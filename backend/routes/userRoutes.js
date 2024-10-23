const express = require('express');
const { registerUser, getUsers,updateUser, deleteUser,getUserById} = require('../controllers/userController');
const router = express.Router();

router.post('/register', registerUser);
router.get('/user', getUsers);
router.put('/update-user/:id', updateUser);   // Actualizar usuario
router.delete('/delete-user/:id', deleteUser); // Eliminar usuario
router.get('/search-user/:id', getUserById);  // Buscar usuario por ID

module.exports = router;