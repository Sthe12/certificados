const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Actualizar los permisos de un rol
exports.updatePermissions = async (req, res) => {
    const { rol_id } = req.params;
    const { permisos } = req.body; // Array de permisos que se asignarán al rol

    try {
        // Primero eliminamos los permisos actuales del rol
        await db.query('DELETE FROM rol_permisos WHERE rol_id = ?', [rol_id]);

        // Insertamos los nuevos permisos
        for (let permiso_id of permisos) {
            await db.query('INSERT INTO rol_permisos (rol_id, permiso_id) VALUES (?, ?)', [rol_id, permiso_id]);
        }

        res.status(200).json({ message: 'Permisos actualizados correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar permisos' });
    }
};

exports.getRolePermissions = async (req, res) => {
    const { rol_id } = req.params;

    try {
        const [permisos] = await db.query(`
            SELECT p.id, p.nombre_permiso
            FROM permisos p
            INNER JOIN rol_permisos rp ON p.id = rp.permiso_id
            INNER JOIN roles r ON rp.rol_id = r.id
            WHERE r.rol = ?
        `, [rol_id]);
        if (permisos.length === 0) {
            return res.status(404).json({ message: 'Permisos no encontrados para este rol' });
        }
        res.status(200).json({ permisos });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener permisos del rol' });
    }
};