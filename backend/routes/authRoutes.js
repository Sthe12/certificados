const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', authController.getAllUsers); 
router.put('/users/:id', authController.updateUser); 
router.delete('/users/:id', authController.deleteUser); 
router.post('/logout', authController.logout);



module.exports = router;