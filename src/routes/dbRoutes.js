const express = require('express');
const router = express.Router();
const Middleware = require('../middlewares/Middleware');

router.get('/usuarios', Middleware.getTables);

module.exports = router;