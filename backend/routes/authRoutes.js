const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizationMiddleware =  require('..//middleware/authorizationMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', authMiddleware.verifyToken, authorizationMiddleware.hasPermission('manage_users'),authController.getAllUsers); 
router.put('/users/:id', authMiddleware.verifyToken,authorizationMiddleware.hasPermission('manage_users') ,authController.updateUser); 
router.delete('/users/:id',authMiddleware.verifyToken,authorizationMiddleware.hasPermission('manage_users') , authController.deleteUser); 
router.post('/logout', authController.logout);
router.post('/assign-role', authMiddleware.verifyToken,authorizationMiddleware.hasPermission('manage_role') , authController.assignRole);
router.post('/remove-role',authMiddleware.verifyToken,authorizationMiddleware.hasPermission('manage_users') , authController.removeRole);
router.get('/roles', authMiddleware.verifyToken, authorizationMiddleware.hasPermission('manage_roles'), authController.getAllRoles);

module.exports = router;