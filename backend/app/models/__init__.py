from app.db.database import Base
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

class MarketData(Base):
    __tablename__ = "market_data"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), index=True, nullable=False)
    date = Column(DateTime, index=True, nullable=False)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class QuarterlyData(Base):
    __tablename__ = "quarterly_data"
    
    id = Column(Integer, primary_key=True, index=True)
    quarter = Column(String(10), nullable=False)
    year = Column(Integer, nullable=False)
    revenue = Column(Float, nullable=False)
    costs = Column(Float, nullable=False)
    profit = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class BankingMetric(Base):
    __tablename__ = "banking_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(50), index=True, nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(10))
    category = Column(String(50))
    date = Column(DateTime, index=True, nullable=False)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class RiskMetric(Base):
    __tablename__ = "risk_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    risk_type = Column(String(50), index=True, nullable=False)
    risk_level = Column(Float, nullable=False)
    exposure = Column(Float, nullable=False)
    var_95 = Column(Float)
    cvar_95 = Column(Float)
    date = Column(DateTime, index=True, nullable=False)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class KPIData(Base):
    __tablename__ = "kpi_data"
    
    id = Column(Integer, primary_key=True, index=True)
    kpi_name = Column(String(50), index=True, nullable=False)
    value = Column(String(50), nullable=False)
    target = Column(String(50))
    status = Column(String(20))
    trend = Column(Float)
    date = Column(DateTime, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(100), nullable=False)
    resource = Column(String(100))
    details = Column(JSON)
    ip_address = Column(String(45))
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", backref="audit_logs")