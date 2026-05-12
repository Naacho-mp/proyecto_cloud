import React from 'react'
import { BsCartPlus } from "react-icons/bs";
import jockey from '../assets/imagenes/jockey.png';
import mochila from '../assets/imagenes/mochila.png';
import polera from '../assets/imagenes/polera.png';
import tazon from '../assets/imagenes/tazon.png';

export const ListaProductos = ({ productos = [], agregarAlCarrito }) => {

const imagenes = {
    1: jockey,
    2: mochila,
    3: polera,
    4: tazon
  };
  
  const formatCLP = (valor) => 
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(valor);

  return (
    <div className="container my-5">
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        {productos.map((producto) => (
          <div className="col" key={producto.id}>
            <div className="card h-100 shadow-sm border-0 carta-hover">
              <div className="position-relative bg-light text-center p-3">
                <img
                  src = {imagenes[producto.id]}
                  className="img-fluid"
                  alt={producto.nombre}
                  style={{ height: '150px', objectFit: 'contain' }}/>
              </div>
              
              <div className="card-body d-flex flex-column">
                <h6 className="card-title fw-bold">{producto.nombre}</h6>
                
                <div className="mt-auto">
                  <p className="mb-3 fs-5">
                    <strong>{formatCLP(producto.precio)}</strong>
                  </p>
                  
                  <button
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => agregarAlCarrito(producto)} 
                  >
                    Agregar <BsCartPlus />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};