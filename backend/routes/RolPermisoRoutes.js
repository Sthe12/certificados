const express = require('express');
const router = express.Router();
const rolePermissionController = require('../controllers/RolePermisoController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole, checkPermission } = require('../middleware/RolMiddleware');

router.post('/role', authMiddleware, checkPermission('create_role'), rolePermissionController.createRole);
router.get('/roles', authMiddleware, rolePermissionController.getAllRoles);
router.post('/permissions', authMiddleware, checkPermission('create_permission'), rolePermissionController.createPermission);
router.get('/permissions', authMiddleware, rolePermissionController.getAllPermissions);
router.post('/assign-role', authMiddleware, checkPermission('assign_role'), rolePermissionController.assignRoleToUser);
router.post('/assign-permission', authMiddleware, checkPermission('assign_permission'), rolePermissionController.assignPermissionToRole);
router.get('/user-roles/:userId', authMiddleware, rolePermissionController.getUserRoles);
router.get('/role-permissions/:roleId', authMiddleware, rolePermissionController.getRolePermissions);

module.exports = router;