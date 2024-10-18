const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const RolPermisoRoute = require('./routes/RolPermisoRoutes');
const User = require('./models/userModel');

dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',  // El origen permitido (el frontend)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Métodos permitidos
    credentials: true  // Si necesitas enviar cookies o cabeceras de autorización
}));

// Middlewares
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes, RolPermisoRoute);

const PORT = process.env.PORT || 3600;

async function startServer() {
  try {
    const isConnected = await User.testConnection();
    if (isConnected) {
      app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
    } else {
      console.error('No se pudo establecer la conexión a la base de datos. El servidor no se iniciará.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();

