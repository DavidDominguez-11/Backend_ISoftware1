const prisma = require('../prismaClient');

/**
 * REPORTE DE MATERIALES
 * Filtros: rango de fechas, material, tipo de movimiento, proyecto
 * Columnas: fecha, código, material, tipo, cantidad, proyecto, nivel_stock
 */
const getReporteMateriales = async (req, res) => {
  try {
    const { 
      fecha_inicio, 
      fecha_fin, 
      material_ids, 
      tipo_movimiento, 
      proyecto_id 
    } = req.query;

    // Construir filtros dinámicos
    const where = {};

    // Filtro por rango de fechas
    if (fecha_inicio || fecha_fin) {
      where.fecha = {};
      if (fecha_inicio) where.fecha.gte = new Date(fecha_inicio);
      if (fecha_fin) where.fecha.lte = new Date(fecha_fin);
    }

    // Filtro por material(es)
    if (material_ids) {
      const materialIdsArray = Array.isArray(material_ids) 
        ? material_ids.map(id => parseInt(id))
        : [parseInt(material_ids)];
      where.material_id = { in: materialIdsArray };
    }

    // Filtro por tipo de movimiento
    if (tipo_movimiento && tipo_movimiento !== 'todos') {
      where.tipo = tipo_movimiento;
    }

    // Filtro por proyecto
    if (proyecto_id) {
      where.proyecto_id = parseInt(proyecto_id);
    }

    // Obtener movimientos de bodega con relaciones
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

    // TODO: Calcular nivel de stock para cada material
    // Esto lo implementaremos en el siguiente stage

    const reporteData = movimientos.map(mov => ({
      fecha: mov.fecha,
      codigo: mov.material?.codigo || 'N/A',
      material: mov.material?.material || 'N/A',
      tipo_movimiento: mov.tipo,
      cantidad: mov.cantidad,
      proyecto: mov.proyecto?.nombre || 'N/A',
      nivel_stock: 'Pendiente' // TODO: Implementar cálculo
    }));

    res.json({
      filtros_aplicados: {
        fecha_inicio: fecha_inicio || 'Todos',
        fecha_fin: fecha_fin || 'Todos',
        material_ids: material_ids || 'Todos',
        tipo_movimiento: tipo_movimiento || 'Todos',
        proyecto_id: proyecto_id || 'Todos'
      },
      total_registros: reporteData.length,
      datos: reporteData
    });

  } catch (error) {
    console.error('Error en getReporteMateriales:', error);
    res.status(500).json({ 
      message: 'Error del servidor al generar reporte de materiales',
      error: error.message 
    });
  }
};

/**
 * REPORTE DE PROYECTOS
 * Filtros: rango fechas inicio/fin, nombre, cliente, estado, tipo_servicio
 * Columnas: las mismas que los filtros
 */
const getReporteProyectos = async (req, res) => {
  try {
    const { 
      fecha_inicio, 
      fecha_fin, 
      nombre_proyecto, 
      cliente_id, 
      estado, 
      tipo_servicio 
    } = req.query;

    // Construir filtros dinámicos
    const where = {};

    // Filtro por rango de fechas de inicio
    if (fecha_inicio || fecha_fin) {
      where.fecha_inicio = {};
      if (fecha_inicio) where.fecha_inicio.gte = new Date(fecha_inicio);
      if (fecha_fin) where.fecha_inicio.lte = new Date(fecha_fin);
    }

    // Filtro por nombre del proyecto
    if (nombre_proyecto) {
      where.nombre = {
        contains: nombre_proyecto,
        mode: 'insensitive'
      };
    }

    // Filtro por cliente
    if (cliente_id) {
      where.cliente_id = parseInt(cliente_id);
    }

    // Filtro por estado
    if (estado && estado !== 'todos') {
      where.estado = estado;
    }

    // Filtro por tipo de servicio
    if (tipo_servicio && tipo_servicio !== 'todos') {
      where.tipo_servicio = tipo_servicio;
    }

    // Obtener proyectos con relaciones
    const proyectos = await prisma.proyectos.findMany({
      where,
      include: {
        cliente: {
          select: {
            nombre: true,
            telefono: true
          }
        }
      },
      orderBy: [
        { fecha_inicio: 'desc' },
        { id: 'desc' }
      ]
    });

    const reporteData = proyectos.map(proyecto => ({
      id: proyecto.id,
      nombre: proyecto.nombre,
      cliente: proyecto.cliente?.nombre || 'N/A',
      estado: proyecto.estado,
      tipo_servicio: proyecto.tipo_servicio,
      fecha_inicio: proyecto.fecha_inicio,
      fecha_fin: proyecto.fecha_fin,
      presupuesto: proyecto.presupuesto,
      ubicacion: proyecto.ubicacion
    }));

    res.json({
      filtros_aplicados: {
        fecha_inicio: fecha_inicio || 'Todos',
        fecha_fin: fecha_fin || 'Todos',
        nombre_proyecto: nombre_proyecto || 'Todos',
        cliente_id: cliente_id || 'Todos',
        estado: estado || 'Todos',
        tipo_servicio: tipo_servicio || 'Todos'
      },
      total_registros: reporteData.length,
      datos: reporteData
    });

  } catch (error) {
    console.error('Error en getReporteProyectos:', error);
    res.status(500).json({ 
      message: 'Error del servidor al generar reporte de proyectos',
      error: error.message 
    });
  }
};

module.exports = {
  getReporteMateriales,
  getReporteProyectos
};