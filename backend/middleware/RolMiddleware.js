// src/middlewares/roleMiddleware.js
const Role = require('../models/Rol');
const Permission = require('../models/Permiso');

exports.checkRole = (roleName) => {
  return async (req, res, next) => {
    try {
      const userRoles = await Role.getUserRoles(req.userData.userId);
      if (userRoles.some(role => role.name === roleName)) {
        next();
      } else {
        res.status(403).json({ message: 'Acceso denegado: rol requerido' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al verificar rol', error: error.message });
    }
  };
};

exports.checkPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      const userRoles = await Role.getUserRoles(req.userData.userId);
      let hasPermission = false;
      for (let role of userRoles) {
        const rolePermissions = await Permission.getRolePermissions(role.id);
        if (rolePermissions.some(permission => permission.name === permissionName)) {
          hasPermission = true;
          break;
        }
      }
      if (hasPermission) {
        next();
      } else {
        res.status(403).json({ message: 'Acceso denegado: permiso requerido' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al verificar permiso', error: error.message });
    }
  };
};