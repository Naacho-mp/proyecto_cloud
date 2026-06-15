import React, { useState, useEffect } from 'react';
import { BsCloudUpload, BsTrash, BsFileEarmarkText } from 'react-icons/bs';
import { obtenerArchivosUsuario, subirArchivo } from '../servicios/api';


export const MiPerfil = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario")) || { nombre: "Usuario", correo: "correo@ucm.cl" };

  // Límite de almacenamiento ficticio: 500 MB (en Bytes para los cálculos)
  const LIMITE_ALMACENAMIENTO = 2 * 1024 * 1024 * 1024; 

  // Estado para la lista de archivos (con algunos datos de prueba)
    const [archivos, setArchivos] = useState([]);

  // cargar archivos al entrar al perfil
  useEffect(() => {
    obtenerArchivosUsuario()
      .then(data => setArchivos(data))
      .catch(err => console.error(err))
  }, [])


  // --- CÁLCULOS DE ESPACIO ---
  const espacioUtilizadoBytes = archivos.reduce((acc, curr) => acc + curr.tamano_bytes, 0);
  const espacioDisponibleBytes = LIMITE_ALMACENAMIENTO - espacioUtilizadoBytes;
  const porcentajeUtilizado = (espacioUtilizadoBytes / LIMITE_ALMACENAMIENTO) * 100;

  // --- REQUISITO: Función auxiliar para formatear Bytes a MB de forma amigable ---
  const formatearTamano = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // --- REQUISITO: Manejar la subida de archivos 
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > espacioDisponibleBytes) {
      alert("No tienes suficiente espacio disponible para subir este archivo.");
      return;
    }

    try {
      const archivoSubido = await subirArchivo(file) // llama al backend
      setArchivos([...archivos, archivoSubido])  // agrega el archivo real con id de RDS
      alert("Archivo subido exitosamente")    
    } catch (err) {
      alert("Error al subir el archivo")
      console.error(err)
    }
};


  return (
    <div className="container my-5">
      <div className="row mb-4">
        <div className="col">
          <div className="p-4 bg-white rounded shadow-sm border-start border-primary border-4">
            <h2 className="mb-1 fw-bold text-dark">Mi Perfil</h2>
            <p className="text-muted mb-0">Bienvenido(a), <span className="fw-semibold text-primary">{usuario.nombre}</span></p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm p-4 bg-white h-100">
            <h5 className="card-title fw-bold mb-4 text-secondary">Almacenamiento en la Nube</h5>
            
            {/* Barra de progreso */}
            <div className="progress mb-4" style={{ height: '12px', borderRadius: '10px' }}>
              <div 
                className={`progress-bar transition-all ${porcentajeUtilizado > 85 ? 'bg-danger' : 'bg-success'}`}
                role="progressbar" 
                style={{ width: `${porcentajeUtilizado}%` }}
                aria-valuenow={porcentajeUtilizado} 
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
            </div>

            {/* Métrica: Espacio Utilizado */}
            <div className="d-flex align-items-center mb-3 p-3 bg-light rounded">
              <div className="flex-grow-1">
                <small className="text-muted d-block fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>Espacio Utilizado</small>
                <span className="fs-5 fw-bold text-dark">{formatearTamano(espacioUtilizadoBytes)}</span>
              </div>
              <span className="badge bg-secondary-subtle text-secondary rounded-pill p-2">
                {porcentajeUtilizado.toFixed(1)}%
              </span>
            </div>

            {/* Métrica: Espacio Disponible */}
            <div className="d-flex align-items-center p-3 bg-light rounded">
              <div className="flex-grow-1">
                <small className="text-muted d-block fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>Espacio Disponible</small>
                <span className="fs-5 fw-bold text-success">{formatearTamano(espacioDisponibleBytes)}</span>
              </div>
              <small className="text-muted">de 2000 MB (2GB)</small>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Botón de subida y Tabla de archivos */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <h5 className="card-title fw-bold mb-0 text-secondary">Mis Archivos Subidos</h5>
              
              {/* Botón de subir archivos conectado al input real invisible */}
              <div>
                <input 
                  type="file" 
                  id="input-archivo-oculto" 
                  className="d-none" 
                  onChange={handleFileChange} 
                />
                <label 
                  htmlFor="input-archivo-oculto" 
                  className="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-2 shadow-sm"
                  style={{ cursor: 'pointer', borderRadius: '8px' }}
                >
                  <BsCloudUpload size={18} />
                  Subir Archivo
                </label>
              </div>
            </div>

            {/* Tabla de Archivos */}
            <div className="table-responsive">
              {archivos.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <BsFileEarmarkText size={40} className="mb-2 text-black-50" />
                  <p className="mb-0">No has subido ningún archivo todavía.</p>
                </div>
              ) : (
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" style={{ width: '50%' }}>Nombre</th>
                      <th scope="col">Tamaño</th>
                      <th scope="col">Fecha</th>
                      
                    </tr>
                  </thead>
                  <tbody>
                    {archivos.map((archivo) => (
                      <tr key={archivo.id}>
                        <td className="text-truncate fw-semibold text-dark" style={{ maxWidth: '250px' }}>
                          <BsFileEarmarkText className="me-2 text-primary" size={16} />
                          {archivo.nombre_original}
                        </td>
                        <td className="text-muted">{formatearTamano(archivo.tamano_bytes)}</td>
                        <td className="text-muted">{new Date(archivo.fecha_subida).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};