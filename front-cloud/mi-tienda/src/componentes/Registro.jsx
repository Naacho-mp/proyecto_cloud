import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarUsuario, enviarCodigoVerificacion } from '../servicios/api';
import logo from '../assets/imagenes/logo_ucm_marca.png';

function Registro() {  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState(''); 
  const [cargandoCodigo, setCargandoCodigo] = useState(false);
  
  const navigate = useNavigate();

  const handleEnviarCodigo = async () => {
    setError('');
    setMensajeExito('');
    
    if (!nombre.trim() || !email.trim()) {
      setError('Por favor, ingresa tu nombre y correo electrónico');
      return;
    }
    try {
      setCargandoCodigo(true);
      // Llamamos a la API de enviar-codigo
      const data = await enviarCodigoVerificacion(email, nombre);
      
      if (data.detail) {
        setError(data.detail);
      } else {
        setMensajeExito('Código Enviado! Revisa tu email');
      }
    } catch (err) {
      console.error("Detalle del error atrapado:", err);
      setError('Error al conectar con el servidor');
    } finally {
      setCargandoCodigo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar contraseñas en el frontend
    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      // 1. Llamamos a la API principal de registro de usuarios
      const data = await registrarUsuario(nombre, email, password, codigo);

      if (data.detail) {
        setError(data.detail);
      } else {
        // 2. Si el registro es exitoso, capturamos el tiempo del sistema
        const ahora = new Date();
        const fecha = ahora.toISOString().split('T')[0]; 
        const hora = ahora.toTimeString().split(' ')[0]; 

        const logData = {
          fecha: String(fecha),
          hora: String(hora),
          usuario_asociado: String(email),
          tipo_evento: "REGISTER",
          descripcion_evento: "Usuario registrado correctamente"
        };

        // 3. Enviamos el JSON de auditoría al endpoint en el puerto 3005
        try {
          const logResponse = await fetch("http://18.207.159.9:3005/guardar", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(logData)
          });
          
          if (!logResponse.ok) {
            console.error("El servidor de logs respondió con código de error:", logResponse.status);
          } else {
            const logResultado = await logResponse.json();
            console.log("Bitácora guardada exitosamente:", logResultado);
          }
        } catch (err) {
          // Si hay error de red o de CORS, lo veremos directamente en la consola del navegador
          console.error("Error de red/CORS al conectar con el servicio de logs (3005):", err);
        }

        // 4. Continuamos con el flujo normal de la app
        alert('Usuario registrado con éxito. Ahora puedes iniciar sesión.');
        navigate('/login');
      }
    } catch (err) {
      setError('Hubo un error al procesar el registro.');
    }
  };

  return (
    <div className="login-container mt-3">
      <div className="card login-card">
        <img src={logo} alt="Logo UCM" className="nav-logo" style={{ height: '80px' }} />
        <p className="login-subtitulo">Crea tu cuenta para continuar</p>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {mensajeExito && <div className="alert alert-success py-2">{mensajeExito}</div>}

        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label htmlFor="nombre" className="form-label fw-semibold">Nombre</label>
            <input
              type="text"
              id="nombre"
              className="form-control"
              placeholder="Juan Perez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">Correo electrónico</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-semibold">Contraseña</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="confirmarPassword" className="form-label fw-semibold">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmarPassword"
              className="form-control"
              placeholder="••••••••"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="codigo" className="form-label fw-semibold">Código de verificación</label>
            <div className="d-flex gap-2">
              <input 
                type="text" 
                id="codigo" 
                className="form-control" 
                placeholder="Ingresa el código" 
                value={codigo} 
                onChange={(e) => setCodigo(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="btn codigo-btn" 
                onClick={handleEnviarCodigo}
                disabled={cargandoCodigo}
              > 
                {cargandoCodigo ? 'Enviando...' : 'Enviar'} 
              </button>
            </div>
          </div>

          <div className="d-flex gap-2 mt-4">
            <button
              type="button"
              className="btn login-btn w-50"
              style={{ backgroundColor: '#6c757d', borderColor: '#6c757d' }}
              onClick={() => navigate('/login')}
            >
              Cancelar
            </button>
            <button type="submit" className="btn login-btn w-50">
              Registrarse
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Registro;