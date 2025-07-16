"""
Dataset management endpoints with IFRS 9 validation
Conformément aux prompts 16-17 du cahier des charges
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict
import pandas as pd
import json
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.schemas import (
    DatasetCreate, DatasetResponse, DatasetValidation,
    DataQualityReport, DataLineage
)
from app.services.dataset_service import DatasetService
from app.utils.validators import validate_financial_data

router = APIRouter()

@router.post("/upload", response_model=DatasetResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    name: str = Query(..., description="Nom du dataset"),
    dataset_type: str = Query(..., description="Type: credit_risk, market_risk, liquidity"),
    validate_ifrs9: bool = Query(True, description="Valider IFRS 9"),
    anonymize_gdpr: bool = Query(True, description="Anonymiser GDPR"),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload de dataset avec validation IFRS 9 et anonymisation GDPR
    Prompts 16-17: Pipeline automatisée avec validation
    """
    dataset_service = DatasetService(db)
    
    # Vérifier le type de fichier
    if not file.filename.endswith(('.csv', '.xlsx', '.json')):
        raise HTTPException(
            status_code=400,
            detail="Format non supporté. Utilisez CSV, Excel ou JSON"
        )
    
    # Lire le fichier
    content = await file.read()
    
    try:
        # Parser selon le type
        if file.filename.endswith('.csv'):
            df = pd.read_csv(content)
        elif file.filename.endswith('.xlsx'):
            df = pd.read_excel(content)
        else:
            df = pd.DataFrame(json.loads(content))
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Erreur lors de la lecture du fichier: {str(e)}"
        )
    
    # Validation IFRS 9 si demandée
    validation_report = None
    if validate_ifrs9 and dataset_type == "credit_risk":
        validation_report = validate_financial_data(df, "ifrs9")
        if not validation_report.is_valid:
            raise HTTPException(
                status_code=400,
                detail=f"Validation IFRS 9 échouée: {validation_report.errors}"
            )
    
    # Anonymisation GDPR si demandée
    if anonymize_gdpr:
        df = await dataset_service.anonymize_pii_data(df)
    
    # Détecter automatiquement les colonnes financières
    financial_columns = await dataset_service.detect_financial_columns(df)
    
    # Calculer les métriques de qualité
    quality_metrics = await dataset_service.calculate_data_quality(df)
    
    # Sauvegarder le dataset
    dataset = await dataset_service.create_dataset(
        name=name,
        user_id=current_user.id,
        dataset_type=dataset_type,
        data=df,
        metadata={
            "original_filename": file.filename,
            "rows": len(df),
            "columns": list(df.columns),
            "financial_columns": financial_columns,
            "quality_metrics": quality_metrics,
            "validation_report": validation_report.dict() if validation_report else None
        }
    )
    
    return DatasetResponse(
        id=dataset.id,
        name=dataset.name,
        type=dataset.dataset_type,
        created_at=dataset.created_at,
        rows=len(df),
        columns=len(df.columns),
        quality_score=quality_metrics.get("overall_score", 0),
        is_validated=validation_report.is_valid if validation_report else True
    )

@router.get("/", response_model=List[DatasetResponse])
async def list_datasets(
    dataset_type: Optional[str] = None,
    validated_only: bool = False,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Liste des datasets avec filtrage"""
    dataset_service = DatasetService(db)
    
    datasets = await dataset_service.list_user_datasets(
        user_id=current_user.id,
        dataset_type=dataset_type,
        validated_only=validated_only
    )
    
    return [
        DatasetResponse(
            id=ds.id,
            name=ds.name,
            type=ds.dataset_type,
            created_at=ds.created_at,
            rows=ds.metadata.get("rows", 0),
            columns=len(ds.metadata.get("columns", [])),
            quality_score=ds.metadata.get("quality_metrics", {}).get("overall_score", 0),
            is_validated=ds.metadata.get("validation_report", {}).get("is_valid", True)
        )
        for ds in datasets
    ]

@router.get("/{dataset_id}/preview")
async def preview_dataset(
    dataset_id: str,
    rows: int = Query(10, le=100),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Aperçu des données avec détection automatique des types"""
    dataset_service = DatasetService(db)
    
    dataset = await dataset_service.get_dataset(dataset_id, current_user.id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset non trouvé")
    
    # Charger les données
    df = await dataset_service.load_dataset_data(dataset_id)
    
    # Détection des types et statistiques
    column_info = {}
    for col in df.columns:
        column_info[col] = {
            "type": str(df[col].dtype),
            "null_count": df[col].isnull().sum(),
            "unique_count": df[col].nunique()
        }
        
        # Statistiques pour colonnes numériques
        if pd.api.types.is_numeric_dtype(df[col]):
            column_info[col].update({
                "min": float(df[col].min()),
                "max": float(df[col].max()),
                "mean": float(df[col].mean()),
                "std": float(df[col].std())
            })
    
    return {
        "preview": df.head(rows).to_dict(orient="records"),
        "column_info": column_info,
        "financial_mappings": dataset.metadata.get("financial_columns", {})
    }

@router.post("/{dataset_id}/validate", response_model=DataValidation)
async def validate_dataset(
    dataset_id: str,
    validation_type: str = Query(..., description="ifrs9, basel3, corep, finrep"),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Validation réglementaire du dataset
    Prompt 34: Conformité COREP/FINREP, IFRS 9, Bâle III
    """
    dataset_service = DatasetService(db)
    
    dataset = await dataset_service.get_dataset(dataset_id, current_user.id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset non trouvé")
    
    # Charger et valider les données
    df = await dataset_service.load_dataset_data(dataset_id)
    validation_report = validate_financial_data(df, validation_type)
    
    # Mettre à jour les métadonnées
    await dataset_service.update_validation_status(
        dataset_id, 
        validation_report
    )
    
    return validation_report

@router.get("/{dataset_id}/lineage", response_model=DataLineage)
async def get_data_lineage(
    dataset_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Traçabilité des données (Data Lineage)
    Prompt 17: Système de traçabilité et audit blockchain
    """
    dataset_service = DatasetService(db)
    
    dataset = await dataset_service.get_dataset(dataset_id, current_user.id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset non trouvé")
    
    # Récupérer l'historique complet
    lineage = await dataset_service.get_data_lineage(dataset_id)
    
    return DataLineage(
        dataset_id=dataset_id,
        source=lineage.get("source"),
        transformations=lineage.get("transformations", []),
        validations=lineage.get("validations", []),
        access_logs=lineage.get("access_logs", []),
        blockchain_hash=lineage.get("blockchain_hash")
    )

@router.post("/{dataset_id}/transform")
async def transform_dataset(
    dataset_id: str,
    transformation: Dict,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Transformation ML-ready du dataset
    Prompt 16: Transformation automatisée pour ML
    """
    dataset_service = DatasetService(db)
    
    dataset = await dataset_service.get_dataset(dataset_id, current_user.id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset non trouvé")
    
    # Appliquer les transformations
    transformed_data = await dataset_service.apply_transformations(
        dataset_id,
        transformation
    )
    
    # Créer un nouveau dataset transformé
    new_dataset = await dataset_service.create_dataset(
        name=f"{dataset.name}_transformed",
        user_id=current_user.id,
        dataset_type=dataset.dataset_type,
        data=transformed_data,
        metadata={
            "parent_dataset_id": dataset_id,
            "transformations": transformation,
            **dataset.metadata
        }
    )
    
    return {
        "new_dataset_id": new_dataset.id,
        "transformations_applied": transformation,
        "rows": len(transformed_data),
        "columns": len(transformed_data.columns)
    }

@router.delete("/{dataset_id}")
async def delete_dataset(
    dataset_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Suppression sécurisée avec audit trail"""
    dataset_service = DatasetService(db)
    
    dataset = await dataset_service.get_dataset(dataset_id, current_user.id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset non trouvé")
    
    # Supprimer avec audit
    await dataset_service.delete_dataset(dataset_id, current_user.id)
    
    return {"message": "Dataset supprimé avec succès"}

@router.get("/{dataset_id}/quality-report", response_model=DataQualityReport)
async def get_quality_report(
    dataset_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Rapport détaillé de qualité des données"""
    dataset_service = DatasetService(db)
    
    dataset = await dataset_service.get_dataset(dataset_id, current_user.id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset non trouvé")
    
    # Générer rapport de qualité
    report = await dataset_service.generate_quality_report(dataset_id)
    
    return report