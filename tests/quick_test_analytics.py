#!/usr/bin/env python3
"""
Test rapide du Module Analytics ML
Exécution : python quick_test_analytics.py
"""

import requests
import json
import numpy as np
from datetime import datetime, timedelta

# Configuration
API_URL = "http://localhost:8000/api/v1"  # Ajustez selon votre config
HEADERS = {"Content-Type": "application/json"}

def generate_test_data():
    """Génère des données de test simples"""
    dates = [(datetime.now() - timedelta(days=x)).isoformat() for x in range(100, 0, -1)]
    values = [100 + x + np.random.normal(0, 5) for x in range(100)]
    
    return [{"date": d, "value": v} for d, v in zip(dates, values)]

def test_endpoint(name, endpoint, payload):
    """Test un endpoint et affiche le résultat"""
    print(f"\n🔍 Test: {name}")
    print(f"   Endpoint: {endpoint}")
    
    try:
        response = requests.post(f"{API_URL}{endpoint}", json=payload, headers=HEADERS)
        
        if response.status_code == 200:
            print(f"   ✅ Succès (200 OK)")
            result = response.json()
            
            # Afficher quelques infos clés
            if "predictions" in result:
                print(f"   📊 Prédictions générées: {len(result['predictions'])}")
            if "selected_model" in result:
                print(f"   🤖 Modèle sélectionné: {result['selected_model']}")
            if "anomalies" in result:
                print(f"   ⚠️  Anomalies détectées: {len(result['anomalies'])}")
            
            return True
        else:
            print(f"   ❌ Échec ({response.status_code})")
            print(f"   Erreur: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def main():
    """Tests rapides principaux"""
    print("="*60)
    print("🚀 TEST RAPIDE - MODULE ANALYTICS ML")
    print("="*60)
    
    # Générer les données de test
    test_data = generate_test_data()
    print(f"\n📊 Données de test générées: {len(test_data)} points")
    
    # Liste des tests à effectuer
    tests = [
        {
            "name": "Prédiction automatique",
            "endpoint": "/analytics/predict/auto",
            "payload": {
                "data": test_data,
                "target_column": "value",
                "forecast_horizon": 10
            }
        },
        {
            "name": "Détection d'anomalies",
            "endpoint": "/analytics/anomalies/detect",
            "payload": {
                "data": test_data,
                "target_column": "value",
                "method": "isolation_forest"
            }
        },
        {
            "name": "Pipeline AutoML",
            "endpoint": "/analytics/automl/run",
            "payload": {
                "data": test_data,
                "target_column": "value",
                "models_to_test": ["xgboost", "prophet"],
                "validation_strategy": "time_series_split"
            }
        },
        {
            "name": "Analyse de scénarios",
            "endpoint": "/analytics/scenarios/analyze",
            "payload": {
                "base_data": [d["value"] for d in test_data],
                "scenarios": [
                    {"name": "Optimiste", "growth_rate": 0.1},
                    {"name": "Pessimiste", "growth_rate": -0.1}
                ],
                "horizon": 30
            }
        }
    ]
    
    # Exécuter les tests
    results = []
    for test in tests:
        success = test_endpoint(test["name"], test["endpoint"], test["payload"])
        results.append((test["name"], success))
    
    # Résumé
    print("\n" + "="*60)
    print("📊 RÉSUMÉ DES TESTS")
    print("="*60)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
    
    print(f"\n📈 Score: {passed}/{total} ({passed/total*100:.0f}%)")
    
    if passed == total:
        print("\n🎉 Tous les tests sont passés avec succès!")
        print("✨ Le Module Analytics ML est opérationnel!")
    else:
        print("\n⚠️  Certains tests ont échoué.")
        print("📋 Vérifiez que l'API est bien démarrée et accessible.")
    
    # Test de santé de l'API
    print("\n🏥 Test de santé de l'API...")
    try:
        health_response = requests.get(f"{API_URL}/health")
        if health_response.status_code == 200:
            print("✅ L'API est accessible")
        else:
            print("❌ L'API ne répond pas correctement")
    except:
        print("❌ Impossible de joindre l'API")
        print(f"   Vérifiez que le serveur est démarré sur {API_URL}")

if __name__ == "__main__":
    main()
