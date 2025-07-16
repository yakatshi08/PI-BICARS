"""
PI BICARS - Backend API
Finance & Insurance Analytics Platform
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn

# 🔧 Configuration des imports avec chemins relatifs
import sys
import os

# Ajouter le répertoire parent au path pour les imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Import des routers avec chemins relatifs
try:
    from routers import import_router, copilot_router, credit_risk_router
    from analytics_ml import router as analytics_ml_router
except ImportError:
    # Si les imports échouent, essayer avec le préfixe app
    try:
        from app.routers import import_router, copilot_router, credit_risk_router
        from app.analytics_ml import router as analytics_ml_router
    except ImportError as e:
        print(f"⚠️ Erreur d'import des modules: {e}")
        print("📌 Assurez-vous que la structure des dossiers est correcte")
        # Imports factices pour permettre le démarrage
        import_router = None
        copilot_router = None
        credit_risk_router = None
        analytics_ml_router = None

# Configuration de l'application
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 PI BICARS Backend démarrage...")
    print("📁 Répertoire de travail:", os.getcwd())
    print("📁 Répertoire du script:", current_dir)
    if analytics_ml_router:
        print("✅ Module Analytics ML chargé")
    else:
        print("⚠️ Module Analytics ML non disponible")
    yield
    # Shutdown
    print("🛑 PI BICARS Backend arrêt...")

# Création de l'application FastAPI
app = FastAPI(
    title="PI BICARS API",
    description="API pour la plateforme d'analyse financière et d'assurance avec Analytics ML",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],  # Frontend URLs + dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routers si disponibles
if import_router and hasattr(import_router, 'router'):
    app.include_router(import_router.router)
    print("✅ Router Import chargé")
else:
    print("⚠️ Router Import non disponible")

if copilot_router and hasattr(copilot_router, 'router'):
    app.include_router(copilot_router.router)
    print("✅ Router Copilot chargé")
else:
    print("⚠️ Router Copilot non disponible")

if credit_risk_router and hasattr(credit_risk_router, 'router'):
    app.include_router(credit_risk_router.router)
    print("✅ Router Credit Risk chargé")
else:
    print("⚠️ Router Credit Risk non disponible")

# Inclusion du nouveau router Analytics ML
if analytics_ml_router:
    app.include_router(analytics_ml_router, prefix="/api/v1", tags=["Analytics ML"])
    print("✅ Router Analytics ML ajouté")
else:
    print("⚠️ Router Analytics ML non disponible")

# Route de santé
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "PI BICARS Backend",
        "version": "1.0.0",
        "modules": {
            "import": "active" if import_router else "not loaded",
            "copilot": "active" if copilot_router else "not loaded",
            "credit_risk": "active" if credit_risk_router else "not loaded",
            "analytics_ml": "active" if analytics_ml_router else "not loaded"
        }
    }

# Route racine
@app.get("/")
async def root():
    return {
        "message": "Bienvenue sur PI BICARS API",
        "documentation": "/docs",
        "health": "/health",
        "modules": [
            "Import de données",
            "Copilot IA",
            "Credit Risk",
            "Analytics ML (ML Finance & Assurance)"
        ]
    }

# Endpoints d'exemple pour les données du dashboard
@app.get("/api/dashboard/kpis")
async def get_dashboard_kpis():
    """Retourne les KPIs pour le dashboard"""
    return {
        "general": [
            {
                "id": "revenue",
                "name": "Chiffre d'affaires",
                "value": "€3.24M",
                "change": "+29.6%",
                "status": "up"
            },
            {
                "id": "active_users",
                "name": "Utilisateurs actifs",
                "value": "3,540",
                "change": "+3.4%",
                "status": "up"
            },
            {
                "id": "ml_models",
                "name": "Modèles ML actifs",
                "value": "12",
                "change": "+2",
                "status": "up"
            }
        ],
        "banking": [
            {
                "id": "cet1",
                "name": "CET1 Ratio",
                "value": "14.8%",
                "threshold": ">10.5%",
                "status": "healthy"
            },
            {
                "id": "lcr",
                "name": "LCR",
                "value": "125.5%",
                "threshold": ">100%",
                "status": "healthy"
            },
            {
                "id": "npl",
                "name": "NPL Ratio",
                "value": "2.3%",
                "threshold": "<5%",
                "status": "healthy"
            }
        ],
        "insurance": [
            {
                "id": "scr",
                "name": "SCR Ratio",
                "value": "168%",
                "threshold": ">100%",
                "status": "healthy"
            },
            {
                "id": "combined",
                "name": "Combined Ratio",
                "value": "94.5%",
                "threshold": "<100%",
                "status": "healthy"
            },
            {
                "id": "loss_ratio",
                "name": "Loss Ratio",
                "value": "62.3%",
                "threshold": "<70%",
                "status": "healthy"
            }
        ],
        "analytics_ml": [
            {
                "id": "anomalies",
                "name": "Anomalies détectées",
                "value": "73",
                "change": "-5",
                "status": "down"
            },
            {
                "id": "predictions",
                "name": "Prédictions aujourd'hui",
                "value": "1,245",
                "change": "+156",
                "status": "up"
            },
            {
                "id": "accuracy",
                "name": "Précision moyenne",
                "value": "92.3%",
                "change": "+0.8%",
                "status": "up"
            }
        ]
    }

@app.get("/api/dashboard/charts")
async def get_dashboard_charts():
    """Retourne les données pour les graphiques"""
    return {
        "quarterly": [
            {"quarter": "Q1 2024", "revenues": 120, "costs": 85, "profit": 35},
            {"quarter": "Q2 2024", "revenues": 150, "costs": 92, "profit": 58},
            {"quarter": "Q3 2024", "revenues": 180, "costs": 98, "profit": 82},
            {"quarter": "Q4 2024", "revenues": 200, "costs": 110, "profit": 90}
        ],
        "performance": [
            {"metric": "Revenus", "value": 100},
            {"metric": "Coûts", "value": 75},
            {"metric": "Profit", "value": 92},
            {"metric": "Clients", "value": 85},
            {"metric": "Satisfaction", "value": 88},
            {"metric": "ML Accuracy", "value": 92}  # Nouveau metric ML
        ],
        "ml_performance": [
            {"model": "XGBoost", "accuracy": 93.4, "usage": 450},
            {"model": "Prophet", "accuracy": 91.2, "usage": 380},
            {"model": "LSTM", "accuracy": 89.7, "usage": 220},
            {"model": "Random Forest", "accuracy": 90.5, "usage": 340}
        ]
    }

# Nouvel endpoint pour les statistiques Analytics ML
@app.get("/api/analytics-ml/stats")
async def get_analytics_ml_stats():
    """Retourne les statistiques du module Analytics ML"""
    return {
        "models_deployed": 12,
        "total_predictions": 45670,
        "anomalies_detected_today": 73,
        "active_monitoring": 8,
        "average_accuracy": 92.3,
        "sectors_covered": ["banking", "insurance"],
        "regulatory_reports_generated": 156,
        "top_models": [
            {"name": "Credit Risk XGBoost", "accuracy": 94.2, "predictions": 12450},
            {"name": "Claims Prophet", "accuracy": 91.8, "predictions": 8930},
            {"name": "Fraud Detection RF", "accuracy": 93.1, "predictions": 6780}
        ]
    }

# Point d'entrée pour le développement
if __name__ == "__main__":
    print("🚀 Démarrage de PI BICARS Backend avec Analytics ML...")
    print("📁 Démarrage depuis:", os.getcwd())
    
    # Vérifier si uvicorn est installé
    try:
        import uvicorn as uv
        uv.run(
            "main:app",  # Utiliser main:app au lieu de app.main:app quand on lance depuis le dossier app
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except ImportError:
        print("⚠️ Uvicorn n'est pas installé!")
        print("👉 Installez-le avec: pip install uvicorn")
        print("👉 Ou installez toutes les dépendances: pip install -r requirements.txt")