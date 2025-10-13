// routes/bodegaMaterialesRoutes.js

const express = require('express');
const router = express.Router();

// Importar el controlador
const { getBodegaMateriales, postBodegaMaterial } = require('../controllers/bodegaMaterialesController');

// Definir la ruta GET para obtener los registros de la bodega
router.get('/bodega-materiales', getBodegaMateriales);
router.post('/bodega-materiales', postBodegaMaterial);

module.exports = router;
