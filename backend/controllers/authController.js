const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authController = {
    // Registro de usuario
    async register(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ message: 'Username y password son requeridos' });
            }

            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(409).json({ message: 'El nombre de usuario ya existe' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = await User.create(username, hashedPassword);

            const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.status(201).json({ message: 'Usuario registrado exitosamente', token, userId });
        } catch (error) {
            console.error('Error en register:', error);
            return res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
        }
    },

    // Inicio de sesión
    async login(req, res) {
        try {
            const { username, password } = req.body;
            console.log('Datos recibidos del frontend:', { username, password });
    
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
    
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Contraseña incorrecta' });
            }
    
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.status(200).json({ message: 'Login exitoso', token, user: { id: user.id, username: user.username } });
        } catch (error) {
            console.error('Error en login:', error);
            return res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
        }
    },

    // Ver todos los usuarios registrados
    async getAllUsers(req, res) {
        try {
            const users = await User.findAll();
            return res.status(200).json({ message: 'Usuarios encontrados', users });
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            return res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
        }
    },

    // Actualizar un usuario
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { username, password } = req.body;

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const hashedPassword = password ? await bcrypt.hash(password, 10) : user.password;
            await User.update(id, { username, password: hashedPassword });

            return res.status(200).json({ message: 'Usuario actualizado exitosamente' });
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            return res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
        }
    },

    // Eliminar un usuario
    async deleteUser(req, res) {
        try {
            const { id } = req.params;

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            await User.delete(id);
            return res.status(200).json({ message: 'Usuario eliminado exitosamente' });
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            return res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
        }
    },
    // Logout
    async logout(req, res) {
        try {
            // Aquí simplemente enviamos un mensaje de confirmación
            return res.status(200).json({ message: 'Logout exitoso' });
        } catch (error) {
            console.error('Error en logout:', error);
            return res.status(500).json({ message: 'Error al hacer logout', error: error.message });
        }
    }
};

module.exports = authController;
