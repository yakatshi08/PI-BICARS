# app.py - Backend FastAPI pour FinTech Analysis Platform
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
import random

# Créer l'application FastAPI
app = FastAPI(
    title="FinTech Analysis Platform API",
    description="API pour l'analyse de données financières avec ML/IA",
    version="1.0.0"
)

# Configuration CORS pour permettre les requêtes du frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèles Pydantic
class FinanceMetrics(BaseModel):
    npl_ratio: float
    cet1_ratio: float
    lcr: float
    roe: float

class Dataset(BaseModel):
    id: str
    name: str
    type: str
    created_at: str
    rows: int
    columns: int
    quality_score: int
    is_validated: bool

# Routes API
@app.get("/")
def read_root():
    return {"message": "Welcome to FinTech Analysis Platform API"}

@app.get("/api/v1/dashboard/metrics", response_model=FinanceMetrics)
def get_dashboard_metrics():
    """Retourne les métriques financières pour le dashboard"""
    return FinanceMetrics(
        npl_ratio=round(random.uniform(2.0, 3.5), 2),
        cet1_ratio=round(random.uniform(14.0, 16.5), 2),
        lcr=round(random.uniform(135, 150), 0),
        roe=round(random.uniform(10.0, 14.0), 2)
    )

@app.get("/api/v1/datasets", response_model=List[Dataset])
def get_datasets():
    """Retourne la liste des datasets disponibles"""
    return [
        Dataset(
            id="demo-1",
            name="Données Clients 2024",
            type="credit_risk",
            created_at="2024-01-15",
            rows=10523,
            columns=45,
            quality_score=98,
            is_validated=True
        ),
        Dataset(
            id="demo-2",
            name="Portefeuille Crédit Q4",
            type="liquidity",
            created_at="2024-01-10",
            rows=8654,
            columns=38,
            quality_score=95,
            is_validated=True
        )
    ]

@app.get("/api/v1/health")
def health_check():
    """Vérification de l'état du serveur"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.post("/api/v1/analyses/run")
def run_analysis(dataset_id: str, analysis_type: str):
    """Lance une analyse sur un dataset"""
    return {
        "analysis_id": f"analysis-{random.randint(1000, 9999)}",
        "dataset_id": dataset_id,
        "type": analysis_type,
        "status": "running",
        "started_at": datetime.now().isoformat()
    }

@app.get("/api/v1/models")
def get_models():
    """Retourne la liste des modèles ML disponibles"""
    return [
        {
            "id": "model-1",
            "name": "Prédiction Défaut XGBoost",
            "type": "xgboost",
            "status": "production",
            "metrics": {"accuracy": 96.8, "f1_score": 0.94},
            "created_at": "2024-01-15",
            "last_used": "2024-01-20"
        },
        {
            "id": "model-2",
            "name": "Scoring Crédit RandomForest",
            "type": "random_forest",
            "status": "staging",
            "metrics": {"accuracy": 94.2, "f1_score": 0.91},
            "created_at": "2024-01-10",
            "last_used": "2024-01-18"
        }
    ]