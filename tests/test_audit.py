from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime

# Importamos el modelo de la auditoría para poder buscar en la tabla
from app.models.audit_log import AuditLog

# Los fixtures 'client', 'db_session' y 'test_user' vienen de conftest.py
def test_audit_log_on_create_reservation(client: TestClient, db_session: Session, test_user):
    """
    Test para verificar que se crea un registro de auditoría al crear una reserva.
    """
    # 1. Preparamos los datos de la reserva que vamos a crear
    reservation_data = {
        "lab_name": "Laboratorio Auditado",
        "reserved_by": "Test de Auditoría",
        "purpose": "Verificar la creación de logs",
        "start_time": datetime.utcnow().isoformat(),
        "active": True,
    }

    # 2. Hacemos la petición POST para crear la reserva
    response = client.post("/reservations/", json=reservation_data)
    assert response.status_code == 201
    reservation_id = response.json()["id"]

    # 3. Buscamos en la base de datos el registro de auditoría que se debió crear
    log_entry = db_session.query(AuditLog).filter(
        AuditLog.target_id == reservation_id,
        AuditLog.target_model == "Reservation"
    ).first()

    # 4. Verificamos que el registro de auditoría exista y sea correcto
    assert log_entry is not None
    assert log_entry.action == "CREATE"
    assert log_entry.user_id == test_user.id
    assert log_entry.target_id == reservation_id

