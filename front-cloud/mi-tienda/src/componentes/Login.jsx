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
    localStorage.setItem("usuario", JSON.stringify(resultado))
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
          <button type="submit" className="btn login-btn">Iniciar sesión</button>
        </form>
      </div>
    </div>
  );
}

export default Login;