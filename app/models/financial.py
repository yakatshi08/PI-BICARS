from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class MarketData(Base):
    __tablename__ = "market_data"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    date = Column(DateTime, index=True)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    volume = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

class BankingMetric(Base):
    __tablename__ = "banking_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String, index=True)
    value = Column(Float)
    unit = Column(String)
    category = Column(String)
    date = Column(DateTime, index=True)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class RiskMetric(Base):
    __tablename__ = "risk_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    risk_type = Column(String, index=True)
    risk_level = Column(Float)
    exposure = Column(Float)
    var_95 = Column(Float)
    cvar_95 = Column(Float)
    date = Column(DateTime, index=True)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class KPIData(Base):
    __tablename__ = "kpi_data"
    
    id = Column(Integer, primary_key=True, index=True)
    kpi_name = Column(String, index=True)
    value = Column(String)
    target = Column(String)
    status = Column(String)
    trend = Column(Float)
    date = Column(DateTime, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)