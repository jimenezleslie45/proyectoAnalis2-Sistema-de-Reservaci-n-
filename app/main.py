from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import os

# --- Routers principales ---
from app.api.v1.endpoints import (
    auth as auth_router,
    reservations as reservations_router,
    audit as audit_router,
)
# --- 💡 Nuevo router de Inteligencia Artificial ---
from app.api.v1 import ai  # asegúrate de tener app/api/v1/ai.py

# --- Base de datos ---
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.crud.user import get_user_by_username, create_user

# =====================================================
# 🚀 CONFIGURACIÓN PRINCIPAL DE LA APLICACIÓN
# =====================================================
app = FastAPI(title="Sistema de Reservas de Laboratorio")

# --- Configurar CORS (para el frontend React) ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")[0]
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Archivos estáticos y plantillas (HTML, CSS) ---
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

# =====================================================
# ⚙️ EVENTOS DE INICIO
# =====================================================
@app.on_event("startup")
def on_startup():
    """Crea las tablas y el usuario admin por defecto si no existe."""
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if not get_user_by_username(db, "admin"):
            create_user(
                db,
                username="admin",
                password="admin123",
                full_name="Administrador",
                email="admin@example.com"
            )
            print("✅ Usuario admin creado (admin / admin123)")
    except Exception as e:
        print(f"⚠️ Error al crear usuario admin: {e}")
    finally:
        db.close()


# =====================================================
# 🌐 ENDPOINTS BASE
# =====================================================
@app.get("/", tags=["Health"])
async def root():
    return {"message": "Bienvenido al Sistema de Reservas de Laboratorio"}

@app.get("/login", tags=["Login Page"])
def login_page(request: Request):
    """Renderiza la página de login en HTML (solo si usas plantillas)."""
    return templates.TemplateResponse("login.html", {"request": request})


# =====================================================
# 🧩 REGISTRO DE ROUTERS
# =====================================================
app.include_router(auth_router.router, prefix="/auth", tags=["Auth"])
app.include_router(reservations_router.router, prefix="/reservations", tags=["Reservas"])
app.include_router(audit_router.router, prefix="/audit", tags=["Auditoría"])

# --- ✅ Registrar el nuevo router de IA Conversacional ---
app.include_router(ai.router, prefix="/ai", tags=["Inteligencia Artificial"])


# =====================================================
# 🧪 ENDPOINT DE PRUEBA (.env)
# =====================================================
@app.get("/env-check", tags=["Debug"])
def env_check():
    """Verifica que las variables del entorno estén cargadas correctamente."""
    return {
        "db": os.getenv("DATABASE_URL", "")[:40] + "...",
        "redis": os.getenv("REDIS_URL", ""),
        "cors": os.getenv("CORS_ORIGINS", ""),
        "openai_key_present": bool(os.getenv("OPENAI_API_KEY")),
        "openai_model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    }
