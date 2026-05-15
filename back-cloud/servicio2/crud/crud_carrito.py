from sqlalchemy.orm import Session
import models

def agregar_producto_carrito(db: Session, usuario_id: int, producto_id: int, cantidad: int):    
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    
    if not producto:
        return None
    
    if producto.stock < cantidad:
        return "sin_stock"
           
    item_existente = db.query(models.Carrito).filter(
        models.Carrito.usuario_id == usuario_id,
        models.Carrito.producto_id == producto_id
    ).first()

    if item_existente:
        cantidad_total = item_existente.cantidad + cantidad
        if producto.stock < cantidad_total:  
            return "sin_stock"
        item_existente.cantidad = cantidad_total

        db.commit()
        db.refresh(item_existente)
        return item_existente
    
    # Si no existe, crear nuevo item
    nuevo_item = models.Carrito(
        usuario_id=usuario_id,
        producto_id=producto_id,
        cantidad=cantidad
    )
    db.add(nuevo_item)
    db.commit()
    db.refresh(nuevo_item)
    return nuevo_item


def obtener_carrito_usuario(db: Session, usuario_id: int):
    return db.query(models.Carrito).filter(
        models.Carrito.usuario_id == usuario_id
    ).all()

def reducir_cantidad_producto(db: Session, item_id: int):
    item = db.query(models.Carrito).filter(models.Carrito.id == item_id).first()
    
    if not item:
        return None
    
    if item.cantidad > 1:
        item.cantidad -= 1  
        db.commit()
        db.refresh(item)
        return item
    else:
        db.delete(item)
        db.commit()
        return "eliminado"


def eliminar_item_carrito(db: Session, item_id: int):
    item = db.query(models.Carrito).filter(models.Carrito.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
    return item


def vaciar_carrito(db: Session, usuario_id: int):
    db.query(models.Carrito).filter(
        models.Carrito.usuario_id == usuario_id
    ).delete()
    db.commit()


def procesar_pago(db: Session, usuario_id: int):
    items = db.query(models.Carrito).filter(
        models.Carrito.usuario_id == usuario_id
    ).all()

    if not items:
        return None

    # Validar stock 
    for item in items:
        if item.producto.stock < item.cantidad:
            return f"sin_stock:{item.producto.nombre}"  

    total = sum(item.producto.precio * item.cantidad for item in items)

    # Descontar stock
    for item in items:                                  
        item.producto.stock -= item.cantidad

    nuevo_pedido = models.Pedido(usuario_id=usuario_id, total=round(total, 2))
    db.add(nuevo_pedido)
    db.commit()
    db.refresh(nuevo_pedido)
    vaciar_carrito(db, usuario_id)
    return nuevo_pedido