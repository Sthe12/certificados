const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', authController.getAllUsers);
router.get('/search', authController.searchUsers);
router.get('/users/:id', authController.getUserById);
router.put('users-update/:id', authController.updateUser);
router.delete('delete-user/:id', authController.deleteUser);
//router.post('/logout', authMiddleware, authController.logout);

module.exports = router;