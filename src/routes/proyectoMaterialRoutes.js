//routes/proyectoMaterialRoutes
const express = require('express');
const router = express.Router();

// Importar el controlador
const { getProyectoMaterialEnProgreso, createProyectoMaterial, getProyectoMaterialById, entregarMaterialAObra, reservarMaterial  } = require('../controllers/proyectoMaterialController');

// Definir la ruta GET para obtener los materiales de proyectos "en progreso"
// El endpoint será: GET /services/proyecto-material/en-progreso
router.get('/proyecto-material/en-progreso', getProyectoMaterialEnProgreso);

// Definir la ruta POST para crear materiales de proyectos
// El endpoint será: POST /services/proyecto-material
router.post('/proyecto-material', createProyectoMaterial);

// Definir la ruta GET para obtener los materiales de un proyecto específico
// El endpoint será: GET /services/proyecto-material/:id_proyecto
router.get('/proyecto-material/:id_proyecto', getProyectoMaterialById);

//ruta para endpoint PUT para actualizar la cantidad en_obra en proyecto_material
router.put('/proyecto-material/entregar-obra', entregarMaterialAObra);

//ruta para endpoint PUT para actualizar la cantidad reservada en proyecto_material
router.put('/proyecto-material/reservar', reservarMaterial);

module.exports = router;
