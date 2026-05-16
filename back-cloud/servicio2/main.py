from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.api_productos import api_productos
from api.api_usuarios import api_usuarios
from api.api_base_datos import api_conexion
from api.api_carrito import api_carrito

# Al agregar root_path, FastAPI asume que el balanceador te manda 
# el tráfico a través de ese prefijo.
app = FastAPI(root_path="/api")

print("esto se cambio")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Los routers se quedan exactamente igual, pero ahora 
# responderán bajo /api/productos, /api/usuarios, etc.
app.include_router(api_productos)
app.include_router(api_usuarios)
app.include_router(api_conexion)
app.include_router(api_carrito)
