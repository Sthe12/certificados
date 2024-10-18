const express = require('express');
const { registerUser, getUsers } = require('../controllers/userController');
const router = express.Router();

router.post('/register', registerUser);
router.get('/', getUsers);
router.put('/:id', updateUser);   // Actualizar usuario
router.delete('/:id', deleteUser); // Eliminar usuario
router.get('/:id', getUserById);  // Buscar usuario por ID

module.exports = router;