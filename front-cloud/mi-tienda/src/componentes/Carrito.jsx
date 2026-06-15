import { useState } from 'react'

const Carrito = ({ children }) => {
  const [carrito, setCarrito] = useState([])
  const agregarAlCarrito = (producto) => {
    // Actualizar estado local (UI rápida)
    setCarrito((prev) => {
      const existente = prev.find((item) => item.id === producto.id)
      const nuevoCarrito = existente
        ? prev.map((item) =>
            item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
          )
        : [...prev, { ...producto, cantidad: 1 }]

      // Guardar en localStorage
      localStorage.setItem('carrito', JSON.stringify(nuevoCarrito))
      return nuevoCarrito
    })
  }

  const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0)

  const eliminarDelCarrito = (id) => {
    const idNumber = Number(id)
    setCarrito((prev) => {
      const item = prev.find((item) => item.id === idNumber)
      if (!item) return prev

      const nuevoCarrito = item.cantidad > 1
        ? prev.map((item) =>
            item.id === idNumber ? { ...item, cantidad: item.cantidad - 1 } : item
          )
        : prev.filter((item) => item.id !== idNumber)

      // Guardar en localStorage
      localStorage.setItem('carrito', JSON.stringify(nuevoCarrito))
      return nuevoCarrito
    })
  }

  return children({ carrito, agregarAlCarrito, cantidadTotal, eliminarDelCarrito })
}

export default Carrito;