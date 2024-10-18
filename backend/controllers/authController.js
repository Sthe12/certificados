const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    const [user] = await db.query(query, [email]);

    if (user.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);

    if (!isMatch) {
        return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user[0].id, rol: user[0].rol }, 'secretkey', { expiresIn: '1h' });

    res.json({ token });
};
