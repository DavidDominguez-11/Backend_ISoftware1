//controllers/bodegaMaterialesController.js
const prisma = require('../prismaClient');

/**
 * GET /bodega-materiales
 * Filtros opcionales: ?tipo=entrada|salida&material_id=...&proyecto_id=...
 */
const getBodegaMateriales = async (req, res) => {
  try {
    const { tipo, material_id, proyecto_id } = req.query;
    
    // Build where clause for filters
    const where = {};
    if (tipo) where.tipo = tipo;
    if (material_id) where.material_id = parseInt(material_id);
    if (proyecto_id) where.proyecto_id = parseInt(proyecto_id);

    const movimientos = await prisma.bodega_materiales.findMany({
      where,
      include: { 
        material: {
          select: {
            codigo: true,
            material: true
          }
        },
        proyecto: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: [
        { fecha: 'desc' },
        { id: 'desc' }
      ]
    });

    if (movimientos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron registros en la bodega de materiales' });
    }

    // Transform data to match expected format
    const transformedMovimientos = movimientos.map(mov => ({
      id: mov.id,
      material_id: mov.material_id,
      material_codigo: mov.material?.codigo || null,
      material_nombre: mov.material?.material || null,
      tipo: mov.tipo,
      cantidad: mov.cantidad,
      fecha: mov.fecha,
      observaciones: mov.observaciones,
      proyecto_id: mov.proyecto_id,
      proyecto_nombre: mov.proyecto?.nombre || null
    }));

    res.json(transformedMovimientos);
  } catch (error) {
    console.error('Error en getBodegaMateriales:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * POST /bodega-materiales
 * body: { material_id, tipo: 'entrada'|'salida', cantidad (>0), fecha?, observaciones?, proyecto_id? }
 * Reglas:
 *  - entrada: cantidad se guarda positiva; proyecto_id debe ser NULL
 *  - salida: cantidad recibida >0 pero se guarda negativa; proyecto_id es OBLIGATORIO; valida stock
 */
const createBodegaMaterial = async (req, res) => {
  try {
    const { material_id, tipo, cantidad, fecha, observaciones, proyecto_id } = req.body;

    // Validaciones básicas
    if (!material_id || !tipo || cantidad === undefined) {
      return res.status(400).json({ message: 'Faltan campos: material_id, tipo, cantidad' });
    }
    
    if (tipo !== 'entrada' && tipo !== 'salida') {
      return res.status(400).json({ message: `Tipo inválido: ${tipo}. Debe ser 'entrada' o 'salida'` });
    }
    
    const qty = Number(cantidad);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: 'La cantidad debe ser un número > 0' });
    }

    // Verificar que el material existe
    const material = await prisma.materiales.findUnique({
      where: { id: parseInt(material_id) }
    });

    if (!material) {
      return res.status(404).json({ message: `Material id=${material_id} no existe` });
    }

    // Validaciones específicas para salida
    if (tipo === 'salida') {
      if (!proyecto_id) {
        return res.status(400).json({ message: 'proyecto_id es obligatorio para salida' });
      }

      // Verificar que el proyecto existe
      const proyecto = await prisma.proyectos.findUnique({
        where: { id: parseInt(proyecto_id) }
      });

      if (!proyecto) {
        return res.status(404).json({ message: `Proyecto id=${proyecto_id} no existe` });
      }

      // Validar stock disponible
      const stockResult = await prisma.bodega_materiales.aggregate({
        _sum: {
          cantidad: true
        },
        where: {
          material_id: parseInt(material_id)
        }
      });

      const stockActual = stockResult._sum.cantidad || 0;
      
      if (stockActual < qty) {
        return res.status(400).json({
          message: `Stock insuficiente. Stock actual: ${stockActual}, intento de salida: ${qty}`,
        });
      }
    }

    // Preparar datos para inserción
    const cantidadFinal = tipo === 'salida' ? -qty : qty;
    const proyectoIdFinal = tipo === 'entrada' ? null : parseInt(proyecto_id);

    const movimiento = await prisma.bodega_materiales.create({
      data: {
        material_id: parseInt(material_id),
        tipo,
        cantidad: cantidadFinal,
        fecha: fecha ? new Date(fecha) : new Date(),
        observaciones: observaciones || null,
        proyecto_id: proyectoIdFinal
      },
      include: {
        material: {
          select: {
            codigo: true,
            material: true
          }
        },
        proyecto: {
          select: {
            nombre: true
          }
        }
      }
    });

    res.status(201).json(movimiento);

  } catch (error) {
    console.error('Error en createBodegaMaterial:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Violación de restricción única' });
    }
    
    if (error.code === 'P2003') {
      return res.status(404).json({ message: 'FK no encontrada: material o proyecto inexistente' });
    }
    
    res.status(500).json({ message: 'Error del servidor al crear el movimiento' });
  }
};

/**
 * GET /bodega-materiales/stock/:material_id
 * Obtiene el stock actual de un material específico
 */
const getStockByMaterial = async (req, res) => {
  try {
    const { material_id } = req.params;

    if (isNaN(material_id) || !Number.isInteger(Number(material_id))) {
      return res.status(400).json({ 
        message: 'El ID del material debe ser un número entero válido',
        received: material_id
      });
    }

    // Verificar que el material existe
    const material = await prisma.materiales.findUnique({
      where: { id: parseInt(material_id) }
    });

    if (!material) {
      return res.status(404).json({ message: `Material id=${material_id} no existe` });
    }

    // Calcular stock actual
    const stockResult = await prisma.bodega_materiales.aggregate({
      _sum: {
        cantidad: true
      },
      where: {
        material_id: parseInt(material_id)
      }
    });

    const stock = stockResult._sum.cantidad || 0;

    res.json({
      material_id: parseInt(material_id),
      material_codigo: material.codigo,
      material_nombre: material.material,
      stock_actual: stock
    });

  } catch (error) {
    console.error('Error en getStockByMaterial:', error);
    res.status(500).json({ message: 'Error del servidor al obtener el stock' });
  }
};

/**
 * GET /bodega-materiales/stock
 * Obtiene el stock actual de todos los materiales
 */
const getAllStock = async (req, res) => {
  try {
    const stockData = await prisma.bodega_materiales.groupBy({
      by: ['material_id'],
      _sum: {
        cantidad: true
      },
      orderBy: {
        material_id: 'asc'
      }
    });

    // Obtener información de los materiales
    const materialIds = stockData.map(item => item.material_id);
    const materiales = await prisma.materiales.findMany({
      where: {
        id: { in: materialIds }
      },
      select: {
        id: true,
        codigo: true,
        material: true
      }
    });

    // Combinar información
    const stockWithMaterials = stockData.map(stock => {
      const material = materiales.find(m => m.id === stock.material_id);
      return {
        material_id: stock.material_id,
        material_codigo: material?.codigo || 'N/A',
        material_nombre: material?.material || 'N/A',
        stock_actual: stock._sum.cantidad || 0
      };
    });

    res.json(stockWithMaterials);

  } catch (error) {
    console.error('Error en getAllStock:', error);
    res.status(500).json({ message: 'Error del servidor al obtener el stock' });
  }
};

module.exports = {
  getBodegaMateriales,
  createBodegaMaterial,
  getStockByMaterial,
  getAllStock
};
