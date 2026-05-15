from sqlalchemy.orm import Session
import models

def listar_productos(db: Session):
    return db.query(models.Producto).all()