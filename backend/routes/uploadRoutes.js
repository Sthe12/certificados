const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {
  handleUpload,
  handleDownload,
  handlePreview,
} = require('../controllers/uploadController.js');

const router = express.Router();

// Configuración de multer para la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Crear la carpeta si no existe
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// Configuración de multer con límite de tamaño de archivo (10MB)
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Middleware para verificar si se sube una imagen
const validateImage = (req, res, next) => {
  if (req.file) {
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: 'Solo se permiten imágenes en formato PNG, JPG o JPEG.',
      });
    }
  }
  next();
};

// Rutas

// Ruta para subir un archivo Excel
router.post('/upload', upload.single('file'), handleUpload);

// Ruta para previsualizar un certificado
router.post(
  '/preview',
  upload.single('image'), // Cargar imagen opcional
  validateImage, // Validar que sea una imagen válida
  handlePreview
);

// Ruta para descargar un certificado (actualizada a /certificados/descargar)
router.post(
  '/certificados/descargar', // Cambiado a /certificados/descargar para coincidir con el frontend
  upload.single('image'), // Cargar imagen opcional
  validateImage, // Validar que sea una imagen válida
  handleDownload
);

// Exporta el router
module.exports = router;
