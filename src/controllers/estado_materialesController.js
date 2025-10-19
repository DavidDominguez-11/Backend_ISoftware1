const prisma = require('../prismaClient');

const getEstadoMaterial = async (req, res) => {
  try {
    // Paso 1: Obtener todos los materiales
    const materiales = await prisma.materiales.findMany({
      orderBy: { codigo: 'asc' }
    });

    // Paso 2: Obtener stock en bodega por material (suma de cantidades)
    const stockBodega = await prisma.bodega_materiales.groupBy({
      by: ['material_id'],
      _sum: {
        cantidad: true
      }
    });

    // Paso 3: Obtener reservado y ofertado por material desde proyecto_material
    const stockProyectos = await prisma.proyecto_material.groupBy({
      by: ['id_material'],
      _sum: {
        reservado: true,
        ofertada: true
      }
    });

    // Paso 4: Combinar toda la información
    const estadoMateriales = materiales.map(material => {
      // Buscar stock en bodega para este material
      const bodegaData = stockBodega.find(b => b.material_id === material.id);
      const enBodega = bodegaData?._sum.cantidad || 0;

      // Buscar datos de proyectos para este material
      const proyectoData = stockProyectos.find(p => p.id_material === material.id);
      const reservado = proyectoData?._sum.reservado || 0;
      const ofertada = proyectoData?._sum.ofertada || 0;

      // Calcular disponible
      const disponible = enBodega - reservado;

      // Calcular nivel de stock
      let nivelStock;
      if (enBodega <= 0) {
        nivelStock = 'Sin stock';
      } else {
        const porcentajeOfertado = (ofertada * 100.0) / enBodega;
        if (porcentajeOfertado < 30) {
          nivelStock = 'Alto';
        } else if (porcentajeOfertado >= 30 && porcentajeOfertado <= 70) {
          nivelStock = 'Medio';
        } else {
          nivelStock = 'Bajo';
        }
      }

      return {
        id_material: material.id,
        codigo: material.codigo,
        nombre_material: material.material,
        en_bodega: enBodega,
        reservado: reservado,
        disponible: disponible,
        nivel_stock: nivelStock
      };
    });

    res.status(200).json(estadoMateriales);

  } catch (error) {
    console.error('Error al obtener el estado de materiales:', error);
    res.status(500).json({
      message: 'Error no se ha podido obtener el Estado de Materiales',
      error: error.message
    });
  }
};

// Función adicional para obtener estado de un material específico
const getEstadoMaterialById = async (req, res) => {
  const { id } = req.params;
  
  if (isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ 
      message: 'El ID debe ser un número entero válido',
      received: id
    });
  }

  try {
    // Verificar que el material existe
    const material = await prisma.materiales.findUnique({
      where: { id: parseInt(id) }
    });

    if (!material) {
      return res.status(404).json({ 
        message: `No se encontró un material con el ID ${id}.` 
      });
    }

    // Obtener stock en bodega
    const stockBodega = await prisma.bodega_materiales.aggregate({
      _sum: {
        cantidad: true
      },
      where: {
        material_id: parseInt(id)
      }
    });

    // Obtener datos de proyectos
    const stockProyectos = await prisma.proyecto_material.aggregate({
      _sum: {
        reservado: true,
        ofertada: true
      },
      where: {
        id_material: parseInt(id)
      }
    });

    const enBodega = stockBodega._sum.cantidad || 0;
    const reservado = stockProyectos._sum.reservado || 0;
    const ofertada = stockProyectos._sum.ofertada || 0;
    const disponible = enBodega - reservado;

    // Calcular nivel de stock
    let nivelStock;
    if (enBodega <= 0) {
      nivelStock = 'Sin stock';
    } else {
      const porcentajeOfertado = (ofertada * 100.0) / enBodega;
      if (porcentajeOfertado < 30) {
        nivelStock = 'Alto';
      } else if (porcentajeOfertado >= 30 && porcentajeOfertado <= 70) {
        nivelStock = 'Medio';
      } else {
        nivelStock = 'Bajo';
      }
    }

    const estadoMaterial = {
      id_material: material.id,
      codigo: material.codigo,
      nombre_material: material.material,
      en_bodega: enBodega,
      reservado: reservado,
      disponible: disponible,
      nivel_stock: nivelStock
    };

    res.status(200).json(estadoMaterial);

  } catch (error) {
    console.error('Error al obtener el estado del material:', error);
    res.status(500).json({
      message: 'Error no se ha podido obtener el Estado del Material',
      error: error.message
    });
  }
};

// Función para obtener materiales con stock bajo
const getMaterialesStockBajo = async (req, res) => {
  try {
    // Obtener todos los materiales con su estado
    const materiales = await prisma.materiales.findMany({
      orderBy: { codigo: 'asc' }
    });

    const stockBodega = await prisma.bodega_materiales.groupBy({
      by: ['material_id'],
      _sum: {
        cantidad: true
      }
    });

    const stockProyectos = await prisma.proyecto_material.groupBy({
      by: ['id_material'],
      _sum: {
        reservado: true,
        ofertada: true
      }
    });

    // Filtrar solo materiales con stock bajo o sin stock
    const materialesStockBajo = materiales
      .map(material => {
        const bodegaData = stockBodega.find(b => b.material_id === material.id);
        const enBodega = bodegaData?._sum.cantidad || 0;

        const proyectoData = stockProyectos.find(p => p.id_material === material.id);
        const ofertada = proyectoData?._sum.ofertada || 0;

        let nivelStock;
        if (enBodega <= 0) {
          nivelStock = 'Sin stock';
        } else {
          const porcentajeOfertado = (ofertada * 100.0) / enBodega;
          if (porcentajeOfertado < 30) {
            nivelStock = 'Alto';
          } else if (porcentajeOfertado >= 30 && porcentajeOfertado <= 70) {
            nivelStock = 'Medio';
          } else {
            nivelStock = 'Bajo';
          }
        }

        return {
          ...material,
          nivel_stock: nivelStock,
          en_bodega: enBodega
        };
      })
      .filter(material => material.nivel_stock === 'Bajo' || material.nivel_stock === 'Sin stock');

    res.status(200).json(materialesStockBajo);

  } catch (error) {
    console.error('Error al obtener materiales con stock bajo:', error);
    res.status(500).json({
      message: 'Error no se ha podido obtener los materiales con stock bajo',
      error: error.message
    });
  }
};

module.exports = {
  getEstadoMaterial,
  getEstadoMaterialById,
  getMaterialesStockBajo
};