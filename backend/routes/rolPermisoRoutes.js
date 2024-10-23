const express = require('express');
const { updatePermissions, getRolePermissions } = require('../controllers/rolPermisosController');
const router = express.Router();

// Ruta para actualizar permisos de un rol
router.put('/roles/:rol_id/permisos', updatePermissions);

// Ruta para obtener los permisos de un rol
router.get('/roles/:rol_id/permisos', getRolePermissions);

module.exports = router;