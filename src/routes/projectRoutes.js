//routes/projectRoutes

const express = require('express');
const router = express.Router();

const { getProjects } = require('../controllers/projectController');

router.get('/projects', getProjects)

module.exports = router;

