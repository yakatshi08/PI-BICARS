"""
Script d'installation des tests pour le Module Analytics ML
Exécution : python setup_tests.py
"""

import os
import sys

def create_test_files():
    """Crée tous les fichiers de test nécessaires"""
    
    # Créer le dossier tests
    if not os.path.exists('tests'):
        os.makedirs('tests')
        print("✅ Dossier 'tests' créé")
    
    # Contenu du test rapide
    quick_test_content = '''#!/usr/bin/env python3
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
    print(f"\\n🔍 Test: {name}")
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
    print(f"\\n📊 Données de test générées: {len(test_data)} points")
    
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
    print("\\n" + "="*60)
    print("📊 RÉSUMÉ DES TESTS")
    print("="*60)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
    
    print(f"\\n📈 Score: {passed}/{total} ({passed/total*100:.0f}%)")
    
    if passed == total:
        print("\\n🎉 Tous les tests sont passés avec succès!")
        print("✨ Le Module Analytics ML est opérationnel!")
    else:
        print("\\n⚠️  Certains tests ont échoué.")
        print("📋 Vérifiez que l'API est bien démarrée et accessible.")
    
    # Test de santé de l'API
    print("\\n🏥 Test de santé de l'API...")
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
'''

    # Contenu du README
    readme_content = '''# Guide des Tests - Module Analytics ML

## 📋 Installation rapide

```bash
# 1. Installer les dépendances
pip install pytest numpy pandas requests

# 2. Lancer le test rapide
python tests/quick_test_analytics.py

# 3. Lancer la suite complète (optionnel)
python tests/test_analytics_ml.py
```

## 🚀 Configuration

Avant de lancer les tests, assurez-vous que :
1. Votre API est démarrée (par défaut sur http://localhost:8000)
2. Les endpoints sont accessibles
3. Les dépendances sont installées

## 📊 Résultats attendus

Si tout fonctionne :
- ✅ 4/4 tests passés pour le test rapide
- ✅ 14/14 tests passés pour la suite complète
'''

    # Écrire les fichiers
    with open('tests/quick_test_analytics.py', 'w', encoding='utf-8') as f:
        f.write(quick_test_content)
    print("✅ Fichier 'tests/quick_test_analytics.py' créé")
    
    with open('tests/README.md', 'w', encoding='utf-8') as f:
        f.write(readme_content)
    print("✅ Fichier 'tests/README.md' créé")
    
    print("\n📋 Note: Le fichier test_analytics_ml.py (suite complète) est trop long")
    print("   Copiez-le manuellement depuis l'artifact si vous voulez tous les tests")

def install_dependencies():
    """Installe les dépendances nécessaires"""
    print("\n📦 Installation des dépendances...")
    
    try:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", 
                             "pytest", "numpy", "pandas", "requests"])
        print("✅ Dépendances installées avec succès")
        return True
    except Exception as e:
        print(f"❌ Erreur lors de l'installation : {e}")
        print("   Installez manuellement : pip install pytest numpy pandas requests")
        return False

def main():
    print("="*60)
    print("🛠️  SETUP DES TESTS - MODULE ANALYTICS ML")
    print("="*60)
    
    # Créer les fichiers
    create_test_files()
    
    # Proposer d'installer les dépendances
    print("\n❓ Voulez-vous installer les dépendances ? (o/n)")
    response = input().lower()
    
    if response == 'o':
        install_dependencies()
    
    # Instructions finales
    print("\n" + "="*60)
    print("✅ SETUP TERMINÉ!")
    print("="*60)
    print("\n🚀 Pour lancer les tests :")
    print("   1. Assurez-vous que votre API est démarrée")
    print("   2. Exécutez : python tests\\quick_test_analytics.py")
    print("\n💡 Conseil : Commencez par le test rapide pour valider")
    print("   que votre API fonctionne correctement.")

if __name__ == "__main__":
    main()