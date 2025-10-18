// routes/clientesRoutes

const express = require('express');
const router = express.Router();

const { getClientes, createCliente, getClientsCount } = require('../controllers/clientesController');

// GET /services/clientes
router.get('/clients', getClientes);

// POST /services/clients/create
router.post('/clients/create', createCliente);

router.get('/clients_count', getClientsCount)

module.exports = router;
