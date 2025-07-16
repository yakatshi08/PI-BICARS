"""
Script pour corriger le fichier test_analytics_ml.py
"""

import os

# Contenu corrigé avec conversion des dates
test_content_fixed = '''import pytest
import numpy as np
import pandas as pd
import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any
import warnings
warnings.filterwarnings('ignore')

# Configuration
API_BASE_URL = "http://localhost:8000/api/v1"
HEADERS = {"Content-Type": "application/json"}

class TestAnalyticsML:
    """Suite de tests complète pour le Module Analytics ML"""
    
    @classmethod
    def setup_class(cls):
        """Préparation des données de test"""
        np.random.seed(42)
        dates = pd.date_range(start='2020-01-01', end='2024-01-01', freq='D')
        
        # Données avec tendance, saisonnalité et anomalies
        trend = np.linspace(100, 150, len(dates))
        seasonal = 10 * np.sin(2 * np.pi * np.arange(len(dates)) / 365.25)
        noise = np.random.normal(0, 5, len(dates))
        
        # Injection d'anomalies
        anomalies_idx = np.random.choice(len(dates), 20, replace=False)
        anomalies = np.zeros(len(dates))
        anomalies[anomalies_idx] = np.random.uniform(-30, 30, 20)
        
        cls.test_data = pd.DataFrame({
            'date': dates,
            'value': trend + seasonal + noise + anomalies,
            'volume': np.random.poisson(1000, len(dates)),
            'feature_1': np.random.normal(50, 10, len(dates)),
            'feature_2': np.random.uniform(0, 100, len(dates))
        })
        
        # ✅ IMPORTANT: Convertir les dates en strings pour JSON
        cls.test_data['date'] = cls.test_data['date'].dt.strftime('%Y-%m-%d')
    
    # ========== TESTS PRÉDICTIONS AVANCÉES ==========
    
    def test_model_selection(self):
        """Test de la sélection automatique du modèle"""
        print("\\n🔍 Test 1: Sélection automatique du modèle")
        
        endpoint = f"{API_BASE_URL}/analytics/predict/auto"
        payload = {
            "data": self.test_data.to_dict('records'),
            "target_column": "value",
            "forecast_horizon": 30
        }
        
        response = requests.post(endpoint, json=payload, headers=HEADERS)
        assert response.status_code == 200, f"Erreur API: {response.status_code}"
        
        result = response.json()
        assert "selected_model" in result
        assert "predictions" in result
        assert "confidence_intervals" in result
        assert "model_scores" in result
        
        print(f"✅ Modèle sélectionné: {result['selected_model']}")
        print(f"✅ Score du modèle: {result['model_scores'][result['selected_model']]:.4f}")
        print(f"✅ Nombre de prédictions: {len(result['predictions'])}")
    
    def test_anomaly_detection(self):
        """Test de la détection d'anomalies"""
        print("\\n🔍 Test 2: Détection d'anomalies")
        
        endpoint = f"{API_BASE_URL}/analytics/anomalies/detect"
        payload = {
            "data": self.test_data.to_dict('records'),
            "target_column": "value",
            "method": "isolation_forest",
            "contamination": 0.05,
            "include_explanations": True
        }
        
        response = requests.post(endpoint, json=payload, headers=HEADERS)
        assert response.status_code == 200
        
        result = response.json()
        assert "anomalies" in result
        assert "severity_classification" in result
        assert "explanations" in result
        
        print(f"✅ Anomalies détectées: {len(result['anomalies'])}")
    
    def test_automl_pipeline(self):
        """Test du pipeline AutoML complet"""
        print("\\n🔍 Test 3: Pipeline AutoML")
        
        endpoint = f"{API_BASE_URL}/analytics/automl/run"
        payload = {
            "data": self.test_data.to_dict('records'),
            "target_column": "value",
            "models_to_test": ["xgboost", "prophet"],
            "validation_strategy": "time_series_split"
        }
        
        response = requests.post(endpoint, json=payload, headers=HEADERS)
        assert response.status_code == 200
        
        result = response.json()
        assert "best_model" in result
        assert "model_comparison" in result
        
        print(f"✅ Meilleur modèle: {result['best_model']}")
    
    def test_scenario_analysis(self):
        """Test de l'analyse de scénarios"""
        print("\\n🔍 Test 4: Analyse de scénarios")
        
        # Utiliser uniquement les valeurs pour ce test
        endpoint = f"{API_BASE_URL}/analytics/scenarios/analyze"
        payload = {
            "base_data": self.test_data['value'].tolist(),
            "scenarios": [
                {"name": "Optimiste", "growth_rate": 0.1, "volatility": 0.15},
                {"name": "Pessimiste", "growth_rate": -0.1, "volatility": 0.25}
            ],
            "horizon": 30
        }
        
        response = requests.post(endpoint, json=payload, headers=HEADERS)
        assert response.status_code == 200
        
        result = response.json()
        assert "scenario_results" in result
        assert "risk_metrics" in result
        
        print(f"✅ Scénarios analysés: {len(result['scenario_results'])}")
        for scenario, metrics in result["risk_metrics"].items():
            print(f"   - {scenario}: VaR 95% = {metrics.get('var_95', 'N/A')}")


def run_all_tests():
    """Exécute tous les tests et génère un rapport"""
    print("="*60)
    print("🚀 DÉMARRAGE DES TESTS - MODULE ANALYTICS ML")
    print("="*60)
    
    # Vérifier d'abord que le serveur est accessible
    try:
        health_check = requests.get(f"{API_BASE_URL}/health")
        if health_check.status_code != 200:
            print("❌ ERREUR: Le serveur n'est pas accessible!")
            print("   Assurez-vous que mock_analytics_server.py est en cours d'exécution")
            return 0, 1
    except Exception as e:
        print("❌ ERREUR: Impossible de contacter le serveur!")
        print(f"   {str(e)}")
        print("\\n💡 Solution:")
        print("   1. Vérifiez que le serveur mock est lancé: python mock_analytics_server.py")
        print("   2. Vérifiez qu'il écoute sur le port 8000")
        return 0, 1
    
    # Créer une instance de test
    test_suite = TestAnalyticsML()
    test_suite.setup_class()
    
    # Liste des tests à exécuter
    tests = [
        test_suite.test_model_selection,
        test_suite.test_anomaly_detection,
        test_suite.test_automl_pipeline,
        test_suite.test_scenario_analysis
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            failed += 1
            print(f"❌ Échec: {test.__name__}")
            print(f"   Erreur: {str(e)}")
    
    # Rapport final
    print("\\n" + "="*60)
    print("📊 RAPPORT FINAL")
    print("="*60)
    print(f"✅ Tests réussis: {passed}")
    print(f"❌ Tests échoués: {failed}")
    print(f"📈 Taux de réussite: {(passed/(passed+failed)*100):.1f}%")
    
    if failed == 0:
        print("\\n🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS!")
    else:
        print("\\n⚠️  Certains tests ont échoué. Vérifiez les logs ci-dessus.")
    
    return passed, failed


if __name__ == "__main__":
    # Pour exécuter avec pytest:
    # pytest test_analytics_ml.py -v
    
    # Pour exécuter directement:
    run_all_tests()
'''

# Écrire le fichier corrigé
with open('tests/test_analytics_ml.py', 'w', encoding='utf-8') as f:
    f.write(test_content_fixed)

print("✅ Fichier tests/test_analytics_ml.py corrigé avec succès!")
print("\n🔧 Corrections apportées :")
print("   - Conversion des dates en strings pour la sérialisation JSON")
print("   - Ajout de la vérification du serveur au début")
print("   - Amélioration de la gestion d'erreurs")
print("\n🚀 Prochaines étapes :")
print("   1. Assurez-vous que le serveur mock est lancé : python mock_analytics_server.py")
print("   2. Dans un autre terminal : python tests\\test_analytics_ml.py")