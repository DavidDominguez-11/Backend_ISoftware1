const express = require('express');
const router = express.Router();
const { crearUsuarioCompleto } = require('../controllers/usercreateController');

router.post('/usuarios', crearUsuarioCompleto);

module.exports = router;
