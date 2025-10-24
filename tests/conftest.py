import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User as UserModel
from app.core.security import get_password_hash

# --- Configuración de la base de datos de prueba ---
# Usamos una base de datos en memoria (SQLite) para que sea rápida y se borre sola
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Creamos las tablas en la base de datos de prueba
Base.metadata.create_all(bind=engine)

# --- Overrides (Reemplazos para las dependencias) ---
def override_get_db():
    """Reemplaza la dependencia get_db para usar la base de datos de prueba."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

def override_get_current_user():
    """Reemplaza la dependencia de autenticación para devolver un usuario de prueba."""
    # En un test real, esto sería más complejo, pero para empezar es suficiente
    return UserModel(id=1, username="testuser", email="test@example.com")

# Aplicamos los reemplazos a nuestra app de FastAPI
app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

# --- Fixtures de Pytest ---
@pytest.fixture(scope="session")
def db_engine():
    """Crea las tablas una vez por sesión de prueba."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db_engine):
    """Crea una nueva sesión de base de datos para cada test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="module")
def client():
    """Crea un cliente de prueba para hacer peticiones a la API."""
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="function")
def test_user(db_session):
    """Crea un usuario de prueba en la base de datos para cada test."""
    user = UserModel(
        username="testuser",
        email="test@example.com",
        full_name="Test User",
        hashed_password=get_password_hash("testpassword"),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user
