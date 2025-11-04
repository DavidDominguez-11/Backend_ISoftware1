const express = require('express');
const router = express.Router();
const {
  getReporteMateriales,
  getReporteProyectos,
  getFiltrosDisponibles,
  getReporteResumenStock
} = require('../controllers/reportesController');

/**
 * @route GET /services/reportes/materiales
 * @desc Obtener reporte de materiales con filtros
 * @query {string} fecha_inicio - Fecha de inicio (YYYY-MM-DD)
 * @query {string} fecha_fin - Fecha de fin (YYYY-MM-DD)
 * @query {string|array} material_ids - ID(s) de material(es)
 * @query {string} tipo_movimiento - entrada|salida|todos
 * @query {string} proyecto_id - ID del proyecto
 * @access Public
 */
router.get('/materiales', getReporteMateriales);

/**
 * @route GET /services/reportes/proyectos
 * @desc Obtener reporte de proyectos con filtros
 * @query {string} fecha_inicio - Fecha de inicio (YYYY-MM-DD)
 * @query {string} fecha_fin - Fecha de fin (YYYY-MM-DD)
 * @query {string} nombre_proyecto - Nombre del proyecto (búsqueda parcial)
 * @query {string} cliente_id - ID del cliente
 * @query {string} estado - solicitado|en_progreso|finalizado|cancelado|todos
 * @query {string} tipo_servicio - regulares|irregulares|remodelaciones|jacuzzis|etc|todos
 * @access Public
 */
router.get('/proyectos', getReporteProyectos);

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

module.exports = router;