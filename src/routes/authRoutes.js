// routes/authRoutes
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyToken, logoutUser } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-token', verifyToken);
router.post('/logout', logoutUser);

module.exports = router;
