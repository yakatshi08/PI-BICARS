from fastapi import APIRouter
from app.api.v1.endpoints import dashboard, banking, financial, risk
# from app.api.v1.endpoints import ai_copilot, insurance_core  # À activer plus tard si nécessaire

api_router = APIRouter()

# Inclusion des différentes routes
api_router.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["Dashboard"]
)

api_router.include_router(
    banking.router,
    prefix="/banking",
    tags=["Banking"]
)

api_router.include_router(
    financial.router,
    prefix="/financial",
    tags=["Financial"]
)

api_router.include_router(
    risk.router,
    prefix="/risk",
    tags=["Risk"]
)

# Endpoint de test racine
@api_router.get("/")
def api_root():
    return {
        "message": "API v1 root",
        "endpoints": ["/dashboard", "/banking", "/financial", "/risk"]
    }
