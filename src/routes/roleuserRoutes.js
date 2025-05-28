const express = require('express');
const router = express.Router();
const { asignarMultiplesRolesAUsuario } = require('../controllers/roleUserController');

// Ruta POST para asignar múltiples roles a un usuario
router.post('/asignar-roles', asignarMultiplesRolesAUsuario);

module.exports = router;
