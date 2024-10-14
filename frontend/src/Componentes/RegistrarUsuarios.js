import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function RegistrarUsuarios() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userId, setUserId] = useState(null);
    const [users, setUsers] = useState([]);
    const [isCreating, setIsCreating] = useState(false); 
    const [isEditing, setIsEditing] = useState(false);  

    // Obtener el token del localStorage (si el usuario está autenticado)
    const token = localStorage.getItem('token');

    // Función para obtener la lista de usuarios desde el backend
    const fetchUsers = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:3600/api/auth/users', {
                headers: {
                    'Authorization': `Bearer ${token}`  // Enviar token JWT en el encabezado
                }
            });
            setUsers(response.data.users);  // Asignar la lista de usuarios
        } catch (err) {
            Swal.fire('Error', 'Error al obtener usuarios', 'error');
        }
    }, [token]);

    // Llamar a fetchUsers cuando el componente se monta
    useEffect(() => {
        fetchUsers();  // Obtener la lista de usuarios cuando el componente se carga
    }, [fetchUsers]);

    // Registrar un nuevo usuario
    const handleRegister = async (e) => {
        e.preventDefault();

        const body = { username, password };
        const headers = { 'Content-Type': 'application/json' };

        try {
            const response = await axios.post('http://localhost:3600/api/auth/register', body, { headers });
            const { userId } = response.data;

            Swal.fire('Éxito', `Usuario registrado exitosamente (ID: ${userId})`, 'success');
            setUsername('');
            setPassword('');
            setIsCreating(false);  // Ocultar formulario de creación
            fetchUsers();  // Actualizar la lista de usuarios
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Error al registrar usuario', 'error');
        }
    };

    // Cargar los datos de un usuario para editar
    const handleEdit = (user) => {
        setUsername(user.username);
        setUserId(user.id);
        setIsEditing(true);  // Mostrar formulario de edición
    };

    // Actualizar un usuario
    const handleUpdate = async (e) => {
        e.preventDefault();

        const body = { username, password };
        try {
            await axios.put(`http://localhost:3600/api/auth/users/${userId}`, body, {
                headers: {
                    'Authorization': `Bearer ${token}`,  // Enviar el token JWT para la autenticación
                    'Content-Type': 'application/json'
                }
            });

            Swal.fire('Éxito', `Usuario ${userId} actualizado exitosamente`, 'success');
            setUsername('');
            setPassword('');
            setIsEditing(false);  // Ocultar formulario de edición
            fetchUsers();  // Actualizar la lista de usuarios
        } catch (err) {
            Swal.fire('Error', 'Error al actualizar usuario', 'error');
        }
    };

    // Eliminar un usuario
    const handleDelete = async (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'No, cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:3600/api/auth/users/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`  // Enviar el token JWT para la autenticación
                        }
                    });
                    Swal.fire('Eliminado', `Usuario ${id} eliminado exitosamente`, 'success');
                    fetchUsers();  // Actualizar la lista de usuarios
                } catch (err) {
                    Swal.fire('Error', 'Error al eliminar usuario', 'error');
                }
            }
        });
    };

    return (
        <div>
            <h2>Usuarios Registrados</h2>

            {/* Tabla de usuarios */}
            <table border="1" cellPadding="10" cellSpacing="0">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre de usuario</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>
                                <button onClick={() => handleEdit(user)}>Editar</button>
                                <button onClick={() => handleDelete(user.id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Botón para crear un nuevo usuario */}
            <button onClick={() => setIsCreating(true)} style={{ margin: '20px 0' }}>Crear Usuario</button>

            {/* Formulario de creación */}
            {isCreating && (
                <div className="card">
                    <h3>Crear Usuario</h3>
                    <form onSubmit={handleRegister}>
                        <div>
                            <label>Nombre de usuario:</label>
                            <input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                            />
                        </div>
                        <div>
                            <label>Contraseña:</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="submit">Registrar</button>
                    </form>
                </div>
            )}

            {/* Formulario de edición */}
            {isEditing && (
                <div className="card">
                    <h3>Editar Usuario</h3>
                    <form onSubmit={handleUpdate}>
                        <div>
                            <label>Nuevo nombre de usuario:</label>
                            <input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                            />
                        </div>
                        <div>
                            <label>Nueva contraseña:</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="submit">Actualizar Usuario</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default RegistrarUsuarios;
