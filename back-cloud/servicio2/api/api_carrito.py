from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, database
from crud import crud_carrito   

api_carrito = APIRouter(prefix="/carrito", tags=["Carrito"])


@api_carrito.post("/agregar", response_model=schemas.CarritoOut)
def agregar_al_carrito(item: schemas.CarritoBase, usuario_id: int, db: Session = Depends(database.get_db)):
    resultado = crud_carrito.agregar_producto_carrito(db, usuario_id, item.producto_id, item.cantidad)
    if resultado is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if resultado == "sin_stock":
        raise HTTPException(status_code=400, detail="Stock insuficiente")
    return resultado


@api_carrito.get("/{usuario_id}", response_model=list[schemas.CarritoItemOut])
def ver_carrito(usuario_id: int, db: Session = Depends(database.get_db)):
    items = crud_carrito.obtener_carrito_usuario(db, usuario_id)
    if not items:
        raise HTTPException(status_code=404, detail="El carrito está vacío")
    return items


@api_carrito.delete("/reducir/{item_id}")
def reducir_cantidad_producto(item_id: int, db: Session = Depends(database.get_db)):
    resultado = crud_carrito.reducir_cantidad_producto(db, item_id)
    if resultado is None:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    if resultado == "eliminado":
        return {"mensaje": "Producto eliminado del carrito"}
    return resultado

@api_carrito.delete("/eliminar/{item_id}", response_model=schemas.CarritoOut)
def eliminar_item_carrito(item_id: int, db: Session = Depends(database.get_db)):
    item = crud_carrito.eliminar_item_carrito(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    return item


@api_carrito.delete("/vaciar/{usuario_id}")
def vaciar_carrito(usuario_id: int, db: Session = Depends(database.get_db)):
    crud_carrito.vaciar_carrito(db, usuario_id)
    return {"mensaje": f"Carrito del usuario {usuario_id} vaciado exitosamente"}


@api_carrito.post("/pagar/{usuario_id}", response_model=schemas.PedidoOut)
def pagar(usuario_id: int, db: Session = Depends(database.get_db)):
    pedido = crud_carrito.procesar_pago(db, usuario_id)
    if pedido is None:
        raise HTTPException(status_code=400, detail="El carrito está vacío")
    if isinstance(pedido, str) and pedido.startswith("sin_stock:"):
        nombre = pedido.split(":")[1]
        raise HTTPException(status_code=400, detail=f"Stock insuficiente para: {nombre}")
    return pedido