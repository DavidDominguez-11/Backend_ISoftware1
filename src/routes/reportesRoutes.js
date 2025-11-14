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
 * 
 * @example
 * // Ejemplo de request body:
 * {
 *   "fotos": [
 *     "https://ejemplo.com/foto1.jpg",
 *     "https://cloudinary.com/demo/imagen2.png",
 *     "https://drive.google.com/file/d/abc123/imagen3.webp"
 *   ]
 * }
 * 
 * // Ejemplo de response (201):
 * {
 *   "message": "3 foto(s) añadida(s) exitosamente al reporte",
 *   "reporte": {
 *     "id": 1,
 *     "proyecto": "Construcción Piscina Residencial",
 *     "estado_proyecto": "en_progreso",
 *     "responsable": "Carlos Méndez"
 *   },
 *   "fotos_guardadas": [
 *     {
 *       "id": 15,
 *       "ruta_foto": "https://ejemplo.com/foto1.jpg"
 *     },
 *     {
 *       "id": 16,
 *       "ruta_foto": "https://cloudinary.com/demo/imagen2.png"
 *     },
 *     {
 *       "id": 17,
 *       "ruta_foto": "https://drive.google.com/file/d/abc123/imagen3.webp"
 *     }
 *   ],
 *   "total_fotos_reporte": 8
 * }
 */
router.post('/:reporte_id/fotos', subirFotosReporteSimple);

module.exports = router;