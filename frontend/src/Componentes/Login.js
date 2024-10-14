import axios from 'axios';
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
                    <label className="text-start">Username:</label> {/* Clases de Bootstrap para alinear a la izquierda */}
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

export default Login;
