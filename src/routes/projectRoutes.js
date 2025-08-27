//routes/projectRoutes

const express = require('express');
const router = express.Router();

const { getProjects, getFinishedProjects, getFinishedProjectsCount, getInProgressProjects, getTotalProjectsByService, getInProgressProjectsCount } = require('../controllers/projectController');

router.get('/projects', getProjects);
router.get('/projects/finished', getFinishedProjects);
router.get('/projects/in-progress', getInProgressProjects);
router.get('/projects/finished/count', getFinishedProjectsCount);
router.get('/projects/Total-Projects-ByService', getTotalProjectsByService);
router.get('/projects/in-progress-count', getInProgressProjectsCount);

module.exports = router;

