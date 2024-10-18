const db = require('../config/database');

class Role {
  static async create(name) {
    const [result] = await db.execute(
      'INSERT INTO roles (name) VALUES (?)',
      [name]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM roles WHERE id = ?', [id]);
    return rows[0];
  }

  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM roles');
    return rows;
  }

  static async update(id, name) {
    await db.execute('UPDATE roles SET name = ? WHERE id = ?', [name, id]);
  }

  static async delete(id) {
    await db.execute('DELETE FROM roles WHERE id = ?', [id]);
  }

  static async assignToUser(userId, roleId) {
    await db.execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, roleId]);
  }

  static async removeFromUser(userId, roleId) {
    await db.execute('DELETE FROM user_roles WHERE user_id = ? AND role_id = ?', [userId, roleId]);
  }

  static async getUserRoles(userId) {
    const [rows] = await db.execute(
      'SELECT r.* FROM roles r INNER JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?',
      [userId]
    );
    return rows;
  }
}

module.exports = Role;
