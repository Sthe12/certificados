const express = require('express');
const { updatePermissions, getRolePermissions } = require('../controllers/rolPermisosController');
const { verifyToken , authorizeRoles} = require('../middleware/authMiddleware');
const router = express.Router();

// Ruta para actualizar permisos de un rol (solo accesible para Admin)
router.put('/roles/:rol_id/permisos', verifyToken, updatePermissions);

// Ruta para obtener los permisos de un rol (solo accesible para Admin)
router.get('/roles/:rol/permisos',verifyToken,  getRolePermissions);

module.exports = router;
