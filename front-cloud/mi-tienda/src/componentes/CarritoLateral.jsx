import React from 'react';
import { BsTrash } from 'react-icons/bs';
import { BsCreditCard2Back } from "react-icons/bs";

export const CarritoLateral = ({ carrito = [], eliminarDelCarrito = () => {} }) => {
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

  return (
    <div 
      className="offcanvas offcanvas-end" 
      tabIndex="-1" 
      id="offcanvasCart" 
      aria-labelledby="offcanvasCartLabel"
    >
      <div className="offcanvas-header border-bottom">
        <h5 className="offcanvas-title fw-bold" id="offcanvasCartLabel">
          🛒 Mi Carrito
        </h5>
        <button 
          type="button" 
          className="btn-close" 
          data-bs-dismiss="offcanvas" 
          aria-label="Close"
        ></button>
      </div>
      
      <div className="offcanvas-body">
        {carrito.length === 0 ? (
          <p className="text-muted text-center py-5">Tu carrito está vacío.</p>
        ) : (
          <div className="list-group">
            {carrito.map((item) => (
              <div key={item.id} className="list-group-item border-0 px-0 py-3">
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{item.nombre}</h6>
                    <small className="text-muted">{item.cantidad} × {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(item.precio)}</small>
                  </div>

                  <div className="text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger mb-2"
                      onClick={() => eliminarDelCarrito(item.id)}
                      aria-label={`Eliminar ${item.nombre}`}
                    >
                      <BsTrash />
                    </button>
                    <div>
                      <strong>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(item.precio * item.cantidad)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="offcanvas-footer p-3 border-top">
        <div className="d-flex justify-content-between mb-3">
          <span className="fw-bold">Total:</span>
          <span className="fw-bold text-primary">
            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(total)}
          </span>
        </div>
        <button 
          className="btn btn-dark w-100 py-2 fw-bold" 
          style={{ borderRadius: '10px' }}
          disabled={carrito.length === 0}
        >
          Ir a Pagar
          <BsCreditCard2Back className="ms-2" />
        </button>
      </div>
    </div>
  );
};