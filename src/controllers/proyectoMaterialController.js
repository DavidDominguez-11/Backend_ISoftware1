//controllers/proyectoMaterialController
const prisma = require('../prismaClient');

/**
 * Obtiene todos los materiales asociados a proyectos que se encuentran en estado 'en progreso'.
 * Realiza un JOIN con las tablas de proyectos y materiales para enriquecer la información.
 */
const getProyectoMaterialEnProgreso = async (req, res) => {
  try {
    const proyectoMateriales = await prisma.proyecto_material.findMany({
      where: {
        proyecto: {
          estado: 'en_progreso'
        }
      },
      include: {
        proyecto: {
          select: {
            nombre: true,
            estado: true
          }
        },
        material: {
          select: {
            codigo: true,
            material: true
          }
        }
      },
      orderBy: [
        {
          proyecto: {
            nombre: 'asc'
          }
        },
        {
          material: {
            material: 'asc'
          }
        }
      ]
    });

    // Si no se encuentran registros, se devuelve un 404
    if (proyectoMateriales.length === 0) {
      return res.status(404).json({ message: 'No se encontraron materiales para proyectos en progreso' });
    }

    // Transformar datos al formato esperado
    const result = proyectoMateriales.map(pm => ({
      id: pm.id,
      id_proyecto: pm.id_proyecto,
      nombre_proyecto: pm.proyecto.nombre,
      estado_proyecto: pm.proyecto.estado,
      id_material: pm.id_material,
      codigo_material: pm.material.codigo,
      nombre_material: pm.material.material,
      ofertada: pm.ofertada,
      en_obra: pm.en_obra,
      reservado: pm.reservado
    }));

    res.json(result);

  } catch (error) {
    console.error('Error en getProyectoMaterialEnProgreso:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * Crea nuevas entradas en la tabla proyecto_material a partir de una lista de proyectos con sus materiales.
 * El cuerpo de la solicitud debe ser un array de objetos: [ { "id_proyecto": X, "materiales": [ { "id_material": Y, "ofertada": Z } ] } ]
 * Los campos 'en_obra' y 'reservado' se inicializan en 0.
 * La operación se realiza dentro de una transacción para garantizar la atomicidad.
 */
const createProyectoMaterial = async (req, res) => {
  // Se espera un array de proyectos, cada uno con sus materiales
  const proyectosConMateriales = req.body;

  // Validación inicial: debe ser un array no vacío
  if (!Array.isArray(proyectosConMateriales) || proyectosConMateriales.length === 0) {
    return res.status(400).json({ message: 'El cuerpo de la solicitud debe ser una lista de proyectos no vacía.' });
  }

  try {
    const insertedRows = await prisma.$transaction(async (prisma) => {
      const allInsertedRows = [];

      // Iterar sobre cada proyecto en la lista
      for (const proyecto of proyectosConMateriales) {
        const { id_proyecto, materiales } = proyecto;

        // Validar la estructura de cada objeto de proyecto
        if (!id_proyecto || !Array.isArray(materiales) || materiales.length === 0) {
          throw new Error(`Cada elemento en la lista debe tener un "id_proyecto" y una lista de "materiales" no vacía.`);
        }

        // Verificar que el proyecto existe
        const proyectoExistente = await prisma.proyectos.findUnique({
          where: { id: parseInt(id_proyecto) }
        });

        if (!proyectoExistente) {
          throw new Error(`El proyecto con ID ${id_proyecto} no existe.`);
        }

        // Iterar sobre cada material del proyecto para insertarlo
        for (const material of materiales) {
          const { id_material, ofertada } = material;

          // Validar que los campos obligatorios existan y sean correctos en cada material
          if (!id_material || ofertada === undefined || typeof ofertada !== 'number' || ofertada < 0) {
            throw new Error(`Cada material debe tener 'id_material' y un valor numérico no negativo para 'ofertada'.`);
          }

          // Verificar que el material existe
          const materialExistente = await prisma.materiales.findUnique({
            where: { id: parseInt(id_material) }
          });

          if (!materialExistente) {
            throw new Error(`El material con ID ${id_material} no existe.`);
          }

          // Crear la relación proyecto-material
          const nuevoProyectoMaterial = await prisma.proyecto_material.create({
            data: {
              id_proyecto: parseInt(id_proyecto),
              id_material: parseInt(id_material),
              ofertada: ofertada,
              en_obra: 0,
              reservado: 0
            }
          });

          allInsertedRows.push(nuevoProyectoMaterial);
        }
      }

      return allInsertedRows;
    });

    // Retornar todos los registros creados
    res.status(201).json(insertedRows);

  } catch (error) {
    console.error('Error en createProyectoMaterial:', error);

    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Ya existe una relación entre este proyecto y material.' });
    }
    if (error.code === 'P2003') {
      return res.status(404).json({ message: 'Error de clave foránea. Verifique que el id_proyecto y todos los id_material existan.' });
    }

    res.status(500).json({ message: 'Error del servidor al registrar los materiales.' });
  }
};

/**
 * Obtiene todos los materiales para un proyecto específico con información detallada de stock y disponibilidad.
 */
const getProyectoMaterialById = async (req, res) => {
  // Acepta ambos nombres de parámetro
  const projectIdRaw = req.params.projectId ?? req.params.id_proyecto;
  const projectId = parseInt(projectIdRaw, 10);

  if (!Number.isInteger(projectId)) {
    return res.status(400).json({ message: "projectId inválido" });
  }

  try {
    // Verificar que el proyecto existe
    const proyecto = await prisma.proyectos.findUnique({
      where: { id: projectId }
    });

    if (!proyecto) {
      return res.status(404).json({ message: `Proyecto con ID ${projectId} no encontrado` });
    }

    // Obtener materiales del proyecto
    const proyectoMateriales = await prisma.proyecto_material.findMany({
      where: { id_proyecto: projectId },
      include: {
        material: {
          select: {
            codigo: true,
            material: true
          }
        }
      }
    });

    if (proyectoMateriales.length === 0) {
      return res.status(200).json({
        message: `No se encontraron materiales para el proyecto con ID ${projectId}`,
        data: [],
      });
    }

    // Obtener stock en bodega por material
    const materialIds = proyectoMateriales.map(pm => pm.id_material);
    
    const stockBodega = await prisma.bodega_materiales.groupBy({
      by: ['material_id'],
      _sum: {
        cantidad: true
      },
      where: {
        material_id: { in: materialIds }
      }
    });

    // Obtener total reservado por material (todos los proyectos)
    const totalReservado = await prisma.proyecto_material.groupBy({
      by: ['id_material'],
      _sum: {
        reservado: true
      },
      where: {
        id_material: { in: materialIds }
      }
    });

    // Combinar toda la información
    const result = proyectoMateriales.map(pm => {
      const stockData = stockBodega.find(s => s.material_id === pm.id_material);
      const enBodega = stockData?._sum.cantidad || 0;

      const reservadoData = totalReservado.find(r => r.id_material === pm.id_material);
      const reservadoTotal = reservadoData?._sum.reservado || 0;

      const pendienteEntrega = pm.ofertada - pm.en_obra;
      const disponibleGlobal = enBodega - reservadoTotal;
      const pendienteCompra = Math.max(0, pendienteEntrega - disponibleGlobal);

      return {
        material_id: pm.id_material,
        codigo: pm.material.codigo,
        material: pm.material.material,
        ofertado: pm.ofertada,
        reservado: pm.reservado,
        en_obra: pm.en_obra,
        pendiente_entrega: pendienteEntrega,
        en_bodega: enBodega,
        reservado_total: reservadoTotal,
        disponible_global: disponibleGlobal,
        pendiente_compra: pendienteCompra
      };
    });

    return res.status(200).json({ data: result });

  } catch (error) {
    console.error("Error en getProyectoMaterialById:", error);
    return res.status(500).json({
      message: "Error interno al obtener los materiales del proyecto.",
      error: error.message,
    });
  }
};

/**
 * Añade un material a un proyecto específico
 */
const addProyectoMaterial = async (req, res) => {
  try {
    const { id_proyecto, id_material, ofertada = 0, en_obra = 0, reservado = 0 } = req.body;

    // Validaciones básicas
    if (!id_proyecto || !id_material) {
      return res.status(400).json({ message: 'Los campos id_proyecto e id_material son requeridos' });
    }

    // Verificar que el proyecto existe
    const proyecto = await prisma.proyectos.findUnique({
      where: { id: parseInt(id_proyecto) }
    });

    if (!proyecto) {
      return res.status(404).json({ message: `Proyecto con ID ${id_proyecto} no encontrado` });
    }

    // Verificar que el material existe
    const material = await prisma.materiales.findUnique({
      where: { id: parseInt(id_material) }
    });

    if (!material) {
      return res.status(404).json({ message: `Material con ID ${id_material} no encontrado` });
    }

    const pm = await prisma.proyecto_material.create({
      data: { 
        id_proyecto: parseInt(id_proyecto), 
        id_material: parseInt(id_material), 
        ofertada, 
        en_obra, 
        reservado 
      },
      include: {
        proyecto: {
          select: {
            nombre: true
          }
        },
        material: {
          select: {
            codigo: true,
            material: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Material añadido al proyecto exitosamente',
      data: pm
    });

  } catch (error) {
    console.error('Error en addProyectoMaterial:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Este material ya está asociado al proyecto' });
    }

    res.status(500).json({ message: 'Error del servidor al añadir material al proyecto' });
  }
};

/**
 * Lista todas las relaciones proyecto-material
 */
const listProyectoMaterials = async (req, res) => {
  try {
    const items = await prisma.proyecto_material.findMany({ 
      include: { 
        proyecto: {
          select: {
            nombre: true,
            estado: true
          }
        }, 
        material: {
          select: {
            codigo: true,
            material: true
          }
        }
      },
      orderBy: [
        { id_proyecto: 'asc' },
        { id_material: 'asc' }
      ]
    });

    res.json(items);

  } catch (error) {
    console.error('Error en listProyectoMaterials:', error);
    res.status(500).json({ message: 'Error del servidor al listar proyecto-material' });
  }
};

/**
 * Actualiza la información de un material en un proyecto
 */
const updateProyectoMaterial = async (req, res) => {
  const { id } = req.params;
  const { ofertada, en_obra, reservado } = req.body;

  if (isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ 
      message: 'El ID debe ser un número entero válido',
      received: id
    });
  }

  try {
    // Verificar que el registro existe
    const existingRecord = await prisma.proyecto_material.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRecord) {
      return res.status(404).json({ 
        message: `No se encontró registro de proyecto-material con ID ${id}` 
      });
    }

    // Preparar datos de actualización
    const updateData = {};
    if (ofertada !== undefined) updateData.ofertada = ofertada;
    if (en_obra !== undefined) updateData.en_obra = en_obra;
    if (reservado !== undefined) updateData.reservado = reservado;

    const updatedRecord = await prisma.proyecto_material.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        proyecto: {
          select: {
            nombre: true
          }
        },
        material: {
          select: {
            codigo: true,
            material: true
          }
        }
      }
    });

    res.json({
      message: 'Registro actualizado exitosamente',
      data: updatedRecord
    });

  } catch (error) {
    console.error('Error en updateProyectoMaterial:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar el registro.' });
  }
};

module.exports = {
  getProyectoMaterialEnProgreso,
  createProyectoMaterial,
  getProyectoMaterialById,
  addProyectoMaterial,
  listProyectoMaterials,
  updateProyectoMaterial
};
