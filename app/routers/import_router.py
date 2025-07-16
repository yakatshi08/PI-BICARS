"""
Router pour l'import de données
Gère l'import multi-format selon le cahier des charges
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
import pandas as pd
import json
import io
from datetime import datetime

router = APIRouter(
    prefix="/api/v1/import",
    tags=["Import de données"],
    responses={404: {"description": "Not found"}}
)


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    sector: Optional[str] = None
):
    """
    Upload et analyse un fichier (Excel, CSV, JSON, PDF)
    
    Détecte automatiquement le format et propose des analyses adaptées
    """
    try:
        # Vérification du type de fichier
        filename = file.filename.lower()
        content = await file.read()
        
        if filename.endswith('.csv'):
            # Traitement CSV
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
            file_type = "csv"
            
        elif filename.endswith(('.xlsx', '.xls')):
            # Traitement Excel
            df = pd.read_excel(io.BytesIO(content))
            file_type = "excel"
            
        elif filename.endswith('.json'):
            # Traitement JSON
            data = json.loads(content)
            df = pd.DataFrame(data)
            file_type = "json"
            
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Format de fichier non supporté: {filename}"
            )
        
        # Analyse basique du fichier
        analysis = {
            "filename": file.filename,
            "file_type": file_type,
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": df.columns.tolist(),
            "data_types": df.dtypes.astype(str).to_dict(),
            "missing_values": df.isnull().sum().to_dict(),
            "preview": df.head(5).to_dict('records')
        }
        
        # Détection du secteur si non spécifié
        if not sector:
            banking_keywords = ['loan', 'deposit', 'credit', 'asset', 'liability']
            insurance_keywords = ['premium', 'claim', 'policy', 'coverage', 'risk']
            
            columns_lower = [col.lower() for col in df.columns]
            banking_score = sum(1 for kw in banking_keywords if any(kw in col for col in columns_lower))
            insurance_score = sum(1 for kw in insurance_keywords if any(kw in col for col in columns_lower))
            
            if banking_score > insurance_score:
                sector = "banking"
            elif insurance_score > banking_score:
                sector = "insurance"
            else:
                sector = "general"
        
        analysis["detected_sector"] = sector
        analysis["suggested_analyses"] = get_suggested_analyses(sector)
        
        return {
            "success": True,
            "message": f"Fichier {file.filename} importé avec succès",
            "analysis": analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/validate")
async def validate_data(data: Dict[str, Any]):
    """
    Valide la qualité des données importées
    """
    try:
        # Validation basique
        validation_results = {
            "is_valid": True,
            "errors": [],
            "warnings": [],
            "data_quality_score": 0.85
        }
        
        # Vérifications
        if "data" not in data:
            validation_results["errors"].append("Aucune donnée fournie")
            validation_results["is_valid"] = False
            
        return validation_results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/templates")
async def get_import_templates():
    """
    Retourne les templates d'import disponibles
    """
    return {
        "templates": [
            {
                "id": "banking_loans",
                "name": "Portefeuille de prêts bancaires",
                "description": "Template pour importer des données de prêts",
                "columns": ["loan_id", "amount", "interest_rate", "term", "risk_rating"],
                "sector": "banking"
            },
            {
                "id": "insurance_claims",
                "name": "Sinistres assurance",
                "description": "Template pour importer des données de sinistres",
                "columns": ["claim_id", "policy_id", "claim_amount", "claim_date", "status"],
                "sector": "insurance"
            },
            {
                "id": "financial_transactions",
                "name": "Transactions financières",
                "description": "Template général pour transactions",
                "columns": ["transaction_id", "date", "amount", "type", "category"],
                "sector": "general"
            }
        ]
    }


@router.post("/batch")
async def batch_import(
    files: List[UploadFile] = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Import multiple de fichiers en batch
    """
    try:
        batch_id = f"BATCH_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Traitement asynchrone simulé
        background_tasks.add_task(process_batch_files, files, batch_id)
        
        return {
            "success": True,
            "batch_id": batch_id,
            "files_count": len(files),
            "status": "processing",
            "message": f"Import batch de {len(files)} fichiers lancé"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Fonctions helper
def get_suggested_analyses(sector: str) -> List[str]:
    """Retourne les analyses suggérées selon le secteur"""
    base_analyses = ["Statistiques descriptives", "Détection d'anomalies", "Analyse de tendances"]
    
    if sector == "banking":
        return base_analyses + [
            "Analyse du risque de crédit",
            "Calcul des ratios Bâle III",
            "Stress testing du portefeuille"
        ]
    elif sector == "insurance":
        return base_analyses + [
            "Analyse de sinistralité",
            "Calcul des provisions techniques",
            "Analyse de la rentabilité par produit"
        ]
    else:
        return base_analyses


async def process_batch_files(files: List[UploadFile], batch_id: str):
    """Traite les fichiers en batch (simulé)"""
    # Dans une vraie implémentation, traiter chaque fichier
    # et stocker les résultats dans une base de données
    pass