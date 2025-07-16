from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import QuarterlyData, KPIData, BankingMetric, MarketData, RiskMetric
import random

from app.schemas.financial import (
    DashboardData, 
    MarketDataResponse,
    BankingMetricResponse,
    RiskMetricResponse,
    KPIDataResponse
)

router = APIRouter()

@router.get("/", response_model=DashboardData)
async def get_dashboard_data(db: Session = Depends(get_db)):
    """
    Récupère toutes les données nécessaires pour le dashboard depuis la DB
    """
    
    # Récupérer les données trimestrielles
    quarterly = db.query(QuarterlyData).order_by(QuarterlyData.quarter).all()
    
    # Si pas de données dans la DB, utiliser des données de simulation
    if not quarterly:
        # Données de marché simulées
        market_data = []
        base_price = 116.0
        for i in range(10):
            date = datetime.now() - timedelta(days=9-i)
            market_data.append(MarketDataResponse(
                id=i+1,
                symbol="CAC40",
                date=date,
                open=base_price + random.uniform(-1, 1),
                high=base_price + random.uniform(0, 2),
                low=base_price + random.uniform(-2, 0),
                close=base_price + random.uniform(-1, 1),
                volume=random.randint(1000000, 2000000),
                created_at=datetime.now()
            ))
            base_price += random.uniform(-0.5, 1)
    else:
        # Récupérer les vraies données de marché
        market_data_db = db.query(MarketData).order_by(MarketData.date.desc()).limit(10).all()
        market_data = [MarketDataResponse.from_orm(m) for m in market_data_db]
    
    # Récupérer les KPIs
    kpis_db = db.query(KPIData).all()
    if not kpis_db:
        # KPIs par défaut si la DB est vide
        kpis = [
            KPIDataResponse(
                id=1,
                kpi_name="CET1 Ratio",
                value="14.5%",
                target="> 13%",
                status="good",
                trend=0.3,
                date=datetime.now(),
                created_at=datetime.now()
            ),
            KPIDataResponse(
                id=2,
                kpi_name="LCR",
                value="135%",
                target="> 100%",
                status="good",
                trend=2.1,
                date=datetime.now(),
                created_at=datetime.now()
            ),
            KPIDataResponse(
                id=3,
                kpi_name="NPL Ratio",
                value="3.2%",
                target="< 5%",
                status="good",
                trend=-0.4,
                date=datetime.now(),
                created_at=datetime.now()
            ),
            KPIDataResponse(
                id=4,
                kpi_name="ROE",
                value="8.7%",
                target="> 10%",
                status="warning",
                trend=-0.8,
                date=datetime.now(),
                created_at=datetime.now()
            )
        ]
    else:
        kpis = [KPIDataResponse.from_orm(k) for k in kpis_db]
    
    # Récupérer les métriques bancaires
    banking_metrics_db = db.query(BankingMetric).all()
    if not banking_metrics_db:
        # Métriques par défaut
        banking_metrics = [
            BankingMetricResponse(
                id=1,
                metric_name="NII",
                value=45.2,
                unit="M€",
                category="revenue",
                date=datetime.now(),
                metadata={"change": 3.4},
                created_at=datetime.now()
            ),
            BankingMetricResponse(
                id=2,
                metric_name="NSFR",
                value=118,
                unit="%",
                category="liquidity",
                date=datetime.now(),
                metadata={"minimum": 100},
                created_at=datetime.now()
            )
        ]
    else:
        banking_metrics = [BankingMetricResponse.from_orm(b) for b in banking_metrics_db]
    
    # Métriques de risque
    risk_metrics_db = db.query(RiskMetric).all()
    if not risk_metrics_db:
        risk_metrics = [
            RiskMetricResponse(
                id=1,
                risk_type="credit",
                risk_level=0.75,
                exposure=450000,
                var_95=-125000,
                cvar_95=-180000,
                date=datetime.now(),
                metadata={"category": "high"},
                created_at=datetime.now()
            )
        ]
    else:
        risk_metrics = [RiskMetricResponse.from_orm(r) for r in risk_metrics_db]
    
    return DashboardData(
        market_data=market_data,
        banking_metrics=banking_metrics,
        risk_metrics=risk_metrics,
        kpis=kpis,
        last_update=datetime.now()
    )

@router.get("/quarterly")
async def get_quarterly_data(db: Session = Depends(get_db)):
    """
    Récupère les données trimestrielles depuis la DB
    """
    quarterly_data = db.query(QuarterlyData).order_by(QuarterlyData.quarter).all()
    
    if not quarterly_data:
        # Retourner des données par défaut si la DB est vide
        return [
            {"quarter": "Q1", "revenue": 120000, "costs": 80000, "profit": 40000},
            {"quarter": "Q2", "revenue": 150000, "costs": 90000, "profit": 60000},
            {"quarter": "Q3", "revenue": 180000, "costs": 100000, "profit": 80000},
            {"quarter": "Q4", "revenue": 200000, "costs": 110000, "profit": 90000}
        ]
    
    return [
        {
            "quarter": q.quarter,
            "revenue": q.revenue,
            "costs": q.costs,
            "profit": q.profit
        }
        for q in quarterly_data
    ]

@router.get("/metrics/summary")
async def get_metrics_summary():
    """
    Récupère un résumé des métriques principales
    """
    return {
        "revenue_total": "€3.24M",
        "new_clients": 847,
        "retention_rate": "92.8%",
        "net_margin": "23.4%",
        "quarterly_growth": "29.6%"
    }

@router.get("/waterfall")
async def get_waterfall_data():
    """
    Récupère les données pour le graphique waterfall
    """
    return [
        {"name": "Revenu Q4 2023", "value": 2500000, "type": "initial"},
        {"name": "Nouveaux clients", "value": 450000, "type": "increase"},
        {"name": "Expansion clients", "value": 320000, "type": "increase"},
        {"name": "Churn", "value": -180000, "type": "decrease"},
        {"name": "Ajustements prix", "value": 150000, "type": "increase"},
        {"name": "Revenu Q1 2024", "value": 3240000, "type": "total"}
    ]

@router.get("/correlation")
async def get_correlation_data():
    """
    Récupère la matrice de corrélation
    """
    return {
        "assets": ["CAC 40", "S&P 500", "EUR/USD", "Gold", "Oil"],
        "matrix": [
            [1.00, 0.85, -0.60, 0.45, 0.72],
            [0.85, 1.00, -0.45, 0.38, 0.68],
            [-0.60, -0.45, 1.00, -0.35, -0.52],
            [0.45, 0.38, -0.35, 1.00, 0.42],
            [0.72, 0.68, -0.52, 0.42, 1.00]
        ]
    }