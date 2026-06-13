from pydantic import BaseModel, EmailStr


#----------------------ENVIAR CODIGO-----------------------
class UsuarioBase(BaseModel):
    correo: EmailStr

class PedirCodigoRequest(UsuarioBase):
    nombre:str


#----------------------REGISTRO CLIENTE--------------------
class UsuarioCreate(UsuarioBase):
    nombre: str
    password: str
    codigo: str

#---------------------- LOGIN CLIENTE ----------------------


class UsuarioLogin(UsuarioBase):
    password: str

class UsuarioOut(UsuarioBase):
    id: int
    nombre: str 
    
    class Config:
        from_attributes = True


#---------------------- PRODUCTOS ----------------------
class ProductoOut(BaseModel):
    id: int
    nombre: str
    precio: float
    stock: int
    imagen: str | None = None
    
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