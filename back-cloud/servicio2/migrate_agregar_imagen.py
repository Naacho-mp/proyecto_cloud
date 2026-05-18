"""
Script para agregar la columna 'imagen' a la tabla 'productos'
Ejecutar con: python migrate_agregar_imagen.py
"""

import pyodbc
from database import get_db_connection

try:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # SQL para agregar la columna imagen si no existe
    sql = """
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_NAME = 'productos' AND COLUMN_NAME = 'imagen')
    BEGIN
        ALTER TABLE productos
        ADD imagen VARCHAR(255) NULL
        PRINT '✅ Columna imagen agregada correctamente'
    END
    ELSE
    BEGIN
        PRINT '⏭️  La columna imagen ya existe'
    END
    """
    
    cursor.execute(sql)
    conn.commit()
    print("✨ Migración completada correctamente")
    
except Exception as e:
    print(f"❌ Error en la migración: {e}")
finally:
    cursor.close()
    conn.close()

