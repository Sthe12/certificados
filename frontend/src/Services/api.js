import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3600/api/auth', 
  timeout: 10000, 
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      
      console.error('No response received:', error.request);
    } else {
      
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;