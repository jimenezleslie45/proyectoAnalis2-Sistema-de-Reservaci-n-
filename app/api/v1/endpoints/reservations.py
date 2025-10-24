import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
# --- Importaciones para el filtro de fecha ---
from sqlalchemy import cast, Date as SQLDate 
from typing import List, Optional
from datetime import date

from app.schemas import reservation as schemas
from app.models.user import User as UserModel
from app.models.reservation import Reservation as ReservationModel
from app.db.session import get_db
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/reservations", tags=["Reservations"])


@router.post(
    "/",
    response_model=schemas.ReservationOut,
    status_code=status.HTTP_201_CREATED
)
async def create_reservation(
    reservation: schemas.ReservationCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Crea una nueva reserva.
    """
    # Tu modificación, que ahora es correcta
    # Nota: He quitado 'created_at' porque la base de datos lo añade automáticamente.
    db_reservation = ReservationModel(
        lab_name=reservation.lab_name,
        reserved_by=reservation.reserved_by,
        purpose=reservation.purpose,
        start_time=reservation.start_time,
        active=reservation.active,
        owner_id=current_user.id
    )
    
    try:
        db.add(db_reservation)
        db.commit()
        db.refresh(db_reservation)
        return db_reservation
    except Exception as e:
        db.rollback()
        print(f"Error real al guardar en DB: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al crear reserva en la base de datos"
        )

# --- ¡ENDPOINT DE FILTROS CORREGIDO! ---
@router.get("/", response_model=List[schemas.ReservationOut])
async def get_my_reservations(
    # Filtra por el nombre del laboratorio
    lab_name: Optional[str] = None,
    # Filtra por la fecha de inicio
    start_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Obtiene las reservas del usuario actual, con filtros opcionales por nombre de laboratorio y fecha.
    """
    query = db.query(ReservationModel).filter(
        ReservationModel.owner_id == current_user.id
    )
    
    # El 'if' ahora usa 'lab_name' y busca en la columna 'lab_name'
    if lab_name:
        query = query.filter(ReservationModel.lab_name.ilike(f"%{lab_name}%"))
    
    # El 'if' ahora usa 'start_date' y compara solo la parte de la fecha
    if start_date:
        query = query.filter(cast(ReservationModel.start_time, SQLDate) == start_date)
        
    reservations = query.all()
    return reservations


# --- (El resto de los endpoints también deben ser consistentes) ---
@router.get("/{id}", response_model=schemas.ReservationOut)
async def get_reservation_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    db_reservation = db.query(ReservationModel).filter(
        ReservationModel.id == id, ReservationModel.owner_id == current_user.id
    ).first()
    
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reserva no encontrada o sin permisos")
    return db_reservation


@router.put("/{id}", response_model=schemas.ReservationOut)
async def update_reservation(
    id: int,
    reservation_in: schemas.ReservationUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    db_reservation = db.query(ReservationModel).filter(
        ReservationModel.id == id, ReservationModel.owner_id == current_user.id
    ).first()
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reserva no encontrada o sin permisos")
        
    update_data = reservation_in.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_reservation, key, value)
    
    db.commit()
    db.refresh(db_reservation)
    return db_reservation


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reservation(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    db_reservation = db.query(ReservationModel).filter(
        ReservationModel.id == id, ReservationModel.owner_id == current_user.id
    ).first()
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reserva no encontrada o sin permisos")

    db.delete(db_reservation)
    db.commit()
    return

# --- ¡ENDPOINT DE BORRADO ACTUALIZADO A SOFT DELETE! ---
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reservation(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Realiza un borrado suave (soft delete) de una reserva.
    """
    db_reservation = db.query(ReservationModel).filter(
        ReservationModel.id == id, 
        ReservationModel.owner_id == current_user.id,
        ReservationModel.deleted_at == None # <-- Solo se puede borrar si no está ya borrada
    ).first()

    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reserva no encontrada o sin permisos")

    # En lugar de borrar, marcamos la fecha de borrado
    db_reservation.deleted_at = datetime.utcnow()
    db.commit()
    return
