// routes/materialesRoutes.js
const express = require('express');
const router = express.Router();
const { getMateriales, getMaterialById, deleteMaterial, createMateriales, getTotalCantidad, getAlertasMateriales } = require('../controllers/materialesController');

// rutas de materiales
router.get('/materiales', getMateriales);
router.get('/materiales/total-cantidad', getTotalCantidad);
router.post('/materiales', createMateriales);

// rutas de alertas 
router.get('/materiales/alertas', getAlertasMateriales);

// rutas con parámetros dinámicos
router.delete('/materiales/:id', deleteMaterial);
router.get('/materiales/:id', getMaterialById);


module.exports = router;
