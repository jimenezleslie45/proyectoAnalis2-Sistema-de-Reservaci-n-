from sqlalchemy.orm import Session
import json

from app.models.audit_log import AuditLog
from app.models.user import User

def create_audit_log(
    db: Session,
    user: User,
    action: str,
    target_model: str,
    target_id: int,
    details: dict = None
):
    """Crea un nuevo registro de auditoría."""
    details_str = json.dumps(details) if details else None
    
    db_log = AuditLog(
        user_id=user.id,
        action=action,
        target_model=target_model,
        target_id=target_id,
        details=details_str
    )
    db.add(db_log)
    db.commit()
    return db_log
