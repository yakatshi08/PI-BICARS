"""
Kafka service for real-time data streaming
Conformément aux prompts 15, 38, 44 du cahier des charges
"""

import asyncio
import json
from typing import Dict, List, Optional, Callable, Any
from datetime import datetime
import logging
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from aiokafka.errors import KafkaError
import pandas as pd

from app.core.config import settings

logger = logging.getLogger(__name__)


class KafkaService:
    """Service pour streaming temps réel avec Kafka"""
    
    def __init__(self):
        self.producer = None
        self.consumers = {}
        self.running = False
        self.handlers = {}
        
    async def start(self):
        """Démarrer le service Kafka"""
        try:
            # Initialiser le producer
            self.producer = AIOKafkaProducer(
                bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
                value_serializer=lambda v: json.dumps(v).encode(),
                compression_type="gzip",
                acks='all',  # Attendre confirmation de tous les brokers
                retry_backoff_ms=100,
                request_timeout_ms=30000
            )
            await self.producer.start()
            self.running = True
            logger.info("Service Kafka démarré avec succès")
            
        except Exception as e:
            logger.error(f"Erreur au démarrage du service Kafka: {e}")
            raise
    
    async def stop(self):
        """Arrêter le service Kafka"""
        self.running = False
        
        # Arrêter le producer
        if self.producer:
            await self.producer.stop()
            
        # Arrêter tous les consumers
        for consumer in self.consumers.values():
            await consumer.stop()
            
        logger.info("Service Kafka arrêté")
    
    async def publish_market_data(self, data: Dict):
        """
        Publier des données de marché en temps réel
        Prompt 44: Streaming temps réel
        """
        topic = "market-data-stream"
        
        try:
            # Enrichir avec timestamp
            data["timestamp"] = datetime.now().isoformat()
            data["stream_type"] = "market_data"
            
            # Publier
            await self.producer.send_and_wait(topic, data)
            
            logger.debug(f"Données marché publiées: {data.get('symbol', 'N/A')}")
            
        except KafkaError as e:
            logger.error(f"Erreur publication données marché: {e}")
            raise
    
    async def publish_risk_metrics(self, metrics: Dict):
        """
        Publier des métriques de risque en temps réel
        Prompts 22-23: Dashboard liquidité et market risk temps réel
        """
        topic = "risk-metrics-stream"
        
        try:
            # Formater les métriques
            risk_data = {
                "timestamp": datetime.now().isoformat(),
                "stream_type": "risk_metrics",
                "metrics": {
                    "var_95": metrics.get("var_95"),
                    "var_99": metrics.get("var_99"),
                    "cvar": metrics.get("cvar"),
                    "lcr": metrics.get("lcr"),
                    "nsfr": metrics.get("nsfr"),
                    "liquidity_gap": metrics.get("liquidity_gap")
                },
                "alerts": metrics.get("alerts", [])
            }
            
            await self.producer.send_and_wait(topic, risk_data)
            
        except KafkaError as e:
            logger.error(f"Erreur publication métriques risque: {e}")
            raise
    
    async def publish_alert(self, alert: Dict):
        """
        Publier une alerte en temps réel
        Prompt 12: Système d'alertes prédictives
        """
        topic = "risk-alerts-stream"
        
        try:
            alert_data = {
                "alert_id": alert.get("id"),
                "timestamp": datetime.now().isoformat(),
                "severity": alert.get("severity", "medium"),
                "type": alert.get("type"),
                "message": alert.get("message"),
                "metrics": alert.get("metrics", {}),
                "recommendations": alert.get("recommendations", [])
            }
            
            # Publier sur le topic d'alertes
            await self.producer.send_and_wait(topic, alert_data)
            
            # Si alerte critique, publier aussi sur topic prioritaire
            if alert.get("severity") == "critical":
                await self.producer.send_and_wait("critical-alerts", alert_data)
                
        except KafkaError as e:
            logger.error(f"Erreur publication alerte: {e}")
            raise
    
    async def subscribe_to_market_data(self, handler: Callable):
        """S'abonner au stream de données marché"""
        await self._create_consumer(
            "market-data-consumer",
            ["market-data-stream"],
            handler
        )
    
    async def subscribe_to_risk_metrics(self, handler: Callable):
        """S'abonner au stream de métriques de risque"""
        await self._create_consumer(
            "risk-metrics-consumer",
            ["risk-metrics-stream"],
            handler
        )
    
    async def subscribe_to_alerts(self, handler: Callable, severity_filter: Optional[List[str]] = None):
        """S'abonner au stream d'alertes"""
        topics = ["risk-alerts-stream"]
        if severity_filter and "critical" in severity_filter:
            topics.append("critical-alerts")
            
        await self._create_consumer(
            "alerts-consumer",
            topics,
            handler
        )
    
    async def _create_consumer(self, consumer_id: str, topics: List[str], handler: Callable):
        """Créer un consumer Kafka"""
        try:
            consumer = AIOKafkaConsumer(
                *topics,
                bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
                group_id=f"fintech-{consumer_id}",
                value_deserializer=lambda m: json.loads(m.decode()),
                auto_offset_reset='latest',
                enable_auto_commit=True
            )
            
            await consumer.start()
            self.consumers[consumer_id] = consumer
            self.handlers[consumer_id] = handler
            
            # Lancer la boucle de consommation
            asyncio.create_task(self._consume_messages(consumer_id))
            
            logger.info(f"Consumer {consumer_id} créé pour topics: {topics}")
            
        except Exception as e:
            logger.error(f"Erreur création consumer {consumer_id}: {e}")
            raise
    
    async def _consume_messages(self, consumer_id: str):
        """Boucle de consommation des messages"""
        consumer = self.consumers[consumer_id]
        handler = self.handlers[consumer_id]
        
        try:
            async for message in consumer:
                if not self.running:
                    break
                    
                try:
                    # Traiter le message
                    await handler(message.value)
                    
                except Exception as e:
                    logger.error(f"Erreur traitement message {consumer_id}: {e}")
                    
        except Exception as e:
            logger.error(f"Erreur consommation {consumer_id}: {e}")
            
    async def create_batch_pipeline(self, config: Dict):
        """
        Créer un pipeline de traitement batch
        Prompt 38: Ingestion batch & streaming
        """
        pipeline_id = config.get("pipeline_id")
        source_topic = config.get("source_topic")
        sink_topic = config.get("sink_topic")
        batch_size = config.get("batch_size", 1000)
        
        batch = []
        
        async def batch_handler(message):
            batch.append(message)
            
            if len(batch) >= batch_size:
                # Traiter le batch
                processed_data = await self._process_batch(batch, config)
                
                # Publier les résultats
                for item in processed_data:
                    await self.producer.send_and_wait(sink_topic, item)
                    
                batch.clear()
        
        # Créer consumer pour le pipeline
        await self._create_consumer(
            f"batch-pipeline-{pipeline_id}",
            [source_topic],
            batch_handler
        )
    
    async def _process_batch(self, batch: List[Dict], config: Dict) -> List[Dict]:
        """Traiter un batch de données"""
        # Convertir en DataFrame pour traitement
        df = pd.DataFrame(batch)
        
        # Appliquer les transformations configurées
        for transform in config.get("transformations", []):
            if transform["type"] == "aggregate":
                df = df.groupby(transform["group_by"]).agg(transform["aggregations"])
            elif transform["type"] == "filter":
                df = df.query(transform["condition"])
            elif transform["type"] == "calculate":
                df[transform["new_column"]] = eval(transform["formula"])
        
        return df.to_dict(orient="records")
    
    async def get_stream_statistics(self) -> Dict:
        """Obtenir les statistiques des streams"""
        stats = {
            "producer": {
                "running": self.running,
                "topics": []
            },
            "consumers": {}
        }
        
        # Stats des consumers
        for consumer_id, consumer in self.consumers.items():
            partitions = consumer.assignment()
            stats["consumers"][consumer_id] = {
                "topics": list(consumer.subscription()),
                "partitions": len(partitions),
                "position": {}
            }
            
            # Position dans chaque partition
            for partition in partitions:
                try:
                    position = await consumer.position(partition)
                    stats["consumers"][consumer_id]["position"][str(partition)] = position
                except:
                    pass
        
        return stats
    
    async def replay_stream(self, topic: str, start_time: datetime, end_time: datetime, handler: Callable):
        """
        Rejouer un stream entre deux dates
        Utile pour backtesting et analyse historique
        """
        # Créer un consumer temporaire
        replay_consumer = AIOKafkaConsumer(
            topic,
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            value_deserializer=lambda m: json.loads(m.decode()),
            auto_offset_reset='earliest',
            enable_auto_commit=False
        )
        
        try:
            await replay_consumer.start()
            
            # Parcourir les messages dans la période
            async for message in replay_consumer:
                msg_time = datetime.fromisoformat(message.value.get("timestamp"))
                
                if msg_time < start_time:
                    continue
                elif msg_time > end_time:
                    break
                    
                await handler(message.value)
                
        finally:
            await replay_consumer.stop()


# Instance globale du service
kafka_service = KafkaService()