import React from 'react'
import logo from '../assets/imagenes/logo_ucm_marca.png'
import { BsCartPlus } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom' 

export const Navbar = ({ cantidadCarrito = 0 }) => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario"))

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary shadow-sm">
      <div className="container-fluid">
        <img src={logo} alt="Logo UCM" className="nav-logo" style={{ height: '40px' }} />
        
        <div className="d-flex order-lg-last align-items-center">

          {usuario && (
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted fw-semibold" style={{ fontSize: '0.9rem' }}>
                {usuario.correo}
              </span>
            </div>
          )}

          <button className="btn btn-outline-dark position-relative ms-2 ms-lg-4 d-flex align-items-center justify-content-center"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasCart"
            aria-controls="offcanvasCart"
            style={{ borderRadius: '10px', padding: '8px 12px' }}
          >
            <BsCartPlus size={20} />
            {cantidadCarrito > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.7em' }}>
                {cantidadCarrito}
              </span>
            )}
          </button>

          <button className="navbar-toggler ms-2" type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav ms-lg-5">
            <a className="nav-link active fw-semibold" aria-current="page" href="#">Inicio</a>
            <a className="nav-link" href="#">Productos</a>
            <a className="nav-link" href="#">Ofertas</a>
          </div>
        </div>
      </div>
    </nav>
  )
}

