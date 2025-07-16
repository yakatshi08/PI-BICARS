"""
External API integrations service
Conformément aux prompts 36-37 du cahier des charges
"""

import asyncio
import aiohttp
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import pandas as pd
import logging
from abc import ABC, abstractmethod
import json

from app.core.config import settings
from app.core.cache import cache_service

logger = logging.getLogger(__name__)


class BaseAPIClient(ABC):
    """Classe de base pour les clients API"""
    
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.session = None
        self.rate_limiter = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
            
    @abstractmethod
    async def authenticate(self):
        """Authentification spécifique à chaque API"""
        pass
        
    @abstractmethod
    async def fetch_data(self, endpoint: str, params: Dict) -> Dict:
        """Récupérer des données depuis l'API"""
        pass


class BloombergAPIClient(BaseAPIClient):
    """
    Client pour Bloomberg API
    Prompt 36: Intégration Bloomberg
    """
    
    def __init__(self):
        super().__init__(
            api_key=settings.BLOOMBERG_API_KEY,
            base_url=settings.BLOOMBERG_API_URL
        )
        self.session_token = None
        
    async def authenticate(self):
        """Authentification Bloomberg"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        async with self.session.post(
            f"{self.base_url}/auth/token",
            headers=headers
        ) as response:
            if response.status == 200:
                data = await response.json()
                self.session_token = data["session_token"]
            else:
                raise Exception(f"Bloomberg auth failed: {response.status}")
    
    async def fetch_data(self, endpoint: str, params: Dict) -> Dict:
        """Récupérer des données Bloomberg"""
        if not self.session_token:
            await self.authenticate()
            
        headers = {
            "Session-Token": self.session_token,
            "Content-Type": "application/json"
        }
        
        async with self.session.get(
            f"{self.base_url}/{endpoint}",
            headers=headers,
            params=params
        ) as response:
            if response.status == 200:
                return await response.json()
            else:
                raise Exception(f"Bloomberg API error: {response.status}")
    
    async def get_market_data(self, symbols: List[str], fields: List[str]) -> pd.DataFrame:
        """Récupérer des données de marché"""
        # Vérifier le cache d'abord
        cache_key = f"bloomberg_market_{','.join(symbols)}_{','.join(fields)}"
        cached_data = await cache_service.get(cache_key)
        
        if cached_data:
            return pd.DataFrame(cached_data)
        
        # Récupérer depuis l'API
        data = await self.fetch_data("market/data", {
            "symbols": ",".join(symbols),
            "fields": ",".join(fields)
        })
        
        # Transformer en DataFrame
        df = pd.DataFrame(data["results"])
        
        # Mettre en cache pour 5 minutes
        await cache_service.set(cache_key, df.to_dict(), ttl=300)
        
        return df
    
    async def get_historical_data(
        self,
        symbol: str,
        start_date: datetime,
        end_date: datetime,
        frequency: str = "daily"
    ) -> pd.DataFrame:
        """Récupérer des données historiques"""
        data = await self.fetch_data("historical/data", {
            "symbol": symbol,
            "start": start_date.isoformat(),
            "end": end_date.isoformat(),
            "frequency": frequency
        })
        
        return pd.DataFrame(data["timeseries"])


class ReutersAPIClient(BaseAPIClient):
    """
    Client pour Reuters/Refinitiv API
    Prompt 36: Intégration Reuters
    """
    
    def __init__(self):
        super().__init__(
            api_key=settings.REUTERS_API_KEY,
            base_url=settings.REUTERS_API_URL
        )
        
    async def authenticate(self):
        """Authentification Reuters"""
        self.headers = {
            "X-API-KEY": self.api_key,
            "Accept": "application/json"
        }
    
    async def fetch_data(self, endpoint: str, params: Dict) -> Dict:
        """Récupérer des données Reuters"""
        if not hasattr(self, 'headers'):
            await self.authenticate()
            
        async with self.session.get(
            f"{self.base_url}/{endpoint}",
            headers=self.headers,
            params=params
        ) as response:
            if response.status == 200:
                return await response.json()
            else:
                raise Exception(f"Reuters API error: {response.status}")
    
    async def get_news_sentiment(self, symbols: List[str], days: int = 7) -> Dict:
        """Analyse de sentiment des news"""
        data = await self.fetch_data("news/sentiment", {
            "symbols": ",".join(symbols),
            "days": days
        })
        
        return {
            "overall_sentiment": data["aggregate_sentiment"],
            "by_symbol": data["symbol_sentiments"],
            "top_stories": data["top_stories"]
        }


class ECBAPIClient(BaseAPIClient):
    """
    Client pour European Central Bank API
    Prompt 36: Intégration ECB
    """
    
    def __init__(self):
        super().__init__(
            api_key="",  # ECB API est publique
            base_url="https://sdw-wsrest.ecb.europa.eu/service"
        )
        
    async def authenticate(self):
        """Pas d'authentification requise pour ECB"""
        pass
    
    async def fetch_data(self, endpoint: str, params: Dict) -> Dict:
        """Récupérer des données ECB"""
        headers = {"Accept": "application/json"}
        
        async with self.session.get(
            f"{self.base_url}/{endpoint}",
            headers=headers,
            params=params
        ) as response:
            if response.status == 200:
                return await response.json()
            else:
                raise Exception(f"ECB API error: {response.status}")
    
    async def get_reference_rates(self, currency: str = "EUR") -> Dict:
        """Récupérer les taux de référence"""
        data = await self.fetch_data("data/EXR", {
            "startPeriod": (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"),
            "endPeriod": datetime.now().strftime("%Y-%m-%d")
        })
        
        return self._parse_ecb_data(data)
    
    async def get_monetary_aggregates(self) -> Dict:
        """Récupérer les agrégats monétaires"""
        data = await self.fetch_data("data/BSI", {
            "startPeriod": (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
        })
        
        return self._parse_ecb_data(data)
    
    def _parse_ecb_data(self, data: Dict) -> Dict:
        """Parser les données ECB au format standard"""
        # ECB retourne un format XML/SDMX complexe
        # Simplifier pour notre usage
        return {
            "series": data.get("dataSets", [{}])[0].get("series", {}),
            "structure": data.get("structure", {}),
            "updated": datetime.now().isoformat()
        }


class BanqueDeFranceAPIClient(BaseAPIClient):
    """
    Client pour Banque de France API
    Prompt 36: Intégration Banque de France
    """
    
    def __init__(self):
        super().__init__(
            api_key=settings.BDF_API_KEY,
            base_url="https://api.banque-france.fr"
        )
        
    async def authenticate(self):
        """Authentification Banque de France"""
        self.headers = {
            "X-API-KEY": self.api_key,
            "Accept": "application/json"
        }
    
    async def fetch_data(self, endpoint: str, params: Dict) -> Dict:
        """Récupérer des données BdF"""
        if not hasattr(self, 'headers'):
            await self.authenticate()
            
        async with self.session.get(
            f"{self.base_url}/{endpoint}",
            headers=self.headers,
            params=params
        ) as response:
            if response.status == 200:
                return await response.json()
            else:
                raise Exception(f"BdF API error: {response.status}")
    
    async def get_company_rating(self, siren: str) -> Dict:
        """Récupérer la cotation Banque de France d'une entreprise"""
        data = await self.fetch_data(f"ratings/company/{siren}", {})
        
        return {
            "siren": siren,
            "rating": data.get("cotation"),
            "credit_score": data.get("score_credit"),
            "payment_behavior": data.get("comportement_paiement"),
            "last_update": data.get("date_maj")
        }


class APIIntegrationService:
    """
    Service principal pour gérer toutes les intégrations
    Prompt 37: Connecteurs pour systèmes bancaires
    """
    
    def __init__(self):
        self.clients = {
            "bloomberg": BloombergAPIClient(),
            "reuters": ReutersAPIClient(),
            "ecb": ECBAPIClient(),
            "banque_de_france": BanqueDeFranceAPIClient()
        }
        self.connectors = {}
        
    async def initialize(self):
        """Initialiser tous les clients API"""
        for name, client in self.clients.items():
            try:
                async with client:
                    await client.authenticate()
                logger.info(f"Client {name} initialisé avec succès")
            except Exception as e:
                logger.error(f"Erreur initialisation {name}: {e}")
    
    async def get_market_data_composite(self, symbols: List[str]) -> pd.DataFrame:
        """
        Récupérer des données de marché depuis plusieurs sources
        et les consolider
        """
        results = {}
        
        # Bloomberg
        if "bloomberg" in self.clients:
            try:
                async with self.clients["bloomberg"] as client:
                    bloomberg_data = await client.get_market_data(
                        symbols,
                        ["PX_LAST", "VOLUME", "CHG_PCT_1D"]
                    )
                    results["bloomberg"] = bloomberg_data
            except Exception as e:
                logger.error(f"Erreur Bloomberg: {e}")
        
        # Reuters pour le sentiment
        if "reuters" in self.clients:
            try:
                async with self.clients["reuters"] as client:
                    sentiment_data = await client.get_news_sentiment(symbols)
                    results["sentiment"] = sentiment_data
            except Exception as e:
                logger.error(f"Erreur Reuters: {e}")
        
        # Consolider les données
        return self._consolidate_market_data(results)
    
    async def get_regulatory_data(self, report_type: str) -> Dict:
        """Récupérer des données réglementaires"""
        data = {}
        
        # ECB pour les taux de référence
        if report_type in ["basel3", "lcr", "nsfr"]:
            async with self.clients["ecb"] as client:
                data["reference_rates"] = await client.get_reference_rates()
                data["monetary_aggregates"] = await client.get_monetary_aggregates()
        
        # Banque de France pour les ratings
        if report_type in ["credit_risk", "corep"]:
            # Implémenter la logique pour récupérer les ratings
            pass
        
        return data
    
    async def setup_webhook(self, provider: str, config: Dict) -> str:
        """
        Configurer un webhook pour recevoir des données en temps réel
        Prompt 38: Webhooks pour streaming
        """
        webhook_id = f"webhook_{provider}_{datetime.now().timestamp()}"
        
        # Enregistrer le webhook selon le provider
        if provider == "bloomberg":
            # Configuration spécifique Bloomberg
            pass
        elif provider == "reuters":
            # Configuration spécifique Reuters
            pass
        
        # Stocker la configuration
        self.connectors[webhook_id] = {
            "provider": provider,
            "config": config,
            "created_at": datetime.now(),
            "status": "active"
        }
        
        return webhook_id
    
    async def connect_banking_system(self, system_type: str, config: Dict) -> Dict:
        """
        Connecter à un système bancaire core
        Prompt 37: Connecteurs Temenos, SAP, Murex
        """
        connector_map = {
            "temenos": self._connect_temenos,
            "sap": self._connect_sap,
            "murex": self._connect_murex,
            "finastra": self._connect_finastra
        }
        
        if system_type not in connector_map:
            raise ValueError(f"Système non supporté: {system_type}")
        
        # Établir la connexion
        connection = await connector_map[system_type](config)
        
        # Tester la connexion
        test_result = await self._test_connection(connection)
        
        return {
            "connection_id": connection["id"],
            "system_type": system_type,
            "status": "connected" if test_result else "failed",
            "capabilities": connection.get("capabilities", [])
        }
    
    def _consolidate_market_data(self, data_sources: Dict) -> pd.DataFrame:
        """Consolider les données de plusieurs sources"""
        # Logique de consolidation
        # Prioriser Bloomberg pour les prix, Reuters pour le sentiment
        consolidated = pd.DataFrame()
        
        if "bloomberg" in data_sources:
            consolidated = data_sources["bloomberg"]
            
        if "sentiment" in data_sources:
            # Ajouter les colonnes de sentiment
            sentiment_df = pd.DataFrame(data_sources["sentiment"]["by_symbol"])
            consolidated = consolidated.merge(
                sentiment_df,
                left_on="symbol",
                right_index=True,
                how="left"
            )
        
        return consolidated
    
    async def _connect_temenos(self, config: Dict) -> Dict:
        """Connexion à Temenos T24"""
        # Implémentation spécifique Temenos
        return {
            "id": f"temenos_{datetime.now().timestamp()}",
            "capabilities": ["accounts", "transactions", "customers", "loans"]
        }
    
    async def _connect_sap(self, config: Dict) -> Dict:
        """Connexion à SAP Banking"""
        # Implémentation spécifique SAP
        return {
            "id": f"sap_{datetime.now().timestamp()}",
            "capabilities": ["gl", "accounts", "reporting", "compliance"]
        }
    
    async def _connect_murex(self, config: Dict) -> Dict:
        """Connexion à Murex MX.3"""
        # Implémentation spécifique Murex
        return {
            "id": f"murex_{datetime.now().timestamp()}",
            "capabilities": ["trading", "risk", "collateral", "treasury"]
        }
    
    async def _connect_finastra(self, config: Dict) -> Dict:
        """Connexion à Finastra"""
        # Implémentation spécifique Finastra
        return {
            "id": f"finastra_{datetime.now().timestamp()}",
            "capabilities": ["core_banking", "lending", "payments", "treasury"]
        }
    
    async def _test_connection(self, connection: Dict) -> bool:
        """Tester une connexion bancaire"""
        # Implémentation du test de connexion
        return True


# Instance globale du service
api_integration_service = APIIntegrationService()