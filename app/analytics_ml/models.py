"""
Modèles Pydantic pour le module Analytics ML
Compatible avec FastAPI et le cahier des charges FinTech
"""
from typing import List, Dict, Optional, Any, Union
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum


# ========== ENUMS ==========
class ModelType(str, Enum):
    """Types de modèles ML disponibles"""
    XGBOOST = "xgboost"
    RANDOM_FOREST = "random_forest"
    NEURAL_NETWORK = "neural_network"
    PROPHET = "prophet"
    ARIMA = "arima"
    LSTM = "lstm"
    COX = "cox"
    
class SectorType(str, Enum):
    """Secteurs supportés selon le cahier des charges"""
    BANKING = "banking"
    INSURANCE = "insurance"
    FINTECH = "fintech"
    INSURTECH = "insurtech"

class DataStatus(str, Enum):
    """Statut de traitement des données"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    ERROR = "error"

class AnalysisType(str, Enum):
    """Types d'analyses disponibles"""
    PREDICTIVE = "predictive"
    ANOMALY_DETECTION = "anomaly_detection"
    CLUSTERING = "clustering"
    TIME_SERIES = "time_series"
    RISK_ANALYSIS = "risk_analysis"
    REGULATORY = "regulatory"


# ========== MODÈLES DE BASE ==========
class BaseResponse(BaseModel):
    """Modèle de base pour toutes les réponses"""
    success: bool = True
    message: str = "Opération réussie"
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ========== DÉTECTION DE CONTEXTE ==========
class SectorDetectionRequest(BaseModel):
    """Requête pour détecter automatiquement le secteur"""
    data_sample: Dict[str, Any]
    column_names: List[str]
    
class SectorDetectionResponse(BaseResponse):
    """Réponse de détection du secteur"""
    detected_sector: SectorType
    confidence: float = Field(ge=0, le=1)
    detected_patterns: List[str]
    suggested_kpis: List[str]
    recommended_dashboards: List[str]


# ========== SÉLECTION DE MODÈLE ==========
class ModelSelectionRequest(BaseModel):
    """Requête pour sélection automatique du modèle"""
    data_type: str = Field(description="Type de données: time_series, classification, regression")
    sector: SectorType
    features: List[str]
    target: str
    sample_size: int = Field(gt=0)
    
class ModelSelectionResponse(BaseResponse):
    """Réponse de sélection du modèle"""
    selected_model: ModelType
    score: float = Field(ge=0, le=1)
    alternative_models: List[Dict[str, float]]
    reasoning: str
    

# ========== DÉTECTION D'ANOMALIES ==========
class AnomalyDetectionRequest(BaseModel):
    """Requête pour détection d'anomalies"""
    data: List[Dict[str, Any]]
    sensitivity: float = Field(default=0.95, ge=0, le=1)
    method: str = Field(default="isolation_forest")
    sector_specific: bool = True
    
class AnomalyDetectionResponse(BaseResponse):
    """Réponse de détection d'anomalies"""
    anomalies_count: int
    anomaly_indices: List[int]
    anomaly_scores: List[float]
    risk_level: str = Field(description="low, medium, high")
    recommendations: List[str]


# ========== PIPELINE AUTOML ==========
class AutoMLRequest(BaseModel):
    """Requête pour pipeline AutoML"""
    data: Dict[str, List[Any]]
    target_column: str
    task_type: str = Field(description="classification, regression, time_series")
    sector: SectorType
    optimization_metric: str = Field(default="accuracy")
    max_runtime_minutes: int = Field(default=10, ge=1, le=120)
    
class AutoMLResponse(BaseResponse):
    """Réponse AutoML"""
    best_model: ModelType
    performance_metrics: Dict[str, float]
    feature_importance: Dict[str, float]
    training_time: float
    model_id: str
    leaderboard: List[Dict[str, Any]]


# ========== ANALYSE DE SCÉNARIOS ==========
class ScenarioAnalysisRequest(BaseModel):
    """Requête pour analyse de scénarios (stress testing)"""
    base_data: Dict[str, Any]
    scenarios: List[Dict[str, Any]]
    risk_factors: List[str]
    sector: SectorType
    horizon_days: int = Field(default=365, ge=1)
    confidence_level: float = Field(default=0.95)
    
class ScenarioResult(BaseModel):
    """Résultat d'un scénario"""
    scenario_name: str
    probability: float
    impact_metrics: Dict[str, float]
    var_95: float = Field(description="Value at Risk à 95%")
    cvar_95: float = Field(description="Conditional VaR à 95%")
    regulatory_capital_impact: Optional[float] = None
    
class ScenarioAnalysisResponse(BaseResponse):
    """Réponse analyse de scénarios"""
    scenarios_analyzed: int
    results: List[ScenarioResult]
    worst_case_scenario: str
    recommendations: List[str]
    regulatory_compliance: Dict[str, bool]


# ========== PRÉDICTIONS ==========
class PredictionRequest(BaseModel):
    """Requête de prédiction"""
    model_id: str
    features: Dict[str, Any]
    horizon: Optional[int] = Field(default=1, description="Horizon de prédiction")
    include_confidence: bool = True
    
class PredictionResponse(BaseResponse):
    """Réponse de prédiction"""
    predictions: Union[float, List[float]]
    confidence_intervals: Optional[Dict[str, List[float]]] = None
    feature_contributions: Optional[Dict[str, float]] = None
    model_type: ModelType
    prediction_timestamp: datetime = Field(default_factory=datetime.utcnow)


# ========== MÉTRIQUES SECTORIELLES ==========
class BankingMetrics(BaseModel):
    """Métriques spécifiques au secteur bancaire"""
    nii: Optional[float] = Field(description="Net Interest Income")
    lcr: Optional[float] = Field(description="Liquidity Coverage Ratio")
    nsfr: Optional[float] = Field(description="Net Stable Funding Ratio") 
    cet1: Optional[float] = Field(description="Common Equity Tier 1")
    npl_ratio: Optional[float] = Field(description="Non-Performing Loans Ratio")
    
class InsuranceMetrics(BaseModel):
    """Métriques spécifiques au secteur assurance"""
    combined_ratio: Optional[float]
    loss_ratio: Optional[float]
    expense_ratio: Optional[float]
    scr_ratio: Optional[float] = Field(description="Solvency Capital Requirement")
    mcr_ratio: Optional[float] = Field(description="Minimum Capital Requirement")
    
class SectorMetricsRequest(BaseModel):
    """Requête pour calcul de métriques sectorielles"""
    data: Dict[str, Any]
    sector: SectorType
    period: str = Field(description="daily, monthly, quarterly, yearly")
    
class SectorMetricsResponse(BaseResponse):
    """Réponse métriques sectorielles"""
    sector: SectorType
    metrics: Union[BankingMetrics, InsuranceMetrics]
    benchmarks: Dict[str, float]
    regulatory_status: Dict[str, str]
    alerts: List[str]


# ========== RAPPORTS RÉGLEMENTAIRES ==========  
class RegulatoryReportRequest(BaseModel):
    """Requête pour génération de rapport réglementaire"""
    report_type: str = Field(description="COREP, FINREP, QRT, ORSA")
    sector: SectorType
    period_start: datetime
    period_end: datetime
    data: Dict[str, Any]
    
class RegulatoryReportResponse(BaseResponse):
    """Réponse rapport réglementaire"""
    report_id: str
    report_type: str
    validation_status: str
    validation_errors: List[str]
    report_url: Optional[str]
    submission_ready: bool


# ========== EXPLAINABILITY ==========
class ModelExplanationRequest(BaseModel):
    """Requête pour explication de modèle"""
    model_id: str
    instance_id: Optional[str] = None
    explanation_type: str = Field(default="shap", description="shap, lime")
    
class ModelExplanationResponse(BaseResponse):
    """Réponse explication de modèle"""
    feature_importance: Dict[str, float]
    decision_path: Optional[List[str]]
    counterfactuals: Optional[List[Dict[str, Any]]]
    confidence: float
    visualization_data: Optional[Dict[str, Any]]


# ========== MONITORING & DRIFT ==========
class ModelMonitoringRequest(BaseModel):
    """Requête pour monitoring de modèle"""
    model_id: str
    current_data: Dict[str, Any]
    
class ModelMonitoringResponse(BaseResponse):
    """Réponse monitoring"""
    drift_detected: bool
    drift_score: float
    performance_degradation: bool
    current_accuracy: float
    baseline_accuracy: float
    retraining_recommended: bool
    alerts: List[str]


# ========== VALIDATION DES MODÈLES ==========
class DataQualityMetrics(BaseModel):
    """Métriques de qualité des données"""
    completeness: float = Field(ge=0, le=1)
    accuracy: float = Field(ge=0, le=1) 
    consistency: float = Field(ge=0, le=1)
    timeliness: float = Field(ge=0, le=1)
    
    @validator('*')
    def validate_percentage(cls, v):
        if not 0 <= v <= 1:
            raise ValueError('Les métriques doivent être entre 0 et 1')
        return v


# ========== BATCH PROCESSING ==========
class BatchProcessRequest(BaseModel):
    """Requête pour traitement batch"""
    job_type: AnalysisType
    data_sources: List[str]
    parameters: Dict[str, Any]
    schedule: Optional[str] = None
    priority: str = Field(default="normal", pattern="^(low|normal|high|critical)$")
    
class BatchProcessResponse(BaseResponse):
    """Réponse traitement batch"""
    job_id: str
    status: DataStatus
    estimated_completion: Optional[datetime]
    progress: float = Field(ge=0, le=1)
    results_location: Optional[str]