from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.credit_risk import CreditExposure, RatingMigration, StressTestResult
from app.schemas.credit_risk import (
    CreditRiskDashboard, ECLByRating, PDEvolution, StressScenario
)

router = APIRouter()

@router.get("/dashboard", response_model=CreditRiskDashboard)
async def get_credit_risk_dashboard(
    portfolio: str = "all",
    period: str = "12M",
    db: Session = Depends(get_db)
):
    """Récupère le dashboard Credit Risk complet"""
    
    # ECL par rating
    ecl_by_rating = [
        ECLByRating(
            segment="AAA", pd=0.02, exposure=45000000, lgd=25, 
            ead=42000000, ecl=210000, ecl_percentage=0.005
        ),
        ECLByRating(
            segment="AA", pd=0.05, exposure=120000000, lgd=30,
            ead=115000000, ecl=1725000, ecl_percentage=0.015
        ),
        ECLByRating(
            segment="A", pd=0.15, exposure=230000000, lgd=35,
            ead=220000000, ecl=11550000, ecl_percentage=0.0525
        ),
        ECLByRating(
            segment="BBB", pd=0.8, exposure=180000000, lgd=40,
            ead=175000000, ecl=56000000, ecl_percentage=0.32
        ),
        ECLByRating(
            segment="BB", pd=2.5, exposure=95000000, lgd=45,
            ead=92000000, ecl=103500000, ecl_percentage=1.125
        ),
        ECLByRating(
            segment="B", pd=5.8, exposure=65000000, lgd=50,
            ead=63000000, ecl=182700000, ecl_percentage=2.9
        ),
        ECLByRating(
            segment="CCC", pd=12.5, exposure=25000000, lgd=60,
            ead=24000000, ecl=180000000, ecl_percentage=7.5
        )
    ]
    
    # Evolution PD
    pd_evolution = [
        PDEvolution(month="Jan", pd_retail=1.2, pd_corporate=2.1, pd_mortgage=0.8),
        PDEvolution(month="Fév", pd_retail=1.3, pd_corporate=2.0, pd_mortgage=0.7),
        PDEvolution(month="Mar", pd_retail=1.4, pd_corporate=2.2, pd_mortgage=0.8),
        PDEvolution(month="Avr", pd_retail=1.3, pd_corporate=2.3, pd_mortgage=0.9),
        PDEvolution(month="Mai", pd_retail=1.5, pd_corporate=2.1, pd_mortgage=0.8),
        PDEvolution(month="Jun", pd_retail=1.6, pd_corporate=2.4, pd_mortgage=0.9)
    ]
    
    # Stress scenarios
    stress_scenarios = [
        StressScenario(scenario="Base", pd_increase=0, lgd_increase=0, ecl_impact=0),
        StressScenario(scenario="Adverse", pd_increase=50, lgd_increase=20, ecl_impact=85),
        StressScenario(scenario="Severely Adverse", pd_increase=150, lgd_increase=40, ecl_impact=280)
    ]
    
    # KPIs
    kpis = {
        "pd_average": 2.3,
        "lgd_average": 38.5,
        "ecl_total": 535685000,  # Somme des ECL
        "coverage_ratio": 125,
        "stage_2_ratio": 15.3,
        "stage_3_ratio": 3.8
    }
    
    return CreditRiskDashboard(
        ecl_by_rating=ecl_by_rating,
        pd_evolution=pd_evolution,
        stress_scenarios=stress_scenarios,
        kpis=kpis
    )

@router.get("/migration-matrix")
async def get_migration_matrix(db: Session = Depends(get_db)):
    """Récupère la matrice de migration des ratings"""
    return {
        "matrix": [
            {"from": "AAA", "AAA": 92.5, "AA": 6.5, "A": 0.8, "BBB": 0.2, "BB": 0, "B": 0, "CCC": 0, "D": 0},
            {"from": "AA", "AAA": 1.2, "AA": 91.8, "A": 6.2, "BBB": 0.6, "BB": 0.2, "B": 0, "CCC": 0, "D": 0},
            {"from": "A", "AAA": 0.1, "AA": 2.5, "A": 91.2, "BBB": 5.8, "BB": 0.3, "B": 0.1, "CCC": 0, "D": 0},
            {"from": "BBB", "AAA": 0, "AA": 0.3, "A": 4.2, "BBB": 89.5, "BB": 5.2, "B": 0.6, "CCC": 0.1, "D": 0.1},
            {"from": "BB", "AAA": 0, "AA": 0, "A": 0.2, "BBB": 5.8, "BB": 86.2, "B": 6.8, "CCC": 0.8, "D": 0.2},
            {"from": "B", "AAA": 0, "AA": 0, "A": 0, "BBB": 0.3, "BB": 4.5, "B": 82.8, "CCC": 10.2, "D": 2.2},
            {"from": "CCC", "AAA": 0, "AA": 0, "A": 0, "BBB": 0, "BB": 0.5, "B": 2.8, "CCC": 78.5, "D": 18.2}
        ]
    }

@router.post("/stress-test")
async def run_stress_test(
    scenario_name: str,
    pd_multiplier: float,
    lgd_multiplier: float,
    db: Session = Depends(get_db)
):
    """Execute un stress test personnalisé"""
    
    # Calculer l'impact
    base_ecl = 535685000  # ECL total de base
    ecl_impact = base_ecl * (pd_multiplier * lgd_multiplier - 1)
    
    # Sauvegarder le résultat
    stress_result = StressTestResult(
        scenario_name=scenario_name,
        pd_multiplier=pd_multiplier,
        lgd_multiplier=lgd_multiplier,
        ecl_impact=ecl_impact,
        total_ecl=base_ecl + ecl_impact,
        test_date=datetime.now()
    )
    
    db.add(stress_result)
    db.commit()
    
    return {
        "scenario": scenario_name,
        "impact": ecl_impact,
        "total_ecl": base_ecl + ecl_impact,
        "impact_percentage": (ecl_impact / base_ecl) * 100
    }