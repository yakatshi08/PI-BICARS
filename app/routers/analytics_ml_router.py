"""
Router FastAPI pour le module Analytics ML
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.services.analytics_ml_service import (
    AnalyticsMLService,
    ModelType,
    PredictionType,
    MetricType
)

router = APIRouter(
    prefix="/api/analytics-ml",
    tags=["analytics-ml"],
    responses={404: {"description": "Not found"}},
)

# Modèles Pydantic
class PredictionRequest(BaseModel):
    """Requête de prédiction"""
    metric_name: str
    historical_data: List[Dict[str, Any]]
    horizon: Optional[int] = 30
    model_type: Optional[str] = None
    confidence_level: Optional[float] = 0.95

class AnomalyDetectionRequest(BaseModel):
    """Requête de détection d'anomalies"""
    data: List[Dict[str, Any]]
    metric_name: str
    sensitivity: Optional[float] = 0.95
    method: Optional[str] = 'isolation_forest'

class AutoMLRequest(BaseModel):
    """Requête AutoML"""
    data: List[Dict[str, Any]]
    target_metric: str
    feature_columns: List[str]
    optimization_metric: Optional[str] = 'rmse'
    time_limit: Optional[int] = 300

class ScenarioForecastRequest(BaseModel):
    """Requête de prévision par scénarios"""
    base_data: List[Dict[str, Any]]
    metric: str
    scenarios: Dict[str, Dict[str, float]]
    horizon: Optional[int] = 90

# Instance du service
analytics_service = AnalyticsMLService()

@router.get("/health")
async def health_check():
    """Vérification de santé du module Analytics ML"""
    return {
        'status': 'healthy',
        'module': 'analytics_ml',
        'version': '1.0.0',
        'models_available': [model.value for model in ModelType],
        'capabilities': ['prediction', 'anomaly_detection', 'automl', 'scenario_analysis']
    }

@router.post("/predict")
async def predict_metric(request: PredictionRequest):
    """
    Prédit une métrique financière
    
    Modèles disponibles:
    - xgboost: Polyvalent, bon pour la plupart des cas
    - prophet: Excellent pour la saisonnalité
    - lstm: Bon pour les séries temporelles complexes
    """
    try:
        # Validation
        if not request.historical_data:
            raise HTTPException(status_code=400, detail="Données historiques requises")
        
        if len(request.historical_data) < 10:
            raise HTTPException(
                status_code=400, 
                detail="Au moins 10 points de données requis"
            )
        
        # Conversion du type de modèle
        model_type = None
        if request.model_type:
            try:
                model_type = ModelType(request.model_type)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Type de modèle invalide: {request.model_type}"
                )
        
        # Prédiction
        result = await analytics_service.predict_metric(
            metric_name=request.metric_name,
            historical_data=request.historical_data,
            horizon=request.horizon,
            model_type=model_type,
            confidence_level=request.confidence_level
        )
        
        return {
            'status': 'success',
            'metric': result.metric,
            'model_used': result.model_used,
            'accuracy_score': result.accuracy_score,
            'predictions': {
                'values': result.predictions,
                'dates': result.dates,
                'confidence_intervals': result.confidence_intervals
            },
            'feature_importance': result.feature_importance,
            'visualization_config': _create_prediction_chart_config(result)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/anomalies/detect")
async def detect_anomalies(request: AnomalyDetectionRequest):
    """
    Détecte les anomalies dans les données
    
    Méthodes disponibles:
    - isolation_forest: Détection par isolation (recommandé)
    - statistical: Méthodes statistiques (Z-score, IQR)
    """
    try:
        # Validation
        if not request.data:
            raise HTTPException(status_code=400, detail="Données requises")
        
        # Détection
        anomalies = await analytics_service.detect_anomalies(
            data=request.data,
            metric_name=request.metric_name,
            sensitivity=request.sensitivity,
            method=request.method
        )
        
        # Formatage des résultats
        formatted_anomalies = []
        for anomaly in anomalies:
            formatted_anomalies.append({
                'timestamp': anomaly.timestamp.isoformat(),
                'metric': anomaly.metric,
                'value': anomaly.value,
                'expected_value': anomaly.expected_value,
                'deviation': anomaly.deviation,
                'severity': anomaly.severity,
                'confidence': anomaly.confidence,
                'explanation': anomaly.explanation
            })
        
        # Statistiques
        severity_counts = {
            'critical': sum(1 for a in anomalies if a.severity == 'critical'),
            'high': sum(1 for a in anomalies if a.severity == 'high'),
            'medium': sum(1 for a in anomalies if a.severity == 'medium'),
            'low': sum(1 for a in anomalies if a.severity == 'low')
        }
        
        return {
            'status': 'success',
            'anomalies_found': len(anomalies),
            'anomalies': formatted_anomalies[:50],  # Limiter à 50
            'severity_distribution': severity_counts,
            'method_used': request.method,
            'sensitivity': request.sensitivity,
            'visualization_config': _create_anomaly_chart_config(request.data, anomalies)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/automl/train")
async def train_automl_pipeline(
    request: AutoMLRequest,
    background_tasks: BackgroundTasks
):
    """
    Entraîne un pipeline AutoML
    
    Teste automatiquement plusieurs modèles et sélectionne le meilleur
    """
    try:
        # Validation
        if len(request.feature_columns) == 0:
            raise HTTPException(status_code=400, detail="Au moins une feature requise")
        
        # Lancement de l'entraînement
        # En production, lancer en tâche de fond
        result = await analytics_service.train_automl_pipeline(
            data=request.data,
            target_metric=request.target_metric,
            feature_columns=request.feature_columns,
            optimization_metric=request.optimization_metric,
            time_limit=request.time_limit
        )
        
        return {
            'status': 'success',
            'best_model': result['best_model'],
            'best_score': result['best_score'],
            'models_tested': list(result['all_results'].keys()),
            'feature_importance': result['all_results'][result['best_model']]['feature_importance'],
            'backtest_results': {
                'mean_score': result['backtest']['mean_score'],
                'std_score': result['backtest']['std_score'],
                'n_splits': result['backtest']['n_splits']
            },
            'recommendations': result['recommendations']
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scenarios/forecast")
async def forecast_scenarios(request: ScenarioForecastRequest):
    """
    Prévisions selon différents scénarios
    
    Exemple de scénarios:
    {
        "optimistic": {"revenue": 0.1, "costs": -0.05},
        "pessimistic": {"revenue": -0.1, "costs": 0.1}
    }
    """
    try:
        # Validation
        if not request.scenarios:
            raise HTTPException(status_code=400, detail="Au moins un scénario requis")
        
        # Prévisions
        results = await analytics_service.forecast_scenarios(
            base_data=request.base_data,
            metric=request.metric,
            scenarios=request.scenarios,
            horizon=request.horizon
        )
        
        # Formatage pour le frontend
        formatted_predictions = {}
        for scenario_name, prediction in results['predictions'].items():
            formatted_predictions[scenario_name] = {
                'values': prediction.predictions,
                'dates': prediction.dates,
                'confidence_intervals': prediction.confidence_intervals,
                'model_used': prediction.model_used
            }
        
        return {
            'status': 'success',
            'metric': request.metric,
            'horizon_days': request.horizon,
            'scenarios_analyzed': list(request.scenarios.keys()),
            'predictions': formatted_predictions,
            'comparison': results['comparison'],
            'risk_analysis': results['risk_analysis'],
            'recommendations': results['recommendations'],
            'visualization_config': _create_scenario_chart_config(results['predictions'])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models")
async def get_available_models():
    """Retourne la liste des modèles disponibles"""
    models = []
    
    for model in ModelType:
        models.append({
            'id': model.value,
            'name': model.value.replace('_', ' ').title(),
            'description': _get_model_description(model),
            'best_for': _get_model_use_cases(model),
            'requires_data_points': _get_min_data_points(model)
        })
    
    return {
        'models': models,
        'default_model': 'auto',
        'recommendation': 'Utilisez "auto" pour la sélection automatique du meilleur modèle'
    }

@router.get("/metrics/suggestions")
async def get_metric_suggestions(sector: Optional[str] = None):
    """Suggère des métriques à analyser selon le secteur"""
    
    base_metrics = [
        {
            'name': 'revenue',
            'label': 'Revenus',
            'category': 'financial',
            'sectors': ['all']
        },
        {
            'name': 'costs',
            'label': 'Coûts',
            'category': 'financial',
            'sectors': ['all']
        },
        {
            'name': 'profit_margin',
            'label': 'Marge bénéficiaire',
            'category': 'performance',
            'sectors': ['all']
        }
    ]
    
    banking_metrics = [
        {
            'name': 'npl_ratio',
            'label': 'Ratio NPL',
            'category': 'risk',
            'sectors': ['banking']
        },
        {
            'name': 'net_interest_margin',
            'label': 'Marge d\'intérêt nette',
            'category': 'performance',
            'sectors': ['banking']
        },
        {
            'name': 'cost_income_ratio',
            'label': 'Coefficient d\'exploitation',
            'category': 'efficiency',
            'sectors': ['banking']
        }
    ]
    
    insurance_metrics = [
        {
            'name': 'claims_ratio',
            'label': 'Ratio de sinistralité',
            'category': 'performance',
            'sectors': ['insurance']
        },
        {
            'name': 'combined_ratio',
            'label': 'Ratio combiné',
            'category': 'performance',
            'sectors': ['insurance']
        },
        {
            'name': 'premium_growth',
            'label': 'Croissance des primes',
            'category': 'growth',
            'sectors': ['insurance']
        }
    ]
    
    all_metrics = base_metrics + banking_metrics + insurance_metrics
    
    # Filtrer par secteur
    if sector and sector != 'all':
        filtered = [m for m in all_metrics if sector in m['sectors'] or 'all' in m['sectors']]
    else:
        filtered = all_metrics
    
    return {
        'metrics': filtered,
        'categories': list(set(m['category'] for m in filtered))
    }

@router.post("/backtest")
async def perform_backtesting(
    metric: str,
    model_type: str,
    data: List[Dict[str, Any]],
    test_size: Optional[float] = 0.2
):
    """Effectue un backtesting sur un modèle"""
    try:
        # Validation
        if test_size <= 0 or test_size >= 1:
            raise HTTPException(
                status_code=400,
                detail="test_size doit être entre 0 et 1"
            )
        
        # Simulation de backtesting
        # En production, implémenter le vrai backtesting
        n_periods = int(len(data) * test_size)
        
        results = {
            'metric': metric,
            'model': model_type,
            'test_periods': n_periods,
            'performance': {
                'rmse': 0.05 + (0.1 * (1 - 0.8)),  # Simulation
                'mae': 0.04 + (0.08 * (1 - 0.8)),
                'mape': 0.06 + (0.12 * (1 - 0.8)),
                'r2': 0.85 + (0.1 * 0.8)
            },
            'prediction_vs_actual': _generate_backtest_comparison(n_periods),
            'confidence': 0.85
        }
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Fonctions helper
def _create_prediction_chart_config(result) -> Dict:
    """Crée la configuration pour le graphique de prédiction"""
    return {
        'type': 'line_chart',
        'title': f'Prédiction {result.metric}',
        'series': [
            {
                'name': 'Prédiction',
                'data': result.predictions,
                'type': 'line'
            },
            {
                'name': 'Intervalle inférieur',
                'data': [ci[0] for ci in result.confidence_intervals],
                'type': 'line',
                'style': 'dashed'
            },
            {
                'name': 'Intervalle supérieur',
                'data': [ci[1] for ci in result.confidence_intervals],
                'type': 'line',
                'style': 'dashed'
            }
        ],
        'x_axis': result.dates
    }

def _create_anomaly_chart_config(data: List[Dict], anomalies) -> Dict:
    """Crée la configuration pour le graphique d'anomalies"""
    anomaly_dates = [a.timestamp.isoformat() for a in anomalies]
    
    return {
        'type': 'scatter_plot',
        'title': 'Détection d\'anomalies',
        'series': [
            {
                'name': 'Données normales',
                'data': [(d['date'], d.get('value', 0)) for d in data 
                        if d['date'] not in anomaly_dates]
            },
            {
                'name': 'Anomalies',
                'data': [(a.timestamp.isoformat(), a.value) for a in anomalies],
                'color': 'red',
                'size': 10
            }
        ]
    }

def _create_scenario_chart_config(predictions: Dict) -> Dict:
    """Crée la configuration pour le graphique de scénarios"""
    series = []
    
    for scenario_name, prediction in predictions.items():
        series.append({
            'name': scenario_name.capitalize(),
            'data': prediction.predictions,
            'type': 'line'
        })
    
    return {
        'type': 'multi_line_chart',
        'title': 'Analyse de scénarios',
        'series': series,
        'x_axis': list(predictions.values())[0].dates if predictions else []
    }

def _get_model_description(model: ModelType) -> str:
    """Retourne la description d'un modèle"""
    descriptions = {
        ModelType.XGBOOST: "Gradient boosting optimisé, excellent pour les données structurées",
        ModelType.PROPHET: "Modèle Facebook pour séries temporelles avec saisonnalité",
        ModelType.LSTM: "Réseau de neurones pour séries temporelles complexes",
        ModelType.RANDOM_FOREST: "Ensemble d'arbres de décision, robuste au surapprentissage",
        ModelType.ARIMA: "Modèle classique pour séries temporelles stationnaires",
        ModelType.ISOLATION_FOREST: "Détection d'anomalies par isolation"
    }
    return descriptions.get(model, "")

def _get_model_use_cases(model: ModelType) -> List[str]:
    """Retourne les cas d'usage d'un modèle"""
    use_cases = {
        ModelType.XGBOOST: ["Prédiction de revenus", "Score de risque", "Classification"],
        ModelType.PROPHET: ["Prévisions avec saisonnalité", "Tendances long terme"],
        ModelType.LSTM: ["Séries complexes", "Patterns non-linéaires"],
        ModelType.RANDOM_FOREST: ["Classification robuste", "Feature importance"],
        ModelType.ARIMA: ["Séries stationnaires", "Court terme"],
        ModelType.ISOLATION_FOREST: ["Détection de fraude", "Anomalies"]
    }
    return use_cases.get(model, [])

def _get_min_data_points(model: ModelType) -> int:
    """Retourne le nombre minimum de points requis"""
    requirements = {
        ModelType.XGBOOST: 50,
        ModelType.PROPHET: 30,
        ModelType.LSTM: 100,
        ModelType.RANDOM_FOREST: 50,
        ModelType.ARIMA: 50,
        ModelType.ISOLATION_FOREST: 30
    }
    return requirements.get(model, 50)

def _generate_backtest_comparison(n_periods: int) -> List[Dict]:
    """Génère des données de comparaison pour le backtesting"""
    import random
    
    comparison = []
    for i in range(n_periods):
        actual = 1000 + random.uniform(-100, 100)
        predicted = actual + random.uniform(-50, 50)
        comparison.append({
            'period': i + 1,
            'actual': round(actual, 2),
            'predicted': round(predicted, 2),
            'error': round(abs(actual - predicted), 2)
        })
    
    return comparison