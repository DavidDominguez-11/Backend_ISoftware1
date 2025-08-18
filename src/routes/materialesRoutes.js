// routes/materialesRoutes.js
const express = require('express');
const router = express.Router();
const { getMateriales, getMaterialById, deleteMaterial, createMateriales } = require('../controllers/materialesController');

router.get('/materiales', getMateriales);

router.post('/materiales', createMateriales);

router.delete('/materiales/:id', deleteMaterial);

router.get('/materiales/:id', getMaterialById);

module.exports = router;
