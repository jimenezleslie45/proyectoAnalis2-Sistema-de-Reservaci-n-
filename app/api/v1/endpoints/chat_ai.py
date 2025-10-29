from fastapi import APIRouter, Body
from sqlalchemy import create_engine, text
import os
import openai

router = APIRouter()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Conexión a la BD
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

@router.post("/chat-ia")
async def chat_ai(message: dict = Body(...)):
    question = message.get("question", "")

    # Recupera datos básicos desde PostgreSQL
    with engine.connect() as conn:
        reservas = conn.execute(text("SELECT lab_name, reserved_by, start_time FROM reservation LIMIT 20")).fetchall()

    # Crea un resumen de contexto
    resumen = "\n".join([f"{r.lab_name} reservado por {r.reserved_by} a las {r.start_time}" for r in reservas])

    prompt = f"""
    Actúa como un asistente del Sistema de Reservas de Laboratorio.
    Datos recientes de reservas:
    {resumen}

    Usuario pregunta: "{question}"

    Responde de forma clara y útil, en español, sin inventar datos.
    """

    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",  # económico y rápido
        messages=[
            {"role": "system", "content": "Eres un asistente experto en gestión de laboratorios."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=300
    )

    return {"respuesta": response["choices"][0]["message"]["content"]}
