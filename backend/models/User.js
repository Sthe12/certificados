const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(firstName, lastName, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM users');
    return rows;
  }

  static async update(id, updates) {
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const query = `UPDATE users SET ${keys.map(key => `${key} = ?`).join(', ')} WHERE id = ?`;
    const [result] = await db.execute(query, [...values, id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async search(query, limit = 10, offset = 0) {
    const searchQuery = `%${query}%`;
    const [rows] = await db.execute(
      'SELECT id, first_name, last_name, email FROM users WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? LIMIT ? OFFSET ?',
      [searchQuery, searchQuery, searchQuery, limit, offset]
    );
    return rows;
  }

  static async count() {
    const [result] = await db.execute('SELECT COUNT(*) as total FROM users');
    return result[0].total;
  }
}

module.exports = User;