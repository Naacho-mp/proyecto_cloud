import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DB_SERVER = os.getenv("DB_SERVER")
DB_USERNAME = os.getenv("DB_USERNAME")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_DATABASE = os.getenv("DB_DATABASE")

SQLALCHEMY_URL = (
    f"mssql+pyodbc://{DB_USERNAME}:{DB_PASSWORD}@{DB_SERVER}/{DB_DATABASE}"
    f"?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes&Encrypt=yes"
)

print(f"Intentando conectar a: {DB_SERVER}")
print(f"Base de datos: {DB_DATABASE}")

try:
    engine = create_engine(SQLALCHEMY_URL)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT COUNT(*) FROM productos"))
        count = result.scalar()
        print(f"Conexión exitosa. Productos en la tabla: {count}")
        
        if count > 0:
            result = connection.execute(text("SELECT TOP 5 id, nombre, precio FROM productos"))
            for row in result:
                print(f"ID: {row[0]}, Producto: {row[1]}, Precio: {row[2]}")
        else:
            print("La tabla productos está vacía.")
except Exception as e:
    print(f"Error al conectar o consultar: {e}")
