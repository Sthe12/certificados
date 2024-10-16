const User = require('../models/userModel');

const authorizationMiddleware = {
    hasPermission(requiredPermission) {
        return async (req, res, next) => {
            try {
                const permissions = await User.getUserPermissions(req.userId);
                if (permissions.includes(requiredPermission)) {
                    next();
                } else {
                    res.status(403).json({ message: 'Acceso denegado' });
                }
            } catch (error) {
                res.status(500).json({ message: 'Error en la autorización' });
            }
        };
    }
};

module.exports = authorizationMiddleware;