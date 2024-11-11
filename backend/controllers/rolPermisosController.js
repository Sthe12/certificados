const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Actualizar los permisos de un rol
exports.updatePermissions = async (req, res) => {
    const { role_id } = req.params; // ID del rol a actualizar
    const { permisos } = req.body; // Array de permisos enviado desde el frontend

    try {
        // Verifica que `permisos` sea un array válido
        if (!permisos || !Array.isArray(permisos)) {
            return res.status(400).json({ message: 'Permisos inválidos o no proporcionados' });
        }

        // Verifica si el rol existe en la base de datos
        const [roleExists] = await db.query(`SELECT 1 FROM roles WHERE id = ?`, [role_id]);
        if (roleExists.length === 0) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }

        // Verifica que cada `permiso` en el array exista en la tabla `permisos`
        for (let permiso of permisos) {
            const [permisoExists] = await db.query(`SELECT 1 FROM permisos WHERE id = ?`, [permiso]);
            if (permisoExists.length === 0) {
                return res.status(400).json({ message: `Permiso con ID ${permiso} no encontrado` });
            }
        }

        // Elimina todos los permisos actuales del rol en `rol_permisos`
        await db.query(`DELETE FROM rol_permisos WHERE rol_id = ?`, [role_id]);

        // Inserta cada nuevo permiso para el rol
        for (let permiso of permisos) {
            await db.query(`
                INSERT INTO rol_permisos (rol_id, permiso_id)
                VALUES (?, ?)
            `, [role_id, permiso]);
        }

        res.status(200).json({ message: 'Permisos actualizados exitosamente' });
    } catch (error) {
        console.error('Error en el servidor al actualizar permisos:', error.message);
        res.status(500).json({ error: 'Error al actualizar permisos en el servidor' });
    }
};



exports.getRolePermissions = async (req, res) => {
    const { role_id } = req.params;  // Aquí recibes el nombre del rol

    console.log('Nombre del rol recibido:', role_id);  // Verificar si el rol se recibe correctamente

    try {
        const [permisos] = await db.query(`
            SELECT p.id, p.nombre_permiso
            FROM permisos p
            INNER JOIN rol_permisos rp ON p.id = rp.permiso_id
            INNER JOIN roles r ON rp.rol_id = r.id
            WHERE r.id = ?
        `, [role_id]);  // Usar el nombre del rol para la consulta

        console.log('Permisos obtenidos:', permisos);  // Verificar si se están obteniendo permisos correctamente

         res.status(200).json({ permisos: permisos.length ? permisos : [] });
    } catch (error) {
        console.error('Error en la consulta:', error);  // Mostrar el error en el backend
        res.status(500).json({ error: 'Error al obtener permisos del rol' });
    }
};
