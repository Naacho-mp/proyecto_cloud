"""
Script para agregar la columna 'imagen' usando SQLAlchemy
Ejecutar con: python migrate_sqlalchemy.py
"""

from sqlalchemy import text
from database import engine

try:
    with engine.connect() as conn:
        # Para SQL Server
        sql = text("""
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                       WHERE TABLE_NAME = 'productos' AND COLUMN_NAME = 'imagen')
        BEGIN
            ALTER TABLE productos ADD imagen VARCHAR(255) NULL
        END
        """)
        
        conn.execute(sql)
        conn.commit()
        print("✅ Columna 'imagen' agregada correctamente a la tabla 'productos'")
        
except Exception as e:
    print(f"❌ Error: {e}")

