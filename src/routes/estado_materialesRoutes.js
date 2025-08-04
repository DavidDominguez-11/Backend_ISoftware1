const express = require('express');
const router = express.Router();

const { getEstadoMaterial } = require('../controllers/estado_materialesController');

router.get('/estado_materiales', getEstadoMaterial)

module.exports = router;
