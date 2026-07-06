import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUsuario } from '../servicios/api';  
import logo from '../assets/imagenes/logo_ucm_marca.png'

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('')  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {  
    e.preventDefault();
    const resultado = await loginUsuario(email, password) 
    if (resultado.detail) {
      setError(resultado.detail)  
      return
    }
    
    // Guardar el usuario en el localStorage
    localStorage.setItem("usuario", JSON.stringify(resultado))

    // Capturar la fecha y hora actuales del sistema
    const ahora = new Date();
    const fecha = ahora.toISOString().split('T')[0]; // Formato: YYYY-MM-DD
    const hora = ahora.toTimeString().split(' ')[0]; // Formato: HH:MM:SS

    // Enviar el registro de auditoría/evento al endpoint especificado
    try {
      await fetch("http://18.207.159.9:3005/guardar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fecha: fecha,
          hora: hora,
          usuario_asociado: email, // O puedes usar resultado.correo / resultado.username según retorne tu backend
          tipo_evento: "Login",
          descripcion_evento: "Usuario inició sesión correctamente"
        })
      });
    } catch (err) {
      // Manejar el error de manera silenciosa para no bloquear el flujo del usuario si la bitácora falla
      console.error("Error al guardar el registro de auditoría:", err);
    }

    // Redirigir a la vista de productos
    navigate('/productos')
  };

  return (
    <div className="login-container">
      <div className="card login-card">
        <img src={logo} alt="Logo UCM" className="nav-logo" style={{ height: '80px' }} />
        <p className="login-subtitulo">Ingresa tus credenciales para continuar</p>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">Correo electrónico</label>
            <input type="email" id="email" className="form-control" placeholder="ejemplo@correo.com" value={email} onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold">Contraseña</label>
            <input type="password" id="password" className="form-control" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className='d-flex gap-2'>
            <button type="submit" className="btn login-btn w-50">Iniciar sesión</button>
            <button type="button" className="btn registrar-btn w-50" onClick={() => navigate('/registro')}>Registrarse</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;