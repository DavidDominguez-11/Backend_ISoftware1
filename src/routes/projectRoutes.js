//routes/projectRoutes

const express = require('express');
const router = express.Router();

const { getProjects, getFinishedProjects } = require('../controllers/projectController');

router.get('/projects', getProjects);
router.get('/projects/finished', getFinishedProjects);

module.exports = router;

