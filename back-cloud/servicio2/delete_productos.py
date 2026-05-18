"""
Script para eliminar los productos Jockey UCM y Mochila UCM
Ejecutar con: python delete_productos.py
"""

from database import SessionLocal
from models import Producto

db = SessionLocal()

try:
    # Productos a eliminar
    productos_a_eliminar = ["Jockey UCM", "Mochila UCM"]
    
    for nombre in productos_a_eliminar:
        producto = db.query(Producto).filter(Producto.nombre == nombre).first()
        
        if producto:
            db.delete(producto)
            print(f"🗑️  Eliminado: {nombre} (ID: {producto.id})")
        else:
            print(f"⏭️  No encontrado: {nombre}")
    
    db.commit()
    print("\n✨ Productos eliminados correctamente")
    
    # Mostrar total de productos restantes
    total = db.query(Producto).count()
    print(f"📊 Total de productos en BD: {total}")
    
except Exception as e:
    db.rollback()
    print(f"❌ Error al eliminar productos: {e}")
finally:
    db.close()

