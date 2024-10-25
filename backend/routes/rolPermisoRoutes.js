const { updatePermissions, getRolePermissions} = require('../controllers/rolPermisosController');
const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();


// Ruta para actualizar permisos de un rol (solo accesible para Admin)
router.put('/roles/:role_id/permisos',verifyToken, updatePermissions);

// Ruta para obtener los permisos de un rol (solo accesible para Admin)
router.get('/roles/:role_id/permisos',verifyToken, getRolePermissions);

module.exports = router;
