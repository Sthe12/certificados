import React, { createContext, useState, useEffect } from 'react';
import { getUserById } from '../Services/userService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: null, user: null });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user data if token exists
      getUserById('me') 
        .then(response => {
          setAuth({ token, user: response.data });
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('token');
          setAuth({ token: null, user: null });
        });
    }
  }, []);

  const login = (token, user) => {
    localStorage.setItem('token', token);
    setAuth({ token, user });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
