from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
import database
from models import Archivo, Usuario
from s3_service import subir_archivo
from schemas import ArchivoOut

api_archivos = APIRouter(prefix="/archivos", tags=["Archivos"])

def obtener_usuario(usuario_id: int, db: Session = Depends(database.get_db)) -> Usuario:
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario



@api_archivos.post("/subir", response_model=ArchivoOut)
def subir_archivo_usuario(usuario_id: int, archivo: UploadFile = File(...), db: Session = Depends(database.get_db)
):
    usuario = obtener_usuario(usuario_id, db)

    contenido = archivo.file.read()  

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