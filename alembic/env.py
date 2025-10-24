from logging.config import fileConfig
import os
import sys

from sqlalchemy import engine_from_config, pool
from alembic import context

# Añadir project root al path para poder importar app.*
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Importar metadata y modelos para que Alembic los detecte
from app.db.base import Base  # debe existir en tu proyecto
# Importar los módulos de modelos (ajusta si tus módulos tienen otros nombres)
try:
    from app.models import reservation, user  # noqa: F401
except Exception:
    # Si la estructura de modelos es distinta, intenta importar paquete completo
    try:
        import app.models  # noqa: F401
    except Exception:
        pass

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Attempt to read database URL from app config or environment, fallback to alembic.ini
db_url = None
try:
    # Intenta cargar la configuración desde app.core.config (ajusta si usas otro nombre)
    from app.core.config import settings  # type: ignore
    # intenta varios nombres posibles en settings
    db_url = getattr(settings, "SQLALCHEMY_DATABASE_URI", None) or getattr(settings, "DATABASE_URL", None) or getattr(settings, "SQLALCHEMY_DATABASE_URL", None)
except Exception:
    pass

# Si hay variable de entorno DATABASE_URL, úsala
env_db = os.getenv("DATABASE_URL") or os.getenv("SQLALCHEMY_DATABASE_URL")
if env_db:
    db_url = env_db

# Si obtuvimos una URL, la inyectamos en la configuración de Alembic
if db_url:
    config.set_main_option("sqlalchemy.url", db_url)

# add your model's MetaData object here for 'autogenerate' support
target_metadata = Base.metadata

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()