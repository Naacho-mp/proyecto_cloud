import { BsCartPlus, BsShop } from "react-icons/bs";

export const ListaProductos = ({ productos = [], agregarAlCarrito, comprarAhora }) => {

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
                      onClick={() => agregarAlCarrito(producto)}
                    >
                      Agregar <BsCartPlus />
                    </button>
                    <button
                      className="btn btn-success d-flex align-items-center justify-content-center gap-2"
                      onClick={() => comprarAhora && comprarAhora(producto)}
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
  );
};

