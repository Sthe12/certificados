import React, { useState } from 'react';
import axios from 'axios';

const Certificados = () => {
  const [file, setFile] = useState(null);
  const [certificados, setCertificados] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Maneja la selección del archivo
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Subir y procesar el archivo
  const handleUpload = async () => {
    if (!file) {
      alert('Por favor, selecciona un archivo primero.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError(''); // Limpiar errores previos

    try {
      const response = await axios.post('http://localhost:3600/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Verificar si la respuesta contiene los certificados generados
      console.log('Respuesta del servidor:', response.data);

      if (response.data.certificados && response.data.certificados.length > 0) {
        setCertificados(response.data.certificados);
        setExcelData(response.data.certificados);
      } else {
        setError(response.data.error || 'No se generaron certificados. Verifica el archivo.');
      }
      
    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      setError('Hubo un problema al procesar el archivo. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Descargar certificado individual
  const handleDownload = async (url) => {
    try {
      const response = await axios.get(`http://localhost:3600${url}`, { responseType: 'blob' });
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = `${url}.pdf`;
      a.click();
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
    }
  };

  return (
    <div>
      <h1>Subir Excel y generar certificados</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Subir y procesar archivo</button>

      {loading && <p>Procesando archivo...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Mostrar tabla con datos del Excel */}
      {excelData && excelData.length > 0 && (
        <div>
          <h2>Datos extraídos del Excel</h2>
          <table border="1">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Curso</th>
                <th>Fecha</th>
                <th>Puntuación</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {excelData.map((row, index) => (
                <tr key={index}>
                  <td>{row.Nombre}</td>
                  <td>{row.Curso}</td>
                  <td>{row.Fecha}</td>
                  <td>{row.Puntuacion}</td>
                  <td>
                    <button onClick={() => handleDownload(row.url)}>
                      Descargar Certificado
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mostrar certificados generados */}
      {certificados && certificados.length > 0 && (
        <div>
          <h2>Certificados generados</h2>
          <ul>
            {certificados.map((certificado, index) => (
              <li key={index}>
                <span>{certificado.nombre}</span>
                <a href={`http://localhost:3600${certificado.url}`} target="_blank" rel="noopener noreferrer">
                  Descargar
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Certificados;
