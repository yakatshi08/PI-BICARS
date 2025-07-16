from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, timedelta
from pydantic import BaseModel

router = APIRouter()

class ReportData(BaseModel):
    id: int
    title: str
    type: str
    date: str
    status: str
    content: dict

@router.get("/", response_model=List[ReportData])
async def get_reports():
    """Récupère la liste des rapports disponibles"""
    return [
        ReportData(
            id=1,
            title="Rapport Mensuel Q1 2024",
            type="monthly",
            date=datetime.now().isoformat(),
            status="completed",
            content={
                "revenue": 3240000,
                "growth_rate": 29.6,
                "new_clients": 847,
                "churn_rate": 3.2
            }
        ),
        ReportData(
            id=2,
            title="Analyse de Risque Crédit",
            type="credit_risk",
            date=(datetime.now() - timedelta(days=7)).isoformat(),
            status="completed",
            content={
                "pd_average": 2.8,
                "lgd_average": 45.0,
                "ead_total": 125000000,
                "expected_loss": 1575000
            }
        ),
        ReportData(
            id=3,
            title="Rapport de Conformité COREP",
            type="regulatory",
            date=(datetime.now() - timedelta(days=30)).isoformat(),
            status="pending",
            content={
                "cet1_ratio": 14.5,
                "tier1_ratio": 16.2,
                "total_capital_ratio": 18.8
            }
        )
    ]

@router.post("/generate")
async def generate_report(type: str, params: dict = {}):
    """Génère un nouveau rapport"""
    return ReportData(
        id=4,
        title=f"Rapport {type} - {datetime.now().strftime('%Y-%m-%d')}",
        type=type,
        date=datetime.now().isoformat(),
        status="processing",
        content={"message": "Rapport en cours de génération..."}
    )

@router.get("/{report_id}")
async def get_report_by_id(report_id: int):
    """Récupère un rapport spécifique par ID"""
    if report_id > 3:
        raise HTTPException(status_code=404, detail="Rapport non trouvé")
    
    return ReportData(
        id=report_id,
        title=f"Rapport détaillé #{report_id}",
        type="detailed",
        date=datetime.now().isoformat(),
        status="completed",
        content={"data": "Contenu détaillé du rapport"}
    )