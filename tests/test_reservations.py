from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime

# Los tests reciben 'client', 'db_session' y 'test_user' como argumentos.
# Pytest se los pasa automáticamente desde el archivo conftest.py.

def test_create_reservation(client: TestClient, test_user):
    """
    Test para verificar la creación exitosa de una reserva.
    """
    # 1. Preparamos los datos de la reserva con el formato correcto
    reservation_data = {
        "lab_name": "Laboratorio de Pruebas de Creación",
        "reserved_by": "Usuario de Test",
        "purpose": "Probar el endpoint POST",
        "start_time": datetime.utcnow().isoformat(),
        "active": True,
    }

    # 2. Hacemos la petición POST a la API
    response = client.post("/reservations/", json=reservation_data)

    # 3. Verificamos que todo haya salido bien
    assert response.status_code == 201, f"Error: {response.json()}"
    data = response.json()
    assert data["lab_name"] == reservation_data["lab_name"]
    assert data["purpose"] == reservation_data["purpose"]
    assert "id" in data
    assert data["owner_id"] == test_user.id

def test_get_my_reservations(client: TestClient, test_user):
    """
    Test para verificar que se puede obtener la lista de reservas paginada.
    """
    # 1. Creamos una reserva para asegurarnos de que hay algo en la lista
    client.post("/reservations/", json={
        "lab_name": "Reserva para el Test GET",
        "reserved_by": "Test User",
        "purpose": "Probar el listado",
        "start_time": datetime.utcnow().isoformat(),
        "active": True,
    })

    # 2. Hacemos la petición GET a la API
    response = client.get("/reservations/")

    # 3. Verificamos la respuesta
    assert response.status_code == 200
    data = response.json()
    assert "results" in data # Comprueba la paginación
    assert "total" in data
    assert isinstance(data["results"], list)
    assert len(data["results"]) > 0
    assert data["results"][0]["lab_name"] == "Reserva para el Test GET"

def test_update_reservation(client: TestClient, test_user):
    """
    Test para verificar la actualización de una reserva.
    """
    # 1. Creamos una reserva inicial
    initial_data = {
        "lab_name": "Reserva Original",
        "reserved_by": "Test User",
        "purpose": "Ser actualizada",
        "start_time": datetime.utcnow().isoformat(),
        "active": True,
    }
    response = client.post("/reservations/", json=initial_data)
    reservation_id = response.json()["id"]

    # 2. Preparamos los datos para la actualización
    update_data = {"purpose": "¡Propósito Actualizado!"}

    # 3. Hacemos la petición PUT
    response = client.put(f"/reservations/{reservation_id}", json=update_data)

    # 4. Verificamos
    assert response.status_code == 200
    data = response.json()
    assert data["purpose"] == "¡Propósito Actualizado!"
    assert data["lab_name"] == "Reserva Original" # El resto no debe cambiar

def test_soft_delete_reservation(client: TestClient, test_user):
    """
    Test para verificar el borrado suave (Soft Delete).
    """
    # 1. Creamos una reserva para borrarla
    response = client.post("/reservations/", json={
        "lab_name": "Reserva para Borrar",
        "reserved_by": "Test User",
        "purpose": "Probar el Soft Delete",
        "start_time": datetime.utcnow().isoformat(),
        "active": True,
    })
    reservation_id = response.json()["id"]

    # 2. Hacemos la petición DELETE
    response = client.delete(f"/reservations/{reservation_id}")
    assert response.status_code == 204 # Éxito sin contenido

    # 3. Verificamos que la reserva ya no aparece en la lista GET normal
    response = client.get("/reservations/")
    data = response.json()
    ids_en_la_lista = [r["id"] for r in data["results"]]
    assert reservation_id not in ids_en_la_lista

    # 4. Verificamos que al pedirla por su ID da 404
    response = client.get(f"/reservations/{reservation_id}")
    assert response.status_code == 404

    