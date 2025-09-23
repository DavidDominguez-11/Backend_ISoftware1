// routes/clientesRoutes

const express = require('express');
const router = express.Router();

const { getClientes } = require('../controllers/clientesController');

// GET /services/clientes
router.get('/clients', getClientes);

module.exports = router;
