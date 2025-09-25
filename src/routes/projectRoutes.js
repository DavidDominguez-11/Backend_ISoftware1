//routes/projectRoutes

const express = require('express');
const router = express.Router();

const {
    getProjects,
    getFinishedProjects,
    getFinishedProjectsCount,
    getInProgressProjects,
    getTotalProjectsByService,
    getInProgressProjectsCount,
    createProject,
    updateProjectType,
    getProjectStatuses,
    getProjectById,
    updateProjectStatus,
    updateProjectById
} = require('../controllers/projectController');


router.get('/projects', getProjects);
router.get('/projects/finished', getFinishedProjects);
router.get('/projects/in-progress', getInProgressProjects);
router.get('/projects/finished/count', getFinishedProjectsCount);
router.get('/projects/Total-Projects-ByService', getTotalProjectsByService);
router.get('/projects/in-progress-count', getInProgressProjectsCount);
router.post('/projects/create', createProject);
router.patch('/projects/:id/tipo', updateProjectType);
router.get('/projects/projectById/:id', getProjectById);
router.get('/projects/status-projects', getProjectStatuses);
router.patch('/projects/:id/estado', updateProjectStatus);
router.put('/projects/:id', updateProjectById);
router.get('/projects/materials', getProjectMaterials);

module.exports = router;
