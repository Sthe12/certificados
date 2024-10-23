import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaUserPlus, FaSave, FaTimes, FaCog } from 'react-icons/fa';

function RegistrarUsuarios() {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('');
    const [userId, setUserId] = useState(null);
    const [users, setUsers] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const token = localStorage.getItem('token');

    // Permisos disponibles
    const permisosDisponibles = [
        'user_management',
        'project_management',
        'view_technical_docs',
        'robot_development',
        'view_reports',
        'robot_maintenance',
        'view_inventory'
    ];

    const fetchUsers = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:3600/api/users/user', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(response.data); // Assuming response.data contains the array of users
        } catch (err) {
            Swal.fire('Error', 'Error al obtener usuarios', 'error');
        }
    }, [token]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3600/api/users/register', 
                { nombre, apellido, email, password, rol },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
            );
            Swal.fire('Éxito', `Usuario registrado exitosamente (ID: ${response.data.userId})`, 'success');
            resetForm();
            fetchUsers();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Error al registrar usuario', 'error');
        }
    };

    const handleEdit = (user) => {
        setNombre(user.nombre);
        setApellido(user.apellido);
        setEmail(user.email);
        setRol(user.rol);
        setUserId(user.id);
        setIsEditing(true);
        setIsCreating(false);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:3600/api/users/update-user/${userId}`,
                { nombre, apellido, email, rol },
                { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            Swal.fire('Éxito', `Usuario ${userId} actualizado exitosamente`, 'success');
            resetForm();
            fetchUsers();
        } catch (err) {
            Swal.fire('Error', 'Error al actualizar usuario', 'error');
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:3600/api/users/delete-user/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    Swal.fire('Eliminado', `Usuario ${id} eliminado exitosamente`, 'success');
                    fetchUsers();
                } catch (err) {
                    Swal.fire('Error', 'Error al eliminar usuario', 'error');
                }
            }
        });
    };

    // Función para configurar permisos de un usuario
    const handleConfigurarPermisos = async (user) => {
        console.log(user); // Verifica si el campo rol_id está presente
        try {
            // Obtener los permisos actuales del rol seleccionado
            const response = await axios.get(`http://localhost:3600/api/rol-perm/roles/${user.rol_id}/permisos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setSelectedUser({
                ...user,
                permisos: response.data.permisos.map(p => p.nombre_permiso) // Asigna los permisos del rol actual
            });

            setIsConfiguring(true);
        } catch (err) {
            Swal.fire('Error', 'Error al obtener los permisos del rol', 'error');
        }
    };

    const togglePermiso = (permiso) => {
        if (selectedUser.permisos.includes(permiso)) {
            setSelectedUser({
                ...selectedUser,
                permisos: selectedUser.permisos.filter(p => p !== permiso)
            });
        } else {
            setSelectedUser({
                ...selectedUser,
                permisos: [...selectedUser.permisos, permiso]
            });
        }
    };

    const savePermisos = async () => {
        try {
            await axios.put(`http://localhost:3600/api/rol-perm/roles/${selectedUser.rol_id}/permisos`, 
                { permisos: selectedUser.permisos },
                { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            Swal.fire('Éxito', `Permisos del rol actualizados exitosamente`, 'success');
            setIsConfiguring(false);
            fetchUsers();
        } catch (err) {
            Swal.fire('Error', 'Error al actualizar permisos', 'error');
        }
    };

    const resetForm = () => {
        setNombre('');
        setApellido('');
        setEmail('');
        setPassword('');
        setRol('');
        setUserId(null);
        setIsEditing(false);
        setIsCreating(false);
        setIsConfiguring(false);
    };

    const filteredUsers = users.filter(user =>
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Gestión de Usuarios</h2>

            {/* Campo de búsqueda */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>

            {/* Botón para crear usuarios */}
            <button
                onClick={() => { setIsCreating(true); setIsEditing(false); setIsConfiguring(false); }}
                className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
                <FaUserPlus className="mr-2" /> Crear Usuario
            </button>

            {/* Tabla de usuarios */}
            <div className="overflow-x-auto mt-4">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">Nombre</th>
                            <th className="px-4 py-2">Apellido</th>
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">Rol</th>
                            <th className="px-4 py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2">{user.id}</td>
                                <td className="px-4 py-2">{user.nombre}</td>
                                <td className="px-4 py-2">{user.apellido}</td>
                                <td className="px-4 py-2">{user.email}</td>
                                <td className="px-4 py-2">{user.rol}</td>
                                <td className="px-4 py-2">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="mr-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                                    >
                                        <FaTrash />
                                    </button>
                                    <button
                                        onClick={() => handleConfigurarPermisos(user)}
                                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded"
                                    >
                                        <FaCog /> Configurar Permisos
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Formulario para crear o editar usuarios */}
            {(isCreating || isEditing) && (
                <div className="mt-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <h3 className="text-xl font-bold mb-4">{isEditing ? 'Editar Usuario' : 'Crear Usuario'}</h3>
                    <form onSubmit={isEditing ? handleUpdate : handleRegister}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nombre">
                                Nombre:
                            </label>
                            <input
                                id="nombre"
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apellido">
                                Apellido:
                            </label>
                            <input
                                id="apellido"
                                type="text"
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                                required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Email:
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Contraseña:
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required={!isEditing} // El password solo es requerido en la creación
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rol">
                                Rol:
                            </label>
                            <select
                                id="rol"
                                value={rol}
                                onChange={(e) => setRol(e.target.value)}
                                required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                <option value="">Seleccionar Rol</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                            >
                                <FaSave className="mr-2" /> {isEditing ? 'Actualizar' : 'Registrar'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                            >
                                <FaTimes className="mr-2" /> Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal para configurar permisos */}
            {isConfiguring && selectedUser && (
                <div className="modal bg-white p-6 rounded shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Configurar Permisos para {selectedUser.nombre}</h3>
                    <div className="permissions-list">
                        {permisosDisponibles.map((permiso) => (
                            <label key={permiso} className="block mb-2">
                                <input
                                    type="checkbox"
                                    checked={selectedUser.permisos && selectedUser.permisos.includes(permiso)}
                                    onChange={() => togglePermiso(permiso)}
                                    className="mr-2"
                                />
                                {permiso.replace('_', ' ').toUpperCase()}
                            </label>
                        ))}
                    </div>
                    <button
                        onClick={savePermisos}
                        className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        <FaSave className="mr-2" /> Guardar Permisos
                    </button>
                    <button
                        onClick={() => setIsConfiguring(false)}
                        className="mt-4 ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                        <FaTimes className="mr-2" /> Cancelar
                    </button>
                </div>
            )}
        </div>
    );
}

export default RegistrarUsuarios;
