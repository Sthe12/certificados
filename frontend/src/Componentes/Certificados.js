import React, { useState } from 'react';
import axios from 'axios';
import { Container, Button, Form, Table, Spinner, Alert } from 'react-bootstrap';
import './Certificados.css';


const Certificados = () => {
  const [file, setFile] = useState(null);
  const [datosExcel, setDatosExcel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customOptions, setCustomOptions] = useState({
    fontSize: 16,
    fontColor: '#000000',
    imageUrl: '',
  });
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCustomChange = (e) => {
    const { name, value } = e.target;
    setCustomOptions({ ...customOptions, [name]: value });
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Por favor, selecciona un archivo primero.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:3600/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.datos) {
        setDatosExcel(response.data.datos);
      } else {
        setError('No se encontraron datos válidos en el archivo Excel.');
      }
    } catch (error) {
      setError('Hubo un problema procesando el archivo.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (item) => {
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:3600/preview',
        {
          nombre: item.nombre,
          curso: item.curso,
          fecha: item.fecha,
          puntuacion: item.puntuacion,
          fontSize: customOptions.fontSize,
          fontColor: customOptions.fontColor,
          imageUrl: customOptions.imageUrl,
        },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobURL = URL.createObjectURL(blob);
      window.open(blobURL, '_blank');
    } catch (error) {
      setError('Hubo un problema generando la previsualización.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (item) => {
    const { fontSize, fontColor, imageUrl } = customOptions;
    try {
      const response = await axios.post(
        'http://localhost:3600/certificados/descargar',
        {
          nombre: item.nombre,
          curso: item.curso,
          fecha: item.fecha,
          puntuacion: item.puntuacion,
          fontSize,
          fontColor,
          imageUrl,
        },
        { responseType: 'blob' }
      );

      const blob = response.data;
      const blobURL = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobURL;
      link.download = `${item.nombre.replace(/\s+/g, '_')}_certificado.pdf`;
      link.click();
      URL.revokeObjectURL(blobURL);
    } catch (error) {
      setError('Hubo un problema descargando el certificado.');
    }
  };

  return (
    <Container>
      <h1 className="my-4">Generar Certificado Personalizado</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}

      <Form>
        <Form.Group controlId="fileUpload">
          <Form.Label>Selecciona archivo Excel</Form.Label>
          <Form.Control type="file" onChange={handleFileChange} />
        </Form.Group>
        <Button onClick={handleUpload} disabled={loading} className="mt-3">
          {loading ? <Spinner animation="border" size="sm" /> : 'Subir Archivo'}
        </Button>
      </Form>

      {datosExcel.length > 0 && (
        <>
          <h3 className="my-4">Personalización de Certificados</h3>
          <Form>
            <Form.Group controlId="fontSize">
              <Form.Label>Tamaño de la fuente</Form.Label>
              <Form.Control
                type="number"
                name="fontSize"
                value={customOptions.fontSize}
                onChange={handleCustomChange}
                min="10"
              />
            </Form.Group>
            <Form.Group controlId="fontColor">
              <Form.Label>Color de la fuente</Form.Label>
              <Form.Control
                type="color"
                name="fontColor"
                value={customOptions.fontColor}
                onChange={handleCustomChange}
              />
            </Form.Group>
            <Form.Group controlId="imageUrl">
              <Form.Label>URL de la imagen</Form.Label>
              <Form.Control
                type="text"
                name="imageUrl"
                value={customOptions.imageUrl}
                onChange={handleCustomChange}
                placeholder="http://..."
              />
            </Form.Group>
          </Form>

          <h3 className="my-4">Datos del Excel</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Curso</th>
                <th>Fecha</th>
                <th>Puntuación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {datosExcel.map((item, index) => (
                <tr key={index}>
                  <td>{item.nombre}</td>
                  <td>{item.curso}</td>
                  <td>{item.fecha}</td>
                  <td>{item.puntuacion}</td>
                  <td>
                    <Button variant="primary" onClick={() => handlePreview(item)}>Previsualizar</Button>
                    <Button variant="success" onClick={() => handleDownload(item)}>Descargar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
};

export default Certificados;
