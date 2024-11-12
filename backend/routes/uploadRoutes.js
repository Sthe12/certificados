const express = require('express');
const multer = require('multer');
//const { processUpload } = require('../controllers/uploadController');
const { handleUpload, handleDownload, handlePreview } = require('../controllers/uploadController');
const path = require('path');
//const { handleUpload, processUpload } = require('../controllers/uploadController');

const router = express.Router();
//const upload = multer({ dest: 'uploads/' });

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


// Define la ruta y asocia el controlador
//router.post('/upload', upload.single('file'), processUpload);
router.post('/upload', upload.single('file'), handleUpload);
router.get('/download/:id', handleDownload);
router.post('/upload', handleUpload);
router.post('/preview', handlePreview);

module.exports = router;
