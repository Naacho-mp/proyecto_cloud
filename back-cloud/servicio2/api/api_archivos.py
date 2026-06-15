from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
import schemas
from sqlalchemy.orm import Session
import database
from sqlalchemy import func
from models import Archivo, Usuario
from s3_service import subir_archivo
from schemas import ArchivoOut
from wsp_service import enviar_notificacion_wsp
import os

api_archivos = APIRouter(prefix="/archivos", tags=["Archivos"])

WSP_API_URL=os.getenv("WSP_API_URL")

LIMITE_ALMACENAMIENTO = 2 * 1024 * 1024 * 1024

def obtener_usuario(usuario_id: int, db: Session = Depends(database.get_db)) -> Usuario:
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario



@api_archivos.post("/subir", response_model=schemas.ArchivoOut)
def subir_archivo_usuario(
    usuario_id: int,
    archivo: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    usuario = obtener_usuario(usuario_id, db)

    contenido = archivo.file.read()

    if len(contenido) > LIMITE_ALMACENAMIENTO:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="El archivo supera el límite de 2GB"
        )

    s3_key = subir_archivo(
        correo=usuario.correo,
        nombre_archivo=archivo.filename,
        contenido=contenido,
        content_type=archivo.content_type
    )

    nuevo_archivo = Archivo(
        nombre_original=archivo.filename,
        s3_key=s3_key,
        tamano_bytes=len(contenido),
        usuario_id=usuario.id
    )
    db.add(nuevo_archivo)
    db.commit()
    db.refresh(nuevo_archivo)

    
    total_usado = db.query(func.sum(Archivo.tamano_bytes)).filter(Archivo.usuario_id == usuario.id).scalar() or 0

    enviar_notificacion_wsp(
        nombre_archivo=archivo.filename,
        tamano_bytes=len(contenido),
        espacio_usado=total_usado
    )

    return nuevo_archivo

@api_archivos.get("/mis-archivos", response_model=list[ArchivoOut], status_code=status.HTTP_200_OK)
def obtener_archivos_usuario(
    usuario_id: int,
    db: Session = Depends(database.get_db)
):
    usuario = obtener_usuario(usuario_id, db)
    
    archivos = db.query(Archivo).filter(Archivo.usuario_id == usuario.id).all()
    
    return [
        {
            "id": a.id,
            "nombre_original": a.nombre_original,
            "tamano_bytes": a.tamano_bytes,
            "fecha_subida": a.fecha_subida,
            "s3_key": a.s3_key
        }
        for a in archivos
    ]