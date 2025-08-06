// routes/materialesRoutes.js
const express = require('express');
const router = express.Router();
const { getMateriales, deleteMaterial, createMateriales } = require('../controllers/materialesControler');

/**
 * GET /services/materiales
 * Obtiene todos los materiales
 * Response example:
 * [
 *   {
 *     "id": 1,
 *     "codigo": "MAD001",
 *     "material": "Madera de Pino"
 *   }
 * ]
 */
router.get('/materiales', getMateriales);

/**
 * POST /services/materiales
 * Crea múltiples materiales
 * Request body example:
 * {
 *   "materiales": [
 *     {
 *       "codigo": "MAD001",
 *       "material": "Madera de Pino"
 *     },
 *     {
 *       "codigo": "CEM002",
 *       "material": "Cemento Portland"
 *     }
 *   ]
 * }
 * Response example:
 * {
 *   "message": "Materiales creados correctamente",
 *   "materiales": [
 *     {
 *       "id": 1,
 *       "codigo": "MAD001",
 *       "material": "Madera de Pino"
 *     }
 *   ]
 * }
 */
router.post('/materiales', createMateriales);

/**
 * DELETE /services/materiales/:id
 * Example: DELETE /services/materiales/1
 * Elimina un material por su ID
 * Response example:
 * {
 *   "message": "Material eliminado correctamente"
 * }
 * Error response example:
 * {
 *   "message": "No se puede eliminar el material porque está siendo utilizado en bodega o en proyectos"
 * }
 */
router.delete('/materiales/:id', deleteMaterial);

module.exports = router;
