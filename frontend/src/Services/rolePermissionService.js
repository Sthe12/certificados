import api from './api';

const handleApiError = (error, operation) => {
  console.error(`Error in ${operation}:`, error.response || error);
  if (error.response && error.response.status === 404) {
    throw new Error(`La ruta para ${operation} no fue encontrada. Verifica la configuración del servidor.`);
  }
  throw error;
};

export const createRole = async (name) => {
  try {
    const response = await api.post('/role', { name });
    return response.data;
  } catch (error) {
    handleApiError(error, 'crear rol');
  }
};

export const getAllRoles = async () => {
  try {
    const response = await api.get('/roles');
    return response.data;
  } catch (error) {
    handleApiError(error, 'obtener roles');
  }
};

export const createPermission = async (name) => {
  try {
    const response = await api.post('/permissions', { name });
    return response.data;
  } catch (error) {
    handleApiError(error, 'crear permiso');
  }
};

export const getAllPermissions = async () => {
  try {
    const response = await api.get('/permissions');
    return response.data;
  } catch (error) {
    handleApiError(error, 'obtener permisos');
  }
};

export const assignRoleToUser = async (userId, roleId) => {
  try {
    const response = await api.post('/assign-role', { userId, roleId });
    return response.data;
  } catch (error) {
    handleApiError(error, 'asignar rol a usuario');
  }
};

export const assignPermissionToRole = async (roleId, permissionId) => {
  try {
    const response = await api.post('/assign-permission', { roleId, permissionId });
    return response.data;
  } catch (error) {
    handleApiError(error, 'asignar permiso a rol');
  }
};

export const getUserRoles = async (userId) => {
  try {
    const response = await api.get(`/user-roles/${userId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'obtener roles de usuario');
  }
};

export const getRolePermissions = async (roleId) => {
  try {
    const response = await api.get(`/role-permissions/${roleId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'obtener permisos de rol');
  }
};