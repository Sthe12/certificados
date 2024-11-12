const XLSX = require('xlsx');
const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');
const path = require('path');
const qrcode = require('qrcode');
const fetch = require('node-fetch');

// Función para generar un certificado PDF (predeterminado o personalizado)
const generateCertificate = async (data, options = {}) => {
  const { nombre, curso, fecha, puntuacion } = data;
  const { fontSize = 16, fontColor = '#000000', imageUrl = null } = options;

  // Generar el QR Code
  const qrCodeData = `http://localhost:3600/certificados/${nombre.replace(/\s+/g, '_')}_certificado.pdf`;
  const qrCodeBuffer = await qrcode.toBuffer(qrCodeData);

  // Crear el PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);

  const fontSizeParsed = parseInt(fontSize) || 16;
  const [r, g, b] = fontColor
    ? fontColor.match(/\w\w/g).map((hex) => parseInt(hex, 16) / 255)
    : [0, 0, 0];
  const fontColorParsed = rgb(r, g, b);

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

// Ruta para subir el archivo Excel y extraer los datos
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

// Ruta para vista previa de un certificado
// Ruta para generar la vista previa del certificado con personalización
const handlePreview = async (req, res) => {
  try {
    const { nombre, curso, fecha, puntuacion, fontSize, fontColor, imageUrl } = req.body;

    if (!nombre || !curso || !fecha || !puntuacion) {
      return res.status(400).json({ error: 'Faltan datos requeridos para generar la vista previa.' });
    }

    // Generar el QR Code
    const qrCodeData = `http://localhost:3600/certificados/${nombre.replace(/\s+/g, '_')}_certificado.pdf`;
    const qrCodeBuffer = await qrcode.toBuffer(qrCodeData);

    // Crear el PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);

    const fontSizeParsed = parseInt(fontSize) || 16;
    const [r, g, b] = fontColor
      ? fontColor.match(/\w\w/g).map((hex) => parseInt(hex, 16) / 255)
      : [0, 0, 0]; // Default to black
    const fontColorParsed = rgb(r, g, b);

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

    const pdfBytes = await pdfDoc.save();
    const pdfFilePath = path.join(__dirname, '..', 'certificados', `${nombre.replace(/\s+/g, '_')}_certificado.pdf`);
    fs.writeFileSync(pdfFilePath, Buffer.from(pdfBytes));

    // Enviar URL para la previsualización
    res.json({
      url: `/certificados/${nombre.replace(/\s+/g, '_')}_certificado.pdf`,
    });
  } catch (error) {
    console.error('Error generando la vista previa del certificado:', error);
    res.status(500).json({ error: 'Hubo un problema generando la vista previa del certificado.' });
  }
};

// Ruta para descargar un certificado (personalizado o no)
// Ruta para descargar el certificado generado
const handleDownload = async (req, res) => {
  try {
    const { nombre, curso, fecha, puntuacion, fontSize, fontColor, imageUrl } = req.body;

    // Validación de datos requeridos
    if (!nombre || !curso || !fecha || !puntuacion) {
      return res.status(400).json({ error: 'Faltan datos requeridos para generar el certificado.' });
    }

    // Valores predeterminados si no se envían
    const fontSizeParsed = fontSize || 16;
    const [r, g, b] = fontColor
      ? fontColor.match(/\w\w/g).map((hex) => parseInt(hex, 16) / 255)
      : [0, 0, 0]; // Color negro por defecto
    const fontColorParsed = rgb(r, g, b);

    // Generación del QR code
    const qrCodeData = `http://localhost:3600/certificados/${nombre.replace(/\s+/g, '_')}_certificado.pdf`;
    const qrCodeBuffer = await qrcode.toBuffer(qrCodeData);

    // Creación del documento PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);

    // Agregar texto al PDF
    page.drawText('Certificado de Logro', { x: 200, y: 350, size: 24 });
    page.drawText(`Nombre: ${nombre}`, { x: 50, y: 300, size: fontSizeParsed, color: fontColorParsed });
    page.drawText(`Curso: ${curso}`, { x: 50, y: 270, size: fontSizeParsed, color: fontColorParsed });
    page.drawText(`Fecha: ${fecha}`, { x: 50, y: 240, size: fontSizeParsed, color: fontColorParsed });
    page.drawText(`Puntuación: ${puntuacion}`, { x: 50, y: 210, size: fontSizeParsed, color: fontColorParsed });

    // Agregar la imagen (si se proporciona)
    if (imageUrl) {
      try {
        const imageBytes = await fetch(imageUrl).then((res) => res.arrayBuffer());
        const image = await pdfDoc.embedPng(imageBytes);
        page.drawImage(image, { x: 50, y: 100, width: 100, height: 100 });
      } catch (error) {
        console.warn('No se pudo cargar la imagen:', error);
      }
    }

    // Agregar código QR
    const qrImage = await pdfDoc.embedPng(qrCodeBuffer);
    page.drawImage(qrImage, { x: 400, y: 100, width: 100, height: 100 });

    // Guardar el PDF y devolver la ruta para descarga
    const pdfBytes = await pdfDoc.save();
    const pdfFilePath = path.join(__dirname, '..', 'certificados', `${nombre.replace(/\s+/g, '_')}_certificado.pdf`);
    fs.writeFileSync(pdfFilePath, Buffer.from(pdfBytes));

    res.download(pdfFilePath, `${nombre.replace(/\s+/g, '_')}_certificado.pdf`);

  } catch (error) {
    console.error('Error generando el certificado:', error);
    res.status(500).json({ error: 'Hubo un problema generando el certificado.' });
  }
};



module.exports = { handleUpload, handlePreview, handleDownload };
