import datetime
from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.orm import Session
# --- IMPORTACIONES AÑADIDAS (para Soft Delete y Análisis) ---
from sqlalchemy import cast, Date as SQLDate, func, extract 
from typing import List, Optional, Dict, Any # <-- Se añadió Dict y Any
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

# --- ENDPOINT DE FILTROS CORREGIDO (con Soft Delete) ---
@router.get("/", response_model=List[schemas.ReservationOut])
async def get_my_reservations(
    lab_name: Optional[str] = None,
    start_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Obtiene las reservas (no borradas) del usuario actual, con filtros opcionales.
    """
    query = db.query(ReservationModel).filter(
        ReservationModel.owner_id == current_user.id,
        ReservationModel.deleted_at == None # <-- FILTRO AÑADIDO (Soft Delete)
    )
    
    if lab_name:
        query = query.filter(ReservationModel.lab_name.ilike(f"%{lab_name}%"))
    
    if start_date:
        query = query.filter(cast(ReservationModel.start_time, SQLDate) == start_date)
        
    reservations = query.all()
    return reservations


# --- (Corregido con Soft Delete) ---
@router.get("/{id}", response_model=schemas.ReservationOut)
async def get_reservation_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    db_reservation = db.query(ReservationModel).filter(
        ReservationModel.id == id, 
        ReservationModel.owner_id == current_user.id,
        ReservationModel.deleted_at == None # <-- FILTRO AÑADIDO (Soft Delete)
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
    # Solo se puede actualizar si no está borrada
    db_reservation = db.query(ReservationModel).filter(
        ReservationModel.id == id, 
        ReservationModel.owner_id == current_user.id,
        ReservationModel.deleted_at == None # <-- FILTRO AÑADIDO (Soft Delete)
    ).first()
    
    if not db_reservation:
        raise HTTPException(status_code=404, detail="Reserva no encontrada o sin permisos")
        
    update_data = reservation_in.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_reservation, key, value)
    
    db.commit()
    db.refresh(db_reservation)
    return db_reservation


# --- (Esta es la ÚNICA función de borrado, la duplicada se eliminó) ---
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
    db_reservation.deleted_at = datetime.datetime.utcnow() # Asegúrate de usar datetime.datetime
    db.commit()
    return


# --- ¡AQUÍ ESTÁ EL NUEVO ENDPOINT DE ANÁLISIS! ---

@router.get("/analysis/popular-times", response_model=Dict[str, Any])
async def get_popular_times(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user) # Asegura que esté logueado
):
    """
    Realiza un análisis de popularidad de horas y laboratorios.
    (Filtra por reservas no borradas)
    """
    try:
        # 1. Consulta para horas populares (solo de reservas no borradas)
        popular_hours_query = (
            db.query(
                extract("hour", ReservationModel.start_time).label("hour"),
                func.count(ReservationModel.id).label("count"),
            )
            .filter(ReservationModel.deleted_at == None) # <-- FILTRO AÑADIDO
            .group_by(extract("hour", ReservationModel.start_time))
            .order_by(extract("hour", ReservationModel.start_time))
            .all()
        )
        
        # 2. Consulta para labs populares (solo de reservas no borradas)
        popular_labs_query = (
            db.query(
                ReservationModel.lab_name,
                func.count(ReservationModel.id).label("count"),
            )
            .filter(ReservationModel.deleted_at == None) # <-- FILTRO AÑADIDO
            .group_by(ReservationModel.lab_name)
            .order_by(func.count(ReservationModel.id).desc())
            .all()
        )

        popular_hours = [{"hour": row.hour, "count": row.count} for row in popular_hours_query]
        popular_labs = [{"lab_name": row.lab_name, "count": row.count} for row in popular_labs_query]

        return {"popular_hours": popular_hours, "popular_labs": popular_labs}

    except Exception as e:
        print(f"Error durante el análisis: {e}")
        raise HTTPException(status_code=500, detail="Error al procesar el análisis")