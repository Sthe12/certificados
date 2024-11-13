const XLSX = require('xlsx');
const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');
const path = require('path');
const qrcode = require('qrcode');
const fetch = require('node-fetch');

// Función para generar un certificado PDF
const generateCertificate = async (data, options = {}) => {
  const { nombre, curso, fecha, puntuacion } = data;
  const { fontSize = 16, fontColor = '#000000', imageUrl = null } = options;

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

  // Agregar la imagen si se proporciona
  if (imageUrl) {
    try {
      const imageBytes = await fetch(imageUrl).then((res) => res.arrayBuffer());
      const image = await pdfDoc.embedPng(imageBytes);
      page.drawImage(image, { x: 50, y: 100, width: 100, height: 100 });
    } catch (error) {
      console.warn('No se pudo cargar la imagen de la URL proporcionada:', error);
    }
  }

  // Agregar el código QR
  const qrImage = await pdfDoc.embedPng(qrCodeBuffer);
  page.drawImage(qrImage, { x: 400, y: 100, width: 100, height: 100 });

  return pdfDoc.save();
};

// Ruta para subir el archivo Excel
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

    if (!nombre || !curso || !fecha || !puntuacion) {
      return res.status(400).json({ error: 'Faltan datos requeridos para generar la vista previa.' });
    }

    const pdfBytes = await generateCertificate(
      { nombre, curso, fecha, puntuacion },
      { fontSize, fontColor, imageUrl }
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="preview_certificado.pdf"');
    res.send(Buffer.from(pdfBytes)); // Envía el PDF directamente
  } catch (error) {
    console.error('Error generando la vista previa del certificado:', error);
    res.status(500).json({ error: 'Hubo un problema generando la vista previa del certificado.' });
  }
};

// Ruta para descargar el certificado
const handleDownload = async (req, res) => {
  const { nombre, curso, fecha, puntuacion, fontSize, fontColor, imageUrl } = req.body;

  // Verifica si los parámetros son válidos
  if (!nombre || !curso || !fecha || !puntuacion) {
    return res.status(400).json({ error: 'Faltan datos requeridos para generar el certificado.' });
  }

  try {
    // Llama a la función para generar el certificado con las opciones personalizadas
    const pdfBytes = await generateCertificate(
      { nombre, curso, fecha, puntuacion },
      { fontSize, fontColor, imageUrl }
    );

    // Asegúrate de que el archivo PDF se genera correctamente
    console.log('PDF generado correctamente, enviando al frontend...');

    // Guarda el PDF generado en el servidor (si es necesario)
    const pdfFilePath = path.join(__dirname, '..', 'certificados', `${nombre.replace(/\s+/g, '_')}_certificado.pdf`);
    fs.writeFileSync(pdfFilePath, Buffer.from(pdfBytes));

    // Enviar el PDF directamente como respuesta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="certificado.pdf"');
    res.send(Buffer.from(pdfBytes)); // Envía el PDF directamente

  } catch (error) {
    console.error('Error al generar el PDF:', error);
    res.status(500).json({ error: 'Hubo un problema al generar el certificado.' });
  }
};

// Exportar las funciones
module.exports = { handleUpload, handlePreview, handleDownload };
