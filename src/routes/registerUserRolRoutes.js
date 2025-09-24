const express = require('express');
const router = express.Router();
const { registerUserRol, assignRoleToUser, removeRoleFromUser } = require('../controllers/registerUserRolController');

router.post('/register-user-rol', registerUserRol);
router.post('/assign', assignRoleToUser);
router.post('/', assignRoleToUser); // Also handle direct POST
router.delete('/:id', removeRoleFromUser);

module.exports = router;
