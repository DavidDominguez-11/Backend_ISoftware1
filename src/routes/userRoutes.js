const express = require('express');
const router = express.Router();
const { loginUser, contra } = require('../controllers/userController');


router.post('/login', loginUser);
router.get('/contra', contra);


module.exports = router;