# run.py - Lanceur pour le serveur FastAPI
import uvicorn
import sys
import os

# Ajouter le répertoire actuel au path Python
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # Configuration du serveur
    config = {
        "app": "app:app",  # Référence à app.py et l'objet 'app'
        "host": "127.0.0.1",
        "port": 8000,
        "reload": True,  # Rechargement automatique lors des modifications
        "log_level": "info"
    }
    
    print("\n🚀 Démarrage du serveur FinTech Analysis Platform...")
    print(f"📍 URL: http://{config['host']}:{config['port']}")
    print(f"📚 Documentation API: http://{config['host']}:{config['port']}/docs")
    print("\n💡 Appuyez sur CTRL+C pour arrêter le serveur\n")
    
    # Lancer le serveur
    uvicorn.run(**config)