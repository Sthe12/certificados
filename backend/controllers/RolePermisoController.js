const Role = require('../models/Rol');
const Permission = require('../models/Permiso');

exports.createRole = async (req, res) => {
  try {
    const { name } = req.body;
    const roleId = await Role.create(name);
    res.status(201).json({ message: 'Rol creado exitosamente', roleId });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear rol', error: error.message });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener roles', error: error.message });
  }
};

exports.createPermission = async (req, res) => {
  try {
    const { name } = req.body;
    const permissionId = await Permission.create(name);
    res.status(201).json({ message: 'Permiso creado exitosamente', permissionId });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear permiso', error: error.message });
  }
};

exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener permisos', error: error.message });
  }
};

exports.assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    await Role.assignToUser(userId, roleId);
    res.json({ message: 'Rol asignado exitosamente al usuario' });
  } catch (error) {
    res.status(500).json({ message: 'Error al asignar rol al usuario', error: error.message });
  }
};

exports.assignPermissionToRole = async (req, res) => {
  try {
    const { roleId, permissionId } = req.body;
    await Permission.assignToRole(roleId, permissionId);
    res.json({ message: 'Permiso asignado exitosamente al rol' });
  } catch (error) {
    res.status(500).json({ message: 'Error al asignar permiso al rol', error: error.message });
  }
};

exports.getUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;
    const roles = await Role.getUserRoles(userId);
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener roles del usuario', error: error.message });
  }
};

exports.getRolePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const permissions = await Permission.getRolePermissions(roleId);
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener permisos del rol', error: error.message });
  }
};