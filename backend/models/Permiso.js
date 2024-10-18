const db = require('../config/database');

class Permiso {
  static async create(name) {
    const [result] = await db.execute(
      'INSERT INTO permissions (name) VALUES (?)',
      [name]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM permissions WHERE id = ?', [id]);
    return rows[0];
  }

  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM permissions');
    return rows;
  }

  static async update(id, name) {
    await db.execute('UPDATE permissions SET name = ? WHERE id = ?', [name, id]);
  }

  static async delete(id) {
    await db.execute('DELETE FROM permissions WHERE id = ?', [id]);
  }

  static async assignToRole(roleId, permissionId) {
    await db.execute('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)', [roleId, permissionId]);
  }

  static async removeFromRole(roleId, permissionId) {
    await db.execute('DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?', [roleId, permissionId]);
  }

  static async getRolePermissions(roleId) {
    const [rows] = await db.execute(
      'SELECT p.* FROM permissions p INNER JOIN role_permissions rp ON p.id = rp.permission_id WHERE rp.role_id = ?',
      [roleId]
    );
    return rows;
  }
}

module.exports = Permiso;