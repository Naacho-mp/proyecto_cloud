from pydantic import BaseModel, EmailStr

#---------------------- LOGIN CLIENTE ----------------------

class UsuarioLogin(BaseModel):
    correo: EmailStr
    password: str 

class UsuarioCreate(UsuarioLogin):
    pass

class UsuarioOut(BaseModel):
    id: int
    correo: EmailStr
    
    class Config:
        from_attributes = True


#---------------------- PRODUCTOS ----------------------
class ProductoOut(BaseModel):
    id: int
    nombre: str
    precio: float
    stock: int 
    
    class Config:
        from_attributes = True


#---------------------- CARRITO ----------------------
class CarritoBase(BaseModel):
    producto_id: int
    cantidad: int

class CarritoOut(CarritoBase):
    id: int
    usuario_id: int
    class Config:
        from_attributes = True

class CarritoItemOut(BaseModel):
    producto_id: int
    cantidad: int

    class Config:
        from_attributes = True


#---------------------- PEDIDO ----------------------
class PedidoOut(BaseModel):
    id: int
    usuario_id: int
    total: float

    class Config:
        from_attributes = True