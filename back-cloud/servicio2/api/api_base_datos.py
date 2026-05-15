from fastapi import APIRouter
from database import get_db_connection

api_conexion = APIRouter(prefix="/conect", tags=["Base de datos"])

@api_conexion.get("/conexion")
def verificar_conexion():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT @@VERSION;")
        row = cursor.fetchone()
        version_texto = str(row) if row else "Sin respuesta"
        cursor.close()
        conn.close()
        return {"status": "Conectado exitosamente a RDS", "version": version_texto}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
@api_conexion.get("/tablas")
def ver_tablas():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("USE tienda;")
    cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE';")
    tablas = [row[0] for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return {"tablas": tablas}