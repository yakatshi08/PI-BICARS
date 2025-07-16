import asyncio
from app.services.ai_service import FinanceAIService

async def test_queries():
    service = FinanceAIService()
    
    queries = [
        "Calcule mon ratio CET1",
        "Explique ce qu'est le ratio SCR",
        "Quel est mon ratio MCR ?"
    ]
    
    for query in queries:
        print(f"\n🔍 Test: {query}")
        try:
            result = await service.process_query(query, {"sector": "banking"})
            print(f"✅ Intent: {result['intent']}")
            print(f"✅ Response type: {result['response'].get('type')}")
        except Exception as e:
            print(f"❌ Erreur: {e}")

asyncio.run(test_queries())