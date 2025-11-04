/**
 * MIDDLEWARE DE VALIDACIÓN PARA REPORTES
 */

// Validar formato de fechas
const validateDateFormat = (dateString) => {
  if (!dateString) return true;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && dateString === date.toISOString().split('T')[0];
};

// Validar parámetros de reporte de materiales
const validateReporteMaterialesParams = (req, res, next) => {
  const { fecha_inicio, fecha_fin, material_ids, tipo_movimiento, proyecto_id, limit, offset } = req.query;
  const errors = [];

  // Validar fechas
  if (fecha_inicio && !validateDateFormat(fecha_inicio)) {
    errors.push('fecha_inicio debe tener formato YYYY-MM-DD');
  }
  
  if (fecha_fin && !validateDateFormat(fecha_fin)) {
    errors.push('fecha_fin debe tener formato YYYY-MM-DD');
  }

  // Validar que fecha_inicio no sea mayor que fecha_fin
  if (fecha_inicio && fecha_fin && new Date(fecha_inicio) > new Date(fecha_fin)) {
    errors.push('fecha_inicio no puede ser mayor que fecha_fin');
  }

  // Validar material_ids
  if (material_ids) {
    const ids = Array.isArray(material_ids) ? material_ids : [material_ids];
    const invalidIds = ids.filter(id => isNaN(parseInt(id)) || parseInt(id) <= 0);
    if (invalidIds.length > 0) {
      errors.push('material_ids debe contener solo números enteros positivos');
    }
  }

  // Validar tipo_movimiento
  if (tipo_movimiento && !['entrada', 'salida', 'todos'].includes(tipo_movimiento)) {
    errors.push('tipo_movimiento debe ser: entrada, salida o todos');
  }

  // Validar proyecto_id
  if (proyecto_id && (isNaN(parseInt(proyecto_id)) || parseInt(proyecto_id) <= 0)) {
    errors.push('proyecto_id debe ser un número entero positivo');
  }

  // Validar paginación
  if (limit && (isNaN(parseInt(limit)) || parseInt(limit) <= 0 || parseInt(limit) > 1000)) {
    errors.push('limit debe ser un número entre 1 y 1000');
  }

  if (offset && (isNaN(parseInt(offset)) || parseInt(offset) < 0)) {
    errors.push('offset debe ser un número >= 0');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Parámetros de consulta inválidos',
      errors: errors
    });
  }

  next();
};

// Validar parámetros de reporte de proyectos
const validateReporteProyectosParams = (req, res, next) => {
  const { fecha_inicio, fecha_fin, cliente_id, estado, tipo_servicio, limit, offset } = req.query;
  const errors = [];

  // Validar fechas
  if (fecha_inicio && !validateDateFormat(fecha_inicio)) {
    errors.push('fecha_inicio debe tener formato YYYY-MM-DD');
  }
  
  if (fecha_fin && !validateDateFormat(fecha_fin)) {
    errors.push('fecha_fin debe tener formato YYYY-MM-DD');
  }

  if (fecha_inicio && fecha_fin && new Date(fecha_inicio) > new Date(fecha_fin)) {
    errors.push('fecha_inicio no puede ser mayor que fecha_fin');
  }

  // Validar cliente_id
  if (cliente_id && (isNaN(parseInt(cliente_id)) || parseInt(cliente_id) <= 0)) {
    errors.push('cliente_id debe ser un número entero positivo');
  }

  // Validar estado
  const estadosValidos = ['solicitado', 'en_progreso', 'finalizado', 'cancelado', 'todos'];
  if (estado && !estadosValidos.includes(estado)) {
    errors.push(`estado debe ser uno de: ${estadosValidos.join(', ')}`);
  }

  // Validar tipo_servicio
  const tiposValidos = ['regulares', 'irregulares', 'remodelaciones', 'jacuzzis', 'paneles solares', 'fuentes y cascadas', 'todos'];
  if (tipo_servicio && !tiposValidos.includes(tipo_servicio)) {
    errors.push(`tipo_servicio debe ser uno de: ${tiposValidos.join(', ')}`);
  }

  // Validar paginación
  if (limit && (isNaN(parseInt(limit)) || parseInt(limit) <= 0 || parseInt(limit) > 1000)) {
    errors.push('limit debe ser un número entre 1 y 1000');
  }

  if (offset && (isNaN(parseInt(offset)) || parseInt(offset) < 0)) {
    errors.push('offset debe ser un número >= 0');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Parámetros de consulta inválidos',
      errors: errors
    });
  }

  next();
};

module.exports = {
  validateReporteMaterialesParams,
  validateReporteProyectosParams
};