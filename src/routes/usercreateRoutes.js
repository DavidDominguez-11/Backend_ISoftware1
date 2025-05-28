const express = require('express');
const router = express.Router();
const { crearUsuarioCompleto } = require('../controllers/usuarioController');

router.post('/usuarios', crearUsuarioCompleto);

module.exports = router;
