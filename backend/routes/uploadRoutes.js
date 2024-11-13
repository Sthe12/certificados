const express = require('express');
const multer = require('multer');
const { handleUpload, handleDownload, handlePreview } = require('../controllers/uploadController');
const path = require('path');

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

const upload = multer({ storage });

// Ruta para subir el archivo Excel
router.post('/upload', upload.single('file'), handleUpload);

// Ruta para previsualizar el certificado
router.post('/preview', handlePreview);

// Ruta para descargar el certificado generado
router.post('/certificados/descargar', handleDownload);

// Exporta el router
module.exports = router;
