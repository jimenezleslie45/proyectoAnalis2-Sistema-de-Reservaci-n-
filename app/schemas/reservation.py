from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

# --- SCHEMA PARA CREAR (MODIFICADO) ---
# Este es el "molde" para el JSON que envías al crear una reserva.
class ReservationCreate(BaseModel):
    lab_name: str = Field(..., min_length=3, max_length=150)
    reserved_by: str = Field(..., min_length=3, max_length=150)
    purpose: str = Field(..., min_length=3)
    start_time: datetime
    active: bool = True

# --- SCHEMA PARA ACTUALIZAR (MODIFICADO) ---
class ReservationUpdate(BaseModel):
    lab_name: Optional[str] = Field(None, min_length=3, max_length=150)
    reserved_by: Optional[str] = Field(None, min_length=3, max_length=150)
    purpose: Optional[str] = Field(None, min_length=3)
    start_time: Optional[datetime] = None
    active: Optional[bool] = None

# --- SCHEMA DE RESPUESTA (MODIFICADO) ---
# Este es el "molde" para el JSON que la API te devuelve.
class ReservationOut(BaseModel):
    id: int
    lab_name: str
    reserved_by: str
    purpose: str
    start_time: datetime
    active: bool
    created_at: datetime 
    owner_id: int

    model_config = {"from_attributes": True}
    
    # --- ¡NUEVO SCHEMA PARA LA PAGINACIÓN! ---
# Esto es lo que faltaba. Define la estructura de la respuesta paginada.
class PaginatedReservationOut(BaseModel):
    total: int
    page: int
    size: int
    pages: int
    results: List[ReservationOut]
