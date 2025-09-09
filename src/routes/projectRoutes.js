//routes/projectRoutes

const express = require('express');
const router = express.Router();

const { getProjects, getFinishedProjects, getFinishedProjectsCount, getInProgressProjects, getTotalProjectsByService, getInProgressProjectsCount, createProject, updateProjectType } = require('../controllers/projectController');

router.get('/projects', getProjects);
router.get('/projects/finished', getFinishedProjects);
router.get('/projects/in-progress', getInProgressProjects);
router.get('/projects/finished/count', getFinishedProjectsCount);
router.get('/projects/Total-Projects-ByService', getTotalProjectsByService);
router.get('/projects/in-progress-count', getInProgressProjectsCount);
router.post('/projects/create', createProject);
router.patch('/projects/:id/tipo', updateProjectType);

module.exports = router;
