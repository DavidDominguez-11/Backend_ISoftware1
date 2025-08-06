const express = require('express');
const router = express.Router();

// Importar el controlador
const { getBodegaMateriales } = require('../controllers/bodegaMaterialesController');

// Definir la ruta GET para obtener los registros de la bodega
router.get('/bodega-materiales', getBodegaMateriales);

module.exports = router;
