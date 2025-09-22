//routes/proyectoMaterialRoutes
const express = require('express');
const router = express.Router();

// Importar el controlador
const { getProyectoMaterialEnProgreso, createProyectoMaterial } = require('../controllers/proyectoMaterialController');

// Definir la ruta GET para obtener los materiales de proyectos "en progreso"
// El endpoint será: GET /services/proyecto-material/en-progreso
router.get('/proyecto-material/en-progreso', getProyectoMaterialEnProgreso);

// Definir la ruta POST para crear materiales de proyectos
// El endpoint será: POST /services/proyecto-material
router.post('/proyecto-material', createProyectoMaterial);

module.exports = router;
