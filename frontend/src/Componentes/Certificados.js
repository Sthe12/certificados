import React, { useState } from 'react';
import axios from 'axios';

const Certificados = () => {
  const [file, setFile] = useState(null);
  const [datosExcel, setDatosExcel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customOptions, setCustomOptions] = useState({
    fontSize: 16,
    fontColor: '#000000',
    imageUrl: '',
  });

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
    try {
      const response = await axios.post('http://localhost:3600/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.datos) {
        setDatosExcel(response.data.datos);
      } else {
        alert('No se encontraron datos válidos en el archivo Excel.');
      }
    } catch (error) {
      alert('Hubo un problema procesando el archivo.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (item) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3600/preview', {
        nombre: item.nombre,
        curso: item.curso,
        fecha: item.fecha,
        puntuacion: item.puntuacion,
      });
  
      // Redirigir al PDF generado
      window.open(response.data.url, '_blank'); // Abrir el PDF en una nueva pestaña
    } catch (error) {
      alert('Hubo un problema generando la previsualización.');
    } finally {
      setLoading(false);
    }
  };
  

  const handleDownload = async (item) => {
    try {
      const response = await axios.post(
        `http://localhost:3600/download`,
        {
          nombre: item.nombre,
          curso: item.curso,
          fecha: item.fecha,
          puntuacion: item.puntuacion,
          fontSize: customOptions.fontSize || 16,
          fontColor: customOptions.fontColor || '#000000',
          imageUrl: customOptions.imageUrl || '',
        },
        { responseType: 'blob' }
      );

      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = `${item.nombre.replace(/\s+/g, '_')}_certificado.pdf`;
      a.click();
    } catch (error) {
      alert('Hubo un problema descargando el certificado.');
    }
  };

  return (
    <div>
      <h1>Generar Certificado Personalizado</h1>

      <label>Selecciona archivo Excel:</label>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        Subir Archivo
      </button>

      {datosExcel.length > 0 && (
        <div>
          <h3>Personalización de Certificados</h3>
          <form>
            <label>
              Tamaño de la fuente:
              <input
                type="number"
                name="fontSize"
                value={customOptions.fontSize}
                onChange={handleCustomChange}
                min="10"
              />
            </label>
            <label>
              Color de la fuente:
              <input
                type="color"
                name="fontColor"
                value={customOptions.fontColor}
                onChange={handleCustomChange}
              />
            </label>
            <label>
              URL de la imagen:
              <input
                type="text"
                name="imageUrl"
                value={customOptions.imageUrl}
                onChange={handleCustomChange}
                placeholder="http://..."
              />
            </label>
          </form>

          <h3>Datos del Excel</h3>
          <table border="1">
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
                    <button onClick={() => handlePreview(item)}>Previsualizar</button>
                    <button onClick={() => handleDownload(item)}>Descargar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Certificados;
