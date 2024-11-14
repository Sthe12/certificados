const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {
  handleUpload,
  handleDownload,
  handlePreview,
} = require('../controllers/uploadController');

const router = express.Router();

// Configuración de multer para la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos subidos
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para cada archivo subido
  },
});

// Configuración de multer con límite de tamaño de archivo (10MB)
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Ruta para subir el archivo Excel
router.post('/upload', upload.single('file'), handleUpload);

// Ruta para previsualizar el certificado
router.post(
  '/preview',
  upload.single('image'), // Manejar la imagen cargada si se incluye
  handlePreview
);

// Ruta para descargar el certificado generado
router.post(
  '/certificados/descargar',
  upload.single('image'), // Manejar la imagen cargada si se incluye
  handleDownload
);

// Exporta el router
module.exports = router;
