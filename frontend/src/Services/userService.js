import api from './api';

export const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error in getAllUsers:', error.response || error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error in getUserById for id ${id}:`, error.response || error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users-update/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error in updateUser for id ${id}:`, error.response || error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/delete-user/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error in deleteUser for id ${id}:`, error.response || error);
    throw error;
  }
};