//routes/reportesRoutes.js
const express = require('express');
const router = express.Router();

// Importar el controlador
const { 
  getReportes, 
} = require('../controllers/reportesController');

// Definir las rutas para reportes
router.get('/proyectos/reportes', getReportes);

module.exports = router;