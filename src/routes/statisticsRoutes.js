const express = require('express');
const router = express.Router();

// Importar el controlador
const { getEntradasVsSalidasPorMes } = require('../controllers/statisticsController');

// Definir la ruta GET para obtener las estadísticas de entradas vs salidas por mes
router.get('/entradas-salidas', getEntradasVsSalidasPorMes);

module.exports = router;
