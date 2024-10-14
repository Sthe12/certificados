import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Importa Link para la navegación
import './Modulos.css';
import { FaUserTie, FaCertificate, FaLaptop, FaPlusCircle, FaUser } from 'react-icons/fa'; // Íconos

// Componente de una tarjeta
const Card = ({ title, description, icon, link }) => (
    <Link to={link} className="card"> {/* Usa Link para hacer la tarjeta navegable */}
        <div className="icon">
            {icon}
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
    </Link>
);

function Modulos() {
    // Lista inicial de módulos
    const [modules, setModules] = useState([
        { id: 1, title: "Talento RRHH", description: "Gestión del talento humano", icon: <FaUserTie size={40} />, link: '/talento-rrhh' },
        { id: 2, title: "Certificados", description: "Generación y administración de certificados", icon: <FaCertificate size={40} />, link: '/certificados' },
        { id: 3, title: "Inventario TIC", description: "Gestión de inventario de tecnología", icon: <FaLaptop size={40} />, link: '/inventario-tic' },
        { id: 4, title: "Registro de Usuarios", description: "Gestión de Usuarios ", icon: <FaUser size={40} />, link: '/registrar-usuarios' },
    ]);

    // Función para agregar un nuevo módulo
    const addNewModule = () => {
        const newModule = {
            id: modules.length + 1,
            title: `Módulo ${modules.length + 1}`,
            description: `Descripción del módulo ${modules.length + 1}`,
            icon: <FaPlusCircle size={40} />,
            link: `/modulo/${modules.length + 1}`
        };
        setModules([...modules, newModule]);
    };

    return (
        <div className="grid-container">
            {modules.map((module) => (
                <Card
                    key={module.id}
                    title={module.title}
                    description={module.description}
                    icon={module.icon}
                    link={module.link}
                />
            ))}
            <div className="card add-card" onClick={addNewModule}>
                <div className="icon">
                    <FaPlusCircle size={40} />
                </div>
                <h3>Agregar Módulo</h3>
                <p>Haga clic para agregar un nuevo módulo</p>
            </div>
        </div>
    );
}

export default Modulos;
