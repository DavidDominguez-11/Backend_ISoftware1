const express = require('express');
const router = express.Router();
const { getAllRoles } = require('../controllers/rolesController');

router.get('/roles', getAllRoles);

module.exports = router;
