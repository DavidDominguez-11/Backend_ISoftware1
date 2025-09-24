const express = require('express');
const router = express.Router();
const { getUsersInfo, getClientsCount } = require('../controllers/userController');

router.get('/', getUsersInfo);
router.get('/clients/count', getClientsCount);

module.exports = router;
