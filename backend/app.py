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

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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

# Routes API
@app.get("/")
def read_root():
    return {"message": "Welcome to FinTech Analysis Platform API"}

@app.get("/api/v1/dashboard/metrics")
def get_dashboard_metrics():
    return {
        "npl_ratio": round(random.uniform(2.0, 3.5), 2),
        "cet1_ratio": round(random.uniform(14.0, 16.5), 2),
        "lcr": round(random.uniform(135, 150), 0),
        "roe": round(random.uniform(10.0, 14.0), 2)
    }

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }