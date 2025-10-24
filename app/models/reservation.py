from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    
    lab_name = Column(String(150), index=True, nullable=False)
    reserved_by = Column(String(150), nullable=False)
    purpose = Column(String, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # --- ¡NUEVA COLUMNA PARA SOFT DELETE! ---
    deleted_at = Column(DateTime(timezone=True), nullable=True, default=None)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="reservations")