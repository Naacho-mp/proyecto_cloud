import boto3, os
from dotenv import load_dotenv

load_dotenv()

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION")
)

BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

def crear_carpeta_usuario(correo: str):
    """
    En S3 las carpetas se simulan creando un objeto vacío con key: 'correo/'
    """
    carpeta_key = f"{correo}/"  
    
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=carpeta_key,
        Body=b""  
    )
    
    return carpeta_key


def subir_archivo(correo: str, nombre_archivo: str, contenido: bytes, content_type: str):
    """
    Sube el archivo a la carpeta del usuario en S3
    """
    s3_key = f"{correo}/{nombre_archivo}"
    
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=s3_key,
        Body=contenido,
        ContentType=content_type
    )
    
    return s3_key