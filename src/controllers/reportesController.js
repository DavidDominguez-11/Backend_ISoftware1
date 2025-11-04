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

    // Calcular nivel de stock para cada material único en el reporte
    const materialIdsUnicos = [...new Set(movimientos.map(mov => mov.material_id))];
    
    // Obtener stock actual y datos de proyectos para calcular nivel
    const stockData = await Promise.all(materialIdsUnicos.map(async (materialId) => {
      // Stock total en bodega
      const stockBodega = await prisma.bodega_materiales.aggregate({
        _sum: { cantidad: true },
        where: { material_id: materialId }
      });

      // Total ofertado en proyectos
      const stockProyectos = await prisma.proyecto_material.aggregate({
        _sum: { ofertada: true },
        where: { id_material: materialId }
      });

      const enBodega = stockBodega._sum.cantidad || 0;
      const ofertada = stockProyectos._sum.ofertada || 0;

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
        material_id: materialId,
        nivel_stock: nivelStock,
        stock_actual: enBodega
      };
    }));

    const reporteData = movimientos.map(mov => {
      const stockInfo = stockData.find(s => s.material_id === mov.material_id);
      
      return {
        fecha: mov.fecha,
        codigo: mov.material?.codigo || 'N/A',
        material: mov.material?.material || 'N/A',
        tipo_movimiento: mov.tipo,
        cantidad: mov.cantidad,
        proyecto: mov.proyecto?.nombre || 'N/A',
        nivel_stock: stockInfo?.nivel_stock || 'N/A',
        stock_actual: stockInfo?.stock_actual || 0
      };
    });

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

/**
 * OBTENER FILTROS DISPONIBLES PARA REPORTES
 * Endpoint helper para obtener opciones de filtros
 */
const getFiltrosDisponibles = async (req, res) => {
  try {
    // Obtener todos los materiales para filtro
    const materiales = await prisma.materiales.findMany({
      select: {
        id: true,
        codigo: true,
        material: true
      },
      orderBy: { codigo: 'asc' }
    });

    // Obtener todos los clientes para filtro
    const clientes = await prisma.clientes.findMany({
      select: {
        id: true,
        nombre: true
      },
      orderBy: { nombre: 'asc' }
    });

    // Obtener todos los proyectos activos para filtro
    const proyectos = await prisma.proyectos.findMany({
      select: {
        id: true,
        nombre: true,
        estado: true
      },
      orderBy: { nombre: 'asc' }
    });

    // Opciones de estados y tipos de servicio
    const estadosProyecto = ['solicitado', 'en_progreso', 'finalizado', 'cancelado'];
    const tiposServicio = ['regulares', 'irregulares', 'remodelaciones', 'jacuzzis', 'paneles solares', 'fuentes y cascadas'];
    const tiposMovimiento = ['entrada', 'salida'];

    res.json({
      materiales,
      clientes,
      proyectos,
      estados_proyecto: estadosProyecto,
      tipos_servicio: tiposServicio,
      tipos_movimiento: tiposMovimiento
    });

  } catch (error) {
    console.error('Error en getFiltrosDisponibles:', error);
    res.status(500).json({ 
      message: 'Error del servidor al obtener filtros disponibles',
      error: error.message 
    });
  }
};

/**
 * REPORTE RESUMEN DE STOCK
 * Reporte consolidado de niveles de stock actual
 */
const getReporteResumenStock = async (req, res) => {
  try {
    const { nivel_stock } = req.query;

    // Obtener todos los materiales
    const materiales = await prisma.materiales.findMany({
      orderBy: { codigo: 'asc' }
    });

    // Calcular stock y nivel para cada material
    const stockData = await Promise.all(materiales.map(async (material) => {
      // Stock total en bodega
      const stockBodega = await prisma.bodega_materiales.aggregate({
        _sum: { cantidad: true },
        where: { material_id: material.id }
      });

      // Total ofertado en proyectos
      const stockProyectos = await prisma.proyecto_material.aggregate({
        _sum: { 
          ofertada: true,
          reservado: true 
        },
        where: { id_material: material.id }
      });

      const enBodega = stockBodega._sum.cantidad || 0;
      const ofertada = stockProyectos._sum.ofertada || 0;
      const reservado = stockProyectos._sum.reservado || 0;
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
        id: material.id,
        codigo: material.codigo,
        material: material.material,
        stock_bodega: enBodega,
        reservado: reservado,
        disponible: disponible,
        ofertada_proyectos: ofertada,
        nivel_stock: nivelStock
      };
    }));

    // Filtrar por nivel de stock si se especifica
    let datosReporte = stockData;
    if (nivel_stock && nivel_stock !== 'todos') {
      datosReporte = stockData.filter(item => 
        item.nivel_stock.toLowerCase() === nivel_stock.toLowerCase()
      );
    }

    // Estadísticas generales
    const estadisticas = {
      total_materiales: stockData.length,
      sin_stock: stockData.filter(s => s.nivel_stock === 'Sin stock').length,
      stock_bajo: stockData.filter(s => s.nivel_stock === 'Bajo').length,
      stock_medio: stockData.filter(s => s.nivel_stock === 'Medio').length,
      stock_alto: stockData.filter(s => s.nivel_stock === 'Alto').length
    };

    res.json({
      filtros_aplicados: {
        nivel_stock: nivel_stock || 'Todos'
      },
      estadisticas,
      total_registros: datosReporte.length,
      datos: datosReporte
    });

  } catch (error) {
    console.error('Error en getReporteResumenStock:', error);
    res.status(500).json({ 
      message: 'Error del servidor al generar reporte de stock',
      error: error.message 
    });
  }
};

module.exports = {
  getReporteMateriales,
  getReporteProyectos,
  getFiltrosDisponibles,
  getReporteResumenStock
};