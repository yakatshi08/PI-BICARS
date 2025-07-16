from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime

class CreditExposure(Base):
    __tablename__ = "credit_exposures"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(String(50), index=True, nullable=False)
    segment = Column(String(20), index=True, nullable=False)  # AAA, AA, A, BBB, etc.
    exposure = Column(Float, nullable=False)
    pd = Column(Float, nullable=False)  # Probability of Default
    lgd = Column(Float, nullable=False)  # Loss Given Default
    ead = Column(Float, nullable=False)  # Exposure at Default
    ecl = Column(Float)  # Expected Credit Loss
    stage = Column(Integer, default=1)  # IFRS 9 Stage (1, 2, or 3)
    date = Column(DateTime, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RatingMigration(Base):
    __tablename__ = "rating_migrations"
    
    id = Column(Integer, primary_key=True, index=True)
    from_rating = Column(String(10), nullable=False)
    to_rating = Column(String(10), nullable=False)
    probability = Column(Float, nullable=False)
    period = Column(String(20), default="annual")
    created_at = Column(DateTime, default=datetime.utcnow)

class StressTestResult(Base):
    __tablename__ = "stress_test_results"
    
    id = Column(Integer, primary_key=True, index=True)
    scenario_name = Column(String(50), index=True, nullable=False)
    pd_multiplier = Column(Float, nullable=False)
    lgd_multiplier = Column(Float, nullable=False)
    ecl_impact = Column(Float, nullable=False)
    total_ecl = Column(Float)
    test_date = Column(DateTime, nullable=False)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class CreditRiskMetric(Base):
    __tablename__ = "credit_risk_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_type = Column(String(50), index=True)  # pd_average, lgd_average, ecl_total, etc.
    portfolio = Column(String(50), index=True)  # retail, corporate, mortgage, all
    value = Column(Float, nullable=False)
    date = Column(DateTime, index=True, nullable=False)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)