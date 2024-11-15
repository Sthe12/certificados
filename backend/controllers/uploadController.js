const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');
const qrcode = require('qrcode');
const fetch = require('node-fetch');
const sharp = require('sharp');

const certificadosDir = path.join(__dirname, '../certificados');

// Crear la carpeta `certificados` si no existe
if (!fs.existsSync(certificadosDir)) {
  fs.mkdirSync(certificadosDir, { recursive: true });
}

// Función para generar el certificado
const generateCertificate = async (data, options = {}) => {
  const { nombre, curso, fecha, puntuacion } = data;
  const { fontSize = 16, fontColor = '#000000', imageFile = null, imageUrl = null } = options;

  const doc = new jsPDF();

  // Configuración de texto
  doc.setFontSize(fontSize);
  const [r, g, b] = fontColor.match(/\w\w/g).map((hex) => parseInt(hex, 16));
  doc.setTextColor(r, g, b);

  // Texto del certificado
  doc.text('Certificado de Logro', 105, 50, { align: 'center' });
  doc.text(`Nombre: ${nombre}`, 20, 80);
  doc.text(`Curso: ${curso}`, 20, 100);
  doc.text(`Fecha: ${fecha}`, 20, 120);
  doc.text(`Puntuación: ${puntuacion}`, 20, 140);

  // Generar código QR
  const qrCodeData = `http://localhost:3600/certificados/${nombre.replace(/\s+/g, '_')}_certificado.pdf`;
  const qrCodeDataUrl = await qrcode.toDataURL(qrCodeData);
  doc.addImage(qrCodeDataUrl, 'PNG', 140, 120, 50, 50);

  // Procesar imagen
  const processImage = async (image) => {
    if (image) {
      const imageDataUrl = await sharp(image.path).resize(100, 100).toBuffer();
      return `data:image/png;base64,${imageDataUrl.toString('base64')}`;
    }
    return null;
  };

  let imageDataUrl = null;
  if (imageFile) {
    imageDataUrl = await processImage(imageFile);
  } else if (imageUrl) {
    try {
      const response = await fetch(imageUrl);
      const buffer = await response.buffer();
      imageDataUrl = `data:image/png;base64,${buffer.toString('base64')}`;
    } catch (error) {
      console.error('Error cargando la imagen desde URL:', error);
    }
  }

  if (imageDataUrl) {
    doc.addImage(imageDataUrl, 'PNG', 20, 160, 50, 50);
  }

  return doc.output('arraybuffer');
};

// Controlador para manejar la subida del archivo Excel
const handleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    }

    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const normalizedData = data.map((row) => ({
      nombre: row['Nombre']?.toString() || 'Desconocido',
      curso: row['Curso']?.toString() || 'Sin curso',
      fecha: row['Fecha']?.toString() || 'Sin fecha',
      puntuacion: row['Puntuacion']?.toString() || 'N/A',
    }));

    res.json({ datos: normalizedData });
  } catch (error) {
    console.error('Error procesando el archivo Excel:', error);
    res.status(500).json({ error: 'Hubo un problema procesando el archivo Excel.' });
  }
};

// Controlador para previsualizar un certificado
const handlePreview = async (req, res) => {
  try {
    const { nombre, curso, fecha, puntuacion, fontSize, fontColor, imageUrl } = req.body;
    const imageFile = req.file;

    if (!nombre || !curso || !fecha || !puntuacion) {
      return res.status(400).json({ error: 'Faltan datos requeridos para la vista previa.' });
    }

    const pdfBytes = await generateCertificate(
      { nombre, curso, fecha, puntuacion },
      { fontSize, fontColor, imageFile, imageUrl }
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="preview_certificado.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error generando la vista previa:', error);
    res.status(500).json({ error: 'Error al generar la vista previa.' });
  }
};

// Controlador para descargar un certificado
const handleDownload = async (req, res) => {
  try {
    const { nombre, curso, fecha, puntuacion, fontSize, fontColor, imageUrl } = req.body;
    const imageFile = req.file;

    if (!nombre || !curso || !fecha || !puntuacion) {
      return res.status(400).json({ error: 'Faltan datos requeridos para generar el certificado.' });
    }

    const pdfBytes = await generateCertificate(
      { nombre, curso, fecha, puntuacion },
      { fontSize, fontColor, imageFile, imageUrl }
    );

    const pdfFilePath = path.join(certificadosDir, `${nombre.replace(/\s+/g, '_')}_certificado.pdf`);
    fs.writeFileSync(pdfFilePath, Buffer.from(pdfBytes));

    res.download(pdfFilePath, `${nombre.replace(/\s+/g, '_')}_certificado.pdf`);
  } catch (error) {
    console.error('Error al generar o descargar el certificado:', error);
    res.status(500).json({ error: 'Error al descargar el certificado.' });
  }
};

module.exports = { handleUpload, handlePreview, handleDownload };
