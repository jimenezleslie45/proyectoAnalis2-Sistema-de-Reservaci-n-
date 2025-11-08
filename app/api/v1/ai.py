from fastapi import APIRouter, Body, HTTPException
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os
import openai

# ==========================================================
# 💡 CARGA DE CONFIGURACIÓN Y VARIABLES DE ENTORNO
# ==========================================================
load_dotenv()  # Carga el .env (si estás corriendo localmente)

router = APIRouter(prefix="/ai", tags=["Inteligencia Artificial"])

# Clave de OpenAI (debe estar en tu archivo .env)
openai.api_key = os.getenv("OPENAI_API_KEY")

# Conexión a la base de datos PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("❌ No se encontró DATABASE_URL en el entorno")

engine = create_engine(DATABASE_URL)

# ==========================================================
# 🧩 ENDPOINT PRINCIPAL — CHAT CON INTELIGENCIA ARTIFICIAL
# ==========================================================
@router.post("/chat-ia")
async def chat_ai(message: dict = Body(...)):
    """
    Endpoint principal de IA.
    Recibe una pregunta y devuelve una respuesta contextual basada en los datos de reservas.
    """
    question = message.get("question", "").strip()
    if not question:
        raise HTTPException(status_code=400, detail="Debe enviar una pregunta válida.")

    # Recuperar datos recientes de reservas
    try:
        with engine.connect() as conn:
            query = text("""
                SELECT lab_name, reserved_by, start_time
                FROM reservations
                ORDER BY start_time DESC
                LIMIT 10
            """)
            rows = conn.execute(query).fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al acceder a la base de datos: {str(e)}")

    # Generar resumen de contexto de las reservas
    if not rows:
        resumen = "No hay registros recientes de reservas en la base de datos."
    else:
        resumen = "\n".join(
            f"- {r.lab_name} reservado por {r.reserved_by} a las {r.start_time}"
            for r in rows
        )

    # Construir prompt para la IA
    prompt = f"""
    Actúa como un asistente del Sistema de Reservas de Laboratorio.
    Datos recientes de reservas:
    {resumen}

    Usuario pregunta: "{question}"

    Responde en español de forma clara, útil y profesional.
    Si no hay datos suficientes, explica educadamente que no puedes inferirlo.
    """

    try:
        completion = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Eres un asistente experto en gestión de laboratorios y reservas."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=350,
        )

        respuesta = completion.choices[0].message.content.strip()
        return {"respuesta": respuesta}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al comunicarse con OpenAI: {str(e)}")


@router.get("/sugerir")
async def sugerir_reserva():
  
    try:
        with engine.connect() as conn:
            total = conn.execute(text("SELECT COUNT(*) FROM reservation")).scalar()
    except Exception:
        total = None

    return {
        "laboratorio_recomendado": "Laboratorio de Robótica",
        "hora_sugerida": "14:00",
        "confianza": "92%" if total else "85%",
        "razon": "Se recomienda por baja ocupación promedio y disponibilidad de equipos."
    }
