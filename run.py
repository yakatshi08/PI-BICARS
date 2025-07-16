#!/usr/bin/env python
"""
Script de lancement pour PI BICARS Backend
"""
import uvicorn
import sys
import os

# Ajouter le répertoire parent au path Python
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🚀 Démarrage de PI BICARS Backend...")
    print("📍 URL: http://localhost:8000")
    print("📚 Documentation: http://localhost:8000/docs")
    print("🛑 Appuyez sur CTRL+C pour arrêter\n")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )