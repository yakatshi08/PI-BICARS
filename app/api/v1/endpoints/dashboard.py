from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_dashboard_data():
    return {
        "metrics": {
            "total_assets": 1500000000,
            "total_liabilities": 1200000000,
            "net_income": 50000000,
            "roe": 12.5
        },
        "status": "operational"
    }

@router.get("/kpis")
def get_kpis():
    return {
        "banking": {
            "cet1_ratio": 14.8,
            "lcr": 125.5,
            "nsfr": 112.3
        },
        "insurance": {
            "scr_ratio": 168,
            "combined_ratio": 94.5
        }
    }