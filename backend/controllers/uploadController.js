const XLSX = require('xlsx');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const path = require('path');
const archiver = require('archiver');

const handleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    }

    const filePath = path.join(__dirname, '..', req.file.path);
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    const certificados = [];

    // Verificar el contenido de los datos y normalizar encabezados
    if (data && data.length > 0) {
      const normalizedData = data.map(row => ({
        nombre: row['Nombre']?.trim() || "Desconocido",
        curso: row['Curso']?.trim() || "Sin curso",
        fecha: row['Fecha'] ? parseDate(row['Fecha']) : "Fecha no proporcionada",
        puntuacion: row['Puntuacion'] || "N/A"
      }));

      console.log("Datos normalizados del archivo Excel:", normalizedData);

      if (normalizedData.length === 0) {
        return res.status(400).json({ message: 'No se generaron certificados. Verifica el archivo.' });
      }

      // Configura el archivo ZIP como respuesta
      res.setHeader('Content-Disposition', 'attachment; filename="certificados.zip"');
      res.setHeader('Content-Type', 'application/zip');

      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(res);

      // Crear la carpeta para guardar los archivos PDF si no existe
      const certificadosDir = path.join(__dirname, '..', 'certificados');
      if (!fs.existsSync(certificadosDir)) {
        fs.mkdirSync(certificadosDir);
      }

      let filasProcesadas = 0;

      // Generar un PDF para cada fila y agregarlo al archivo ZIP
      for (const row of normalizedData) {
        const { nombre, curso, fecha, puntuacion } = row;

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);
        page.drawText(`Certificado de Logro`, { x: 200, y: 350, size: 24 });
        page.drawText(`Nombre: ${nombre}`, { x: 50, y: 300, size: 16 });
        page.drawText(`Curso: ${curso}`, { x: 50, y: 270, size: 16 });
        page.drawText(`Fecha: ${fecha}`, { x: 50, y: 240, size: 16 });
        page.drawText(`Puntuación: ${puntuacion}`, { x: 50, y: 210, size: 16 });

        const pdfBytes = await pdfDoc.save();
        const pdfBuffer = Buffer.from(pdfBytes);

        // Guardar el PDF en el servidor
        const pdfFilePath = path.join(certificadosDir, `${nombre}_certificado.pdf`);
        fs.writeFileSync(pdfFilePath, pdfBuffer);
        certificados.push({ nombre, url: `/certificados/${nombre}_certificado.pdf` });

        // Agregar el PDF al archivo ZIP
        archive.append(pdfBuffer, { name: `${nombre}_certificado.pdf` });
        filasProcesadas++;
      }

      // Verificar si se generaron certificados
      if (certificados.length === 0) {
        return res.status(400).json({ message: 'No se generaron certificados. Verifica el archivo.' });
      }

      // Finalizar el archivo ZIP después de agregar todos los archivos
      await archive.finalize();

      // Eliminar el archivo Excel cargado temporalmente
      fs.unlinkSync(filePath);

      // Enviar JSON con la lista de certificados
      if (!res.headersSent) {
        res.json({ certificados });
      }

    } else {
      return res.status(400).json({ message: 'El archivo Excel está vacío o no contiene datos válidos.' });
    }

  } catch (error) {
    console.error("Error al procesar el archivo:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Hubo un problema procesando el archivo.' });
    }
  }
};

// Función para la descarga de un certificado específico
const handleDownload = (req, res) => {
  const certificadoId = req.params.id;
  const filePath = path.join(__dirname, '..', 'certificados', `${certificadoId}_certificado.pdf`);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('Archivo no encontrado:', err);
      return res.status(404).json({ message: 'Certificado no encontrado' });
    }

    res.download(filePath, `${certificadoId}_certificado.pdf`, (err) => {
      if (err) {
        console.error('Error al enviar el archivo:', err);
        res.status(500).json({ message: 'Error al descargar el certificado' });
      }
    });
  });
};

module.exports = { handleUpload, handleDownload };

// Función para convertir fechas en formato de serial numérico
const parseDate = (value) => {
  if (typeof value === 'number') {
    const parsedDate = XLSX.SSF.parse_date_code(value);
    return `${parsedDate.y}-${String(parsedDate.m).padStart(2, '0')}-${String(parsedDate.d).padStart(2, '0')}`;
  }
  return value;
};
