import React, { useState, useEffect } from 'react';
import { BsCloudUpload, BsFileEarmarkText } from 'react-icons/bs';
import { obtenerArchivosUsuario, subirArchivo } from '../servicios/api';

export const MiPerfil = () => {
  // Aseguramos que busque la propiedad exacta 'correo'
  const usuario = JSON.parse(localStorage.getItem("usuario")) || { nombre: "Usuario", correo: "correo@ucm.cl" };

  const LIMITE_ALMACENAMIENTO = 2 * 1024 * 1024 * 1024;

  const [archivos, setArchivos] = useState([]);

  useEffect(() => {
    obtenerArchivosUsuario()
      .then(data => setArchivos(data))
      .catch(err => console.error("Error al obtener archivos:", err))
  }, []);

  const espacioUtilizadoBytes = archivos.reduce((acc, curr) => acc + (curr.tamano_bytes || 0), 0);
  const espacioDisponibleBytes = LIMITE_ALMACENAMIENTO - espacioUtilizadoBytes;
  const porcentajeUtilizado = (espacioUtilizadoBytes / LIMITE_ALMACENAMIENTO) * 100;

  const formatearTamano = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // --- Función dedicada para registrar el evento de auditoría ---
  const registrarEventoAuditoria = async (nombreArchivo) => {
    const ahora = new Date();
    const fecha = ahora.toISOString().split('T')[0]; // YYYY-MM-DD
    const hora = telemetryHora(ahora); // Extrae HH:MM:SS de manera limpia

    const logData = {
      fecha: String(fecha),
      hora: String(hora),
      usuario_asociado: String(usuario.correo || "anonimo@ucm.cl"),
      tipo_evento: "FILE_UPLOAD",
      descripcion_evento: `Se subió el archivo "${nombreArchivo}" a s3`
    };

    try {
      console.log("Enviando JSON de auditoría a 3005...", logData);
      const res = await fetch("http://18.207.159.9:3005/guardar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(logData)
      });

      if (res.ok) {
        console.log("Log de auditoría guardado correctamente en el puerto 3005.");
      } else {
        console.error("El endpoint de auditoría respondió con error:", res.status);
      }
    } catch (err) {
      console.error("Error de red/CORS al contactar el endpoint de auditoría:", err);
    }
  };

  // Función auxiliar para obtener la hora sin textos extraños de zona horaria
  const telemetryHora = (dateObj) => {
    const hrs = String(dateObj.getHours()).padStart(2, '0');
    const mins = String(dateObj.getMinutes()).padStart(2, '0');
    const secs = String(dateObj.getSeconds()).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > espacioDisponibleBytes) {
      alert("No tienes suficiente espacio disponible para subir este archivo.");
      return;
    }

    // 🔥 MODIFICACIÓN CRUCIAL: El log se ejecuta de forma asíncrona EN PARALELO al principio.
    // Al quitar el "await", no congelamos la UI ni esperamos la subida pesada.
    registrarEventoAuditoria(file.name);

    try {
      const archivoSubido = await subirArchivo(file);
  
      if (archivoSubido) {
        setArchivos([...archivos, archivoSubido]);
        alert("Archivo subido exitosamente");
      } else {
        console.warn("archivoSubido fue nulo o inválido.");
      }
    } catch (err) {
      alert("Error al subir el archivo en la API principal");
      console.error("rror detallado de la subida:", err);
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

            <div className="progress mb-4" style={{ height: '12px', borderRadius: '10px' }}>
              <div
                className={"progress-bar transition-all " + (porcentajeUtilizado > 85 ? 'bg-danger' : 'bg-success')}
                role="progressbar"
                style={{ width: porcentajeUtilizado + "%" }}
                aria-valuenow={porcentajeUtilizado}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>

            <div className="d-flex align-items-center mb-3 p-3 bg-light rounded">
              <div className="flex-grow-1">
                <small className="text-muted d-block fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>Espacio Utilizado</small>
                <span className="fs-5 fw-bold text-dark">{formatearTamano(espacioUtilizadoBytes)}</span>
              </div>
              <span className="badge bg-secondary-subtle text-secondary rounded-pill p-2">
                {porcentajeUtilizado.toFixed(1)}%
              </span>
            </div>

            <div className="d-flex align-items-center p-3 bg-light rounded">
              <div className="flex-grow-1">
                <small className="text-muted d-block fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>Espacio Disponible</small>
                <span className="fs-5 fw-bold text-success">{formatearTamano(espacioDisponibleBytes)}</span>
              </div>
              <small className="text-muted">de 2000 MB (2GB)</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <h5 className="card-title fw-bold mb-0 text-secondary">Mis Archivos Subidos</h5>

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
                    {archivos.map((archivo, index) => (
                      <tr key={archivo.id || index}>
                        <td className="text-truncate fw-semibold text-dark" style={{ maxWidth: '250px' }}>
                          <BsFileEarmarkText className="me-2 text-primary" size={16} />
                          {archivo.nombre_original || "Archivo sin nombre"}
                        </td>
                        <td className="text-muted">{formatearTamano(archivo.tamano_bytes || 0)}</td>
                        <td className="text-muted">
                          {archivo.fecha_subida ? new Date(archivo.fecha_subida).toLocaleDateString() : "---"}
                        </td>
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