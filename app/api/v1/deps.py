from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from app.db.session import get_db
from app.models.user import User
from app.models.reservation import Reservation

def get_current_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

def get_current_reservation(db: Session, reservation_id: int):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if reservation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")
    return reservation

def get_db_session():
    db = get_db()
    try:
        yield db
    finally:
        db.close()