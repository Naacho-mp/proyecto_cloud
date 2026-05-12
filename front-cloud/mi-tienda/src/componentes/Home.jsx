import React from 'react';
import { ListaProductos } from './ListaProductos';
import productosData from '../productos.json';

function Home({ agregarAlCarrito }) {
  return (
    <main className="py-4">
      <div className="container text-center mb-4">
        <h2 className="titulo-productos">Nuestros Productos</h2>
        <hr className="w-25 mx-auto" />
      </div>
      <ListaProductos productos={productosData} agregarAlCarrito={agregarAlCarrito} />
    </main>
  );
}

export default Home;