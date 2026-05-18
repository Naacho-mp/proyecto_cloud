"""
Script para insertar 15 productos en la base de datos
Ejecutar con: python insert_productos.py
"""

from database import SessionLocal, engine
from models import Producto, Base

# Crear las tablas si no existen (esto también agrega la columna imagen si falta)
Base.metadata.create_all(bind=engine)

# Datos de los 15 productos
productos_data = [
    {"nombre": "Agenda", "precio": 2500, "stock": 50, "imagen": "agenda.png"},
    {"nombre": "Bolsa", "precio": 3200, "stock": 50, "imagen": "bolsa.png"},
    {"nombre": "Bolso", "precio": 4500, "stock": 50, "imagen": "bolso.png"},
    {"nombre": "Botella", "precio": 3800, "stock": 50, "imagen": "botella.png"},
    {"nombre": "Calendario", "precio": 2800, "stock": 50, "imagen": "calendario.png"},
    {"nombre": "Jockey", "precio": 5990, "stock": 50, "imagen": "jockey.png"},
    {"nombre": "Lanyer", "precio": 2500, "stock": 50, "imagen": "lanyer.png"},
    {"nombre": "Lapicero", "precio": 2700, "stock": 50, "imagen": "lapicero.png"},
    {"nombre": "Libreta", "precio": 3500, "stock": 50, "imagen": "libreta.png"},
    {"nombre": "Libreta con Divisor", "precio": 4200, "stock": 50, "imagen": "libretacondivisor.png"},
    {"nombre": "Libro", "precio": 6500, "stock": 50, "imagen": "libro.png"},
    {"nombre": "Llavero", "precio": 2900, "stock": 50, "imagen": "llavero.png"},
    {"nombre": "Mug", "precio": 5200, "stock": 50, "imagen": "mug.png"},
    {"nombre": "Pendrive", "precio": 7990, "stock": 50, "imagen": "pendrive.png"},
    {"nombre": "Tazón", "precio": 4800, "stock": 50, "imagen": "tazon.png"},
]

db = SessionLocal()

try:
    # Verificar si ya existen productos
    productos_existentes = db.query(Producto).count()
    
    if productos_existentes > 0:
        print(f"⚠️  Ya existen {productos_existentes} productos en la BD.")
        respuesta = input("¿Deseas continuar e insertar más? (s/n): ").lower()
        if respuesta != 's':
            print("Operación cancelada.")
            db.close()
            exit()
    
    # Insertar los productos
    for i, producto_data in enumerate(productos_data, 1):
        # Verificar si el producto ya existe
        existe = db.query(Producto).filter(
            Producto.nombre == producto_data["nombre"]
        ).first()
        
        if existe:
            print(f"⏭️  {i}. {producto_data['nombre']} - YA EXISTE")
        else:
            nuevo_producto = Producto(**producto_data)
            db.add(nuevo_producto)
            print(f"✅ {i}. {producto_data['nombre']} - ${producto_data['precio']} - Agregado")
    
    # Confirmar cambios
    db.commit()
    print("\n✨ ¡Todos los productos han sido insertados correctamente!")
    
    # Mostrar resumen
    total = db.query(Producto).count()
    print(f"📊 Total de productos en BD: {total}")
    
except Exception as e:
    db.rollback()
    print(f"❌ Error al insertar productos: {e}")
finally:
    db.close()

