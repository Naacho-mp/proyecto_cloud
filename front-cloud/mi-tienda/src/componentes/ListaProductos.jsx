import { useState } from 'react';
import { BsCartPlus, BsShop, BsX } from "react-icons/bs";

export const ListaProductos = ({ productos = [], agregarAlCarrito, comprarAhora }) => {
  const [modalProducto, setModalProducto] = useState(null);

  const formatCLP = (valor) => 
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(valor);

  const abrirModal = (producto) => {
    setModalProducto(producto);
  };

  const cerrarModal = () => {
    setModalProducto(null);
  };

  return (
    <>
      <div className="container my-5">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {productos.map((producto) => (
            <div className="col" key={producto.id}>
              <div className="card h-100 shadow-sm border-0 carta-hover cursor-pointer" onClick={() => abrirModal(producto)} style={{ cursor: 'pointer' }}>
                <div className="position-relative bg-light text-center p-3">
                  <img
                    src={`/products/${producto.imagen}`}
                    className="img-fluid"
                    alt={producto.nombre}
                    style={{ height: '150px', objectFit: 'contain' }}/>
                </div>

                <div className="card-body d-flex flex-column text-center">
                  <h6 className="card-title fw-bold">{producto.nombre}</h6>

                  <div className="mt-auto">
                    <p className="mb-3 fs-5">
                      <strong>{formatCLP(producto.precio)}</strong>
                    </p>

                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          agregarAlCarrito(producto);
                        }}
                      >
                        Agregar <BsCartPlus />
                      </button>
                      <button
                        className="btn btn-success d-flex align-items-center justify-content-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          comprarAhora && comprarAhora(producto);
                        }}
                      >
                        Comprar Ahora <BsShop />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Detalles del Producto */}
      {modalProducto && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalProducto.nombre}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cerrarModal}
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 text-center mb-3 mb-md-0">
                    <img
                      src={`/products/${modalProducto.imagen}`}
                      className="img-fluid"
                      alt={modalProducto.nombre}
                      style={{ maxHeight: '400px', objectFit: 'contain' }}/>
                  </div>

                  <div className="col-md-6">
                    <h4 className="fw-bold mb-3">{formatCLP(modalProducto.precio)}</h4>

                    <div className="mb-4">
                      <h6 className="fw-bold mb-2">Descripción:</h6>
                      <p className="text-muted">
                        {modalProducto.descripcion || `Producto de calidad: ${modalProducto.nombre}. Perfecto para tus necesidades.`}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h6 className="fw-bold mb-2">Detalles:</h6>
                      <ul className="list-unstyled text-muted">
                        <li>✓ Producto original</li>
                        <li>✓ Garantía de calidad</li>
                        <li>✓ Envío disponible</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cerrarModal}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={() => {
                    agregarAlCarrito(modalProducto);
                    cerrarModal();
                  }}
                >
                  <BsCartPlus /> Agregar al Carrito
                </button>
                <button
                  type="button"
                  className="btn btn-success d-flex align-items-center gap-2"
                  onClick={() => {
                    comprarAhora && comprarAhora(modalProducto);
                    cerrarModal();
                  }}
                >
                  <BsShop /> Comprar Ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

