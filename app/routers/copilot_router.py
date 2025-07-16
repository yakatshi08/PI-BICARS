"""
Router pour le Copilot IA Finance/Assurance
Assistant conversationnel intelligent avec NLP spécialisé
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

router = APIRouter(
    prefix="/api/v1/copilot",
    tags=["Copilot IA"],
    responses={404: {"description": "Not found"}}
)


# Modèles Pydantic
class ChatMessage(BaseModel):
    role: str  # "user" ou "assistant"
    content: str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    sector: Optional[str] = "general"
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    suggestions: List[str]
    actions: List[Dict[str, Any]]
    conversation_id: str
    confidence: float


class QueryAnalysisRequest(BaseModel):
    query: str
    data_context: Optional[Dict[str, Any]] = None


# Endpoints
@router.post("/chat", response_model=ChatResponse)
async def chat_with_copilot(request: ChatRequest):
    """
    Interaction avec le Copilot IA spécialisé Finance/Assurance
    
    Comprend le langage naturel et répond avec des insights contextuels
    """
    try:
        # Génération d'un ID de conversation si non fourni
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Analyse de l'intention (simulée)
        intent = analyze_intent(request.message, request.sector)
        
        # Génération de la réponse selon l'intention
        if intent == "ratio_calculation":
            response = generate_ratio_response(request.message, request.sector)
        elif intent == "risk_analysis":
            response = generate_risk_response(request.message, request.sector)
        elif intent == "report_generation":
            response = generate_report_response(request.message, request.sector)
        else:
            response = generate_general_response(request.message, request.sector)
        
        return ChatResponse(
            response=response["text"],
            suggestions=response["suggestions"],
            actions=response["actions"],
            conversation_id=conversation_id,
            confidence=response["confidence"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-query")
async def analyze_query(request: QueryAnalysisRequest):
    """
    Analyse une requête en langage naturel et retourne l'intention
    """
    try:
        # Analyse NLP simulée
        keywords = request.query.lower().split()
        
        # Détection des intentions
        intents = []
        if any(word in keywords for word in ["calcule", "ratio", "lcr", "cet1", "scr"]):
            intents.append("calculation")
        if any(word in keywords for word in ["risque", "risk", "stress", "test"]):
            intents.append("risk_analysis")
        if any(word in keywords for word in ["rapport", "report", "dashboard"]):
            intents.append("reporting")
        if any(word in keywords for word in ["anomalie", "fraude", "suspect"]):
            intents.append("anomaly_detection")
            
        # Extraction des entités
        entities = {
            "metrics": [],
            "time_period": None,
            "sector": "general"
        }
        
        # Détection des métriques
        if "lcr" in keywords:
            entities["metrics"].append("LCR")
        if "cet1" in keywords:
            entities["metrics"].append("CET1")
        if "combined" in keywords and "ratio" in keywords:
            entities["metrics"].append("Combined Ratio")
            
        return {
            "query": request.query,
            "intents": intents,
            "entities": entities,
            "suggested_actions": get_suggested_actions(intents)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-insights")
async def generate_insights(data: Dict[str, Any]):
    """
    Génère automatiquement des insights basés sur les données
    """
    try:
        insights = []
        
        # Analyse basique des données (simulée)
        if "metrics" in data:
            for metric, value in data["metrics"].items():
                insight = analyze_metric(metric, value)
                if insight:
                    insights.append(insight)
        
        # Insights sectoriels
        if data.get("sector") == "banking":
            insights.extend([
                {
                    "type": "regulatory",
                    "severity": "info",
                    "message": "Vos ratios Bâle III sont conformes aux exigences réglementaires",
                    "details": "CET1: 14.8% (min 10.5%), LCR: 125% (min 100%)"
                }
            ])
        elif data.get("sector") == "insurance":
            insights.extend([
                {
                    "type": "performance",
                    "severity": "positive",
                    "message": "Le combined ratio s'améliore ce trimestre",
                    "details": "94.5% vs 96.2% au trimestre précédent"
                }
            ])
        
        return {
            "insights": insights,
            "summary": f"Généré {len(insights)} insights",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/suggestions/{sector}")
async def get_copilot_suggestions(sector: str):
    """
    Retourne des suggestions de questions selon le secteur
    """
    suggestions = {
        "banking": [
            "Quel est mon ratio CET1 actuel ?",
            "Montre-moi l'évolution du NPL ratio sur 6 mois",
            "Effectue un stress test sur mon portefeuille de prêts",
            "Analyse le risque de concentration sectorielle",
            "Génère le rapport COREP du trimestre"
        ],
        "insurance": [
            "Calcule le combined ratio YTD",
            "Quelle est l'évolution de la sinistralité auto ?",
            "Analyse les provisions techniques IBNR",
            "Montre la rentabilité par ligne de produit",
            "Prépare le QRT Solvency II"
        ],
        "general": [
            "Analyse les tendances de mes données",
            "Détecte les anomalies dans les transactions",
            "Crée un dashboard de performance",
            "Compare mes métriques avec le benchmark",
            "Génère un rapport exécutif"
        ]
    }
    
    return {
        "sector": sector,
        "suggestions": suggestions.get(sector, suggestions["general"]),
        "quick_actions": [
            {"action": "new_analysis", "label": "Nouvelle analyse"},
            {"action": "view_dashboard", "label": "Voir le dashboard"},
            {"action": "generate_report", "label": "Générer un rapport"}
        ]
    }


@router.get("/history/{conversation_id}")
async def get_conversation_history(conversation_id: str):
    """
    Récupère l'historique d'une conversation
    """
    # Dans une vraie implémentation, récupérer depuis la DB
    return {
        "conversation_id": conversation_id,
        "messages": [
            {
                "role": "user",
                "content": "Calcule mon ratio CET1",
                "timestamp": "2024-01-15T10:00:00"
            },
            {
                "role": "assistant",
                "content": "Votre ratio CET1 actuel est de 14.8%, bien au-dessus du minimum réglementaire de 10.5%.",
                "timestamp": "2024-01-15T10:00:05"
            }
        ]
    }


# Fonctions helper
def analyze_intent(message: str, sector: str) -> str:
    """Analyse l'intention de l'utilisateur"""
    message_lower = message.lower()
    
    if any(word in message_lower for word in ["calcule", "ratio", "quel est"]):
        return "ratio_calculation"
    elif any(word in message_lower for word in ["risque", "stress", "test"]):
        return "risk_analysis"
    elif any(word in message_lower for word in ["rapport", "génère", "crée"]):
        return "report_generation"
    else:
        return "general_query"


def generate_ratio_response(message: str, sector: str) -> Dict[str, Any]:
    """Génère une réponse pour un calcul de ratio"""
    return {
        "text": "D'après vos dernières données, votre ratio CET1 est de 14.8%, ce qui est excellent et dépasse largement le minimum réglementaire de 10.5% requis par Bâle III.",
        "suggestions": [
            "Voir l'évolution sur 12 mois",
            "Comparer avec les pairs du secteur",
            "Simuler l'impact d'une augmentation des RWA"
        ],
        "actions": [
            {"type": "view_chart", "data": {"metric": "CET1", "period": "12M"}},
            {"type": "download_report", "data": {"report": "basel_iii_ratios"}}
        ],
        "confidence": 0.95
    }


def generate_risk_response(message: str, sector: str) -> Dict[str, Any]:
    """Génère une réponse pour une analyse de risque"""
    return {
        "text": "J'ai analysé votre portefeuille. Le risque de concentration est modéré avec 32% d'exposition au secteur immobilier. Je recommande une diversification pour optimiser le profil risque/rendement.",
        "suggestions": [
            "Voir la répartition sectorielle détaillée",
            "Lancer un stress test immobilier",
            "Analyser les corrélations entre secteurs"
        ],
        "actions": [
            {"type": "show_analysis", "data": {"analysis": "concentration_risk"}},
            {"type": "run_simulation", "data": {"type": "stress_test"}}
        ],
        "confidence": 0.88
    }


def generate_report_response(message: str, sector: str) -> Dict[str, Any]:
    """Génère une réponse pour la génération de rapport"""
    return {
        "text": "Je prépare votre rapport COREP pour le T4 2024. Le rapport inclura tous les ratios prudentiels, l'analyse de liquidité et les expositions par classe d'actifs. Génération en cours...",
        "suggestions": [
            "Ajouter une analyse comparative T3 vs T4",
            "Inclure les projections Q1 2025",
            "Générer aussi le rapport FINREP"
        ],
        "actions": [
            {"type": "generate_report", "data": {"type": "COREP", "period": "Q4_2024"}},
            {"type": "preview_report", "data": {"sections": ["ratios", "liquidity", "exposures"]}}
        ],
        "confidence": 0.92
    }


def generate_general_response(message: str, sector: str) -> Dict[str, Any]:
    """Génère une réponse générale"""
    return {
        "text": "Je suis là pour vous aider avec vos analyses financières. Que souhaitez-vous analyser aujourd'hui ?",
        "suggestions": [
            "Analyser mes KPIs principaux",
            "Détecter des anomalies",
            "Créer un nouveau dashboard"
        ],
        "actions": [
            {"type": "show_menu", "data": {"options": ["analysis", "reporting", "monitoring"]}}
        ],
        "confidence": 0.75
    }


def get_suggested_actions(intents: List[str]) -> List[Dict[str, str]]:
    """Retourne des actions suggérées selon les intentions"""
    actions = []
    
    if "calculation" in intents:
        actions.append({"action": "open_calculator", "label": "Ouvrir le calculateur"})
    if "risk_analysis" in intents:
        actions.append({"action": "run_analysis", "label": "Lancer l'analyse"})
    if "reporting" in intents:
        actions.append({"action": "generate_report", "label": "Générer le rapport"})
        
    return actions


def analyze_metric(metric: str, value: Any) -> Optional[Dict[str, Any]]:
    """Analyse une métrique et génère un insight"""
    if metric == "CET1" and isinstance(value, (int, float)):
        if value < 10.5:
            return {
                "type": "alert",
                "severity": "critical",
                "message": f"CET1 ratio ({value}%) en dessous du minimum réglementaire",
                "action": "Augmenter le capital ou réduire les RWA"
            }
    return None