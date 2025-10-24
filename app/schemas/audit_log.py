from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AuditLogOut(BaseModel):
    id: int
    timestamp: datetime
    user_id: int
    action: str
    target_model: str
    target_id: int
    details: Optional[str] = None

    model_config = {"from_attributes": True}
