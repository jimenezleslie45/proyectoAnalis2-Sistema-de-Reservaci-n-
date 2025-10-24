from sqlalchemy.orm import Session
from datetime import datetime

from app.models.reservation import Reservation as ReservationModel
from app.schemas.reservation import ReservationCreate, ReservationUpdate

def create_reservation(db: Session, reservation_in: ReservationCreate, owner_id: int) -> ReservationModel:
    """
    Crea una nueva reserva en la base de datos.
    """
    # Crea el objeto del modelo de base de datos usando los datos del schema
    db_reservation = ReservationModel(
        lab_name=reservation_in.lab_name,
        reserved_by=reservation_in.reserved_by,
        purpose=reservation_in.purpose,
        start_time=reservation_in.start_time,
        active=reservation_in.active,
        owner_id=owner_id
    )
    
    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)
    return db_reservation

def get_reservation_by_id(db: Session, reservation_id: int, owner_id: int) -> ReservationModel | None:
    """
    Obtiene una reserva por su ID, asegurándose de que pertenezca al usuario.
    """
    return db.query(ReservationModel).filter(
        ReservationModel.id == reservation_id, 
        ReservationModel.owner_id == owner_id,
        ReservationModel.deleted_at == None
    ).first()

def update_reservation(db: Session, db_reservation: ReservationModel, reservation_in: ReservationUpdate) -> ReservationModel:
    """
    Actualiza una reserva en la base de datos.
    """
    update_data = reservation_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_reservation, key, value)
    
    db.commit()
    db.refresh(db_reservation)
    return db_reservation

def soft_delete_reservation(db: Session, db_reservation: ReservationModel) -> ReservationModel:
    """
    Realiza un borrado suave de una reserva.
    """
    db_reservation.deleted_at = datetime.utcnow()
    db.commit()
    return db_reservation