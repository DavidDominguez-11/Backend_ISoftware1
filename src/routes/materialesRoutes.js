// routes/materialesRoutes.js
const express = require('express');
const router = express.Router();
const { getMateriales, deleteMaterial, createMateriales } = require('../controllers/materialesControler');

router.get('/materiales', getMateriales);
router.post('/materiales', createMateriales);
router.delete('/materiales/:id', deleteMaterial);

module.exports = router;
