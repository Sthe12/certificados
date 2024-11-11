const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const rolPermisoRoutes = require('./routes/rolPermisoRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');


//dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',  // El origen permitido (el frontend)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Métodos permitidos
    credentials: true  // Si necesitas enviar cookies o cabeceras de autorización
}));

// Middlewares
app.use(express.json());
//modificacion
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rol-perm', rolPermisoRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/', uploadRoutes);
app.use('/certificados', express.static(path.join(__dirname, 'certificados')));

const PORT = process.env.PORT || 3600;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});





