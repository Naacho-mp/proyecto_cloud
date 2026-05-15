from sqlalchemy.orm import Session
import models

def obtener_usuario_por_correo(db: Session, correo: str):
    return db.query(models.Usuario).filter(models.Usuario.correo == correo).first()

def obtener_usuario_por_id(db: Session, usuario_id: int):
    return db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()

def crear_usuario(db: Session, correo: str, password_hash: str):
    nuevo_usuario = models.Usuario(correo=correo, password_hash=password_hash)
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario