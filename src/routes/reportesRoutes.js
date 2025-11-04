const express = require('express');
const router = express.Router();
const {
  getReporteMateriales,
  getReporteProyectos,
  getFiltrosDisponibles,
  getReporteResumenStock,
  exportReporteMaterialesCSV,
  getEstadisticasGenerales
} = require('../controllers/reportesController');

const {
  validateReporteMaterialesParams,
  validateReporteProyectosParams
} = require('../middleware/reportesValidation');

/**
 * @route GET /services/reportes/materiales
 * @desc Obtener reporte de materiales con filtros y paginación
 * @query {string} fecha_inicio - Fecha de inicio (YYYY-MM-DD)
 * @query {string} fecha_fin - Fecha de fin (YYYY-MM-DD)
 * @query {string|array} material_ids - ID(s) de material(es)
 * @query {string} tipo_movimiento - entrada|salida|todos
 * @query {string} proyecto_id - ID del proyecto
 * @query {number} limit - Registros por página (max 1000, default 50)
 * @query {number} offset - Desplazamiento para paginación (default 0)
 * @access Public
 */
router.get('/materiales', validateReporteMaterialesParams, getReporteMateriales);

/**
 * @route GET /services/reportes/proyectos
 * @desc Obtener reporte de proyectos con filtros y paginación
 * @query {string} fecha_inicio - Fecha de inicio (YYYY-MM-DD)
 * @query {string} fecha_fin - Fecha de fin (YYYY-MM-DD)
 * @query {string} nombre_proyecto - Nombre del proyecto (búsqueda parcial)
 * @query {string} cliente_id - ID del cliente
 * @query {string} estado - solicitado|en_progreso|finalizado|cancelado|todos
 * @query {string} tipo_servicio - regulares|irregulares|remodelaciones|jacuzzis|etc|todos
 * @query {number} limit - Registros por página (max 1000, default 50)
 * @query {number} offset - Desplazamiento para paginación (default 0)
 * @access Public
 */
router.get('/proyectos', validateReporteProyectosParams, getReporteProyectos);

/**
 * @route GET /services/reportes/stock
 * @desc Obtener reporte resumen de stock con niveles
 * @query {string} nivel_stock - Alto|Medio|Bajo|Sin stock|todos
 * @access Public
 */
router.get('/stock', getReporteResumenStock);

/**
 * @route GET /services/reportes/filtros
 * @desc Obtener todas las opciones disponibles para filtros
 * @access Public
 */
router.get('/filtros', getFiltrosDisponibles);

/**
 * @route GET /services/reportes/materiales/export/csv
 * @desc Exportar reporte de materiales en formato CSV
 * @query {string} fecha_inicio - Fecha de inicio (YYYY-MM-DD)
 * @query {string} fecha_fin - Fecha de fin (YYYY-MM-DD)
 * @query {string|array} material_ids - ID(s) de material(es)
 * @query {string} tipo_movimiento - entrada|salida|todos
 * @query {string} proyecto_id - ID del proyecto
 * @access Public
 */
router.get('/materiales/export/csv', validateReporteMaterialesParams, exportReporteMaterialesCSV);

/**
 * @route GET /services/reportes/estadisticas
 * @desc Obtener estadísticas generales para dashboard
 * @access Public
 */
router.get('/estadisticas', getEstadisticasGenerales);

module.exports = router;