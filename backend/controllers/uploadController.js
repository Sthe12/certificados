const XLSX = require('xlsx');
const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');
const path = require('path');
const qrcode = require('qrcode');
const fetch = require('node-fetch');
const sharp = require('sharp');

const certificadosDir = path.join(__dirname, 'certificados');

// Crear la carpeta `certificados` si no existe
if (!fs.existsSync(certificadosDir)) {
  fs.mkdirSync(certificadosDir);
}

// Función para generar un certificado PDF
const generateCertificate = async (data, options = {}) => {
  const { nombre, curso, fecha, puntuacion } = data;
  const { fontSize = 16, fontColor = '#000000', imageFile = null, imageUrl = null } = options;

  // Generar el QR Code
  const qrCodeData = `http://localhost:3600/certificados/${nombre.replace(/\s+/g, '_')}_certificado.pdf`;
  const qrCodeBuffer = await qrcode.toBuffer(qrCodeData);

  // Crear el PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);

  // Configuración del tamaño y color de la fuente
  const fontSizeParsed = parseInt(fontSize, 10) || 16;
  const [r, g, b] = fontColor
    ? fontColor.match(/\w\w/g).map((hex) => parseInt(hex, 16) / 255)
    : [0, 0, 0]; // Color por defecto es negro
  const fontColorParsed = rgb(r, g, b);

  // Dibujar el texto en el PDF
  page.drawText('Certificado de Logro', { x: 200, y: 350, size: 24 });
  page.drawText(`Nombre: ${nombre}`, { x: 50, y: 300, size: fontSizeParsed, color: fontColorParsed });
  page.drawText(`Curso: ${curso}`, { x: 50, y: 270, size: fontSizeParsed, color: fontColorParsed });
  page.drawText(`Fecha: ${fecha}`, { x: 50, y: 240, size: fontSizeParsed, color: fontColorParsed });
  page.drawText(`Puntuación: ${puntuacion}`, { x: 50, y: 210, size: fontSizeParsed, color: fontColorParsed });

  // Función para manejar y convertir imágenes
  const handleImage = async (image) => {
    try {
      // Verificar el tipo de imagen con image-type
      const buffer = fs.readFileSync(image.path);
      const type = imageType(buffer);

      if (!type) {
        throw new Error('No se pudo detectar el tipo de imagen.');
      }

      // Si es un PNG o JPG
      if (type.ext === 'png') {
        return await pdfDoc.embedPng(buffer);
      } else if (type.ext === 'jpg' || type.ext === 'jpeg') {
        // Convertir JPG a PNG antes de insertar
        const imageBuffer = await sharp(image.path).png().toBuffer();
        return await pdfDoc.embedPng(imageBuffer);
      } else {
        throw new Error('Formato de imagen no soportado. Solo PNG o JPG están permitidos.');
      }
    } catch (error) {
      console.warn('Error al procesar la imagen:', error);
      return null;
    }
  };

  // Agregar la imagen cargada si existe
  let image;
  if (imageFile) {
    image = await handleImage(imageFile);
  } else if (imageUrl) {
    try {
      const response = await fetch(imageUrl);
      const imageBuffer = await response.buffer();
      const type = imageType(imageBuffer);

      if (type && (type.ext === 'png' || type.ext === 'jpg' || type.ext === 'jpeg')) {
        const imageEmbed = await pdfDoc.embedPng(imageBuffer);
        page.drawImage(imageEmbed, { x: 50, y: 100, width: 100, height: 100 });
      } else {
        console.warn('Formato de imagen no soportado desde la URL:', imageUrl);
      }
    } catch (error) {
      console.warn('Error al cargar imagen desde URL:', error);
    }
  }

  if (image) {
    page.drawImage(image, { x: 50, y: 100, width: 100, height: 100 });
  }

  // Agregar el código QR
  const qrImage = await pdfDoc.embedPng(qrCodeBuffer);
  page.drawImage(qrImage, { x: 400, y: 100, width: 100, height: 100 });

  return pdfDoc.save();
};

// Ruta para procesar la subida del archivo Excel
const handleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    }

    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    if (!rawData || rawData.length === 0) {
      return res.status(400).json({ error: 'El archivo Excel está vacío o no contiene datos válidos.' });
    }

    const normalizedData = rawData.map((row) => ({
      nombre: row['Nombre']?.toString().trim() || 'Desconocido',
      curso: row['Curso']?.toString().trim() || 'Sin curso',
      fecha: row['Fecha']?.toString().trim() || 'Fecha no proporcionada',
      puntuacion: row['Puntuacion']?.toString().trim() || 'N/A',
    }));

    res.json({ datos: normalizedData });
  } catch (error) {
    console.error('Error procesando el archivo Excel:', error);
    res.status(500).json({ error: 'Hubo un problema procesando el archivo.' });
  }
};

// Ruta para generar la vista previa del certificado
const handlePreview = async (req, res) => {
  try {
    const { nombre, curso, fecha, puntuacion, fontSize, fontColor, imageUrl } = req.body;
    const imageFile = req.file; // Archivo de imagen cargado (opcional)

    if (!nombre || !curso || !fecha || !puntuacion) {
      return res.status(400).json({ error: 'Faltan datos requeridos para generar la vista previa.' });
    }

    const pdfBytes = await generateCertificate(
      { nombre, curso, fecha, puntuacion },
      { fontSize, fontColor, imageFile, imageUrl }
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="preview_certificado.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error generando la vista previa del certificado:', error);
    res.status(500).json({ error: 'Hubo un problema generando la vista previa del certificado.' });
  }
};

// Ruta para generar y descargar el certificado
const handleDownload = async (req, res) => {
  try {
    const { nombre, curso, fecha, puntuacion, fontSize, fontColor, imageUrl } = req.body;
    const imageFile = req.file; // Archivo de imagen cargado (opcional)

    if (!nombre || !curso || !fecha || !puntuacion) {
      return res.status(400).json({ error: 'Faltan datos requeridos para generar el certificado.' });
    }

    const pdfBytes = await generateCertificate(
      { nombre, curso, fecha, puntuacion },
      { fontSize, fontColor, imageFile, imageUrl }
    );

    const pdfFilePath = path.join(certificadosDir, `${nombre.replace(/\s+/g, '_')}_certificado.pdf`);
    fs.writeFileSync(pdfFilePath, Buffer.from(pdfBytes));

    res.json({ url: `/certificados/${nombre.replace(/\s+/g, '_')}_certificado.pdf` });
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    res.status(500).json({ error: 'Hubo un problema al generar el certificado.' });
  }
};

module.exports = { handleUpload, handlePreview, handleDownload, generateCertificate };
