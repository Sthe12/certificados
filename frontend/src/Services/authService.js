import api from './api';

export const login = (email, password) => {
  return api.post('/login', { email, password });
};

export const register = (firstName, lastName, email, password) => {
  return api.post('/register', { firstName, lastName, email, password });
};

export const logout = () => {
  return api.post('/logout');
};