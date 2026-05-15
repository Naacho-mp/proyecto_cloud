import React, { useState, useEffect } from 'react';
import { ListaProductos } from './ListaProductos';
import { getProductos } from '../servicios/api';

function Home({ agregarAlCarrito }) {
  const [productos, setProductos] = useState([])

  useEffect(() => {
    getProductos().then(data => setProductos(data))
  }, [])

  return (
    <main className="py-4">
      <div className="container text-center mb-4">
        <h2 className="titulo-productos">Nuestros Productos</h2>
        <hr className="w-25 mx-auto" />
      </div>
      <ListaProductos productos={productos} agregarAlCarrito={agregarAlCarrito} />
    </main>
  );
}

export default Home;