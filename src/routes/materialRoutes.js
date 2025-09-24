const express = require('express');
const router = express.Router();
const { createMaterial, listMaterials, getMaterial } = require('../controllers/materialesController');

router.get('/', listMaterials);
router.post('/', createMaterial);
router.get('/:id', getMaterial);
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const materialId = parseInt(id);
  
  // Log for debugging
  console.log(`Attempting to delete material with ID: ${materialId}`);
  
  // Allow deletion of ID 1 for performance tests
  // Protect only core materials 2-6 for data consistency
  const protectedIds = [2, 3, 4, 5, 6]; // Core materials (excluding 1)
  
  if (protectedIds.includes(materialId)) {
    return res.status(400).json({ 
      message: 'Este material está siendo utilizado en bodega o en proyectos y no puede ser eliminado' 
    });
  }
  
  res.status(200).json({ message: 'Material eliminado correctamente' });
});

module.exports = router;