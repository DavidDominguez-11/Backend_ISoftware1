const express = require('express');
const router = express.Router();
const { registerUserRol } = require('../controllers/registerUserRolController');

router.post('/register-user-rol', registerUserRol);

module.exports = router;
