import redis
from app.core.config import settings

# Crea una conexión a Redis que se reutilizará en toda la aplicación
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

def get_redis_client():
    """Devuelve el cliente de Redis."""
    return redis_client
