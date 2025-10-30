from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # === Base de datos ===
    DATABASE_URL: str

    # === Redis ===
    REDIS_URL: str = "redis://redis:6379"

    # === JWT ===
    SECRET_KEY: str = "CAMBIAR_POR_UNA_SECRET_REAL"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # === CORS (Frontend) ===
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # === OpenAI (IA de pago) ===
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: Optional[str] = "gpt-4o-mini"

    # === Frontend (para API URL) ===
    VITE_API_URL: Optional[str] = "http://localhost:8000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Instancia global de configuración
settings = Settings()
