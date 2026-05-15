import pyodbc

def test_rds_connection():
    try:
        print("Intentando conectar a AWS RDS SQL Server...")
        
        # Configuración de conexión
        server = "database-2.cza4ek4s8hav.us-east-2.rds.amazonaws.com,1433"
        username = "admin"
        password = "admin1234"
        
        # Cadena de conexión para SQL Server
        connection_string = (
            f"DRIVER={{ODBC Driver 18 for SQL Server}};"
            f"SERVER={server};"
            f"UID={username};"
            f"PWD={password};"
            f"TrustServerCertificate=yes;"
            f"Encrypt=yes;"
        )
        
        print(f"Conectando a: {server}")
        connection = pyodbc.connect(connection_string, timeout=10)
        
        cursor = connection.cursor()
        cursor.execute("SELECT @@VERSION;")
        result = cursor.fetchone()
        
        print("\n✅ Conexión exitosa a AWS RDS SQL Server")
        print(f"\nVersión de SQL Server:")
        print(result[0])
        
        cursor.close()
        connection.close()
        
        return True
    except Exception as e:
        print(f"\n❌ Error al conectar: {str(e)}")
        print("\nAsegúrate de tener instalado el driver ODBC:")
        print("  - macOS: brew install unixodbc && brew tap microsoft/mssql-release && brew install msodbcsql17")
        print("  - Linux: Instala msodbcsql17 desde Microsoft")
        return False

if __name__ == "__main__":
    test_rds_connection()
