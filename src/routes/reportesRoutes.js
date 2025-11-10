//routes/reportesRoutes.js
const express = require('express');
const router = express.Router();

// Importar el controlador
const { 
  getReportes, 
  getReportesPorProyecto, 
  crearReporte,
  getReporteParaPDF 
} = require('../controllers/reportesController');

// Definir las rutas para reportes
router.get('/proyectos/reportes', getReportes);
router.get('/proyectos/:proyecto_id/reportes', getReportesPorProyecto);
router.post('/proyectos/:proyecto_id/reportes', crearReporte);
router.get('/reportes/:reporte_id/pdf', getReporteParaPDF);

module.exports = router;