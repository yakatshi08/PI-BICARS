"""
Script de test pour le service IA Co-Pilot
"""

import asyncio
import json
from app.services.ai_service import FinanceAIService

async def test_ai_service():
    """Test des différentes fonctionnalités du service IA"""
    
    # Initialiser le service
    ai_service = FinanceAIService()
    
    print("🧪 Test du Service IA Co-Pilot PI BICARS\n")
    
    # Test 1: Calcul de ratio
    print("📊 Test 1: Calcul de ratio")
    result = await ai_service.process_query(
        "Calcule mon ratio CET1",
        {"sector": "banking"}
    )
    print(f"Intent: {result['intent']}")
    print(f"Secteur: {result['sector']}")
    print(f"Réponse: {json.dumps(result['response'], indent=2, ensure_ascii=False)}\n")
    
    # Test 2: Génération de rapport
    print("📄 Test 2: Génération de rapport")
    result = await ai_service.process_query(
        "Génère un rapport Bâle III",
        {"sector": "banking"}
    )
    print(f"Intent: {result['intent']}")
    print(f"Type de rapport: {result['response']['report_type']}\n")
    
    # Test 3: Explication de métrique
    print("❓ Test 3: Explication de métrique")
    result = await ai_service.process_query(
        "Explique moi ce qu'est le ratio SCR",
        {"sector": "insurance"}
    )
    print(f"Intent: {result['intent']}")
    print(f"Description: {result['response']['description']}\n")
    
    # Test 4: Création de dashboard
    print("📈 Test 4: Création de dashboard")
    result = await ai_service.process_query(
        "Crée un dashboard avec mes KPIs bancaires",
        {"sector": "banking"}
    )
    print(f"Intent: {result['intent']}")
    print(f"Nombre de widgets: {len(result['response']['widgets'])}\n")
    
    # Test 5: Détection d'anomalie
    print("🚨 Test 5: Détection d'anomalie")
    result = await ai_service.process_query(
        "Y a-t-il des anomalies dans ma liquidité ?",
        {"sector": "banking"}
    )
    print(f"Intent: {result['intent']}")
    print(f"Anomalies trouvées: {result['response']['anomalies_found']}\n")
    
    # Test 6: Analyse de tendance
    print("📊 Test 6: Analyse de tendance")
    result = await ai_service.process_query(
        "Analyse l'évolution de mes ratios sur 12 mois",
        {"sector": "mixed"}
    )
    print(f"Intent: {result['intent']}")
    print(f"Insights: {result['response']['insights']}\n")
    
    print("✅ Tests terminés avec succès!")

if __name__ == "__main__":
    asyncio.run(test_ai_service())