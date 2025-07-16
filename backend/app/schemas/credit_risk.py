from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict

class CreditExposureBase(BaseModel):
    client_id: str
    segment: str
    exposure: float
    pd: float
    lgd: float
    ead: float
    ecl: Optional[float] = None
    stage: int = 1

class CreditExposureCreate(CreditExposureBase):
    date: datetime

class CreditExposureResponse(CreditExposureBase):
    id: int
    date: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class PDEvolution(BaseModel):
    month: str
    pd_retail: float
    pd_corporate: float
    pd_mortgage: float

class ECLByRating(BaseModel):
    segment: str
    pd: float
    exposure: float
    lgd: float
    ead: float
    ecl: float
    ecl_percentage: float

class StressScenario(BaseModel):
    scenario: str
    pd_increase: float
    lgd_increase: float
    ecl_impact: float

class CreditRiskDashboard(BaseModel):
    ecl_by_rating: List[ECLByRating]
    pd_evolution: List[PDEvolution]
    stress_scenarios: List[StressScenario]
    kpis: Dict[str, any]