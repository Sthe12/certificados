const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No hay token, permiso denegado' });
    }

    try {
        const decoded = jwt.verify(token, 'secretkey');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token no válido' });
    }
};

module.exports = { verifyToken };

function authorizeRoles(roles = []) {
  return (req, res, next) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
          return res.status(401).json({ message: 'Token no proporcionado' });
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
          if (err) return res.status(403).json({ message: 'Token inválido' });

          // Verificar si el usuario tiene uno de los roles permitidos
          if (!roles.includes(user.role)) {
              return res.status(403).json({ message: 'No tienes permiso para acceder' });
          }

          req.user = user;  // Agregar el usuario a la solicitud
          next();
      });
  };
}
module.exports = { authorizeRoles };