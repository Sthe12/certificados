import React, { useState } from 'react';
import axios from 'axios';
import { Container, Button, Form, Table, Spinner, Alert } from 'react-bootstrap';



const Certificados = () => {
  const [file, setFile] = useState(null);
  const [datosExcel, setDatosExcel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customOptions, setCustomOptions] = useState({
    fontSize: 16,
    fontColor: '#000000',
  });
  const [imageFile, setImageFile] = useState(null); // Estado para la imagen
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFileError(''); // Reset file error on file change
  };

  const handleCustomChange = (e) => {
    const { name, value } = e.target;
    setCustomOptions({ ...customOptions, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setImageFile(file); // Captura el archivo de imagen solo si es válido
    } else {
      setError('Solo se permiten imágenes en formato PNG, JPG o JPEG.');
      setImageFile(null); // Resetea el estado si el archivo no es válido
    }
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
      if (error.response && error.response.status === 400) {
        setFileError('El archivo es demasiado grande. El tamaño máximo permitido es 10MB.');
      } else {
        setError('Hubo un problema procesando el archivo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (item) => {
    setLoading(true);

    const formData = new FormData();
    formData.append('nombre', item.nombre);
    formData.append('curso', item.curso);
    formData.append('fecha', item.fecha);
    formData.append('puntuacion', item.puntuacion);
    formData.append('fontSize', customOptions.fontSize);
    formData.append('fontColor', customOptions.fontColor);

    if (imageFile) {
      formData.append('image', imageFile); // Adjunta la imagen si existe
    }

    try {
      const response = await axios.post('http://localhost:3600/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
      });

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
    const { fontSize, fontColor } = customOptions;
  
    const formData = new FormData();
    formData.append('nombre', item.nombre);
    formData.append('curso', item.curso);
    formData.append('fecha', item.fecha);
    formData.append('puntuacion', item.puntuacion);
    formData.append('fontSize', fontSize);
    formData.append('fontColor', fontColor);
  
    // Si se subió una imagen, adjuntarla
    if (imageFile) {
      formData.append('image', imageFile);
    }
  
    try {
      const response = await axios.post('http://localhost:3600/certificados/descargar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob', // Asegúrate de que la respuesta sea de tipo blob
      });
  
      const blob = response.data;
      const blobURL = URL.createObjectURL(blob);
  
      const link = document.createElement('a');
      link.href = blobURL;
      link.download = `${item.nombre.replace(/\s+/g, '_')}_certificado.pdf`;
      link.click();
      URL.revokeObjectURL(blobURL);
    } catch (error) {
      console.error('Error al intentar descargar el certificado:', error.response || error);
      setError(error.response?.data?.error || 'Hubo un problema descargando el certificado.');
    }
  };

  return (
    <Container>
      <h1 className="my-4">Generar Certificado Personalizado</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {fileError && <Alert variant="danger">{fileError}</Alert>}

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
            <Form.Group controlId="imageUpload">
              <Form.Label>Subir Imagen</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
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
