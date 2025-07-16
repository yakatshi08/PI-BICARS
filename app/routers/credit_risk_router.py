"""
Router pour le module Credit Risk
Analyse du risque de crédit selon IFRS 9 et Bâle III
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, date
import uuid

router = APIRouter(
    prefix="/api/v1/credit-risk",
    tags=["Credit Risk"],
    responses={404: {"description": "Not found"}}
)


# Modèles Pydantic
class LoanData(BaseModel):
    loan_id: str
    borrower_id: str
    amount: float = Field(gt=0)
    interest_rate: float = Field(ge=0, le=1)
    term_months: int = Field(gt=0)
    origination_date: date
    risk_rating: str
    collateral_value: Optional[float] = 0
    sector: Optional[str] = None
    payment_history: Optional[List[Dict]] = []


class RiskAssessmentRequest(BaseModel):
    loans: List[LoanData]
    assessment_date: Optional[date] = None
    scenario: Optional[str] = "baseline"


class ECLCalculationRequest(BaseModel):
    loan_id: str
    pd_12m: float = Field(ge=0, le=1)
    lgd: float = Field(ge=0, le=1)
    ead: float = Field(ge=0)
    stage: int = Field(ge=1, le=3)


class StressTestRequest(BaseModel):
    portfolio_id: str
    scenarios: List[Dict[str, float]]
    confidence_level: float = Field(default=0.95, ge=0, le=1)


# Endpoints
@router.post("/assess-portfolio")
async def assess_portfolio_risk(request: RiskAssessmentRequest):
    """
    Évalue le risque d'un portefeuille de prêts
    
    Calcule les métriques de risque selon Bâle III et IFRS 9
    """
    try:
        portfolio_metrics = {
            "total_exposure": sum(loan.amount for loan in request.loans),
            "weighted_avg_pd": 0,
            "expected_loss": 0,
            "unexpected_loss": 0,
            "economic_capital": 0,
            "risk_weighted_assets": 0
        }
        
        # Calcul des métriques par prêt
        loan_assessments = []
        total_pd_weighted = 0
        total_el = 0
        total_rwa = 0
        
        for loan in request.loans:
            # PD selon le rating (simplifié)
            pd = get_pd_by_rating(loan.risk_rating)
            
            # LGD
            lgd = calculate_lgd(loan.amount, loan.collateral_value)
            
            # EAD
            ead = loan.amount  # Simplifié
            
            # Expected Loss
            el = pd * lgd * ead
            total_el += el
            
            # Risk Weight (Bâle III simplifié)
            risk_weight = get_risk_weight(loan.risk_rating, loan.sector)
            rwa = ead * risk_weight
            total_rwa += rwa
            
            # PD pondérée
            total_pd_weighted += pd * ead
            
            loan_assessments.append({
                "loan_id": loan.loan_id,
                "pd": pd,
                "lgd": lgd,
                "ead": ead,
                "expected_loss": el,
                "risk_weight": risk_weight,
                "rwa": rwa,
                "stage": classify_stage(pd, loan.payment_history)
            })
        
        # Métriques du portefeuille
        portfolio_metrics["weighted_avg_pd"] = total_pd_weighted / portfolio_metrics["total_exposure"]
        portfolio_metrics["expected_loss"] = total_el
        portfolio_metrics["risk_weighted_assets"] = total_rwa
        portfolio_metrics["economic_capital"] = total_rwa * 0.08  # 8% Bâle III
        
        # Concentration risk
        concentration = calculate_concentration(request.loans)
        
        return {
            "assessment_id": str(uuid.uuid4()),
            "assessment_date": request.assessment_date or date.today(),
            "portfolio_metrics": portfolio_metrics,
            "loan_assessments": loan_assessments[:10],  # Top 10 pour la réponse
            "concentration_risk": concentration,
            "regulatory_capital": {
                "minimum_required": portfolio_metrics["economic_capital"],
                "buffer_required": portfolio_metrics["economic_capital"] * 0.25,
                "total_required": portfolio_metrics["economic_capital"] * 1.25
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/calculate-ecl")
async def calculate_expected_credit_loss(request: ECLCalculationRequest):
    """
    Calcule l'Expected Credit Loss selon IFRS 9
    """
    try:
        # ECL selon le stage IFRS 9
        if request.stage == 1:
            # Stage 1: 12-month ECL
            ecl = request.pd_12m * request.lgd * request.ead
            horizon = "12 months"
        elif request.stage == 2:
            # Stage 2: Lifetime ECL (simplifié sur 5 ans)
            lifetime_pd = 1 - (1 - request.pd_12m) ** 5
            ecl = lifetime_pd * request.lgd * request.ead
            horizon = "lifetime"
        else:  # Stage 3
            # Stage 3: Credit impaired
            ecl = request.lgd * request.ead  # PD = 100%
            horizon = "immediate"
        
        return {
            "loan_id": request.loan_id,
            "stage": request.stage,
            "ecl_amount": ecl,
            "ecl_rate": ecl / request.ead if request.ead > 0 else 0,
            "horizon": horizon,
            "components": {
                "pd": request.pd_12m if request.stage == 1 else (1 if request.stage == 3 else "lifetime"),
                "lgd": request.lgd,
                "ead": request.ead
            },
            "ifrs9_compliant": True
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stress-test")
async def run_stress_test(request: StressTestRequest):
    """
    Execute un stress test sur le portefeuille
    """
    try:
        results = []
        
        for scenario in request.scenarios:
            # Simulation de l'impact du scénario
            scenario_name = scenario.get("name", "Unnamed scenario")
            gdp_shock = scenario.get("gdp_shock", 0)
            unemployment_shock = scenario.get("unemployment_shock", 0)
            property_shock = scenario.get("property_shock", 0)
            
            # Impact sur les PDs (formule simplifiée)
            pd_multiplier = 1 + (gdp_shock * -0.5) + (unemployment_shock * 0.3)
            
            # Impact sur les LGDs
            lgd_multiplier = 1 + (property_shock * -0.4)
            
            # Calcul des pertes stressées (simulé)
            baseline_loss = 1000000  # Perte de base simulée
            stressed_loss = baseline_loss * pd_multiplier * lgd_multiplier
            
            results.append({
                "scenario": scenario_name,
                "parameters": scenario,
                "baseline_loss": baseline_loss,
                "stressed_loss": stressed_loss,
                "loss_increase": (stressed_loss / baseline_loss - 1) * 100,
                "capital_impact": stressed_loss * 0.08,
                "severity": "severe" if stressed_loss > baseline_loss * 2 else "moderate"
            })
        
        # Calcul du pire scénario
        worst_case = max(results, key=lambda x: x["stressed_loss"])
        
        return {
            "stress_test_id": str(uuid.uuid4()),
            "portfolio_id": request.portfolio_id,
            "test_date": datetime.now(),
            "scenarios_tested": len(results),
            "results": results,
            "worst_case_scenario": worst_case["scenario"],
            "worst_case_loss": worst_case["stressed_loss"],
            "recommendations": generate_stress_test_recommendations(worst_case)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/risk-dashboard")
async def get_risk_dashboard():
    """
    Retourne les métriques pour le dashboard Credit Risk
    """
    return {
        "overview": {
            "total_exposure": 125000000,
            "average_pd": 0.023,
            "expected_loss": 2875000,
            "provisions": 3150000,
            "coverage_ratio": 1.096
        },
        "portfolio_distribution": {
            "by_rating": {
                "AAA": 15,
                "AA": 25,
                "A": 30,
                "BBB": 20,
                "BB": 7,
                "B": 3
            },
            "by_stage": {
                "stage_1": 85,
                "stage_2": 12,
                "stage_3": 3
            }
        },
        "trends": {
            "pd_evolution": [
                {"month": "Jan", "value": 0.021},
                {"month": "Feb", "value": 0.022},
                {"month": "Mar", "value": 0.023},
                {"month": "Apr", "value": 0.023},
                {"month": "May", "value": 0.022},
                {"month": "Jun", "value": 0.023}
            ],
            "npl_evolution": [
                {"month": "Jan", "value": 2.1},
                {"month": "Feb", "value": 2.2},
                {"month": "Mar", "value": 2.3},
                {"month": "Apr", "value": 2.3},
                {"month": "May", "value": 2.2},
                {"month": "Jun", "value": 2.3}
            ]
        },
        "alerts": [
            {
                "severity": "warning",
                "message": "Concentration élevée dans le secteur immobilier (32%)",
                "action": "Envisager une diversification"
            },
            {
                "severity": "info",
                "message": "3 prêts ont migré du Stage 1 au Stage 2 ce mois",
                "action": "Surveiller l'évolution"
            }
        ]
    }


@router.get("/regulatory-reports")
async def get_regulatory_reports():
    """
    Liste les rapports réglementaires disponibles
    """
    return {
        "reports": [
            {
                "id": "corep_credit_risk",
                "name": "COREP - Credit Risk",
                "description": "Rapport sur le risque de crédit selon CRR",
                "frequency": "quarterly",
                "last_generated": "2024-12-31",
                "status": "completed"
            },
            {
                "id": "finrep_f18",
                "name": "FINREP F.18 - Credit Quality",
                "description": "Information sur la qualité du crédit",
                "frequency": "quarterly",
                "last_generated": "2024-12-31",
                "status": "completed"
            },
            {
                "id": "ifrs9_provisions",
                "name": "IFRS 9 - Provisions Report",
                "description": "Rapport détaillé des provisions ECL",
                "frequency": "monthly",
                "last_generated": "2025-01-31",
                "status": "draft"
            }
        ]
    }


# Fonctions helper
def get_pd_by_rating(rating: str) -> float:
    """Retourne la PD selon le rating"""
    pd_mapping = {
        "AAA": 0.001,
        "AA": 0.003,
        "A": 0.008,
        "BBB": 0.015,
        "BB": 0.035,
        "B": 0.075,
        "CCC": 0.150,
        "D": 1.000
    }
    return pd_mapping.get(rating.upper(), 0.05)


def calculate_lgd(exposure: float, collateral: float) -> float:
    """Calcule la Loss Given Default"""
    if exposure <= 0:
        return 0
    recovery_rate = min(collateral / exposure, 1.0) * 0.8  # 80% recovery sur collatéral
    lgd = 1 - recovery_rate
    return max(0, min(1, lgd))


def get_risk_weight(rating: str, sector: Optional[str]) -> float:
    """Retourne le risk weight selon Bâle III"""
    base_weights = {
        "AAA": 0.20,
        "AA": 0.20,
        "A": 0.50,
        "BBB": 0.75,
        "BB": 1.00,
        "B": 1.50,
        "CCC": 1.50,
        "D": 1.50
    }
    
    weight = base_weights.get(rating.upper(), 1.0)
    
    # Ajustement sectoriel
    if sector == "real_estate":
        weight *= 0.75  # Immobilier résidentiel
    elif sector == "sme":
        weight *= 0.85  # Support PME
        
    return weight


def classify_stage(pd: float, payment_history: List) -> int:
    """Classifie le stage IFRS 9"""
    if pd > 0.20:
        return 3  # Credit impaired
    elif pd > 0.05 or (payment_history and any(p.get("days_late", 0) > 30 for p in payment_history[-3:])):
        return 2  # Significant increase in credit risk
    else:
        return 1  # Performing


def calculate_concentration(loans: List[LoanData]) -> Dict[str, Any]:
    """Calcule le risque de concentration"""
    total_exposure = sum(loan.amount for loan in loans)
    
    # Concentration par secteur
    sector_exposure = {}
    for loan in loans:
        sector = loan.sector or "other"
        sector_exposure[sector] = sector_exposure.get(sector, 0) + loan.amount
    
    # HHI (Herfindahl-Hirschman Index)
    hhi = sum((exp / total_exposure) ** 2 for exp in sector_exposure.values())
    
    # Top exposures
    sorted_sectors = sorted(sector_exposure.items(), key=lambda x: x[1], reverse=True)
    
    return {
        "hhi": hhi,
        "concentration_level": "high" if hhi > 0.15 else "moderate" if hhi > 0.10 else "low",
        "top_sectors": [
            {"sector": s[0], "exposure": s[1], "percentage": s[1] / total_exposure * 100}
            for s in sorted_sectors[:3]
        ]
    }


def generate_stress_test_recommendations(worst_case: Dict) -> List[str]:
    """Génère des recommandations suite au stress test"""
    recommendations = []
    
    if worst_case["loss_increase"] > 100:
        recommendations.append("Augmenter significativement les provisions")
        recommendations.append("Revoir la politique d'octroi de crédit")
    
    if worst_case["capital_impact"] > 1000000:
        recommendations.append("Planifier une augmentation de capital")
    
    recommendations.append("Diversifier le portefeuille pour réduire la concentration")
    recommendations.append("Mettre en place un suivi renforcé des expositions à risque")
    
    return recommendations