#!/usr/bin/env python3
"""
Script para probar la conexión a RDS continuamente hasta que funcione.
Útil mientras configuras AWS.
"""
import psycopg2
import time
import socket
from datetime import datetime

DB_CONFIG = {
    "host": "database-1.cza4ek4s8hav.us-east-2.rds.amazonaws.com",
    "database": "postgres",
    "user": "postgres",
    "password": "admin1234",
    "port": 5432,
    "connect_timeout": 5
}

def test_tcp_port(host, port, timeout=3):
    """Prueba rápida de puerto TCP"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((socket.gethostbyname(host), port))
        sock.close()
        return result == 0
    except:
        return False

def test_postgres_connection():
    """Intenta conectar a PostgreSQL"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        cursor.execute("SELECT current_database(), current_user;")
        db_info = cursor.fetchone()
        cursor.close()
        conn.close()
        return True, {
            "database": db_info[0],
            "user": db_info[1],
            "version": version
        }
    except Exception as e:
        return False, str(e)

def main():
    print("=" * 80)
    print("🔄 PROBANDO CONEXIÓN A AWS RDS CONTINUAMENTE")
    print("=" * 80)
    print(f"Host: {DB_CONFIG['host']}")
    print(f"Port: {DB_CONFIG['port']}")
    print(f"Database: {DB_CONFIG['database']}")
    print(f"User: {DB_CONFIG['user']}")
    print("\nPresiona Ctrl+C para detener\n")
    print("=" * 80)
    
    attempt = 0
    last_tcp_status = None
    
    try:
        while True:
            attempt += 1
            timestamp = datetime.now().strftime("%H:%M:%S")
            
            # Prueba TCP primero (más rápido)
            tcp_ok = test_tcp_port(DB_CONFIG['host'], DB_CONFIG['port'])
            
            if tcp_ok != last_tcp_status:
                if tcp_ok:
                    print(f"\n[{timestamp}] ✅ Puerto TCP 5432 ABIERTO! Probando PostgreSQL...")
                else:
                    print(f"\n[{timestamp}] ❌ Puerto TCP 5432 cerrado")
                last_tcp_status = tcp_ok
            
            if tcp_ok:
                # Si TCP está abierto, prueba PostgreSQL
                success, result = test_postgres_connection()
                
                if success:
                    print("\n" + "=" * 80)
                    print("🎉 ¡CONEXIÓN EXITOSA!")
                    print("=" * 80)
                    print(f"✅ Base de datos: {result['database']}")
                    print(f"✅ Usuario: {result['user']}")
                    print(f"✅ Versión: {result['version'][:50]}...")
                    print(f"✅ Intentos necesarios: {attempt}")
                    print("=" * 80)
                    print("\n✨ La configuración de AWS está correcta ahora!")
                    print("Puedes probar el endpoint: curl http://localhost:8001/health/db")
                    break
                else:
                    error_short = str(result)[:100]
                    print(f"[{timestamp}] Intento #{attempt} - TCP OK pero PostgreSQL falló: {error_short}")
            else:
                # Solo mostrar cada 10 intentos si TCP está cerrado
                if attempt % 10 == 0:
                    print(f"[{timestamp}] Intento #{attempt} - Esperando configuración de AWS...")
            
            time.sleep(5)  # Espera 5 segundos entre intentos
            
    except KeyboardInterrupt:
        print("\n\n⏹️  Prueba detenida por el usuario")
        print(f"Total de intentos: {attempt}")
        print("\n📋 Revisa el archivo check_aws_config.md para ver qué configurar")

if __name__ == "__main__":
    main()
