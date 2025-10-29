# ========================================
# 🐍 BASE: Python 3.9 slim
# ========================================
FROM python:3.9-slim

# --- Variables de entorno básicas ---
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# --- Directorio de trabajo ---
WORKDIR /app

# ========================================
# 🧰 Dependencias del sistema (Postgres + compiladores)
# ========================================
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ========================================
# 📜 Dependencias Python
# ========================================
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# ========================================
# 🧠 Añadir soporte OpenAI (IA)
# ========================================
# Esto se asegura de que la librería esté disponible aunque no esté en el requirements.txt
RUN pip install --no-cache-dir openai>=1.13.3 python-dotenv

# ========================================
# 📂 Copiar el código del proyecto
# ========================================
COPY . /app

# ========================================
# 🌐 Exponer puerto del backend
# ========================================
EXPOSE 8000


CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "/app"]
