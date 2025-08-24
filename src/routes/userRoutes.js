const express = require('express');
const router = express.Router();

const { getUsersInfo, getClientsCount } = require('../controllers/userController');

router.get('/users_info', getUsersInfo)
router.get('/clients_count', getClientsCount)

module.exports = router;
