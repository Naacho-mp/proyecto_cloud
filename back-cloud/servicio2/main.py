from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.api_productos import api_productos
from api.api_usuarios import api_usuarios
from api.api_base_datos import api_conexion
from api.api_carrito import api_carrito

# 1. CORRECCIÓN: Eliminamos 'root_path="/api"'. 
# Ya no dejamos que FastAPI intente "adivinar" o recortar rutas de manera implícita.
app = FastAPI()

print("Backend inicializado con configuración de rutas fijas para AWS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. CORRECCIÓN: Añadimos 'prefix="/api"' de forma explícita a cada router.
# Ahora FastAPI sabrá que debe escuchar exactamente en:
# /api/productos, /api/usuarios/login, etc., tal cual lo envía el ALB.
app.include_router(api_productos, prefix="/api")
app.include_router(api_usuarios, prefix="/api")
app.include_router(api_conexion, prefix="/api")
app.include_router(api_carrito, prefix="/api")

# 3. ADICIÓN: Endpoint exclusivo para el Health Check de AWS.
# Esto responderá un HTTP 200 limpio ante una petición GET.
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "environment": "aws-production"}
