from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.schemas.audit_log import AuditLogOut
from app.models.audit_log import AuditLog
from app.db.session import get_db
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/audit", tags=["Audit"])

@router.get("/", response_model=List[AuditLogOut])
async def read_audit_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    # Asegurarse de que el usuario está logueado para ver los logs
    current_user: dict = Depends(get_current_user)
):
    """
    Obtiene una lista de registros de auditoría.
    (En un proyecto real, esto debería estar restringido solo a administradores).
    """
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
    return logs