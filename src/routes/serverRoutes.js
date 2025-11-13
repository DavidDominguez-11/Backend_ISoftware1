const express = require('express');
const router = express.Router();

const { testDeploy } = require('../controllers/serverController');

router.get('/testDeploy', testDeploy);

module.exports = router;