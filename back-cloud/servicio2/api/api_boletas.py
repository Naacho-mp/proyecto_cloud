import os
import boto3
from fastapi import APIRouter, File, UploadFile, HTTPException
from botocore.exceptions import NoCredentialsError
from dotenv import load_dotenv
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io
import uuid

load_dotenv()

api_boletas = APIRouter(prefix="/boletas", tags=["Boletas"])

# Configuración de AWS
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
S3_REGION = os.getenv("S3_REGION", "us-east-1")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")

s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=S3_REGION
)

def generate_pdf_with_image(image_content: bytes, filename: str):
    """Genera un PDF en memoria que contiene la imagen."""
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Título o encabezado
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, height - 50, "Boleta de Venta")
    c.setFont("Helvetica", 12)
    c.drawString(100, height - 70, f"ID de Transacción: {uuid.uuid4()}")
    
    # Agregar la imagen al PDF
    # La guardamos temporalmente o usamos BytesIO si reportlab lo soporta directamente
    # Reportlab soporta ImageReader para bytes
    from reportlab.lib.utils import ImageReader
    img_reader = ImageReader(io.BytesIO(image_content))
    
    # Ajustar imagen (manteniendo proporción simple)
    c.drawImage(img_reader, 100, height - 400, width=400, preserveAspectRatio=True, mask='auto')
    
    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer

@api_boletas.post("/enviar")
async def enviar_boleta(file: UploadFile = File(...)):
    """
    Recibe una imagen, genera un PDF con ella, lo sube a S3 y devuelve una URL firmada.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen.")

    try:
        # Leer el contenido de la imagen
        image_content = await file.read()
        
        # Generar el PDF
        pdf_buffer = generate_pdf_with_image(image_content, file.filename)
        
        # Nombre del archivo en S3
        s3_filename = f"boletas/{uuid.uuid4()}.pdf"
        
        # Subir el PDF a S3
        s3_client.upload_fileobj(
            pdf_buffer,
            S3_BUCKET_NAME,
            s3_filename,
            ExtraArgs={"ContentType": "application/pdf"}
        )
        
        # Generar Presigned URL (válida por 1 hora)
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET_NAME, 'Key': s3_filename},
            ExpiresIn=3600
        )
        
        return {
            "message": "Boleta procesada y subida exitosamente",
            "filename": s3_filename,
            "presigned_url": presigned_url
        }

    except NoCredentialsError:
        raise HTTPException(status_code=500, detail="Credenciales de AWS no encontradas.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar la boleta: {str(e)}")
