const jwt = require('jsonwebtoken');

const authMiddleware = {
  verifyToken(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({ message: 'Acceso denegado' });
    }

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = verified.userId;
      next();
    } catch (error) {
      res.status(404).json({ message: 'Token inválido' });
    }
  }
};

module.exports = authMiddleware;