// routes/clientesRoutes

const express = require('express');
const router = express.Router();

const { getClientes, createCliente } = require('../controllers/clientesController');

// GET /services/clientes
router.get('/clients', getClientes);

// POST /services/clients/create
router.post('/clients/create', createCliente);

module.exports = router;
