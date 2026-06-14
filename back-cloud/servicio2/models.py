from sqlalchemy import Integer, String, ForeignKey, Float, Boolean, DateTime, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship, DeclarativeBase
from datetime import datetime


class Base(DeclarativeBase):
    pass

class Usuario(Base):
    __tablename__ = "usuarios"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(50),  nullable=False)
    correo: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    pedidos: Mapped[list["Pedido"]] = relationship("Pedido", back_populates="usuario")
    items_carrito: Mapped[list["Carrito"]] = relationship("Carrito", back_populates="usuario")
    archivos: Mapped[list["Archivo"]] = relationship("Archivo", back_populates="usuario")  



class Producto(Base):
    __tablename__ = "productos"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    precio: Mapped[float] = mapped_column(Float, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    imagen: Mapped[str] = mapped_column(String(255), nullable=True)
    
    items_carrito: Mapped[list["Carrito"]] = relationship("Carrito", back_populates="producto")


class Carrito(Base):
    __tablename__ = "carrito"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    usuario_id: Mapped[int] = mapped_column(Integer, ForeignKey("usuarios.id"), nullable=False)
    producto_id: Mapped[int] = mapped_column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad: Mapped[int] = mapped_column(Integer, default=1) 

    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="items_carrito")
    producto: Mapped["Producto"] = relationship("Producto", back_populates="items_carrito")


class Pedido(Base):
    __tablename__ = "pedidos"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    usuario_id: Mapped[int] = mapped_column(Integer, ForeignKey("usuarios.id"), nullable=False)
    total: Mapped[float] = mapped_column(Float, nullable=False)

    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="pedidos")

class CodigoVerificacion(Base):
    __tablename__ = "codigos_verificacion"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    correo: Mapped[str] = mapped_column(String(100), nullable=False)
    codigo: Mapped[str] = mapped_column(String(4), nullable=False)
    expiracion: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    usado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

class Archivo(Base):
    __tablename__ = "archivos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre_original: Mapped[str] = mapped_column(String(255), nullable=False)
    s3_key: Mapped[str] = mapped_column(String(512), nullable=False)
    tamano_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    fecha_subida: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    usuario_id: Mapped[int] = mapped_column(Integer, ForeignKey("usuarios.id"), nullable=False)

    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="archivos")