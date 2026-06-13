from sqlalchemy.orm import Session
import models
import schemas
import random
from datetime import datetime, timedelta, timezone

def obtener_usuario_por_correo(db: Session, correo: str):
    return db.query(models.Usuario).filter(models.Usuario.correo == correo).first()

def obtener_usuario_por_id(db: Session, usuario_id: int):
    return db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()

def crear_usuario(db: Session, usuario: schemas.UsuarioCreate, password_hash: str):
    nuevo_usuario = models.Usuario(
        nombre=usuario.nombre,
        correo=usuario.correo,
        password_hash=password_hash
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

def generar_y_guardar_codigo(db: Session, correo: str) -> str:
    ahora = datetime.now(timezone.utc)
    if ahora.tzinfo is None:
        ahora = datetime.now()

    db.query(models.CodigoVerificacion).filter(
        models.CodigoVerificacion.correo == correo,
        (models.CodigoVerificacion.expiracion < ahora) | (models.CodigoVerificacion.usado == True)
    ).delete()
    
    
    codigo_aleatorio = f"{random.randint(1000, 9999)}"
    tiempo_expiracion = datetime.now(timezone.utc) + timedelta(minutes=3)
    
    nuevo_codigo = models.CodigoVerificacion(
        correo=correo,
        codigo=codigo_aleatorio,
        expiracion=tiempo_expiracion
    )
    db.add(nuevo_codigo)
    db.commit()
    db.refresh(nuevo_codigo)
    
    return codigo_aleatorio


def validar_codigo_registro(db: Session, correo: str, codigo: str) -> bool:

    registro_codigo = (
        db.query(models.CodigoVerificacion)
        .filter(
            models.CodigoVerificacion.correo == correo,
            models.CodigoVerificacion.codigo == codigo,
            models.CodigoVerificacion.usado == False
        )
        .order_by(models.CodigoVerificacion.id.desc()) # Traer el último generado
        .first()
    )
    
    if not registro_codigo:
        return False  # El código no existe o ya se usó
        
    # Verificar si ya expiró
    ahora = datetime.now(timezone.utc)
    # Si tu DB guarda fechas "naive" (sin zona horaria), asegúrate de comparar manzanas con manzanas
    if registro_codigo.expiracion.tzinfo is None:
        ahora = datetime.now() 
        
    if ahora > registro_codigo.expiracion:
        return False  # Código vencido
        
    # Si todo está bien, lo marcamos como usado para que no sirva dos veces
    registro_codigo.usado = True
    db.commit()
    
    return True