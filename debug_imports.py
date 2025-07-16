"""
Script de diagnostic pour identifier les problèmes d'import
"""
import os
import sys

print("🔍 Diagnostic des imports PI BICARS")
print("=" * 50)

# Vérifier le répertoire de travail
print(f"📁 Répertoire actuel: {os.getcwd()}")
print(f"📁 Script location: {os.path.dirname(os.path.abspath(__file__))}")

# Vérifier la structure des dossiers
print("\n📂 Structure des dossiers:")
app_path = os.path.join(os.getcwd(), "app")
if os.path.exists(app_path):
    print("✅ Dossier 'app' trouvé")
    
    # Vérifier les sous-dossiers
    routers_path = os.path.join(app_path, "routers")
    analytics_ml_path = os.path.join(app_path, "analytics_ml")
    
    if os.path.exists(routers_path):
        print("✅ Dossier 'app/routers' trouvé")
        router_files = os.listdir(routers_path)
        print(f"   Fichiers: {router_files}")
    else:
        print("❌ Dossier 'app/routers' MANQUANT")
        
    if os.path.exists(analytics_ml_path):
        print("✅ Dossier 'app/analytics_ml' trouvé")
        ml_files = os.listdir(analytics_ml_path)
        print(f"   Fichiers: {ml_files}")
    else:
        print("❌ Dossier 'app/analytics_ml' MANQUANT")
else:
    print("❌ Dossier 'app' MANQUANT")

# Tester les imports
print("\n🔧 Test des imports:")

# Ajouter le path
sys.path.insert(0, os.getcwd())

# Test 1: Import des routers
try:
    from app.routers import import_router
    print("✅ import_router importé avec succès")
    print(f"   Type: {type(import_router)}")
    print(f"   Router exists: {hasattr(import_router, 'router')}")
except Exception as e:
    print(f"❌ Erreur import_router: {e}")

try:
    from app.routers import copilot_router
    print("✅ copilot_router importé avec succès")
    print(f"   Router exists: {hasattr(copilot_router, 'router')}")
except Exception as e:
    print(f"❌ Erreur copilot_router: {e}")

try:
    from app.routers import credit_risk_router
    print("✅ credit_risk_router importé avec succès")
    print(f"   Router exists: {hasattr(credit_risk_router, 'router')}")
except Exception as e:
    print(f"❌ Erreur credit_risk_router: {e}")

# Test 2: Import analytics_ml
try:
    from app.analytics_ml import router as analytics_ml_router
    print("✅ analytics_ml_router importé avec succès")
    print(f"   Type: {type(analytics_ml_router)}")
except Exception as e:
    print(f"❌ Erreur analytics_ml_router: {e}")

# Test des dépendances
print("\n📦 Test des dépendances principales:")
dependencies = {
    "fastapi": "FastAPI",
    "pydantic": "Pydantic",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "sklearn": "Scikit-learn"
}

for module, name in dependencies.items():
    try:
        __import__(module)
        print(f"✅ {name} installé")
    except ImportError:
        print(f"❌ {name} MANQUANT - installer avec: pip install {module}")

print("\n" + "=" * 50)
print("💡 Solutions suggérées:")
print("1. Vérifier que tous les fichiers sont créés")
print("2. Installer les dépendances manquantes")
print("3. Redémarrer le serveur après corrections")