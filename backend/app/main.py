from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

# Ajouter le chemin du projet au PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = FastAPI(
    title="PI BICARS Analytics API",
    description="API d'analyse de données spécialisée Finance & Assurance",
    version="1.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "PI BICARS Analytics API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "PI BICARS Backend"}

# Importer les routers disponibles
try:
    from app.routers import analytics_router
    app.include_router(analytics_router.router, prefix="/api", tags=["analytics"])
    print("✅ Router Analytics chargé")
except Exception as e:
    print(f"⚠️ Router Analytics non disponible: {e}")

print("🚀 PI BICARS Backend démarré avec succès!")
