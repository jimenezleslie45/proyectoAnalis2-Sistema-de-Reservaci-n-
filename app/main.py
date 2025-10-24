from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.crud.user import get_user_by_username, create_user

# --- ¡1. IMPORTACIÓN ACTUALIZADA! ---
# Ahora importamos los 3 routers que vamos a usar
from app.api.v1.endpoints import (
    auth as auth_router, 
    reservations as reservations_router,
    audit as audit_router # <-- Importamos el nuevo router de auditoría
)

app = FastAPI(title="Sistema Reservas")

# Orígenes permitidos (tu app de React en el puerto 5173)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

@app.on_event("startup")
def on_startup():
    # crea tablas si no existen (para desarrollo)
    Base.metadata.create_all(bind=engine)

    # crear usuario de prueba si no existe
    db = SessionLocal()
    try:
        if not get_user_by_username(db, "admin"):
            create_user(db, username="admin", password="admin123", full_name="Admin", email="admin@example.com")
    finally:
        db.close()

@app.get("/", tags=["Health"])
async def root():
    return {"message": "Bienvenido al Sistema de Reservas de Laboratorio"}

@app.get("/login", tags=["Login Page"])
def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

# Registramos los routers existentes
app.include_router(auth_router.router)
app.include_router(reservations_router.router)

# --- ¡2. REGISTRAMOS EL NUEVO ROUTER DE AUDITORÍA! ---
app.include_router(audit_router.router)