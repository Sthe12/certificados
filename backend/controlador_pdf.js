const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');
const path = require('path');
const app = express();
const upload = multer({ dest: 'uploads/' });



app.use(express.json());

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = path.join(__dirname, req.file.path);
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Generar PDF para cada fila en el Excel
    const pdfDocs = await Promise.all(
      data.map(async (row) => {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);
        page.drawText(`Certificado de Logro`, { x: 200, y: 350, size: 24 });
        page.drawText(`Nombre: ${row.Nombre}`, { x: 50, y: 300, size: 16 });
        page.drawText(`Curso: ${row.Curso}`, { x: 50, y: 270, size: 16 });
        page.drawText(`Fecha: ${row.Fecha}`, { x: 50, y: 240, size: 16 });
        page.drawText(`Puntuación: ${row.Puntuacion}`, { x: 50, y: 210, size: 16 });

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
      })
    );

    res.setHeader('Content-Disposition', 'attachment; filename="certificados.zip"');
    res.setHeader('Content-Type', 'application/zip');

    // Envía los PDF generados o procesa para generar un solo archivo ZIP
    res.send(pdfDocs);
    fs.unlinkSync(filePath); // Elimina el archivo subido
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al procesar el archivo' });
  }
});

app.post('/preview', upload.single('imageFile'), (req, res) => {
  console.log(req.body);  // Aquí se verán los otros campos
  console.log(req.file);   // Aquí estará el archivo si se cargó
});

const PORT = 3600;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});