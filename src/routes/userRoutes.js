const express = require('express');
const router = express.Router();
const { getUsuarios, createUsuario } = require('../controllers/userController');

router.get('/', getUsuarios);
router.post('/', createUsuario);

module.exports = router;