import React, { useState, useMemo, useEffect } from 'react';

// Datos de prueba basados en los requerimientos de tu tienda
const MOCK_AUDIT_LOGS = [
  { id: 1, description: 'Usuario inició sesión correctamente', type: 'LOGIN', date: '05/07/2026', time: '14:20:15', user: 'jaime@ucm.cl' },
  { id: 2, description: 'Se cargó con éxito el archivo "productos.jpg" a S3', type: 'FILE_UPLOAD', date: '05/07/2026', time: '14:15:22', user: 'jaime@ucm.cl' },
  { id: 3, description: 'Compra exitosa - Orden #10245 - Total: $8.700', type: 'PURCHASE', date: '05/07/2026', time: '13:40:10', user: 'nicolas@ucm.cl' },
  { id: 4, description: 'Error 500 en endpoint /api/v1/productos', type: 'ERROR', date: '05/07/2026', time: '12:02:45', user: 'Anónimo' },
  { id: 5, description: 'Registro de nuevo usuario en la plataforma', type: 'REGISTER', date: '05/07/2026', time: '10:05:00', user: 'felipe@ucm.cl' },
  { id: 6, description: 'Cierre de sesión del usuario', type: 'LOGOUT', date: '04/07/2026', time: '23:58:12', user: 'nicolas@ucm.cl' },
  { id: 7, description: 'Compra exitosa - Orden #10244 - Total: $2.500', type: 'PURCHASE', date: '04/07/2026', time: '19:30:00', user: 'jaime@ucm.cl' },
  { id: 8, description: 'Fallo de autenticación - Contraseña incorrecta', type: 'ERROR', date: '04/07/2026', time: '15:10:22', user: 'admin' },
  { id: 9, description: 'Usuario inició sesión correctamente', type: 'LOGIN', date: '04/07/2026', time: '15:09:55', user: 'admin' },
  { id: 10, description: 'Se cargó con éxito el archivo "agenda.jpg" a S3', type: 'FILE_UPLOAD', date: '04/07/2026', time: '11:45:10', user: 'felipe@ucm.cl' },
  { id: 11, description: 'Cierre de sesión del usuario', type: 'LOGOUT', date: '03/07/2026', time: '18:22:01', user: 'jaime@ucm.cl' },
  { id: 12, description: 'Compra exitosa - Orden #10243 - Total: $5.990', type: 'PURCHASE', date: '03/07/2026', time: '16:15:34', user: 'jaime@ucm.cl' },
  { id: 13, description: 'Error 404 - Recurso /ofertas-viejas no encontrado', type: 'ERROR', date: '03/07/2026', time: '14:00:02', user: 'Anónimo' }
];

// Tipos de eventos únicos para el selector de filtros
const EVENT_TYPES = ['Todos', 'LOGIN', 'LOGOUT', 'REGISTER', 'PURCHASE', 'FILE_UPLOAD', 'ERROR'];

// Clase de badge de Bootstrap por tipo de evento
const getTypeBadgeClass = (type) => {
  const base = "badge rounded-pill ";
  switch (type) {
    case 'LOGIN':
    case 'LOGOUT':
      return base + "bg-primary-subtle text-primary";
    case 'REGISTER':
      return base + "bg-info-subtle text-info";
    case 'PURCHASE':
      return base + "bg-success-subtle text-success";
    case 'FILE_UPLOAD':
      return base + "bg-warning-subtle text-warning";
    case 'ERROR':
      return base + "bg-danger-subtle text-danger";
    default:
      return base + "bg-secondary-subtle text-secondary";
  }
};

export default function Dashboard() {
  const [selectedType, setSelectedType] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 1. Filtrar los logs según el tipo seleccionado
  const filteredLogs = useMemo(() => {
    if (selectedType === 'Todos') return MOCK_AUDIT_LOGS;
    return MOCK_AUDIT_LOGS.filter(log => log.type === selectedType);
  }, [selectedType]);

  // Reiniciar a la primera página cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType]);

  // 2. Calcular la paginación sobre los datos ya filtrados
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  // Métricas rápidas para las tarjetas de resumen
  const summary = useMemo(() => {
    const errores = MOCK_AUDIT_LOGS.filter(l => l.type === 'ERROR').length;
    const compras = MOCK_AUDIT_LOGS.filter(l => l.type === 'PURCHASE').length;
    const usuarios = new Set(MOCK_AUDIT_LOGS.map(l => l.user).filter(u => u !== 'Anónimo')).size;
    return [
      { label: 'Eventos totales', value: MOCK_AUDIT_LOGS.length, color: 'text-dark' },
      { label: 'Compras exitosas', value: compras, color: 'text-success' },
      { label: 'Errores detectados', value: errores, color: 'text-danger' },
      { label: 'Usuarios activos', value: usuarios, color: 'text-primary' },
    ];
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;

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
              Mostrando {filteredLogs.length} de {MOCK_AUDIT_LOGS.length} eventos totales
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
                {paginatedLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="fw-semibold text-dark" style={{ maxWidth: '350px' }}>
                      {log.description}
                    </td>
                    <td>
                      <span className={getTypeBadgeClass(log.type)}>{log.type}</span>
                    </td>
                    <td className="text-muted">{log.date}</td>
                    <td className="text-muted">{log.time}</td>
                    <td className="text-muted">{log.user}</td>
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