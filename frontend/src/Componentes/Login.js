/*import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa'; // Iconos para los inputs
import './Login.css'; // Puedes agregar estilos personalizados en un archivo CSS separado

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        //se necesita un body para envio de los parametros
        const body = {
            username: username,
            password: password
        };

        // aqui se pasa por un formato json los datos enviados por el body
        const headers = {
            'Content-Type': 'application/json'  
        };

        try {
            const response = await axios.post('http://localhost:3600/api/auth/login', body, { headers });
            // Si el login es exitoso, almacenar el token en localStorage
            localStorage.setItem('token', response.data.token);
            console.log('Login exitoso. Token recibido:', response.data.token);
            // Redirigir al usuario a otra página
            navigate('/modulos');
        } catch (err) {
            console.error('Error al iniciar sesión:', err.response ? err.response.data.message : err.message);
            setError(err.response ? err.response.data.message : 'Error al iniciar sesión');
        }
    };

    return (
        <div className="login-container d-flex justify-content-center align-items-center vh-100">
        <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
            <h2 className="text-center mb-4">Login</h2>
            <form onSubmit={handleLogin}>
                <div className="form-group mb-3">
                    <label className="text-start">Username:</label> {/* Clases de Bootstrap para alinear a la izquierda 
                    <div className="input-group">
                        <span className="input-group-text">
                            <FaUser />
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="form-group mb-3">
                    <label className="text-start">Password:</label>
                    <div className="input-group">
                        <span className="input-group-text">
                            <FaLock />
                        </span>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>
                {error && <p className="text-danger text-center">{error}</p>}
                <button type="submit" className="btn btn-primary w-100">
                    Login
                </button>
            </form>
        </div>
        </div>
    );
}

export default Login;*/

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { login as loginService } from '../Services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await loginService(email, password);
      login(response.data.token, response.data.user);
      navigate('/modulos');
    } catch (error) {
      setError('Login failed. Please check your credentials.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Iniciar sesión
        </h2>
        {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Iniciar sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;