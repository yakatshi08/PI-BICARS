# Fichier: C:\PROJETS-DEVELOPPEMENT\Analyse_Donnees_CLEAN\project\backend\app\api\v1\endpoints\insurance_core.py

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import numpy as np
from enum import Enum

router = APIRouter()

# Modèles Pydantic
class RiskModule(BaseModel):
    name: str
    value: float
    percentage: float
    trend: str  # 'up', 'down', 'stable'
    sub_modules: Optional[List[Dict[str, Any]]] = None

class SolvencyData(BaseModel):
    scr: float
    mcr: float
    own_funds: float
    scr_ratio: float
    mcr_ratio: float
    risk_margin: float
    technical_provisions: float
    eligible_own_funds: Dict[str, float]
    
class TechnicalProvisions(BaseModel):
    best_estimate_life: float
    best_estimate_non_life: float
    risk_margin: float
    total: float
    
class InsuranceKPIs(BaseModel):
    combined_ratio: float
    loss_ratio: float
    expense_ratio: float
    roe: float
    premium_growth: float
    claims_frequency: float
    retention_rate: float
    
class QRTReport(BaseModel):
    report_id: str
    type: str
    period: str
    status: str
    generated_at: datetime
    
class ORSAProjection(BaseModel):
    year: int
    scr_ratio: float
    mcr_ratio: float
    own_funds: float
    technical_provisions: float
    premium_income: float

# Données simulées pour les démonstrations
def calculate_solvency_data(period: str) -> SolvencyData:
    """Calcule les données de solvabilité pour une période donnée"""
    base_scr = 1150000000
    base_own_funds = 1932000000
    
    # Ajouter une variation aléatoire pour simuler des changements
    variation = np.random.uniform(0.95, 1.05)
    
    scr = base_scr * variation
    mcr = scr * 0.25  # MCR généralement 25% du SCR
    own_funds = base_own_funds * variation
    
    return SolvencyData(
        scr=scr,
        mcr=mcr,
        own_funds=own_funds,
        scr_ratio=(own_funds / scr) * 100,
        mcr_ratio=(own_funds / mcr) * 100,
        risk_margin=85000000 * variation,
        technical_provisions=3450000000 * variation,
        eligible_own_funds={
            "tier1": own_funds * 0.85,
            "tier2": own_funds * 0.12,
            "tier3": own_funds * 0.03
        }
    )

def get_risk_modules() -> List[RiskModule]:
    """Retourne la décomposition du SCR par module de risque"""
    modules = [
        RiskModule(
            name="Market Risk",
            value=517500000,
            percentage=45,
            trend="up",
            sub_modules=[
                {"name": "Interest rate risk", "value": 155250000, "percentage": 30},
                {"name": "Equity risk", "value": 129375000, "percentage": 25},
                {"name": "Property risk", "value": 103500000, "percentage": 20},
                {"name": "Spread risk", "value": 77625000, "percentage": 15},
                {"name": "Currency risk", "value": 51750000, "percentage": 10}
            ]
        ),
        RiskModule(
            name="Life underwriting risk",
            value=230000000,
            percentage=20,
            trend="stable",
            sub_modules=[
                {"name": "Mortality risk", "value": 69000000, "percentage": 30},
                {"name": "Longevity risk", "value": 57500000, "percentage": 25},
                {"name": "Lapse risk", "value": 46000000, "percentage": 20},
                {"name": "Expense risk", "value": 34500000, "percentage": 15},
                {"name": "Catastrophe risk", "value": 23000000, "percentage": 10}
            ]
        ),
        RiskModule(
            name="Non-life underwriting risk",
            value=172500000,
            percentage=15,
            trend="down"
        ),
        RiskModule(
            name="Counterparty default risk",
            value=172500000,
            percentage=15,
            trend="up"
        ),
        RiskModule(
            name="Operational risk",
            value=57500000,
            percentage=5,
            trend="stable"
        )
    ]
    return modules

@router.get("/solvency", response_model=SolvencyData)
async def get_solvency_data(period: str = Query(default="Q4-2024")):
    """
    Retourne les données de solvabilité pour une période donnée
    """
    try:
        return calculate_solvency_data(period)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/risk-modules", response_model=List[RiskModule])
async def get_scr_risk_modules():
    """
    Retourne la décomposition du SCR par module de risque
    """
    return get_risk_modules()

@router.get("/kpis", response_model=InsuranceKPIs)
async def get_insurance_kpis(period: str = Query(default="Q4-2024")):
    """
    Retourne les KPIs métier de l'assurance
    """
    # Simulation avec variations aléatoires
    base_combined = 94.5
    variation = np.random.uniform(-2, 2)
    
    return InsuranceKPIs(
        combined_ratio=base_combined + variation,
        loss_ratio=62.3 + variation * 0.7,
        expense_ratio=32.2 + variation * 0.3,
        roe=12.8 + variation * 0.5,
        premium_growth=7.5 + variation * 0.8,
        claims_frequency=0.045 + variation * 0.001,
        retention_rate=89.5 + variation * 0.5
    )

@router.get("/technical-provisions", response_model=TechnicalProvisions)
async def get_technical_provisions():
    """
    Retourne le détail des provisions techniques
    """
    return TechnicalProvisions(
        best_estimate_life=1850000000,
        best_estimate_non_life=1515000000,
        risk_margin=85000000,
        total=3450000000
    )

@router.get("/solvency-evolution")
async def get_solvency_evolution(periods: int = Query(default=8)):
    """
    Retourne l'évolution historique des ratios de solvabilité
    """
    evolution = []
    base_date = datetime.now()
    
    for i in range(periods, 0, -1):
        period_date = base_date - timedelta(days=i * 90)  # Trimestres
        quarter = f"Q{((period_date.month - 1) // 3) + 1}-{period_date.year}"
        
        # Simulation d'une tendance croissante
        scr_ratio = 145 + (periods - i) * 3 + np.random.uniform(-2, 2)
        mcr_ratio = scr_ratio * 4
        
        evolution.append({
            "period": quarter,
            "scr": scr_ratio,
            "mcr": mcr_ratio,
            "own_funds": 1650 + (periods - i) * 35
        })
    
    return evolution

@router.get("/combined-ratio-trend")
async def get_combined_ratio_trend():
    """
    Retourne l'évolution mensuelle du combined ratio
    """
    months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"]
    base_ratio = 96.2
    
    trend = []
    for i, month in enumerate(months):
        # Simulation d'une amélioration progressive
        ratio = base_ratio - (i * 0.15) + np.random.uniform(-0.3, 0.3)
        trend.append({
            "month": month,
            "ratio": round(ratio, 1)
        })
    
    return trend

@router.post("/generate-qrt", response_model=QRTReport)
async def generate_qrt_report(
    template_type: str = "S.02.01",
    period: str = Query(default="Q4-2024")
):
    """
    Génère un rapport QRT Solvency II
    Templates disponibles:
    - S.02.01: Balance sheet
    - S.05.01: Premiums, claims and expenses
    - S.17.01: Non-life technical provisions
    - S.23.01: Own funds
    - S.25.01: SCR standard formula
    """
    valid_templates = ["S.02.01", "S.05.01", "S.17.01", "S.23.01", "S.25.01"]
    
    if template_type not in valid_templates:
        raise HTTPException(status_code=400, detail=f"Template invalide. Templates disponibles: {valid_templates}")
    
    report = QRTReport(
        report_id=f"QRT_{template_type}_{period}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        type=template_type,
        period=period,
        status="completed",
        generated_at=datetime.now()
    )
    
    return report

@router.get("/orsa-projections")
async def get_orsa_projections(years: int = Query(default=5)):
    """
    Retourne les projections ORSA (Own Risk and Solvency Assessment)
    """
    projections = []
    current_year = datetime.now().year
    
    base_scr_ratio = 168
    base_own_funds = 1932000000
    base_premiums = 850000000
    
    for i in range(years):
        year = current_year + i
        
        # Projections avec croissance modérée
        growth_factor = 1 + (i * 0.03)
        stress_factor = 1 - (i * 0.01)  # Légère dégradation du ratio sous stress
        
        projection = ORSAProjection(
            year=year,
            scr_ratio=base_scr_ratio * stress_factor,
            mcr_ratio=base_scr_ratio * 4 * stress_factor,
            own_funds=base_own_funds * growth_factor,
            technical_provisions=3450000000 * growth_factor,
            premium_income=base_premiums * growth_factor * 1.05
        )
        
        projections.append(projection)
    
    return projections

@router.get("/stress-test-results")
async def get_stress_test_results():
    """
    Retourne les résultats des stress tests Solvency II
    """
    scenarios = [
        {
            "name": "Baseline",
            "scr_ratio_impact": 0,
            "own_funds_impact": 0,
            "status": "pass"
        },
        {
            "name": "Market shock (-20%)",
            "scr_ratio_impact": -25,
            "own_funds_impact": -385000000,
            "status": "pass"
        },
        {
            "name": "Insurance catastrophe",
            "scr_ratio_impact": -35,
            "own_funds_impact": -520000000,
            "status": "pass"
        },
        {
            "name": "Combined scenario",
            "scr_ratio_impact": -48,
            "own_funds_impact": -750000000,
            "status": "warning"
        }
    ]
    
    return {
        "test_date": datetime.now().isoformat(),
        "scenarios": scenarios,
        "minimum_scr_ratio": 120,  # Ratio SCR minimum après stress
        "conclusion": "L'entreprise maintient des ratios de solvabilité adéquats dans tous les scénarios testés"
    }

@router.get("/claims-analysis")
async def get_claims_analysis():
    """
    Retourne l'analyse des sinistres pour la détection de fraude et tendances
    """
    return {
        "total_claims": 45678,
        "suspicious_claims": 234,
        "fraud_detection_rate": 0.51,
        "average_claim_amount": 2845.67,
        "claims_by_type": {
            "auto": 15234,
            "property": 12456,
            "liability": 8976,
            "health": 9012
        },
        "fraud_indicators": [
            {"indicator": "Multiple claims same period", "count": 89},
            {"indicator": "Unusual claim patterns", "count": 67},
            {"indicator": "Documentation issues", "count": 78}
        ],
        "trends": {
            "frequency_trend": "decreasing",
            "severity_trend": "stable",
            "fraud_trend": "increasing"
        }
    }