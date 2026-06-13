from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import bcrypt
import schemas, database
from crud import crud_usuarios


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
    
    # Simulación de envío PARA PROBAR EL CODIGO GENERADO EN LA TERMINAL
    print(f"\n [PRUEBA LOCAL] CÓDIGO GENERADO: {codigo} PARA {payload.correo} \n")
    
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


