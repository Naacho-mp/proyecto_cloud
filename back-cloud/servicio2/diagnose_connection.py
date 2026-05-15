import socket
import time

def test_dns_resolution(hostname):
    """Prueba la resolución DNS"""
    print(f"\n🔍 Probando resolución DNS para {hostname}...")
    try:
        ip = socket.gethostbyname(hostname)
        print(f"✅ DNS resuelto correctamente: {ip}")
        return ip
    except socket.gaierror as e:
        print(f"❌ Error en resolución DNS: {e}")
        return None

def test_tcp_connection(host, port, timeout=10):
    """Prueba la conexión TCP"""
    print(f"\n🔌 Probando conexión TCP a {host}:{port} (timeout: {timeout}s)...")
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(timeout)
    
    start_time = time.time()
    try:
        result = sock.connect_ex((host, port))
        elapsed = time.time() - start_time
        
        if result == 0:
            print(f"✅ Conexión TCP exitosa en {elapsed:.2f}s")
            sock.close()
            return True
        else:
            print(f"❌ Conexión TCP falló con código: {result} después de {elapsed:.2f}s")
            return False
    except socket.timeout:
        elapsed = time.time() - start_time
        print(f"❌ Timeout después de {elapsed:.2f}s")
        return False
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"❌ Error: {e} después de {elapsed:.2f}s")
        return False
    finally:
        sock.close()

def test_postgres_connection():
    """Prueba la conexión completa a PostgreSQL"""
    print("\n🐘 Probando conexión PostgreSQL completa...")
    try:
        import psycopg2
        conn = psycopg2.connect(
            host="database-1.cza4ek4s8hav.us-east-2.rds.amazonaws.com",
            database="postgres",
            user="postgres",
            password="admin1234",
            port=5432,
            connect_timeout=10
        )
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ Conexión PostgreSQL exitosa!")
        print(f"   Versión: {version[0]}")
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Error en conexión PostgreSQL: {e}")
        return False

def main():
    print("=" * 70)
    print("DIAGNÓSTICO DE CONEXIÓN A AWS RDS")
    print("=" * 70)
    
    hostname = "database-1.cza4ek4s8hav.us-east-2.rds.amazonaws.com"
    port = 5432
    
    # Paso 1: Resolución DNS
    ip = test_dns_resolution(hostname)
    
    if not ip:
        print("\n⚠️  No se puede continuar sin resolución DNS")
        return
    
    # Paso 2: Conexión TCP
    tcp_ok = test_tcp_connection(ip, port, timeout=15)
    
    if not tcp_ok:
        print("\n" + "=" * 70)
        print("DIAGNÓSTICO:")
        print("=" * 70)
        print("❌ La conexión TCP al puerto 5432 está bloqueada.")
        print("\nPosibles causas:")
        print("  1. Network ACL de la subnet bloqueando tráfico")
        print("  2. Firewall local bloqueando conexiones salientes al puerto 5432")
        print("  3. ISP bloqueando el puerto 5432")
        print("  4. La instancia RDS está en una subnet privada sin route table adecuada")
        print("\nSoluciones:")
        print("  • Verificar Network ACLs en la subnet de RDS")
        print("  • Verificar route table de la subnet (debe tener Internet Gateway)")
        print("  • Probar desde otra red (ej: hotspot móvil)")
        print("  • Verificar firewall local: sudo pfctl -s rules | grep 5432")
        return
    
    # Paso 3: Conexión PostgreSQL completa
    test_postgres_connection()
    
    print("\n" + "=" * 70)

if __name__ == "__main__":
    main()
