const express = require('express');
const router = express.Router();
const { loginUser, contra } = require('../controllers/authController');


router.post('/login', loginUser);
//router.get('/contra', contra);


module.exports = router;