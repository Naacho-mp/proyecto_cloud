"""
Script para crear todas las tablas en la base de datos
Ejecutar con: python init_database.py
"""

from database import engine
from models import Base

try:
    print("🔨 Creando todas las tablas...")
    Base.metadata.create_all(bind=engine)
    print("✅ ¡Base de datos inicializada correctamente!")
    print("📊 Tablas creadas:")
    print("  - usuarios")
    print("  - productos") 
    print("  - carrito")
    print("  - pedidos")
except Exception as e:
    print(f"❌ Error al crear las tablas: {e}")

