🧪 Sistema de Reservas de Laboratorio (con IA OpenAI)

Este proyecto es una aplicación web completa diseñada para optimizar la gestión de reservas en laboratorios académicos o institucionales.
Combina un backend robusto en FastAPI, un frontend moderno en React (Vite) y un módulo de Inteligencia Artificial para análisis y recomendaciones automáticas.

🧱 Arquitectura del Sistema
🔹 Backend (FastAPI + PostgreSQL + Redis + OpenAI)

Gestiona toda la lógica del negocio: autenticación, reservas, auditorías y conexión con IA.

Totalmente contenerizado con Docker.

Compatible con GPT-4o-mini de OpenAI para análisis predictivo y chat inteligente.

🔹 Frontend (React + Vite)

Interfaz moderna, rápida e intuitiva.

Consume los endpoints del backend y muestra estadísticas, gráficas y respuestas IA.

🚀 Funcionalidades Principales
⚙️ Funcionalidades Base

Gestión de usuarios (registro y autenticación JWT).

CRUD completo de reservas de laboratorio.

Persistencia en PostgreSQL.

Contenerización total con Docker y Docker Compose.

Cache con Redis para mejorar rendimiento.

🌟 Extensiones Avanzadas

🔐 Autenticación JWT.

📊 Análisis de uso de laboratorios.

🧠 IA integrada con OpenAI (GPT-4o-mini).

🗑️ Soft delete y auditoría de acciones.

⚡ Paginación y filtros dinámicos.

🧪 Tests automáticos con Pytest.

🧠 Módulo de Inteligencia Artificial
🔸 Chat Inteligente (/ai/chat-ia)

Usa OpenAI GPT-4o-mini para responder preguntas sobre las reservas:

{
  "question": "¿Qué laboratorio tiene más reservas esta semana?"
}


➡️ El sistema genera respuestas en español, basadas en tus datos reales.

🔸 Sugerencia Inteligente (/ai/sugerir)

Algoritmo interno predictivo que sugiere el mejor laboratorio y hora disponible.
Ideal para automatizar decisiones de reserva.

🧩 Estructura del Proyecto
🧠 Backend (FastAPI)
app/
 ├── api/
 │   ├── v1/
 │   │   ├── endpoints/
 │   │   │   ├── auth.py
 │   │   │   ├── reservas.py
 │   │   │   ├── audit.py
 │   │   │   └── usuarios.py
 │   │   ├── ai.py        # ✅ Nuevo módulo IA (GPT-4o-mini)
 │   │   └── inicio.py
 │   ├── núcleo/
 │   ├── crud/
 │   ├── db/
 │   ├── modelos/
 │   ├── esquemas/
 │   ├── utilidades/
 │   ├── main.py
 │   └── tests/
 │       ├── test_reservations.py
 │       └── test_ai.py   # ✅ Test de conexión IA 

💻 Frontend (React + Vite)
app/schemas/frontend/
 ├── src/
 │   ├── App.jsx
 │   ├── components/
 │   │   ├── Sidebar.jsx
 │   │   └── AISugerencia.jsx   # ✅ Nuevo componente de IA
 │   ├── assets/
 │   └── styles/
 ├── public/
 ├── package.json
 └── vite.config.js



🧰 Pila tecnológica 🔸 Backend

Python 3.9

API rápida

PostgreSQL

SQLAlchemy

Pydantic

Uvicornio

Redis

Docker y Docker Compose

🔹 Frontend

Reaccionar

Vite

Framer Motion (animaciones)

Chart.js (visualización de datos)

⚙️ Instalación y Ejecución 🔧 Prerrequisitos

Tener Docker y Docker Compose instalados y corriendo.

Tener Node.js y npm (o hilo) para el frontend.

🚀 Pasos para ejecutar

Clonar el repositorio

git clone <URL_DEL_REPOSITORIO> cd sistema-reservas-laboratorio

Levantar el Backend

docker compone --build -d

Ejecutar el Frontend

cd frontend-reservas npm install npm run dev

Accesos
Acceder

🌐 Frontend: http://localhost:5173

⚙️ API Docs (Swagger): http://localhost:8000/docs

🧠 IA Chat: POST /ai/chat-ia

🔍 Sugerencias IA: GET /ai/sugerir


🧪 Cómo usar y probar la aplicación

Registre un usuario desde Swagger (/auth/register) o el frontend.

Iniciar sesión Obtenga su access_token JWT.

Conectar el Frontend Si usas un token fijo para desarrollo, colócalo en la variable TOKEN_FIJO del archivo App.jsx.

Crear Reservas Desde el frontend o directamente en /reservas/.


Ejecutar pruebas unitarias desde el contenedor:

docker compose exec backend pytest

Esto ejecutará las pruebas definidas en tests/test_reservations.py y tests/test_audit.py.
