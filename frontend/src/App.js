import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Componentes/Login';
import Modulos from './Componentes/Modulos';
import ProtectedRoute from './Componentes/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import TalentoRRHH from './Componentes/TalentoRRHH';
import Certificados from './Componentes/Certificados';
import InventarioTIC from './Componentes/InventarioTIC';
import RegistrarUsuario from './Componentes/RegistrarUsuarios';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/modulos" element={<ProtectedRoute><Modulos /></ProtectedRoute>} />
        <Route path="/talento-rrhh" element={<TalentoRRHH />} /> 
        <Route path="/certificados" element={<Certificados />} /> 
        <Route path="/inventario-tic" element={<InventarioTIC />} /> 
        <Route path="/registrar-usuarios" element={<RegistrarUsuario />} /> 
      </Routes>
    </Router>
  );
}

export default App;

