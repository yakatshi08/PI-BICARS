from sqlalchemy.orm import Session
from app.db.database import engine, create_tables
from app.models import QuarterlyData, KPIData, BankingMetric
from datetime import datetime

def init_db():
    # Créer les tables
    create_tables()
    print("✅ Tables créées avec succès!")

def seed_data(db: Session):
    """Insérer des données initiales"""
    
    # Données trimestrielles
    quarterly_data = [
        QuarterlyData(quarter="Q1", year=2024, revenue=120000, costs=80000, profit=40000),
        QuarterlyData(quarter="Q2", year=2024, revenue=150000, costs=90000, profit=60000),
        QuarterlyData(quarter="Q3", year=2024, revenue=180000, costs=100000, profit=80000),
        QuarterlyData(quarter="Q4", year=2024, revenue=200000, costs=110000, profit=90000),
    ]
    
    # KPIs
    kpi_data = [
        KPIData(kpi_name="CET1 Ratio", value="14.5%", target="> 13%", status="good", trend=0.3, date=datetime.now()),
        KPIData(kpi_name="LCR", value="135%", target="> 100%", status="good", trend=2.1, date=datetime.now()),
        KPIData(kpi_name="NPL Ratio", value="3.2%", target="< 5%", status="good", trend=-0.4, date=datetime.now()),
        KPIData(kpi_name="ROE", value="8.7%", target="> 10%", status="warning", trend=-0.8, date=datetime.now()),
    ]
    
    # Métriques bancaires
    banking_metrics = [
        BankingMetric(metric_name="NII", value=45.2, unit="M€", category="revenue", date=datetime.now()),
        BankingMetric(metric_name="NSFR", value=118, unit="%", category="liquidity", date=datetime.now()),
    ]
    
    # Ajouter à la base
    db.add_all(quarterly_data)
    db.add_all(kpi_data)
    db.add_all(banking_metrics)
    db.commit()
    
    print("✅ Données initiales insérées!")

if __name__ == "__main__":
    from app.db.database import SessionLocal
    
    # Initialiser la DB
    init_db()
    
    # Insérer des données de test
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()