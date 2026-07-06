import React, { useState, useMemo, useEffect } from 'react';

// Tipos de eventos únicos para el selector de filtros
const EVENT_TYPES = ['Todos', 'LOGIN', 'LOGOUT', 'REGISTER', 'PURCHASE', 'FILE_UPLOAD', 'ERROR'];

// Clase de badge de Bootstrap por tipo de evento
const getTypeBadgeClass = (type) => {
  const base = "badge rounded-pill ";
  const eventType = type ? type.toUpperCase() : '';
  
  switch (eventType) {
    case 'LOGIN':
      return base + "bg-primary-subtle text-primary";      // Azul (Entrada)
    case 'LOGOUT':
      return base + "bg-secondary-subtle text-secondary";  // Gris (Salida)
    case 'REGISTER':
      return base + "bg-info-subtle text-info";            // Celeste
    case 'PURCHASE':
      return base + "bg-success-subtle text-success";      // Verde
    case 'FILE_UPLOAD':
      return base + "bg-warning-subtle text-warning";      // Amarillo
    case 'ERROR':
      return base + "bg-danger-subtle text-danger";        // Rojo
    default:
      return base + "bg-secondary-subtle text-secondary";
  }
};

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [selectedType, setSelectedType] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Cargar los datos desde la API al montar el componente
  useEffect(() => {
    // VALIDACIÓN DE SEGURIDAD
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario"));
    
    if (!usuarioActivo || !usuarioActivo.nombre || usuarioActivo.nombre.toLowerCase() !== "admin") {
      const correoIntruso = usuarioActivo?.correo || "Anónimo";
      const ahora = new Date();
      const fecha = ahora.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Formato local chileno forzado a 24 horas (HH:MM:SS)
      const hora = ahora.toLocaleTimeString('es-CL', { hour12: false }); 

      // DISPARAR LOG DE ERROR EN PARALELO (Sin await para que sea instantáneo)
      fetch("http://18.207.159.9:3005/guardar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tipo_evento: "ERROR",
          descripcion_evento: `Intento de acceso no autorizado a la URL del Dashboard`,
          usuario_asociado: correoIntruso,
          fecha: fecha,
          hora: hora
        })
      }).catch(err => console.error("Error al registrar la intrusión en la bitácora:", err));

      // BLOQUEAR LA PANTALLA INMEDIATAMENTE
      setErrorCarga("Acceso denegado. Solo el usuario 'admin' puede ver este panel.");
      setLoading(false);
      return; // Detiene el resto del useEffect
    }

    // SI ES ADMIN, SE CARGAN LOS LOGS NORMALMENTE
    const cargarLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://18.207.159.9:3005/obtener");
        if (!response.ok) {
          throw new Error("Error HTTP: " + response.status);
        }
        const datos = await response.json();
        
        if (Array.isArray(datos)) {
          const datosInvertidos = [...datos].reverse();
          setLogs(datosInvertidos);
        } else {
          setLogs([]);
        }
      } catch (err) {
        console.error("Error al obtener los logs:", err);
        setErrorCarga("No se pudo establecer conexión con el servicio de auditoría en este momento.");
      } finally {
        setLoading(false);
      }
    };

    cargarLogs();
  }, []);

  // Filtrar los logs según el tipo seleccionado
  const filteredLogs = useMemo(() => {
    if (selectedType === 'Todos') return logs;
    return logs.filter(log => (log.tipo_evento || '').toUpperCase() === selectedType.toUpperCase());
  }, [selectedType, logs]);

  // Reiniciar a la primera página cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType]);

  // Calcular la paginación sobre los datos ya filtrados
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  // Métricas rápidas calculadas dinámicamente con los datos de la API
  const summary = useMemo(() => {
    const errores = logs.filter(l => (l.tipo_evento || '').toUpperCase() === 'ERROR').length;
    const compras = logs.filter(l => (l.tipo_evento || '').toUpperCase() === 'PURCHASE').length;
    const usuarios = new Set(logs.map(l => l.usuario_asociado).filter(u => u && u !== 'Anónimo')).size;
    
    return [
      { label: 'Eventos totales', value: logs.length, color: 'text-dark' },
      { label: 'Compras exitosas', value: compras, color: 'text-success' },
      { label: 'Errores detectados', value: errores, color: 'text-danger' },
      { label: 'Usuarios activos', value: usuarios, color: 'text-primary' },
    ];
  }, [logs]);

  const startIndex = (currentPage - 1) * itemsPerPage;

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando eventos...</span>
        </div>
        <p className="mt-2 text-muted">Obteniendo registros de auditoría en tiempo real...</p>
      </div>
    );
  }

  if (errorCarga) {
    return (
      <div className="container my-5 text-center">
        <div className="alert alert-danger shadow-sm" style={{ maxWidth: '550px', margin: '0 auto', borderRadius: '12px' }}>
          <h4 className="alert-heading fw-bold mb-2">Acción No Permitida u Error de Conexión</h4>
          <p className="mb-0 fs-5 text-secondary-dark">{errorCarga}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      {/* Encabezado */}
      <div className="row mb-4">
        <div className="col">
          <div className="p-4 bg-white rounded shadow-sm border-start border-primary border-4">
            <h2 className="mb-1 fw-bold text-dark">Dashboard de Monitoreo</h2>
            <p className="text-muted mb-0">Historial de auditoría y eventos globales de la tienda virtual</p>
          </div>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="row g-3 mb-4">
        {summary.map((s) => (
          <div className="col-6 col-lg-3" key={s.label}>
            <div className="card border-0 shadow-sm p-3 bg-white h-100">
              <small className="text-muted d-block fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>
                {s.label}
              </small>
              <span className={`fs-4 fw-bold ${s.color}`}>{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Panel de Filtros */}
      <div className="card border-0 shadow-sm p-4 bg-white mb-4">
        <div className="row align-items-end g-3">
          <div className="col-12 col-md-4">
            <label htmlFor="type-filter" className="text-muted d-block fw-semibold text-uppercase mb-2" style={{ fontSize: '0.75rem' }}>
              Filtrar por Tipo de Evento
            </label>
            <select
              id="type-filter"
              className="form-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === 'Todos' ? 'Mostrar Todos' : type}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-8 text-md-end">
            <small className="text-muted">
              Mostrando {filteredLogs.length} de {logs.length} eventos totales
            </small>
          </div>
        </div>
      </div>

      {/* Tabla de Eventos */}
      <div className="card border-0 shadow-sm p-4 bg-white">
        <h5 className="card-title fw-bold mb-4 text-secondary">Registro de Eventos</h5>

        <div className="table-responsive">
          {paginatedLogs.length > 0 ? (
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th scope="col">Descripción del Evento</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Hora</th>
                  <th scope="col">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log, index) => (
                  <tr key={log.id || index}>
                    <td className="fw-semibold text-dark" style={{ maxWidth: '350px' }}>
                      {log.descripcion_evento || log.description || "Sin descripción"}
                    </td>
                    <td>
                      {/* Enlazado con "text-uppercase" para estandarizar la visualización */}
                      <span className={getTypeBadgeClass(log.tipo_evento || log.type) + " text-uppercase"}>
                        {log.tipo_evento || log.type || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="text-muted">{log.fecha || log.date}</td>
                    <td className="text-muted">{log.hora || log.time}</td>
                    <td className="text-muted">{log.usuario_asociado || log.user || "Anónimo"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-5 text-muted">
              No se encontraron eventos cargados para este filtro.
            </div>
          )}
        </div>

        {/* Paginación */}
        {filteredLogs.length > 0 && totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
            <small className="text-muted">
              Página {currentPage} de {totalPages} · mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredLogs.length)} de {filteredLogs.length}
            </small>
            <div className="btn-group">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}