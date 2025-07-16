# app/api/analytics_api.py
"""
API Endpoints pour les fonctionnalités Analytics et Data Engineering
Compatible avec FastAPI
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import pandas as pd
import asyncio
from sqlalchemy.orm import Session

# Import des modules créés
from app.analytics.intelligent_eda import IntelligentEDA, run_intelligent_eda
from app.analytics.cohort_analysis import (
    CohortAnalysis, CohortConfig, CohortType, MetricType
)
from app.analytics.benchmarking import BenchmarkingEngine, run_benchmarking
from app.data_engineering.data_pipeline import (
    PipelineBuilder, DataSource, DataFormat, PipelineStatus
)
from app.data_engineering.data_lineage import (
    LineageManager, DataEntity, DataClassification, ComplianceFramework
)

# Dépendances (à adapter selon votre configuration)
from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.storage import DatasetStorage

# Création des routers
analytics_router = APIRouter(prefix="/api/analytics", tags=["analytics"])
data_engineering_router = APIRouter(prefix="/api/data-engineering", tags=["data-engineering"])

# Modèles Pydantic pour les requêtes/réponses
class EDARequest(BaseModel):
    target_column: Optional[str] = None
    sector: Optional[str] = None

class CohortAnalysisRequest(BaseModel):
    cohort_type: str = "time_based"
    time_period: str = "monthly"
    metrics: List[str] = ["retention", "revenue"]
    user_column: str
    date_column: str
    value_column: Optional[str] = None
    event_column: Optional[str] = None

class BenchmarkingRequest(BaseModel):
    sector: str
    company_size: str = "medium"
    metric_definitions: Dict[str, str] = {}

class PipelineCreateRequest(BaseModel):
    name: str
    source: Dict[str, Any]
    transformations: List[Dict[str, Any]] = []
    destination: Dict[str, Any]
    settings: Dict[str, bool] = {
        "parallel": True,
        "monitoring": True,
        "validation": True,
        "checkpoints": True
    }

class ComplianceReportRequest(BaseModel):
    sector: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

# Storage pour les résultats (en production, utiliser Redis ou une DB)
analysis_results = {}
pipeline_registry = {}
lineage_managers = {}

# Endpoints Analytics
@analytics_router.post("/intelligent-eda/{dataset_id}")
async def run_intelligent_eda_analysis(
    dataset_id: str,
    request: EDARequest,
    background_tasks: BackgroundTasks,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lance une analyse EDA intelligente sur un dataset"""
    try:
        # Charger le dataset
        dataset_storage = DatasetStorage(db)
        df = dataset_storage.load_dataset(dataset_id, current_user["id"])
        
        if df is None:
            raise HTTPException(status_code=404, detail="Dataset non trouvé")
        
        # Lancer l'analyse
        results = run_intelligent_eda(
            df,
            target_column=request.target_column,
            sector=request.sector
        )
        
        # Stocker les résultats
        analysis_id = f"eda_{dataset_id}_{datetime.now().timestamp()}"
        analysis_results[analysis_id] = {
            "type": "eda",
            "dataset_id": dataset_id,
            "results": results,
            "created_at": datetime.now(),
            "created_by": current_user["id"]
        }
        
        # Enregistrer dans la DB (optionnel)
        background_tasks.add_task(save_analysis_to_db, analysis_id, results, db)
        
        return JSONResponse({
            "analysis_id": analysis_id,
            "status": "completed",
            **results
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@analytics_router.post("/cohort-analysis/{dataset_id}")
async def run_cohort_analysis(
    dataset_id: str,
    request: CohortAnalysisRequest,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lance une analyse de cohortes"""
    try:
        # Charger le dataset
        dataset_storage = DatasetStorage(db)
        df = dataset_storage.load_dataset(dataset_id, current_user["id"])
        
        if df is None:
            raise HTTPException(status_code=404, detail="Dataset non trouvé")
        
        # Vérifier les colonnes
        required_cols = [request.user_column, request.date_column]
        if not all(col in df.columns for col in required_cols):
            raise HTTPException(
                status_code=400, 
                detail="Colonnes requises non trouvées dans le dataset"
            )
        
        # Configuration de l'analyse
        config = CohortConfig(
            cohort_type=CohortType[request.cohort_type.upper()],
            time_period=request.time_period,
            metrics=[MetricType[m.upper()] for m in request.metrics]
        )
        
        # Lancer l'analyse
        analyzer = CohortAnalyzer(config)
        results = analyzer.analyze(
            df,
            user_col=request.user_column,
            date_col=request.date_column,
            event_col=request.event_column,
            value_col=request.value_column
        )
        
        # Stocker les résultats
        analysis_id = f"cohort_{dataset_id}_{datetime.now().timestamp()}"
        analysis_results[analysis_id] = {
            "type": "cohort",
            "dataset_id": dataset_id,
            "results": results,
            "created_at": datetime.now(),
            "created_by": current_user["id"]
        }
        
        return JSONResponse({
            "analysis_id": analysis_id,
            "status": "completed",
            **results
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@analytics_router.post("/benchmarking/{dataset_id}")
async def run_benchmarking_analysis(
    dataset_id: str,
    request: BenchmarkingRequest,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lance une analyse de benchmarking"""
    try:
        # Charger le dataset
        dataset_storage = DatasetStorage(db)
        df = dataset_storage.load_dataset(dataset_id, current_user["id"])
        
        if df is None:
            raise HTTPException(status_code=404, detail="Dataset non trouvé")
        
        # Déterminer automatiquement les métriques si non fournies
        if not request.metric_definitions:
            request.metric_definitions = auto_detect_metrics(df, request.sector)
        
        # Lancer le benchmarking
        results = run_benchmarking(
            df,
            sector=request.sector,
            metric_definitions=request.metric_definitions,
            company_size=request.company_size
        )
        
        # Stocker les résultats
        analysis_id = f"benchmark_{dataset_id}_{datetime.now().timestamp()}"
        analysis_results[analysis_id] = {
            "type": "benchmarking",
            "dataset_id": dataset_id,
            "results": results,
            "created_at": datetime.now(),
            "created_by": current_user["id"]
        }
        
        return JSONResponse({
            "analysis_id": analysis_id,
            "status": "completed",
            **results
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@analytics_router.get("/results/{analysis_id}")
async def get_analysis_results(
    analysis_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Récupère les résultats d'une analyse"""
    if analysis_id not in analysis_results:
        raise HTTPException(status_code=404, detail="Analyse non trouvée")
    
    result = analysis_results[analysis_id]
    
    # Vérifier les permissions
    if result["created_by"] != current_user["id"] and not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    return JSONResponse(result)

# Endpoints Data Engineering
@data_engineering_router.get("/pipelines")
async def list_pipelines(
    sector: Optional[str] = Query(None),
    current_user: Dict = Depends(get_current_user)
):
    """Liste les pipelines disponibles"""
    user_pipelines = [
        p for p in pipeline_registry.values()
        if p["created_by"] == current_user["id"] or current_user.get("is_admin")
    ]
    
    if sector:
        user_pipelines = [p for p in user_pipelines if p["sector"] == sector]
    
    return JSONResponse({
        "pipelines": user_pipelines,
        "total": len(user_pipelines)
    })

@data_engineering_router.post("/pipelines")
async def create_pipeline(
    request: PipelineCreateRequest,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crée un nouveau pipeline"""
    try:
        # Créer le pipeline
        builder = PipelineBuilder(request.name, current_user.get("sector", "general"))
        
        # Configurer la source
        source = DataSource(
            name=request.source["name"],
            format=DataFormat(request.source["format"]),
            location=request.source["location"]
        )
        builder.with_source(source)
        
        # Ajouter les transformations
        for trans_config in request.transformations:
            # Ici, mapper les configurations aux fonctions réelles
            pass
        
        # Configurer la destination
        builder.with_sink(request.destination)
        
        # Appliquer les settings
        if request.settings.get("parallel"):
            builder.with_parallel_processing()
        if request.settings.get("monitoring"):
            builder.with_monitoring()
        
        # Construire le pipeline
        pipeline = builder.build()
        
        # Enregistrer le pipeline
        pipeline_id = f"pipeline_{datetime.now().timestamp()}"
        pipeline_registry[pipeline_id] = {
            "id": pipeline_id,
            "name": request.name,
            "sector": current_user.get("sector", "general"),
            "source": request.source,
            "destination": request.destination,
            "status": "idle",
            "created_by": current_user["id"],
            "created_at": datetime.now(),
            "pipeline_object": pipeline  # Référence à l'objet pipeline
        }
        
        return JSONResponse({
            "pipeline_id": pipeline_id,
            "status": "created",
            "message": "Pipeline créé avec succès"
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@data_engineering_router.post("/pipelines/{pipeline_id}/run")
async def run_pipeline(
    pipeline_id: str,
    background_tasks: BackgroundTasks,
    current_user: Dict = Depends(get_current_user)
):
    """Exécute un pipeline"""
    if pipeline_id not in pipeline_registry:
        raise HTTPException(status_code=404, detail="Pipeline non trouvé")
    
    pipeline_info = pipeline_registry[pipeline_id]
    
    # Vérifier les permissions
    if pipeline_info["created_by"] != current_user["id"] and not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    # Vérifier le statut
    if pipeline_info["status"] == "running":
        raise HTTPException(status_code=400, detail="Pipeline déjà en cours d'exécution")
    
    # Lancer le pipeline en arrière-plan
    pipeline_info["status"] = "running"
    background_tasks.add_task(execute_pipeline_async, pipeline_id)
    
    return JSONResponse({
        "pipeline_id": pipeline_id,
        "status": "running",
        "message": "Pipeline lancé"
    })

@data_engineering_router.get("/lineage/{entity_id}")
async def get_data_lineage(
    entity_id: Optional[str] = None,
    current_user: Dict = Depends(get_current_user)
):
    """Récupère le lineage des données"""
    try:
        # Obtenir ou créer le gestionnaire de lineage
        user_id = current_user["id"]
        if user_id not in lineage_managers:
            lineage_managers[user_id] = LineageManager(
                f"sqlite:///lineage_{user_id}.db"
            )
        
        manager = lineage_managers[user_id]
        
        if entity_id:
            # Lineage spécifique à une entité
            lineage = manager.graph.get_lineage(entity_id)
            impact = manager.graph.get_impact_analysis(entity_id)
            
            return JSONResponse({
                "entity_id": entity_id,
                "lineage": serialize_lineage(lineage),
                "impact_analysis": impact,
                "visualization": manager.graph.visualize_lineage(entity_id)
            })
        else:
            # Vue d'ensemble du lineage
            return JSONResponse({
                "stats": {
                    "total_entities": len(manager.graph.entities),
                    "total_transformations": len(manager.graph.transformations),
                    "total_access_logs": len(manager.graph.access_logs)
                },
                "visualization": manager.graph.visualize_lineage()
            })
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@data_engineering_router.post("/compliance/{framework}")
async def generate_compliance_report(
    framework: str,
    request: ComplianceReportRequest,
    current_user: Dict = Depends(get_current_user)
):
    """Génère un rapport de conformité"""
    try:
        # Vérifier le framework
        try:
            compliance_framework = ComplianceFramework[framework.upper()]
        except KeyError:
            raise HTTPException(
                status_code=400, 
                detail=f"Framework non supporté: {framework}"
            )
        
        # Obtenir le gestionnaire de lineage
        user_id = current_user["id"]
        if user_id not in lineage_managers:
            raise HTTPException(
                status_code=404,
                detail="Aucune donnée de lineage disponible"
            )
        
        manager = lineage_managers[user_id]
        
        # Générer le rapport
        report = manager.graph.generate_compliance_report(
            compliance_framework,
            start_date=request.start_date,
            end_date=request.end_date
        )
        
        # Ajouter des informations sectorielles
        report["sector_specific"] = get_sector_compliance_requirements(
            request.sector,
            framework
        )
        
        return JSONResponse({
            "framework": framework,
            "report": report,
            "generated_at": datetime.now().isoformat(),
            "generated_by": current_user["email"]
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Fonctions auxiliaires
async def execute_pipeline_async(pipeline_id: str):
    """Exécute un pipeline de manière asynchrone"""
    try:
        pipeline_info = pipeline_registry[pipeline_id]
        pipeline = pipeline_info["pipeline_object"]
        
        # Exécuter le pipeline
        metrics = await pipeline.run()
        
        # Mettre à jour le statut
        pipeline_info["status"] = "completed"
        pipeline_info["last_run"] = datetime.now()
        pipeline_info["metrics"] = {
            "records_processed": metrics.records_processed,
            "processing_time": metrics.processing_time,
            "data_quality_score": metrics.data_quality_score
        }
        
    except Exception as e:
        pipeline_info = pipeline_registry[pipeline_id]
        pipeline_info["status"] = "failed"
        pipeline_info["last_error"] = str(e)

def auto_detect_metrics(df: pd.DataFrame, sector: str) -> Dict[str, str]:
    """Détecte automatiquement les métriques selon le secteur"""
    metrics = {}
    
    # Métriques communes
    numeric_columns = df.select_dtypes(include=['number']).columns
    
    # Mapping sectoriel
    sector_patterns = {
        'banque': {
            'roi': ['roi', 'return', 'rendement'],
            'npl': ['npl', 'non_performing', 'defaut'],
            'cost_income': ['cost_income', 'efficiency']
        },
        'sante': {
            'satisfaction': ['satisfaction', 'score', 'rating'],
            'readmission': ['readmission', 'readmit'],
            'length_stay': ['los', 'length', 'stay', 'duree']
        },
        'retail': {
            'conversion': ['conversion', 'taux_conversion'],
            'retention': ['retention', 'fidelite'],
            'aov': ['aov', 'panier', 'order_value']
        }
    }
    
    # Chercher les patterns
    patterns = sector_patterns.get(sector, {})
    for metric_type, keywords in patterns.items():
        for col in numeric_columns:
            if any(keyword in col.lower() for keyword in keywords):
                metrics[col] = metric_type
                break
    
    # Ajouter les colonnes numériques restantes comme métriques génériques
    for col in numeric_columns:
        if col not in metrics:
            metrics[col] = 'generic'
    
    return metrics

def serialize_lineage(lineage: Dict[str, Any]) -> Dict[str, Any]:
    """Sérialise le lineage pour l'API"""
    # Convertir les objets dataclass en dictionnaires
    serialized = {
        'entity': lineage.get('entity').__dict__ if lineage.get('entity') else None,
        'upstream': [item.__dict__ for item in lineage.get('upstream', [])],
        'downstream': [item.__dict__ for item in lineage.get('downstream', [])],
        'transformations': [item.__dict__ for item in lineage.get('transformations', [])]
    }
    
    return serialized

def get_sector_compliance_requirements(sector: str, framework: str) -> Dict[str, Any]:
    """Retourne les exigences de conformité spécifiques au secteur"""
    requirements = {
        'banque': {
            'gdpr': {
                'retention_period': 365,
                'anonymization_required': True,
                'special_categories': ['account_number', 'transaction_data']
            },
            'basel_iii': {
                'capital_requirements': True,
                'risk_reporting': True
            }
        },
        'sante': {
            'gdpr': {
                'retention_period': 730,  # 2 ans
                'anonymization_required': True,
                'special_categories': ['health_data', 'genetic_data']
            },
            'hipaa': {
                'encryption_required': True,
                'audit_trail': True,
                'minimum_necessary': True
            }
        }
    }
    
    return requirements.get(sector, {}).get(framework, {})

def save_analysis_to_db(analysis_id: str, results: Dict[str, Any], db: Session):
    """Sauvegarde les résultats d'analyse en DB (à implémenter)"""
    # TODO: Implémenter la sauvegarde en base de données
    pass

# Enregistrement des routes dans l'application principale
def register_analytics_routes(app):
    """Enregistre les routes dans l'application FastAPI"""
    app.include_router(analytics_router)
    app.include_router(data_engineering_router)