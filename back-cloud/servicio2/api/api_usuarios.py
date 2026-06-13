from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import bcrypt
import schemas, database
from crud import crud_usuarios
import os, requests

CODIGO_API_URL = os.getenv("CORREO_API_URL")

api_usuarios = APIRouter(prefix="/usuarios", tags=["Usuarios"])

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verificar_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


@api_usuarios.post("/enviar-codigo", status_code=status.HTTP_200_OK)
def solicitar_codigo(payload: schemas.PedirCodigoRequest, db: Session = Depends(database.get_db)):

    # 1. Validar si el usuario ya existe
    if crud_usuarios.obtener_usuario_por_correo(db, payload.correo):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="El correo ya está registrado"
        )
    
    codigo = crud_usuarios.generar_y_guardar_codigo(db, payload.correo)
    
    correo_payload = {
        "para": payload.correo,
        "asunto": "Código de Verificación",
        "mensajeHtml": f"""
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #005088;">¡Hola, {payload.nombre}!</h2>
                <p>Gracias por registrarte. Tu código de verificación es el siguiente:</p>
                <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #11caa0; border-radius: 6px; margin: 20px 0;">
                    {codigo}
                </div>
                <p style="font-size: 14px; color: #64748b;">Por favor, ingrésalo en la aplicación para continuar con tu registro.</p>
            </div>
        """
    }

    try:
        respuesta = requests.post(CODIGO_API_URL, json=correo_payload, timeout=5.0)
        
        if respuesta.status_code != 200:
            print(f"\n[ALERTA] API de notificaciones respondió con estado: {respuesta.status_code}\n")
            
    except requests.exceptions.RequestException as e:
        # Si la ip se cae, el backend responde
        print(f"\n[ERROR] No se pudo conectar con el servicio de correos: {e}\n")
   
    return {"message": "Código de verificación enviado al correo"}


@api_usuarios.post("/registro", response_model=schemas.UsuarioOut, status_code=status.HTTP_201_CREATED)
def registro(credenciales: schemas.UsuarioCreate, db: Session = Depends(database.get_db)):
  
    if crud_usuarios.obtener_usuario_por_correo(db, credenciales.correo):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="El correo ya está registrado"
        )
    
    # Validar el código de verificación 
    codigo_valido = crud_usuarios.validar_codigo_registro(db, credenciales.correo, credenciales.codigo)
    if not codigo_valido:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Código de verificación inválido o expirado"
        )
    
    # Encriptar contraseña y guardar al usuario con su nombre
    password_hasheada = hash_password(credenciales.password)
    
    nuevo_usuario = crud_usuarios.crear_usuario(
        db=db, 
        usuario=credenciales, 
        password_hash=password_hasheada
    )
    
    return nuevo_usuario


@api_usuarios.post("/login", response_model=schemas.UsuarioOut)
def login(credenciales: schemas.UsuarioLogin, db: Session = Depends(database.get_db)):
  
    usuario = crud_usuarios.obtener_usuario_por_correo(db, correo=credenciales.correo)
    
    if not usuario or not verificar_password(credenciales.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Correo o contraseña incorrectos"
        )
    
    return usuario


