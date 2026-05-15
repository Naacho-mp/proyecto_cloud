from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import schemas
from crud import crud_productos

api_productos = APIRouter(prefix="/productos", tags=["Productos"])

@api_productos.get("/", response_model=list[schemas.ProductoOut])
def listar_productos_tienda(db: Session = Depends(get_db)):
    return crud_productos.listar_productos(db)