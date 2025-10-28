const express = require('express');
const router = express.Router();

// Importar el controlador
const { getEntradasVsSalidasPorMes, getTop5ProyectosMayorPresupuesto, getTop5MaterialesMasUsados } = require('../controllers/statisticsController');

// Definir la ruta GET para obtener las estadísticas de entradas vs salidas por mes
router.get('/entradas-salidas', getEntradasVsSalidasPorMes);

// Definir la ruta GET para obtener los top 5 proyectos con mayor presupuesto
router.get('/top-proyectos-presupuesto', getTop5ProyectosMayorPresupuesto);

// Definir la ruta GET para obtener los top 5 materiales más usados
router.get('/top-materiales-usados', getTop5MaterialesMasUsados);

module.exports = router;
