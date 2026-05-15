from sqlalchemy import Integer, String, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship, DeclarativeBase


class Base(DeclarativeBase):
    pass

class Usuario(Base):
    __tablename__ = "usuarios"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    correo: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    pedidos: Mapped[list["Pedido"]] = relationship("Pedido", back_populates="usuario")
    items_carrito: Mapped[list["Carrito"]] = relationship("Carrito", back_populates="usuario")


class Producto(Base):
    __tablename__ = "productos"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    precio: Mapped[float] = mapped_column(Float, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
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