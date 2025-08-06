const express = require('express');
const router = express.Router();

const { getUsersInfo } = require('../controllers/userController');

router.get('/users_info', getUsersInfo)

module.exports = router;
