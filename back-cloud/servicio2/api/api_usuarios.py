from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import bcrypt
import schemas, database
from crud import crud_usuarios


api_usuarios = APIRouter(prefix="/usuarios", tags=["Usuarios"])

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verificar_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

@api_usuarios.post("/registro", response_model=schemas.UsuarioOut)
def registro(credenciales: schemas.UsuarioCreate, db: Session = Depends(database.get_db)):
    if crud_usuarios.obtener_usuario_por_correo(db, credenciales.correo):
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    
    return crud_usuarios.crear_usuario(db, credenciales.correo, hash_password(credenciales.password))

@api_usuarios.post("/login", response_model=schemas.UsuarioOut)
def login(credenciales: schemas.UsuarioLogin, db: Session = Depends(database.get_db)):
    usuario = crud_usuarios.obtener_usuario_por_correo(db, correo=credenciales.correo)
    
    if not usuario or not verificar_password(credenciales.password, usuario.password_hash):
        raise HTTPException(status_code=400, detail="Correo o contraseña incorrectos")
    
    return usuario