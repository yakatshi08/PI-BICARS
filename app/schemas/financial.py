from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

# Schémas pour les données de marché
class MarketDataBase(BaseModel):
    symbol: str
    date: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int

class MarketDataCreate(MarketDataBase):
    pass

class MarketDataResponse(MarketDataBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les métriques bancaires
class BankingMetricBase(BaseModel):
    metric_name: str
    value: float
    unit: str
    category: str
    date: datetime
    metadata: Optional[Dict[str, Any]] = None

class BankingMetricCreate(BankingMetricBase):
    pass

class BankingMetricResponse(BankingMetricBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les métriques de risque
class RiskMetricBase(BaseModel):
    risk_type: str
    risk_level: float
    exposure: float
    var_95: float
    cvar_95: float
    date: datetime
    metadata: Optional[Dict[str, Any]] = None

class RiskMetricCreate(RiskMetricBase):
    pass

class RiskMetricResponse(RiskMetricBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les KPIs
class KPIDataBase(BaseModel):
    kpi_name: str
    value: str
    target: str
    status: str
    trend: float
    date: datetime

class KPIDataCreate(KPIDataBase):
    pass

class KPIDataResponse(KPIDataBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les réponses agrégées
class DashboardData(BaseModel):
    market_data: List[MarketDataResponse]
    banking_metrics: List[BankingMetricResponse]
    risk_metrics: List[RiskMetricResponse]
    kpis: List[KPIDataResponse]
    last_update: datetime

class WaterfallData(BaseModel):
    name: str
    value: float
    type: str  # 'initial', 'increase', 'decrease', 'total'

class CorrelationData(BaseModel):
    assets: List[str]
    matrix: List[List[float]]