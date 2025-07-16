"""
Prediction endpoints with AutoML and NLP capabilities
Conformément aux prompts 10-13 du cahier des charges
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
import asyncio
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.schemas import (
    PredictionRequest, PredictionResponse,
    ModelTrainingRequest, ModelMetrics,
    AlertConfiguration, AnomalyDetection
)
from app.services.ml_service import MLService
from app.services.nlp_service import NLPService

router = APIRouter()

@router.post("/automl/train", response_model=Dict)
async def train_automl_model(
    training_request: ModelTrainingRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Pipeline AutoML avec XGBoost, LSTM, Prophet
    Prompt 10: Intégration complète des modèles ML
    """
    ml_service = MLService()
    
    # Validation des paramètres
    if training_request.model_type not in ["xgboost", "lstm", "prophet", "cox", "arima", "auto"]:
        raise HTTPException(
            status_code=400,
            detail="Type de modèle non supporté"
        )
    
    # Lancer l'entraînement AutoML
    training_job = await ml_service.start_automl_training(
        dataset_id=training_request.dataset_id,
        target_column=training_request.target_column,
        model_type=training_request.model_type,
        task_type=training_request.task_type,
        optimization_metric=training_request.optimization_metric,
        user_id=current_user.id
    )
    
    return {
        "job_id": training_job["id"],
        "status": "training_started",
        "estimated_time": training_job["estimated_time"],
        "models_to_evaluate": training_job["models"],
        "webhook_url": f"/api/v1/predictions/training/{training_job['id']}/status"
    }

@router.post("/nlp-dashboard", response_model=Dict)
async def generate_dashboard_from_nlp(
    query: str = Body(..., description="Commande en langage naturel"),
    dataset_id: Optional[str] = None,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Génération de dashboard via langage naturel
    Prompt 11: Génération automatique depuis commandes NL
    """
    nlp_service = NLPService()
    
    # Analyser la requête
    intent_analysis = await nlp_service.analyze_dashboard_intent(query)
    
    # Générer la configuration du dashboard
    dashboard_config = await nlp_service.generate_dashboard_config(
        intent=intent_analysis,
        dataset_id=dataset_id,
        user_context={
            "role": current_user.role,
            "permissions": current_user.permissions
        }
    )
    
    # Exécuter les requêtes nécessaires
    dashboard_data = await nlp_service.execute_dashboard_queries(
        config=dashboard_config,
        user_id=current_user.id
    )
    
    return {
        "dashboard_config": dashboard_config,
        "data": dashboard_data,
        "interpretation": intent_analysis,
        "suggested_visualizations": dashboard_config["visualizations"],
        "natural_language_summary": await nlp_service.generate_summary(dashboard_data)
    }

@router.post("/risk-alerts/configure", response_model=Dict)
async def configure_risk_alerts(
    alert_config: AlertConfiguration,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Configuration des alertes prédictives
    Prompt 12: Système d'alertes basé sur le risque financier
    """
    ml_service = MLService()
    
    # Configurer les alertes
    alert_setup = await ml_service.setup_predictive_alerts(
        dataset_id=alert_config.dataset_id,
        alert_types=alert_config.alert_types,
        thresholds=alert_config.thresholds,
        notification_channels=alert_config.channels,
        user_id=current_user.id
    )
    
    return {
        "alert_id": alert_setup["id"],
        "configured_alerts": alert_setup["alerts"],
        "monitoring_metrics": alert_setup["metrics"],
        "notification_rules": alert_setup["rules"],
        "test_mode": alert_setup["test_mode"]
    }

@router.post("/anomaly-detection", response_model=AnomalyDetection)
async def detect_anomalies(
    dataset_id: str,
    detection_methods: List[str] = Query(
        default=["isolation_forest", "lstm_autoencoder"],
        description="Méthodes de détection"
    ),
    sensitivity: float = Query(0.95, description="Sensibilité de détection"),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Détection d'anomalies et fraudes
    Prompt 13: Isolation Forest, LSTM, Graph Networks
    """
    ml_service = MLService()
    
    # Exécuter la détection multi-méthodes
    anomalies = await ml_service.detect_anomalies(
        dataset_id=dataset_id,
        methods=detection_methods,
        sensitivity=sensitivity,
        user_id=current_user.id
    )
    
    # Analyse des patterns de fraude si applicable
    fraud_analysis = None
    if "graph_network" in detection_methods:
        fraud_analysis = await ml_service.analyze_fraud_networks(
            anomalies["suspicious_entities"]
        )
    
    return AnomalyDetection(
        total_records_analyzed=anomalies["total_records"],
        anomalies_detected=anomalies["anomalies"],
        anomaly_scores=anomalies["scores"],
        clusters=anomalies["clusters"],
        fraud_networks=fraud_analysis,
        risk_level=anomalies["risk_level"],
        recommended_actions=anomalies["actions"]
    )

@router.post("/predict", response_model=PredictionResponse)
async def make_prediction(
    prediction_request: PredictionRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Prédiction avec modèle entraîné"""
    ml_service = MLService()
    
    # Charger le modèle
    model = await ml_service.load_model(
        prediction_request.model_id,
        user_id=current_user.id
    )
    
    if not model:
        raise HTTPException(
            status_code=404,
            detail="Modèle non trouvé"
        )
    
    # Faire la prédiction
    predictions = await ml_service.predict(
        model=model,
        data=prediction_request.data,
        return_probabilities=prediction_request.return_probabilities
    )
    
    return PredictionResponse(
        predictions=predictions["values"],
        probabilities=predictions.get("probabilities"),
        confidence_intervals=predictions.get("intervals"),
        feature_importance=predictions.get("importance"),
        model_version=model["version"]
    )

@router.get("/models", response_model=List[Dict])
async def list_models(
    model_type: Optional[str] = None,
    status: Optional[str] = None,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Liste des modèles disponibles"""
    ml_service = MLService()
    
    models = await ml_service.list_user_models(
        user_id=current_user.id,
        model_type=model_type,
        status=status
    )
    
    return [
        {
            "id": model["id"],
            "name": model["name"],
            "type": model["type"],
            "status": model["status"],
            "metrics": model["metrics"],
            "created_at": model["created_at"],
            "last_used": model["last_used"]
        }
        for model in models
    ]

@router.get("/training/{job_id}/status")
async def get_training_status(
    job_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Statut d'un job d'entraînement"""
    ml_service = MLService()
    
    status = await ml_service.get_training_status(
        job_id=job_id,
        user_id=current_user.id
    )
    
    return {
        "job_id": job_id,
        "status": status["status"],
        "progress": status["progress"],
        "current_model": status["current_model"],
        "best_score": status["best_score"],
        "estimated_remaining_time": status["eta"],
        "logs": status["logs"][-10:]  # Derniers logs
    }

@router.post("/models/{model_id}/retrain")
async def retrain_model(
    model_id: str,
    new_data_id: Optional[str] = None,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retraining d'un modèle existant
    Prompt 31: Retraining continu avec monitoring drift
    """
    ml_service = MLService()
    
    # Vérifier le drift avant retraining
    drift_analysis = await ml_service.analyze_model_drift(
        model_id=model_id,
        user_id=current_user.id
    )
    
    if drift_analysis["drift_detected"]:
        # Lancer le retraining
        retrain_job = await ml_service.retrain_model(
            model_id=model_id,
            new_data_id=new_data_id,
            drift_metrics=drift_analysis,
            user_id=current_user.id
        )
        
        return {
            "retrain_job_id": retrain_job["id"],
            "drift_metrics": drift_analysis,
            "estimated_improvement": retrain_job["expected_improvement"],
            "status": "retraining_started"
        }
    else:
        return {
            "message": "Pas de drift détecté, retraining non nécessaire",
            "drift_metrics": drift_analysis,
            "model_performance": "stable"
        }

@router.get("/models/{model_id}/explain")
async def explain_model(
    model_id: str,
    sample_data: Optional[Dict] = None,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Explicabilité du modèle
    Prompt 31: SHAP/LIME pour explicabilité
    """
    ml_service = MLService()
    
    explanations = await ml_service.explain_model(
        model_id=model_id,
        sample_data=sample_data,
        user_id=current_user.id
    )
    
    return {
        "global_importance": explanations["global_features"],
        "shap_values": explanations["shap"],
        "lime_explanation": explanations["lime"],
        "decision_rules": explanations["rules"],
        "model_interpretation": explanations["interpretation"]
    }