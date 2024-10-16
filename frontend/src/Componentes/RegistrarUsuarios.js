/*import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaUserPlus, FaSave, FaTimes } from 'react-icons/fa';

function RegistrarUsuarios() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userId, setUserId] = useState(null);
    const [users, setUsers] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');

    const token = localStorage.getItem('token');

    const fetchUsers = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:3600/api/auth/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(response.data.users);
        } catch (err) {
            Swal.fire('Error', 'Error al obtener usuarios', 'error');
        }
    }, [token]);

    const fetchRoles = useCallback(async()=>{
        try{
            const response = await axios.get('http://localhost:3600/api/auth/roles',{
                headers: {'Authorization': `Bearer ${token}`}
            });
            setRoles(response.data.roles);
        }catch(err){
            Swal.fire('Error','Error al obtener roles','error');
        }
    },[token]);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [fetchUsers,fetchRoles]);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3600/api/auth/register', 
                { username, password },
                { headers: { 'Content-Type': 'application/json' } }
            );
            Swal.fire('Éxito', `Usuario registrado exitosamente (ID: ${response.data.userId})`, 'success');
            resetForm();
            fetchUsers();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Error al registrar usuario', 'error');
        }
    };

    const handleEdit = (user) => {
        setUsername(user.username);
        setUserId(user.id);
        setIsEditing(true);
        setIsCreating(false);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:3600/api/auth/users/${userId}`,
                { username, password },
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
                    await axios.delete(`http://localhost:3600/api/auth/users/${id}`, {
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

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setUserId(null);
        setIsEditing(false);
        setIsCreating(false);
    };
    
    const handleAssignRole = async (userId) =>{
        try{
            await axios.post('http://localhost:3600/api/auth/assign-role',
                {userId, roleName:selectedRole},
                {headers: {'Authorization':`Bearer ${token}` }}
            );
            Swal.fire('Exito', 'Rol asignado correctamente', 'success');
            fetchUsers();
        }catch(err){
            Swal.fire('Error', 'Error al asignar rol', 'error');
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Gestión de Usuarios</h2>

            {/* Barra de búsqueda 
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>

            {/* Tabla de usuarios 
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">Nombre de usuario</th>
                            <th classNmae="px-4 py-2">Roles</th>
                            <th className="px-4 py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2">{user.id}</td>
                                <td className="px-4 py-2">{user.username}</td>
                                <td className="px-4 py-2">{user.roles.join(',')}</td>
                                <td className="px-4 py-2">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                                        aria-label="Editar usuario"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                                        aria-label="Eliminar usuario"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Botón para crear un nuevo usuario 
            <button
                onClick={() => { setIsCreating(true); setIsEditing(false); }}
                className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
                <FaUserPlus className="mr-2" /> Crear Usuario
            </button>

            {/* Formulario de creación/edición 
            {(isCreating || isEditing) && (
                <div className="mt-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <h3 className="text-xl font-bold mb-4">{isEditing ? 'Editar Usuario' : 'Crear Usuario'}</h3>
                    <form onSubmit={isEditing ? handleUpdate : handleRegister}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                Usuario:
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
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
                                required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            />
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
            {/* Formulario para asignar roles
            <div className = "mt-4 bg-white shadow/md rouded px-8 pt-6 pb-8 mb-4">
                <h3 className = "text-xl font-bold mb-4">Asignar Rol</h3>
                <div className="mb-4">
                    <label className = "block text-gray-700 text-sm font-bold mb-2" htmlFor='role'>
                        Rol:
                    </label>
                    <select
                        id = "role"
                        value = {selectedRole}
                        onChange = {(e) => setSelectedRole(e.target.value)}
                        className = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                     <option value="">Seleccione un rol</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.name}>{role.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => handleAssignRole(userId)}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={!selectedRole || !userId}
                >
                    Asignar Rol
                </button>
            </div>
        </div>
    );
}

export default RegistrarUsuarios;*/

import React, { useState, useEffect } from 'react';
import { getAllUsers, deleteUser } from '../Services/userService';
import { getAllRoles, assignRoleToUser } from '../Services/rolePermissionService';

const RegistrarUsuarios = () => {
  const [users, setUsers] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(`Failed to fetch users: ${error.message}`);
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await getAllRoles();
      setRoles(response.data);
      setLoading(false);
    } catch (error) {
      setError(`Error al obtener roles: ${error.message}`);
    }
  };
  
  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(`Failed to delete user: ${error.message}`);
    }
  };

  const handleAssignRole = async (userId, roleId) => {
    try {
      await assignRoleToUser(userId, roleId);
      fetchUsers();
    } catch (error) {
      console.error('Error assigning role:', error);
      setError(`Failed to assign role: ${error.message}`);
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-600">Error: {error}</div>;
  if (!users) return <div className="text-center py-4">No user data available.</div>;
  if (!roles) return <div className="text-center py-4">No user data available.</div>;
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold mb-4">Registro Usuario</h1>
      {users.length === 0 ? (
        <p className="text-center py-4">No users found.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{`${user.firstName} ${user.lastName}`}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    onChange={(e) => handleAssignRole(user.id, e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Assign Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RegistrarUsuarios;