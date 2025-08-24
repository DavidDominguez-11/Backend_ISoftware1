//routes/projectRoutes

const express = require('express');
const router = express.Router();

const { getProjects, getFinishedProjects, getFinishedProjectsCount, getInProgressProjects } = require('../controllers/projectController');

router.get('/projects', getProjects);
router.get('/projects/finished', getFinishedProjects);
router.get('/projects/in-progress', getInProgressProjects);
router.get('/projects/finished/count', getFinishedProjectsCount);

module.exports = router;

