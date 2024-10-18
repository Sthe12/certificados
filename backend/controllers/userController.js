const bcrypt = require('bcryptjs');
const db = require('../config/database');

exports.registerUser = async (req, res) => {
    const { nombre, apellido, email, password, rol } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (nombre, apellido, email, password, rol) VALUES (?, ?, ?, ?, ?)';
        await db.query(query, [nombre, apellido, email, hashedPassword, rol]);

        res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
};

exports.getUsers = async (req, res) => {
    const query = 'SELECT id, nombre, apellido, email, rol, fecha_creacion FROM users';
    const [rows] = await db.query(query);
    res.json(rows);
};
// Actualizar usuario por ID
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, email, rol } = req.body;

  try {
      const query = 'UPDATE users SET nombre = ?, apellido = ?, email = ?, rol = ? WHERE id = ?';
      await db.query(query, [nombre, apellido, email, rol, id]);

      res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

// Eliminar usuario por ID
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
      const query = 'DELETE FROM users WHERE id = ?';
      await db.query(query, [id]);

      res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};

// Buscar usuario por ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
      const query = 'SELECT id, nombre, apellido, email, rol, fecha_creacion FROM users WHERE id = ?';
      const [rows] = await db.query(query, [id]);

      if (rows.length === 0) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json(rows[0]);
  } catch (error) {
      res.status(500).json({ error: 'Error al buscar el usuario' });
  }
};