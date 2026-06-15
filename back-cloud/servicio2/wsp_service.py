# wsp_service.py
import requests, os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

WSP_API_URL = os.getenv("WSP_API_URL")

TELEFONO_PRUEBA = "+56950790054"
LIMITE_ALMACENAMIENTO = 2 * 1024 * 1024 * 1024  

def enviar_notificacion_wsp(nombre_archivo: str, tamano_bytes: int, espacio_usado: int):
    
    espacio_disponible = LIMITE_ALMACENAMIENTO - espacio_usado
    
    tamano_mb = tamano_bytes / (1024 * 1024)
    usado_mb = espacio_usado / (1024 * 1024)
    disponible_mb = espacio_disponible / (1024 * 1024)

    fecha_hora = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

    mensaje = (
        f"*Archivo subido exitosamente*\n\n"
        f"*Nombre:* {nombre_archivo}\n"
        f"*Fecha y hora:* {fecha_hora}\n"
        f"*Espacio utilizado:* {usado_mb:.2f} MB de 2000 MB\n"
        f"*Espacio disponible:* {disponible_mb:.2f} MB"
    )

    payload = {
        "telefono": TELEFONO_PRUEBA,
        "mensaje": mensaje
    }

    try:
        respuesta = requests.post(WSP_API_URL, json=payload, timeout=5.0)
        if respuesta.status_code != 200:
            print(f"[ALERTA] WSP API respondió con estado: {respuesta.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] No se pudo enviar WSP: {e}")