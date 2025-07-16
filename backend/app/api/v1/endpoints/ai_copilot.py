# Fichier: C:\PROJETS-DEVELOPPEMENT\Analyse_Donnees_CLEAN\project\backend\app\api\v1\endpoints\ai_copilot.py

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import re
from enum import Enum

router = APIRouter()

# Modèles Pydantic
class QueryType(str, Enum):
    BANKING = "banking"
    INSURANCE = "insurance"
    RISK = "risk"
    GENERAL = "general"

class AIQuery(BaseModel):
    query: str
    context: Optional[str] = "all"
    include_data: Optional[bool] = True
    
class AIResponse(BaseModel):
    response: str
    type: str
    data: Optional[Dict[str, Any]] = None
    suggestions: Optional[List[str]] = None
    timestamp: datetime

class FinancialMetrics(BaseModel):
    cet1_ratio: float
    lcr_ratio: float
    nsfr_ratio: float
    npl_ratio: float
    roe: float
    
class InsuranceMetrics(BaseModel):
    scr_ratio: float
    mcr_ratio: float
    combined_ratio: float
    loss_ratio: float
    expense_ratio: float

# Base de connaissances simplifiée
KNOWLEDGE_BASE = {
    "banking": {
        "ratios": {
            "cet1": {
                "current": 14.8,
                "minimum": 10.5,
                "trend": "increasing",
                "description": "Common Equity Tier 1 - Mesure la solidité financière"
            },
            "lcr": {
                "current": 125.5,
                "minimum": 100,
                "trend": "stable",
                "description": "Liquidity Coverage Ratio - Capacité à faire face aux sorties de trésorerie"
            },
            "nsfr": {
                "current": 112.3,
                "minimum": 100,
                "trend": "increasing",
                "description": "Net Stable Funding Ratio - Financement stable à long terme"
            }
        }
    },
    "insurance": {
        "solvency": {
            "scr": {
                "current": 168,
                "minimum": 100,
                "capital_required": 1150000000,
                "own_funds": 1932000000
            },
            "mcr": {
                "current": 672,
                "minimum": 100,
                "capital_required": 287500000
            }
        },
        "performance": {
            "combined_ratio": 94.5,
            "loss_ratio": 62.3,
            "expense_ratio": 32.2
        }
    }
}

def analyze_query(query: str) -> QueryType:
    """Détermine le type de requête basé sur des mots-clés"""
    query_lower = query.lower()
    
    banking_keywords = ["cet1", "tier 1", "lcr", "nsfr", "npl", "bâle", "basel", "liquidité bancaire"]
    insurance_keywords = ["solvency", "scr", "mcr", "combined ratio", "loss ratio", "actuariel", "provisions techniques"]
    risk_keywords = ["var", "cvar", "stress test", "risque", "anomalie", "fraude"]
    
    if any(keyword in query_lower for keyword in banking_keywords):
        return QueryType.BANKING
    elif any(keyword in query_lower for keyword in insurance_keywords):
        return QueryType.INSURANCE
    elif any(keyword in query_lower for keyword in risk_keywords):
        return QueryType.RISK
    else:
        return QueryType.GENERAL

def generate_banking_response(query: str) -> Dict[str, Any]:
    """Génère une réponse pour les requêtes bancaires"""
    response = {
        "text": "",
        "data": {},
        "type": "banking"
    }
    
    if "cet1" in query.lower() or "tier 1" in query.lower():
        metrics = KNOWLEDGE_BASE["banking"]["ratios"]["cet1"]
        response["text"] = f"""D'après les dernières données disponibles :

**Ratio CET1 (Common Equity Tier 1)**
• Ratio actuel : {metrics['current']}%
• Minimum réglementaire : {metrics['minimum']}%
• Marge de sécurité : +{metrics['current'] - metrics['minimum']:.1f}%

📊 Évolution : Tendance {metrics['trend']}
✅ **Statut** : Conforme aux exigences Bâle III

💡 **Recommandation** : Maintenir le ratio au-dessus de 14% pour conserver une marge confortable."""
        
        response["data"] = {
            "cet1_ratio": metrics['current'],
            "minimum": metrics['minimum'],
            "margin": metrics['current'] - metrics['minimum'],
            "status": "compliant"
        }
    
    elif "lcr" in query.lower():
        metrics = KNOWLEDGE_BASE["banking"]["ratios"]["lcr"]
        response["text"] = f"""**Liquidity Coverage Ratio (LCR)**

• Ratio actuel : {metrics['current']}%
• Minimum réglementaire : {metrics['minimum']}%
• Excédent de liquidité : +{metrics['current'] - metrics['minimum']:.1f}%

📈 Position de liquidité solide permettant de couvrir les sorties de trésorerie sur 30 jours."""
        
        response["data"] = {
            "lcr_ratio": metrics['current'],
            "minimum": metrics['minimum'],
            "excess": metrics['current'] - metrics['minimum']
        }
    
    return response

def generate_insurance_response(query: str) -> Dict[str, Any]:
    """Génère une réponse pour les requêtes d'assurance"""
    response = {
        "text": "",
        "data": {},
        "type": "insurance"
    }
    
    if "solvency" in query.lower() or "scr" in query.lower():
        solvency = KNOWLEDGE_BASE["insurance"]["solvency"]
        response["text"] = f"""**Analyse Solvency II - Ratios de solvabilité**

📊 **SCR (Solvency Capital Requirement)**
• Ratio de couverture SCR : {solvency['scr']['current']}%
• Minimum réglementaire : {solvency['scr']['minimum']}%
• Capital requis : {solvency['scr']['capital_required']/1e9:.2f}B€
• Fonds propres : {solvency['scr']['own_funds']/1e9:.2f}B€

📈 **MCR (Minimum Capital Requirement)**
• Ratio de couverture MCR : {solvency['mcr']['current']}%
• Minimum réglementaire : {solvency['mcr']['minimum']}%

✅ Position de solvabilité solide avec des marges confortables"""
        
        response["data"] = {
            "scr_ratio": solvency['scr']['current'],
            "mcr_ratio": solvency['mcr']['current'],
            "own_funds": solvency['scr']['own_funds'],
            "scr_requirement": solvency['scr']['capital_required']
        }
    
    elif "combined ratio" in query.lower():
        perf = KNOWLEDGE_BASE["insurance"]["performance"]
        response["text"] = f"""**Analyse du Combined Ratio**

• Combined Ratio actuel : {perf['combined_ratio']}%
• Loss Ratio : {perf['loss_ratio']}%
• Expense Ratio : {perf['expense_ratio']}%

✅ Performance technique excellente (< 100%)
📊 Marge technique : {100 - perf['combined_ratio']:.1f}%"""
        
        response["data"] = perf
    
    return response

def generate_suggestions(query_type: QueryType) -> List[str]:
    """Génère des suggestions contextuelles"""
    suggestions_map = {
        QueryType.BANKING: [
            "Analyser l'évolution du ratio NSFR",
            "Générer un stress test de liquidité",
            "Comparer les ratios avec les pairs du secteur",
            "Préparer le rapport COREP"
        ],
        QueryType.INSURANCE: [
            "Décomposer le SCR par module de risque",
            "Analyser l'évolution du combined ratio",
            "Calculer les provisions techniques",
            "Générer le rapport QRT Solvency II"
        ],
        QueryType.RISK: [
            "Calculer la VaR sur le portefeuille",
            "Lancer une détection d'anomalies",
            "Analyser les corrélations de risque",
            "Simuler des scénarios de stress"
        ],
        QueryType.GENERAL: [
            "Explorer les données disponibles",
            "Générer un rapport personnalisé",
            "Analyser les tendances récentes",
            "Comparer les performances"
        ]
    }
    
    return suggestions_map.get(query_type, suggestions_map[QueryType.GENERAL])

@router.post("/query", response_model=AIResponse)
async def process_ai_query(query: AIQuery):
    """
    Traite une requête en langage naturel et retourne une réponse intelligente
    """
    try:
        # Analyser le type de requête
        query_type = analyze_query(query.query)
        
        # Générer la réponse appropriée
        if query_type == QueryType.BANKING:
            result = generate_banking_response(query.query)
        elif query_type == QueryType.INSURANCE:
            result = generate_insurance_response(query.query)
        else:
            # Réponse générique pour les autres types
            result = {
                "text": f"J'ai bien compris votre demande concernant '{query.query}'. Je suis en train d'analyser les données pertinentes.",
                "data": None,
                "type": "general"
            }
        
        # Préparer la réponse finale
        response = AIResponse(
            response=result["text"],
            type=result["type"],
            data=result.get("data"),
            suggestions=generate_suggestions(query_type),
            timestamp=datetime.now()
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/suggestions/{context}")
async def get_contextual_suggestions(context: str):
    """
    Retourne des suggestions basées sur le contexte
    """
    context_suggestions = {
        "banking": [
            {"text": "Calcule mon ratio CET1", "icon": "building"},
            {"text": "Analyse de liquidité LCR", "icon": "droplet"},
            {"text": "Stress test Bâle III", "icon": "alert"}
        ],
        "insurance": [
            {"text": "Ratio SCR Solvency II", "icon": "shield"},
            {"text": "Analyse Combined Ratio", "icon": "chart"},
            {"text": "Calcul provisions techniques", "icon": "calculator"}
        ],
        "all": [
            {"text": "Vue d'ensemble des risques", "icon": "eye"},
            {"text": "Rapport réglementaire", "icon": "file"},
            {"text": "Détection d'anomalies", "icon": "alert"}
        ]
    }
    
    return context_suggestions.get(context, context_suggestions["all"])

@router.post("/generate-report")
async def generate_report(report_type: str, period: str):
    """
    Génère un rapport automatisé basé sur le type demandé
    """
    report_types = {
        "corep": "Common Reporting (COREP) - Reporting prudentiel bancaire",
        "qrt": "Quantitative Reporting Templates - Solvency II",
        "stress_test": "Stress Test BCE - Tests de résistance",
        "ifrs9": "IFRS 9 - Provisions pour pertes de crédit attendues"
    }
    
    if report_type not in report_types:
        raise HTTPException(status_code=400, detail="Type de rapport non reconnu")
    
    # Simulation de génération de rapport
    return {
        "status": "success",
        "report_type": report_type,
        "description": report_types[report_type],
        "period": period,
        "generated_at": datetime.now(),
        "download_url": f"/api/v1/reports/download/{report_type}_{period}.pdf"
    }

@router.get("/metrics/banking")
async def get_banking_metrics() -> FinancialMetrics:
    """Retourne les métriques bancaires actuelles"""
    return FinancialMetrics(
        cet1_ratio=14.8,
        lcr_ratio=125.5,
        nsfr_ratio=112.3,
        npl_ratio=2.1,
        roe=11.5
    )

@router.get("/metrics/insurance")
async def get_insurance_metrics() -> InsuranceMetrics:
    """Retourne les métriques d'assurance actuelles"""
    return InsuranceMetrics(
        scr_ratio=168.0,
        mcr_ratio=672.0,
        combined_ratio=94.5,
        loss_ratio=62.3,
        expense_ratio=32.2
    )