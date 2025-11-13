//routes/reportesRoutes.js
const express = require('express');
const router = express.Router();

// Importar el controlador
const { 
  getReportes, 
  getReportesPorProyecto, 
  crearReporte,
  getReporteParaPDF,
  subirFotosReporteSimple 
} = require('../controllers/reportesController');

// Definir las rutas para reportes
router.get('/proyectos/reportes', getReportes);
router.get('/proyectos/:proyecto_id/reportes', getReportesPorProyecto);
router.post('/proyectos/:proyecto_id/reportes', crearReporte);
router.get('/reportes/:reporte_id/pdf', getReporteParaPDF);

// ============================================
// SIMPLE PHOTO URL ROUTES (NO FILE UPLOAD)
// ============================================

/**
 * @route POST /services/reportes/:reporte_id/fotos
 * @desc Añadir URLs de fotos a un reporte específico (versión simple)
 * @param {string} reporte_id - ID del reporte
 * @body {array} fotos - Array de URLs de fotos ["url1", "url2", ...]
 * @access Public
 */
router.post('/:reporte_id/fotos', subirFotosReporteSimple);

module.exports = router;