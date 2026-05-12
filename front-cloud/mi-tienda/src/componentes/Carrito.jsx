import { useState } from 'react'

const Carrito = ({ children }) => {
  const [carrito, setCarrito] = useState([])

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.id === producto.id)
      if (existente) {
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }

  const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0)

  const eliminarDelCarrito = (id) => {
    const idNumber = Number(id)
    setCarrito((prev) => {
      const item = prev.find((item) => item.id === idNumber)
      if (!item) return prev
      if (item.cantidad > 1) {
        return prev.map((item) =>
          item.id === idNumber ? { ...item, cantidad: item.cantidad - 1 } : item
        )
      }
      return prev.filter((item) => item.id !== idNumber)
    })
  }

  return children({ carrito, agregarAlCarrito, cantidadTotal, eliminarDelCarrito })
}

export default Carrito;