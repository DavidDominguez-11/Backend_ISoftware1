//routes/reportesRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { optimizeMultipleImages } = require('../middlewares/imageOptimizer');

// Importar el controlador
const { 
  getReportes, 
  getReportesPorProyecto, 
  crearReporte,
  getReporteParaPDF,
  subirFotosReporteSimple,
  uploadPhotosReports 
} = require('../controllers/reportesController');

// Definir las rutas para reportes
router.get('/proyectos/reportes', getReportes);
router.get('/proyectos/:proyecto_id/reportes', getReportesPorProyecto);
router.post('/proyectos/:proyecto_id/reportes', crearReporte);
router.get('/reportes/:reporte_id/pdf', getReporteParaPDF);

/**
 * @route POST /services/:reporte_id/fotos
 * @desc Subir archivos de fotos a un reporte específico
 * @param {string} reporte_id - ID del reporte
 * @body {files} fotos - Array de archivos de imagen
 * @access Public
 */
router.post(
  '/:reporte_id/fotos', 
  upload.array('fotos', 10),  // Acepta hasta 10 fotos a la vez
  optimizeMultipleImages, 
  uploadPhotosReports
);

/**
 * URLS
 * @route POST /services/:reporte_id/fotos
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
router.post('/:reporte_id/fotos-url', subirFotosReporteSimple);

module.exports = router;