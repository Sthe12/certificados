const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Primero verificamos si existe el header de Authorization
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ message: 'No hay token, permiso denegado' });
    }

    try {
        // Solo intentamos reemplazar si existe el header
        const token = authHeader.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Token no proporcionado' });
        }

        // Verificamos el token usando tu misma secretkey
        const decoded = jwt.verify(token, 'secretkey');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token no válido' });
    }
};

module.exports = { verifyToken };