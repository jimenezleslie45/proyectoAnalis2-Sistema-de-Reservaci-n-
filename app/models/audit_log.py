from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.db.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(50), nullable=False) 
    target_model = Column(String(100), nullable=False) 
    target_id = Column(Integer, nullable=False) 
    details = Column(Text, nullable=True) 
