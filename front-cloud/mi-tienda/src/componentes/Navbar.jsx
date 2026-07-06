import React from 'react'
import logo from '../assets/imagenes/logo_ucm_marca.png'
import { BsCartPlus } from 'react-icons/bs'
import { useNavigate, Link } from 'react-router-dom' 

export const Navbar = ({ cantidadCarrito = 0 }) => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario"))

  // Validar directamente por el nombre "admin" (en minúsculas para asegurar)
  const esAdmin = usuario && usuario.nombre && usuario.nombre.toLowerCase() === "admin";

  const cerrarSesion = async (e) => {
    e.preventDefault(); 
    
    // Si hay un usuario en sesión, registramos el evento antes de borrar sus datos
    if (usuario) {
      const ahora = new Date();
      const fecha = ahora.toISOString().split('T')[0]; // Formato: YYYY-MM-DD
      const hora = ahora.toTimeString().split(' ')[0]; // Formato: HH:MM:SS

      const logData = {
        fecha: String(fecha),
        hora: String(hora),
        usuario_asociado: String(usuario.email || usuario.correo || "Usuario sin email"), 
        tipo_evento: "LOGOUT",
        descripcion_evento: "Cierre de sesión exitosamente"
      };

      try {
        await fetch("http://18.207.159.9:3005/guardar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(logData)
        });
      } catch (err) {
        // Fallo silencioso para asegurar que el usuario pueda salir de todos modos si el logger falla
        console.error("Error al registrar el evento de cierre de sesión:", err);
      }
    }
    
    // Limpieza de datos locales y redirección
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  
    navigate("/login"); 
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary shadow-sm">
      <div className="container-fluid">
        <Link to={"/productos"}><img src={logo} alt="Logo UCM" className="nav-logo" style={{ height: '40px' }}/></Link>
        
        <div className="d-flex order-lg-last align-items-center">

          {usuario && (
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted fw-semibold" style={{ fontSize: '0.9rem' }}>
                Bienvenido(a):{' '}
                <Link to="/miperfil" className="text-dark fw-bold text-decoration-none">
                {usuario.nombre} - Mi Perfil | </Link>  <a href="#" onClick={cerrarSesion}>Cerrar Sesión</a>
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

        {/* --- MENÚ DE ENLACES PRINCIPALES --- */}
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav ms-lg-5">
            <a className="nav-link active fw-semibold" aria-current="page" href="#">Inicio</a>
            <a className="nav-link" href="#">Productos</a>
            <a className="nav-link" href="#">Ofertas</a>
            
            {/* Se muestra solo al admin */}
            {esAdmin && (
              <Link className="nav-link text-primary fw-bold" to="/dashboard">
                Dashboard
              </Link>
            )}
          </div>
        </div>

      </div>
    </nav>
  )}