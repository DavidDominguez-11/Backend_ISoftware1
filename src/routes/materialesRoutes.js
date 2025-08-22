// routes/materialesRoutes.js
const express = require('express');
const router = express.Router();
const { getMateriales, getMaterialById, deleteMaterial, createMateriales, getTotalCantidad } = require('../controllers/materialesController');

router.get('/materiales', getMateriales);

router.get('/materiales/total-cantidad', getTotalCantidad);

router.post('/materiales', createMateriales);

router.delete('/materiales/:id', deleteMaterial);

router.get('/materiales/:id', getMaterialById);

module.exports = router;
