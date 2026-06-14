from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from sqlalchemy import text
from api.api_productos import api_productos
from api.api_usuarios import api_usuarios
from api.api_base_datos import api_conexion
from api.api_carrito import api_carrito
from api.api_boletas import api_boletas
from api.api_archivos import api_archivos
from contextlib import asynccontextmanager
from database import SessionLocal
from models import Producto

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Lógica de "seed" al iniciar
    db = SessionLocal()
    try:
        # Forzar un refresh de la conexión
        db.execute(text("SELECT 1"))
        
        productos_existentes = db.query(Producto).count()
        print(f"[Lifespan] Verificando productos... Encontrados: {productos_existentes}")
        
        if productos_existentes == 0:
            print("[Lifespan] No se encontraron productos. Insertando productos iniciales...")
            productos_data = [
                {"nombre": "Agenda", "precio": 2500, "stock": 50, "imagen": "agenda.png"},
                {"nombre": "Bolsa", "precio": 3200, "stock": 50, "imagen": "bolsa.png"},
                {"nombre": "Bolso", "precio": 4500, "stock": 50, "imagen": "bolso.png"},
                {"nombre": "Botella", "precio": 3800, "stock": 50, "imagen": "botella.png"},
                {"nombre": "Calendario", "precio": 2800, "stock": 50, "imagen": "calendario.png"},
                {"nombre": "Jockey", "precio": 5990, "stock": 50, "imagen": "jockey.png"},
                {"nombre": "Lanyer", "precio": 2500, "stock": 50, "imagen": "lanyer.png"},
                {"nombre": "Lapicero", "precio": 2700, "stock": 50, "imagen": "lapicero.png"},
                {"nombre": "Libreta", "precio": 3500, "stock": 50, "imagen": "libreta.png"},
                {"nombre": "Libreta con Divisor", "precio": 4200, "stock": 50, "imagen": "libretacondivisor.png"},
                {"nombre": "Libro", "precio": 6500, "stock": 50, "imagen": "libro.png"},
                {"nombre": "Llavero", "precio": 2900, "stock": 50, "imagen": "llavero.png"},
                {"nombre": "Mug", "precio": 5200, "stock": 50, "imagen": "mug.png"},
                {"nombre": "Pendrive", "precio": 7990, "stock": 50, "imagen": "pendrive.png"},
                {"nombre": "Tazón", "precio": 4800, "stock": 50, "imagen": "tazon.png"},
            ]
            for prod in productos_data:
                db.add(Producto(**prod))
            db.commit()
            print("[Lifespan] Productos iniciales insertados con éxito.")
        else:
            print(f"[Lifespan] Se encontraron {productos_existentes} productos. Saltando seed.")
    except Exception as e:
        print(f"[Lifespan] Error al inicializar productos: {e}")
        db.rollback()
    finally:
        db.close()
    yield

# 1. CORRECCIÓN: Eliminamos 'root_path="/api"'. 
# Ya no dejamos que FastAPI intente "adivinar" o recortar rutas de manera implícita.
app = FastAPI(lifespan=lifespan)

print("Backend inicializado con configuración de rutas fijas para AWS")

# Configurar carpeta estática para imágenes de productos
images_dir = Path(__file__).parent / "api" / "images"
app.mount("/api/images", StaticFiles(directory=str(images_dir)), name="images")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*",
    ],
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
app.include_router(api_boletas, prefix="/api")
app.include_router(api_archivos, prefix="/api")

# ...existing code...

# 3. ADICIÓN: Endpoint exclusivo para el Health Check de AWS.
# Esto responderá un HTTP 200 limpio ante una petición GET.
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "environment": "aws-production"}

@app.get("/health")
async def health_root():
    return {"status": "healthy"}

