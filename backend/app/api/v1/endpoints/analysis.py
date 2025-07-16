"""
Analysis endpoints for financial risk assessment
Conformément aux prompts 7-9, 20-23 du cahier des charges
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict
import pandas as pd
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.schemas import (
    AnalysisRequest, AnalysisResponse, 
    CreditRiskAnalysis, LiquidityAnalysis,
    MarketRiskAnalysis, StressTestResult
)
from app.services.analysis_service import AnalysisService
from app.services.ml_service import MLService

router = APIRouter()

@router.post("/eda", response_model=Dict)
async def exploratory_data_analysis(
    dataset_id: str,
    auto_detect_patterns: bool = True,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    EDA intelligent avec détection de patterns sectoriels
    Prompt 7: Détection automatique des patterns
    """
    analysis_service = AnalysisService(db)
    
    # Charger le dataset
    dataset = await analysis_service.get_dataset(dataset_id, current_user.id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset non trouvé")
    
    # Analyse exploratoire
    eda_results = await analysis_service.perform_eda(
        dataset_id,
        auto_detect_patterns=auto_detect_patterns
    )
    
    return {
        "basic_stats": eda_results["basic_stats"],
        "correlations": eda_results["correlations"],
        "patterns_detected": eda_results["patterns"],
        "anomalies": eda_results["anomalies"],
        "sector_benchmarks": eda_results["benchmarks"],
        "recommendations": eda_results["recommendations"]
    }

@router.post("/cohort-analysis", response_model=Dict)
async def cohort_analysis(
    dataset_id: str,
    cohort_column: str,
    metric_columns: List[str],
    time_column: Optional[str] = None,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyse de cohortes pour segmentation client
    Prompt 8: Analyse de cohortes et clustering métier
    """
    analysis_service = AnalysisService(db)
    
    cohort_results = await analysis_service.analyze_cohorts(
        dataset_id,
        cohort_column,
        metric_columns,
        time_column,
        user_id=current_user.id
    )
    
    return {
        "cohort_summary": cohort_results["summary"],
        "retention_matrix": cohort_results["retention"],
        "lifetime_value": cohort_results["ltv"],
        "segment_profiles": cohort_results["profiles"],
        "clustering_results": cohort_results["clusters"]
    }

@router.post("/financial-ratios", response_model=Dict)
async def calculate_financial_ratios(
    dataset_id: str,
    ratio_types: List[str] = Query(
        default=["prudential", "liquidity", "profitability", "risk"],
        description="Types de ratios à calculer"
    ),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Calcul automatique des ratios financiers
    Prompt 9: Ratios prudentiels, liquidité, profitabilité
    """
    analysis_service = AnalysisService(db)
    
    ratios = await analysis_service.calculate_ratios(
        dataset_id,
        ratio_types,
        user_id=current_user.id
    )
    
    return {
        "prudential_ratios": {
            "CET1": ratios.get("cet1_ratio"),
            "Tier1": ratios.get("tier1_ratio"),
            "Total_Capital": ratios.get("total_capital_ratio"),
            "Leverage": ratios.get("leverage_ratio")
        },
        "liquidity_ratios": {
            "LCR": ratios.get("lcr"),
            "NSFR": ratios.get("nsfr"),
            "Liquidity_Coverage": ratios.get("liquidity_coverage")
        },
        "profitability_ratios": {
            "ROE": ratios.get("roe"),
            "ROA": ratios.get("roa"),
            "NIM": ratios.get("nim"),
            "Cost_Income": ratios.get("cost_income_ratio")
        },
        "risk_ratios": {
            "NPL": ratios.get("npl_ratio"),
            "Coverage": ratios.get("coverage_ratio"),
            "LGD": ratios.get("lgd"),
            "PD": ratios.get("pd")
        },
        "regulatory_compliance": ratios.get("compliance_status")
    }

@router.post("/credit-risk", response_model=CreditRiskAnalysis)
async def analyze_credit_risk(
    dataset_id: str,
    analysis_type: str = Query("full", description="full, pd_only, lgd_only, ead_only"),
    regulatory_framework: str = Query("ifrs9", description="ifrs9, cecl, basel3"),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyse Credit Risk avec modèles PD, LGD, EAD
    Prompts 20-21: Modèles IFRS 9, stress tests BCE
    """
    analysis_service = AnalysisService(db)
    ml_service = MLService()
    
    # Analyse complète du risque de crédit
    credit_analysis = await analysis_service.credit_risk_analysis(
        dataset_id,
        analysis_type,
        regulatory_framework,
        user_id=current_user.id
    )
    
    # Calcul des provisions ECL
    ecl_results = await ml_service.calculate_expected_credit_loss(
        credit_analysis["pd_model"],
        credit_analysis["lgd_model"],
        credit_analysis["ead_model"]
    )
    
    return CreditRiskAnalysis(
        pd_results=credit_analysis["pd_results"],
        lgd_results=credit_analysis["lgd_results"],
        ead_results=credit_analysis["ead_results"],
        ecl_provisions=ecl_results,
        rating_migration=credit_analysis["rating_migration"],
        concentration_risk=credit_analysis["concentration"],
        regulatory_capital=credit_analysis["capital_requirements"]
    )

@router.post("/stress-test", response_model=StressTestResult)
async def run_stress_test(
    dataset_id: str,
    test_type: str = Query("bce", description="bce, fed, custom"),
    scenarios: List[str] = Query(
        default=["baseline", "adverse", "severe"],
        description="Scénarios de stress"
    ),
    horizon_months: int = Query(36, description="Horizon de prédiction"),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Stress Tests réglementaires
    Prompt 21: Stress tests BCE avec validation automatique
    """
    analysis_service = AnalysisService(db)
    
    stress_results = await analysis_service.run_stress_test(
        dataset_id,
        test_type,
        scenarios,
        horizon_months,
        user_id=current_user.id
    )
    
    return StressTestResult(
        test_id=stress_results["test_id"],
        test_type=test_type,
        scenarios_results=stress_results["scenarios"],
        capital_impact=stress_results["capital_impact"],
        liquidity_impact=stress_results["liquidity_impact"],
        p_l_impact=stress_results["p_l_impact"],
        regulatory_breaches=stress_results["breaches"],
        recommendations=stress_results["recommendations"],
        validation_status=stress_results["validation"]
    )

@router.post("/liquidity-alm", response_model=LiquidityAnalysis)
async def analyze_liquidity_alm(
    dataset_id: str,
    analysis_date: datetime = Query(default=datetime.now()),
    include_behavioral: bool = Query(True),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyse Liquidité & ALM
    Prompt 22: Dashboard liquidité temps réel, ALM analytics
    """
    analysis_service = AnalysisService(db)
    
    liquidity_analysis = await analysis_service.liquidity_alm_analysis(
        dataset_id,
        analysis_date,
        include_behavioral,
        user_id=current_user.id
    )
    
    return LiquidityAnalysis(
        lcr_calculation=liquidity_analysis["lcr"],
        nsfr_calculation=liquidity_analysis["nsfr"],
        liquidity_gaps=liquidity_analysis["gaps"],
        cash_flow_ladder=liquidity_analysis["cash_flows"],
        concentration_metrics=liquidity_analysis["concentration"],
        behavioral_adjustments=liquidity_analysis["behavioral"],
        stress_scenarios=liquidity_analysis["stress"],
        alm_metrics={
            "duration_gap": liquidity_analysis["duration_gap"],
            "interest_rate_sensitivity": liquidity_analysis["ir_sensitivity"],
            "repricing_gaps": liquidity_analysis["repricing_gaps"]
        }
    )

@router.post("/market-risk", response_model=MarketRiskAnalysis)
async def analyze_market_risk(
    dataset_id: str,
    risk_measures: List[str] = Query(
        default=["var", "cvar", "expected_shortfall"],
        description="Mesures de risque à calculer"
    ),
    confidence_levels: List[float] = Query(
        default=[0.95, 0.99],
        description="Niveaux de confiance"
    ),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyse Market Risk
    Prompt 23: VaR/CVaR multi-facteurs, P&L Attribution
    """
    analysis_service = AnalysisService(db)
    
    market_risk = await analysis_service.market_risk_analysis(
        dataset_id,
        risk_measures,
        confidence_levels,
        user_id=current_user.id
    )
    
    return MarketRiskAnalysis(
        var_results=market_risk["var"],
        cvar_results=market_risk["cvar"],
        expected_shortfall=market_risk["es"],
        factor_analysis=market_risk["factors"],
        p_l_attribution=market_risk["pnl_attribution"],
        greeks=market_risk["greeks"],
        sa_ccr_calculation=market_risk["sa_ccr"],
        backtesting_results=market_risk["backtesting"]
    )

@router.get("/benchmarks/{sector}")
async def get_sector_benchmarks(
    sector: str,
    metrics: List[str] = Query(default=["all"]),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Benchmarks sectoriels
    Prompt 8: Benchmarking et KPIs financiers
    """
    analysis_service = AnalysisService(db)
    
    benchmarks = await analysis_service.get_sector_benchmarks(
        sector,
        metrics if metrics != ["all"] else None
    )
    
    return {
        "sector": sector,
        "benchmarks": benchmarks,
        "peer_comparison": benchmarks.get("peer_analysis"),
        "percentile_ranks": benchmarks.get("percentiles"),
        "best_practices": benchmarks.get("best_practices")
    }

@router.post("/custom-analysis")
async def run_custom_analysis(
    analysis_request: AnalysisRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Analyse personnalisée avec paramètres flexibles"""
    analysis_service = AnalysisService(db)
    
    results = await analysis_service.run_custom_analysis(
        analysis_request.dict(),
        user_id=current_user.id
    )
    
    return {
        "analysis_id": results["id"],
        "results": results["data"],
        "metadata": results["metadata"],
        "execution_time": results["execution_time"]
    }