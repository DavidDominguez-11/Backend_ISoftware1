const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyToken, logoutUser } = require('../controllers/authController');

// Registro
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Verificar token desde cookies
router.get('/verify-token', verifyToken);

// Logout (opcional pero recomendado)
router.post('/logout', logoutUser);

module.exports = router;
