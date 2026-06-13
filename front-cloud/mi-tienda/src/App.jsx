import './App.css'
import Carrito from './componentes/Carrito'
import { Navbar } from './componentes/Navbar'
import { CarritoLateral } from './componentes/CarritoLateral'
import Login from './componentes/Login'
import Home from './componentes/Home'
import ResultadoPago from './componentes/ResultadoPago'
import WebpayRetorno from './componentes/WebpayRetorno'
import PagoSuccess from './componentes/PagoSuccess'
import PagoFailure from './componentes/PagoFailure'
import PagoPending from './componentes/PagoPending'
import { Routes, Route, Navigate } from 'react-router-dom'
import Registro from './componentes/Registro'
import { MiPerfil } from './componentes/MiPerfil'

function App() {
  return (
    <Carrito>
      {({ carrito, agregarAlCarrito, cantidadTotal, eliminarDelCarrito }) => (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro/>}/>
          <Route path="/miperfil" element={
            <>
              <Navbar cantidadCarrito={cantidadTotal} />
              <MiPerfil />
            </>
          }/> 
          <Route path="/productos" element={
            <>
              <Navbar cantidadCarrito={cantidadTotal} />
              <Home agregarAlCarrito={agregarAlCarrito} />
              <CarritoLateral carrito={carrito} eliminarDelCarrito={eliminarDelCarrito} />
            </>
          } />
          <Route path="/webpay-retorno" element={<WebpayRetorno />} />
          <Route path="/pago-resultado" element={<ResultadoPago />} />
          <Route path="/success" element={<PagoSuccess />} />
          <Route path="/failure" element={<PagoFailure />} />
          <Route path="/pending" element={<PagoPending />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </Carrito>
  )
}

export default App;