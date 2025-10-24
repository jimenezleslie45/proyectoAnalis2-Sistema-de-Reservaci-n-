🧪 Sistema de Reservas de Laboratorio

Este proyecto es una aplicación web completa diseñada para optimizar la gestión de reservas en laboratorios académicos o institucionales.
Combina un backend robusto en FastAPI con un frontend moderno e interactivo en React, brindando una experiencia fluida tanto para los usuarios como para los administradores.

🧱 Arquitectura del Sistema

El sistema está compuesto por dos grandes módulos:

🔹 Backend (API REST)

Desarrollado con FastAPI, gestiona toda la lógica de negocio: autenticación, operaciones CRUD, auditoría y comunicación con la base de datos PostgreSQL.
Está completamente contenerizado con Docker, lo que facilita su despliegue y portabilidad.

🔹 Frontend (Aplicación Web)

Construido con React y potenciado por Vite, ofrece una interfaz intuitiva, rápida y dinámica que consume los servicios del backend.
Permite visualizar, crear y administrar reservas de forma sencilla.

🚀 Funcionalidades Principales

El sistema cumple con los requisitos fundamentales y, además, incorpora extensiones avanzadas que fortalecen su rendimiento y seguridad.

⚙️ Funcionalidades Base

Gestión de Usuarios: Registro, inicio de sesión y autenticación segura.

CRUD de Reservas: Crear, leer, actualizar y eliminar reservas fácilmente.

Base de Datos Relacional: Persistencia de información en PostgreSQL.

Contenerización: Backend ejecutado dentro de Docker para entornos controlados.

🌟 Extensiones Avanzadas (Bonus) si logramos hacer esos  bonus

🔐 Autenticación JWT: Control de acceso seguro mediante tokens.

🔎 Filtros y Búsqueda: Permite filtrar reservas por laboratorio o fecha.

📄 Paginación: Las consultas grandes se dividen en páginas para optimizar el rendimiento.

🗑️ Soft Delete: Las reservas se marcan como inactivas, manteniendo el historial sin pérdida de datos.

🧾 Auditoría: Se registra cada acción de creación, modificación o eliminación.

⚡ Cache con Redis: Mejora la velocidad de respuesta almacenando datos temporalmente.

🧪 Tests Unitarios: Implementados con pytest para garantizar la calidad del código.

🗂️ Estructura del Proyecto (Backend)
sistema-de-reserva-de-laboratorio/
│
├── alembic/
│   └── versions/
│
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── __init__.py
│   │       │   ├── audit.py
│   │       │   ├── auth.py
│   │       │   ├── deps.py
│   │       │   ├── labs.py
│   │       │   ├── reservations.py
│   │       │   └── users.py
│   │       └── __init__.py
│   │
│   ├── core/
│   │   ├── cache.py
│   │   ├── config.py
│   │   └── security.py
│   │
│   ├── crud/
│   │   ├── __init__.py
│   │   ├── audit_log.py
│   │   ├── reservation.py
│   │   └── user.py
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   └── session.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── audit_log.py
│   │   ├── reservation.py
│   │   └── user.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── audit_log.py
│   │   ├── reservation.py
│   │   └── user.py
│   │
│   ├── static/
│   │   └── auth.css
│   │
│   ├── templates/
│   │   └── login.html
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── pagination.py
│   │   └── main.py
│   │
│   └── tests/
│       ├── confest.py
│       ├── test_audit.py          # ✅ Pruebas del registro de auditoría
│       └── test_reservations.py
│
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── README.md

💻 Estructura del Proyecto (Frontend)
frontend-reservas/
├── public/               # Archivos estáticos
├── src/
│   ├── assets/           # Estilos, imágenes y recursos
│   ├── components/       # Componentes reutilizables (Sidebar, StatCard, etc.)
│   ├── pages/            # Páginas completas (LoginPage, Dashboard, etc.)
│   ├── App.jsx           # Lógica principal y enrutamiento
│   └── main.jsx          # Punto de entrada de la aplicación
├── .gitignore
├── index.html
├── package.json
└── vite.config.js

🧰 Tech Stack
🔸 Backend

Python 3.9

FastAPI

PostgreSQL

SQLAlchemy

Pydantic

Uvicorn

Redis

Docker & Docker Compose

🔹 Frontend

React

Vite

Framer Motion (animaciones)

Chart.js (visualización de datos)

⚙️ Instalación y Ejecución
🔧 Prerrequisitos

Tener Docker y Docker Compose instalados y corriendo.

Tener Node.js y npm (o yarn) para el frontend.

🚀 Pasos para ejecutar

Clonar el repositorio

git clone <URL_DEL_REPOSITORIO>
cd sistema-reservas-laboratorio


Levantar el Backend

docker compose up --build -d


Ejecutar el Frontend

cd frontend-reservas
npm install
npm run dev


Accesos

API: http://localhost:8000

Swagger Docs: http://localhost:8000/docs

Frontend: http://localhost:5173

🧪 Cómo Usar y Probar la Aplicación

Registrar un Usuario
Desde Swagger (/auth/register) o el frontend.

Iniciar Sesión
Obtén tu access_token JWT.

Conectar el Frontend
Si usas un token fijo para desarrollo, colócalo en la variable TOKEN_FIJO del archivo App.jsx.

Crear Reservas
Desde el frontend o directamente en /reservations/.

🧾 Pruebas Unitarias

Para ejecutar las pruebas:

docker compose exec app pytest


Esto ejecutará los tests definidos en tests/test_reservations.py y tests/test_audit.py.