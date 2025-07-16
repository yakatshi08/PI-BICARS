"""
Router FastAPI pour le module Analytics ML
Endpoints pour l'intelligence artificielle Finance/Assurance
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from fastapi.responses import JSONResponse
from typing import Dict, Any, List
import logging
from datetime import datetime

from .models import (
    SectorDetectionRequest, SectorDetectionResponse,
    ModelSelectionRequest, ModelSelectionResponse,
    AnomalyDetectionRequest, AnomalyDetectionResponse,
    AutoMLRequest, AutoMLResponse,
    ScenarioAnalysisRequest, ScenarioAnalysisResponse,
    PredictionRequest, PredictionResponse,
    SectorMetricsRequest, SectorMetricsResponse,
    RegulatoryReportRequest, RegulatoryReportResponse,
    ModelExplanationRequest, ModelExplanationResponse,
    ModelMonitoringRequest, ModelMonitoringResponse,
    BatchProcessRequest, BatchProcessResponse,
    DataStatus
)
from .service import analytics_service
from app.core.auth import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)

# Création du router
router = APIRouter(
    prefix="/api/v1/analytics-ml",
    tags=["Analytics ML"],
    responses={404: {"description": "Not found"}}
)


# ========== ENDPOINTS DÉTECTION & CONFIGURATION ==========

@router.post("/detect-sector", response_model=SectorDetectionResponse)
async def detect_sector(
    request: SectorDetectionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Détecte automatiquement le secteur (Banking/Insurance) basé sur les données
    
    Cette fonction analyse les patterns dans les noms de colonnes et les données
    pour identifier automatiquement si les données appartiennent au secteur
    bancaire ou assurance.
    """
    try:
        logger.info(f"Détection de secteur demandée par {current_user.email}")
        response = await analytics_service.detect_sector(request)
        return response
    except Exception as e:
        logger.error(f"Erreur détection secteur: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/select-model", response_model=ModelSelectionResponse)
async def select_model(
    request: ModelSelectionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Sélectionne automatiquement le meilleur modèle ML pour le cas d'usage
    
    Basé sur le type de données, le secteur et les caractéristiques,
    cette fonction recommande le modèle ML le plus approprié.
    """
    try:
        logger.info(f"Sélection de modèle pour {request.data_type} - Secteur: {request.sector}")
        response = await analytics_service.select_model(request)
        return response
    except Exception as e:
        logger.error(f"Erreur sélection modèle: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== ENDPOINTS ANALYSE & DÉTECTION ==========

@router.post("/detect-anomalies", response_model=AnomalyDetectionResponse)
async def detect_anomalies(
    request: AnomalyDetectionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Détecte les anomalies dans les données financières/assurance
    
    Utilise Isolation Forest et d'autres algorithmes pour identifier
    les transactions ou patterns suspects nécessitant une attention particulière.
    """
    try:
        logger.info(f"Détection d'anomalies - Sensibilité: {request.sensitivity}")
        response = await analytics_service.detect_anomalies(request)
        
        # Log si beaucoup d'anomalies détectées
        if response.anomalies_count > 50:
            logger.warning(f"Nombre élevé d'anomalies détectées: {response.anomalies_count}")
            
        return response
    except Exception as e:
        logger.error(f"Erreur détection anomalies: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-scenarios", response_model=ScenarioAnalysisResponse)
async def analyze_scenarios(
    request: ScenarioAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Analyse de scénarios et stress testing
    
    Effectue des simulations Monte Carlo et calcule VaR/CVaR
    pour différents scénarios de risque selon Bâle III ou Solvency II.
    """
    try:
        logger.info(f"Analyse de {len(request.scenarios)} scénarios pour {request.sector}")
        response = await analytics_service.analyze_scenarios(request)
        return response
    except Exception as e:
        logger.error(f"Erreur analyse scénarios: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== ENDPOINTS AUTOML & PRÉDICTION ==========

@router.post("/automl/train", response_model=AutoMLResponse)
async def train_automl(
    request: AutoMLRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Lance un pipeline AutoML pour entraîner automatiquement des modèles
    
    Compare plusieurs algorithmes (XGBoost, Random Forest, Neural Networks, etc.)
    et sélectionne le meilleur selon les métriques de performance.
    """
    try:
        logger.info(f"Lancement AutoML - Tâche: {request.task_type}, Secteur: {request.sector}")
        
        # Pour les jobs longs, on pourrait utiliser background_tasks
        # background_tasks.add_task(analytics_service.run_automl_background, request)
        
        response = await analytics_service.run_automl(request)
        return response
    except Exception as e:
        logger.error(f"Erreur AutoML: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict", response_model=PredictionResponse)
async def predict(
    request: PredictionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Effectue une prédiction avec un modèle entraîné
    
    Utilise le modèle spécifié pour faire des prédictions
    et fournit les intervalles de confiance si demandés.
    """
    try:
        logger.info(f"Prédiction avec modèle {request.model_id}")
        response = await analytics_service.predict(request)
        return response
    except Exception as e:
        logger.error(f"Erreur prédiction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== ENDPOINTS MÉTRIQUES SECTORIELLES ==========

@router.post("/metrics/calculate", response_model=SectorMetricsResponse)
async def calculate_metrics(
    request: SectorMetricsRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Calcule les métriques spécifiques au secteur
    
    - Banking: NII, LCR, NSFR, CET1, NPL Ratio
    - Insurance: Combined Ratio, Loss Ratio, SCR, MCR
    """
    try:
        logger.info(f"Calcul métriques {request.sector} - Période: {request.period}")
        response = await analytics_service.calculate_sector_metrics(request)
        
        # Alertes critiques
        if response.alerts:
            for alert in response.alerts:
                if "🚨" in alert:
                    logger.critical(f"Alerte critique: {alert}")
                    
        return response
    except Exception as e:
        logger.error(f"Erreur calcul métriques: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== ENDPOINTS RAPPORTS RÉGLEMENTAIRES ==========

@router.post("/regulatory/generate-report")
async def generate_regulatory_report(
    request: RegulatoryReportRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Génère un rapport réglementaire (COREP, FINREP, QRT Solvency II)
    
    Création automatique des rapports conformes aux exigences
    réglementaires pour la banque ou l'assurance.
    """
    try:
        logger.info(f"Génération rapport {request.report_type} pour {request.sector}")
        
        # Simulation de génération de rapport
        report_id = f"RPT_{request.report_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Dans un cas réel, on lancerait la génération en background
        # background_tasks.add_task(generate_report_async, request, report_id)
        
        return RegulatoryReportResponse(
            report_id=report_id,
            report_type=request.report_type,
            validation_status="pending",
            validation_errors=[],
            report_url=f"/api/v1/reports/{report_id}",
            submission_ready=False
        )
    except Exception as e:
        logger.error(f"Erreur génération rapport: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== ENDPOINTS EXPLAINABILITY & MONITORING ==========

@router.post("/explain")
async def explain_model(
    request: ModelExplanationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Fournit des explications pour les prédictions du modèle
    
    Utilise SHAP ou LIME pour expliquer les décisions du modèle
    et améliorer la transparence pour la conformité réglementaire.
    """
    try:
        logger.info(f"Explication modèle {request.model_id} - Type: {request.explanation_type}")
        
        # Simulation d'explication
        return ModelExplanationResponse(
            feature_importance={
                "credit_score": 0.35,
                "income": 0.25,
                "debt_ratio": 0.20,
                "employment_years": 0.15,
                "other": 0.05
            },
            decision_path=["High credit score", "Stable income", "Low debt ratio"],
            confidence=0.87,
            visualization_data={
                "shap_values": [],
                "feature_names": []
            }
        )
    except Exception as e:
        logger.error(f"Erreur explication modèle: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/monitor")
async def monitor_model(
    request: ModelMonitoringRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Monitore la performance et le drift des modèles en production
    
    Détecte la dégradation de performance et recommande
    le retraining si nécessaire.
    """
    try:
        logger.info(f"Monitoring modèle {request.model_id}")
        
        # Simulation de monitoring
        drift_score = 0.15  # Exemple
        
        return ModelMonitoringResponse(
            drift_detected=drift_score > 0.2,
            drift_score=drift_score,
            performance_degradation=False,
            current_accuracy=0.89,
            baseline_accuracy=0.92,
            retraining_recommended=drift_score > 0.3,
            alerts=["Légère baisse de performance détectée"] if drift_score > 0.1 else []
        )
    except Exception as e:
        logger.error(f"Erreur monitoring: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== ENDPOINTS BATCH & ASYNCHRONES ==========

@router.post("/batch/submit")
async def submit_batch_job(
    request: BatchProcessRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Soumet un job de traitement batch pour analyses lourdes
    
    Permet de lancer des analyses complexes en arrière-plan
    sans bloquer l'interface utilisateur.
    """
    try:
        logger.info(f"Soumission batch job {request.job_type} - Priorité: {request.priority}")
        
        # Génération ID job
        job_id = f"JOB_{request.job_type.value}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Lancement en background
        # background_tasks.add_task(process_batch_job, request, job_id)
        
        return BatchProcessResponse(
            job_id=job_id,
            status=DataStatus.PENDING,
            estimated_completion=datetime.now(),
            progress=0.0,
            results_location=f"/api/v1/jobs/{job_id}/results"
        )
    except Exception as e:
        logger.error(f"Erreur soumission batch: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/batch/status/{job_id}")
async def get_batch_status(
    job_id: str,
    current_user: User = Depends(get_current_user)
):
    """Récupère le statut d'un job batch"""
    try:
        # Dans un cas réel, on récupérerait le statut depuis la DB/cache
        return {
            "job_id": job_id,
            "status": "processing",
            "progress": 0.45,
            "message": "Analyse en cours..."
        }
    except Exception as e:
        logger.error(f"Erreur récupération statut: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== ENDPOINTS SANTÉ & MÉTADONNÉES ==========

@router.get("/health")
async def health_check():
    """Vérification de santé du module Analytics ML"""
    return {
        "status": "healthy",
        "module": "analytics_ml",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }


@router.get("/models/available")
async def get_available_models(current_user: User = Depends(get_current_user)):
    """Liste les modèles ML disponibles"""
    return {
        "models": [
            {
                "type": "xgboost",
                "name": "XGBoost",
                "description": "Gradient Boosting optimisé pour finance",
                "use_cases": ["credit_scoring", "fraud_detection", "churn_prediction"]
            },
            {
                "type": "prophet",
                "name": "Prophet",
                "description": "Prévision de séries temporelles",
                "use_cases": ["revenue_forecast", "claims_prediction", "demand_planning"]
            },
            {
                "type": "lstm",
                "name": "LSTM",
                "description": "Réseau de neurones pour séquences",
                "use_cases": ["market_prediction", "risk_modeling", "pattern_detection"]
            },
            {
                "type": "random_forest",
                "name": "Random Forest",
                "description": "Ensemble robuste pour classification/régression",
                "use_cases": ["underwriting", "customer_segmentation", "pricing"]
            }
        ]
    }


@router.get("/metrics/definitions/{sector}")
async def get_metrics_definitions(
    sector: SectorType,
    current_user: User = Depends(get_current_user)
):
    """Retourne les définitions des métriques pour un secteur"""
    if sector == SectorType.BANKING:
        return {
            "metrics": {
                "nii": "Net Interest Income - Revenus nets d'intérêts",
                "lcr": "Liquidity Coverage Ratio - Ratio de liquidité court terme",
                "nsfr": "Net Stable Funding Ratio - Ratio de financement stable",
                "cet1": "Common Equity Tier 1 - Ratio de fonds propres durs",
                "npl_ratio": "Non-Performing Loans Ratio - Ratio de créances douteuses"
            }
        }
    else:
        return {
            "metrics": {
                "combined_ratio": "Ratio combiné = (Sinistres + Frais) / Primes",
                "loss_ratio": "Ratio de sinistralité = Sinistres / Primes",
                "expense_ratio": "Ratio de frais = Frais / Primes",
                "scr_ratio": "Solvency Capital Requirement - Capital de solvabilité requis",
                "mcr_ratio": "Minimum Capital Requirement - Capital minimum requis"
            }
        }