const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const User = {
    // Crear un nuevo usuario
    async create(username, hashedPassword) {
        const [result] = await pool.query(
            'INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]
        );
        return result.insertId;
    },

    // Buscar usuario por nombre de usuario
    async findByUsername(username) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE username = ?', [username]
        );
        return rows[0]; 
    },

    // Buscar usuario por ID
    async findById(id) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE id = ?', [id]
        );
        return rows[0]; 
    },

    // Obtener todos los usuarios
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM users');
        return rows; 
    },

    // Actualizar un usuario
    async update(id, { username, password }) {
        const [result] = await pool.query(
            'UPDATE users SET username = ?, password = ? WHERE id = ?', [username, password, id]
        );
        return result.affectedRows; 
    },

    // Eliminar un usuario
    async delete(id) {
        const [result] = await pool.query(
            'DELETE FROM users WHERE id = ?', [id]
        );
        return result.affectedRows; 
    },

    // Probar la conexión con la base de datos
    async testConnection() {
        try {
            const connection = await pool.getConnection();
            console.log('Conexión exitosa a la base de datos.');
            connection.release();
            return true;
        } catch (error) {
            console.error('Error al conectar a la base de datos:', error.message);
            return false;
        }
    },
    // Obtener roles de un usuario
    async getUserRoles(userId) {
        const [rows] = await pool.query(
            'SELECT r.name FROM roles r INNER JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?',
            [userId]
        );
        return rows.map(row => row.name);
    },

    // Obtener permisos de un usuario
    async getUserPermissions(userId) {
        const [rows] = await pool.query(
            'SELECT DISTINCT p.name FROM permissions p ' +
            'INNER JOIN role_permissions rp ON p.id = rp.permission_id ' +
            'INNER JOIN user_roles ur ON rp.role_id = ur.role_id ' +
            'WHERE ur.user_id = ?',
            [userId]
        );
        return rows.map(row => row.name);
    },

    // Asignar rol a un usuario
    async assignRole(userId, roleName) {
        const [role] = await pool.query('SELECT id FROM roles WHERE name = ?', [roleName]);
        if (role.length === 0) throw new Error('Role not found');
        
        await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, role[0].id]);
    },

    // Remover rol de un usuario
    async removeRole(userId, roleName) {
        const [role] = await pool.query('SELECT id FROM roles WHERE name = ?', [roleName]);
        if (role.length === 0) throw new Error('Role not found');
        
        await pool.query('DELETE FROM user_roles WHERE user_id = ? AND role_id = ?', [userId, role[0].id]);
    }

};

module.exports = User;
