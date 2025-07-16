# app/analytics_ml/data_engineering/data_pipeline.py
"""
Module de Pipeline de Traitement de Données Automatisé
Architecture modulaire et scalable pour le traitement de données sectorielles
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Callable, Optional, Union, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
import asyncio
import logging
from enum import Enum
import json
import hashlib
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import yaml
from abc import ABC, abstractmethod
import pickle
import redis
from sqlalchemy import create_engine
import boto3

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PipelineStatus(Enum):
    """États possibles du pipeline"""
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    FAILED = "failed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class DataFormat(Enum):
    """Formats de données supportés"""
    CSV = "csv"
    JSON = "json"
    PARQUET = "parquet"
    EXCEL = "excel"
    SQL = "sql"
    API = "api"
    STREAM = "stream"

@dataclass
class PipelineConfig:
    """Configuration du pipeline"""
    name: str
    sector: str
    version: str = "1.0"
    parallel_processing: bool = True
    max_workers: int = 4
    batch_size: int = 10000
    cache_enabled: bool = True
    monitoring_enabled: bool = True
    error_handling: str = "retry"  # 'retry', 'skip', 'fail'
    retry_attempts: int = 3
    checkpoint_enabled: bool = True
    data_validation_enabled: bool = True

@dataclass
class DataSource:
    """Source de données"""
    name: str
    format: DataFormat
    location: str
    credentials: Optional[Dict[str, Any]] = None
    schema: Optional[Dict[str, Any]] = None
    refresh_interval: Optional[timedelta] = None
    filters: Optional[Dict[str, Any]] = None

@dataclass
class TransformationStep:
    """Étape de transformation"""
    name: str
    function: Callable
    params: Dict[str, Any] = field(default_factory=dict)
    input_validation: Optional[Callable] = None
    output_validation: Optional[Callable] = None
    sector_specific: bool = False
    order: int = 0

@dataclass
class PipelineMetrics:
    """Métriques du pipeline"""
    start_time: datetime
    end_time: Optional[datetime] = None
    records_processed: int = 0
    records_failed: int = 0
    processing_time: float = 0
    steps_completed: List[str] = field(default_factory=list)
    errors: List[Dict[str, Any]] = field(default_factory=list)
    data_quality_score: float = 100.0

class DataPipeline:
    """
    Pipeline de traitement de données principal
    """
    
    def __init__(self, config: PipelineConfig):
        self.config = config
        self.status = PipelineStatus.IDLE
        self.sources: List[DataSource] = []
        self.transformations: List[TransformationStep] = []
        self.sinks: List[Dict[str, Any]] = []
        self.metrics = None
        self.cache = self._setup_cache() if config.cache_enabled else None
        self.checkpoints = {}
        self.executor = self._setup_executor()
        
    def add_source(self, source: DataSource):
        """Ajoute une source de données"""
        self.sources.append(source)
        logger.info(f"Source ajoutée: {source.name}")
        
    def add_transformation(self, transformation: TransformationStep):
        """Ajoute une transformation"""
        self.transformations.append(transformation)
        self.transformations.sort(key=lambda x: x.order)
        logger.info(f"Transformation ajoutée: {transformation.name}")
        
    def add_sink(self, sink: Dict[str, Any]):
        """Ajoute une destination de données"""
        self.sinks.append(sink)
        logger.info(f"Sink ajouté: {sink['name']}")
        
    async def run(self) -> PipelineMetrics:
        """Exécute le pipeline de manière asynchrone"""
        try:
            self.status = PipelineStatus.RUNNING
            self.metrics = PipelineMetrics(start_time=datetime.now())
            
            # 1. Extraction des données
            data = await self._extract_data()
            
            # 2. Validation initiale
            if self.config.data_validation_enabled:
                data = await self._validate_data(data, stage='input')
            
            # 3. Transformations
            data = await self._transform_data(data)
            
            # 4. Validation finale
            if self.config.data_validation_enabled:
                data = await self._validate_data(data, stage='output')
            
            # 5. Chargement des données
            await self._load_data(data)
            
            # Finalisation
            self.status = PipelineStatus.COMPLETED
            self.metrics.end_time = datetime.now()
            self.metrics.processing_time = (
                self.metrics.end_time - self.metrics.start_time
            ).total_seconds()
            
            logger.info(f"Pipeline terminé avec succès: {self.metrics.records_processed} enregistrements traités")
            
            return self.metrics
            
        except Exception as e:
            self.status = PipelineStatus.FAILED
            self.metrics.errors.append({
                'timestamp': datetime.now(),
                'error': str(e),
                'stage': 'pipeline_execution'
            })
            logger.error(f"Erreur dans le pipeline: {e}")
            raise
            
    async def _extract_data(self) -> pd.DataFrame:
        """Extraction des données depuis les sources"""
        logger.info("Début de l'extraction des données")
        
        all_data = []
        
        for source in self.sources:
            try:
                # Vérifier le cache
                if self.cache and self._is_cache_valid(source):
                    data = self._get_from_cache(source)
                    logger.info(f"Données récupérées du cache pour {source.name}")
                else:
                    # Extraire selon le format
                    data = await self._extract_from_source(source)
                    
                    # Mettre en cache
                    if self.cache:
                        self._save_to_cache(source, data)
                
                all_data.append(data)
                
            except Exception as e:
                if self.config.error_handling == 'fail':
                    raise
                elif self.config.error_handling == 'skip':
                    logger.warning(f"Source {source.name} ignorée: {e}")
                    continue
                else:  # retry
                    data = await self._retry_extraction(source)
                    if data is not None:
                        all_data.append(data)
        
        # Combiner les données
        if len(all_data) > 1:
            combined_data = pd.concat(all_data, ignore_index=True)
        else:
            combined_data = all_data[0] if all_data else pd.DataFrame()
        
        self.metrics.records_processed = len(combined_data)
        logger.info(f"Extraction terminée: {len(combined_data)} enregistrements")
        
        return combined_data
    
    async def _extract_from_source(self, source: DataSource) -> pd.DataFrame:
        """Extrait les données d'une source spécifique"""
        if source.format == DataFormat.CSV:
            return pd.read_csv(source.location)
            
        elif source.format == DataFormat.JSON:
            return pd.read_json(source.location)
            
        elif source.format == DataFormat.PARQUET:
            return pd.read_parquet(source.location)
            
        elif source.format == DataFormat.EXCEL:
            return pd.read_excel(source.location)
            
        elif source.format == DataFormat.SQL:
            engine = create_engine(source.location)
            query = source.filters.get('query', 'SELECT * FROM table')
            return pd.read_sql(query, engine)
            
        elif source.format == DataFormat.API:
            return await self._extract_from_api(source)
            
        elif source.format == DataFormat.STREAM:
            return await self._extract_from_stream(source)
            
        else:
            raise ValueError(f"Format non supporté: {source.format}")
    
    async def _transform_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Applique les transformations"""
        logger.info("Début des transformations")
        
        for transformation in self.transformations:
            try:
                # Checkpoint si activé
                if self.config.checkpoint_enabled:
                    self._save_checkpoint(transformation.name, data)
                
                # Validation d'entrée
                if transformation.input_validation:
                    if not transformation.input_validation(data):
                        raise ValueError(f"Validation d'entrée échouée pour {transformation.name}")
                
                # Application de la transformation
                if self.config.parallel_processing and len(data) > self.config.batch_size:
                    data = await self._parallel_transform(data, transformation)
                else:
                    data = transformation.function(data, **transformation.params)
                
                # Validation de sortie
                if transformation.output_validation:
                    if not transformation.output_validation(data):
                        raise ValueError(f"Validation de sortie échouée pour {transformation.name}")
                
                self.metrics.steps_completed.append(transformation.name)
                logger.info(f"Transformation {transformation.name} terminée")
                
            except Exception as e:
                self.metrics.errors.append({
                    'timestamp': datetime.now(),
                    'error': str(e),
                    'transformation': transformation.name
                })
                
                if self.config.error_handling == 'fail':
                    raise
                elif self.config.error_handling == 'skip':
                    logger.warning(f"Transformation {transformation.name} ignorée: {e}")
                    continue
                else:  # retry
                    data = await self._retry_transformation(data, transformation)
        
        return data
    
    async def _parallel_transform(self, 
                                data: pd.DataFrame, 
                                transformation: TransformationStep) -> pd.DataFrame:
        """Transformation parallèle pour grandes données"""
        chunks = np.array_split(data, self.config.max_workers)
        
        loop = asyncio.get_event_loop()
        futures = []
        
        for chunk in chunks:
            future = loop.run_in_executor(
                self.executor,
                transformation.function,
                chunk,
                transformation.params
            )
            futures.append(future)
        
        results = await asyncio.gather(*futures)
        return pd.concat(results, ignore_index=True)
    
    async def _validate_data(self, data: pd.DataFrame, stage: str) -> pd.DataFrame:
        """Validation des données"""
        logger.info(f"Validation des données - {stage}")
        
        validation_rules = self._get_validation_rules(stage)
        quality_issues = []
        
        for rule in validation_rules:
            try:
                result = rule['function'](data)
                if not result['passed']:
                    quality_issues.append({
                        'rule': rule['name'],
                        'severity': rule['severity'],
                        'message': result['message'],
                        'affected_records': result.get('affected_records', 0)
                    })
                    
                    if rule['severity'] == 'critical':
                        raise ValueError(f"Validation critique échouée: {rule['name']}")
                        
            except Exception as e:
                logger.error(f"Erreur de validation {rule['name']}: {e}")
                quality_issues.append({
                    'rule': rule['name'],
                    'severity': 'error',
                    'message': str(e)
                })
        
        # Calculer le score de qualité
        if quality_issues:
            critical_issues = sum(1 for i in quality_issues if i['severity'] == 'critical')
            major_issues = sum(1 for i in quality_issues if i['severity'] == 'major')
            minor_issues = sum(1 for i in quality_issues if i['severity'] == 'minor')
            
            self.metrics.data_quality_score = max(
                0,
                100 - (critical_issues * 30 + major_issues * 10 + minor_issues * 3)
            )
        
        return data
    
    async def _load_data(self, data: pd.DataFrame):
        """Charge les données vers les destinations"""
        logger.info("Début du chargement des données")
        
        for sink in self.sinks:
            try:
                if sink['type'] == 'database':
                    await self._load_to_database(data, sink)
                elif sink['type'] == 'file':
                    await self._load_to_file(data, sink)
                elif sink['type'] == 'api':
                    await self._load_to_api(data, sink)
                elif sink['type'] == 'stream':
                    await self._load_to_stream(data, sink)
                    
                logger.info(f"Données chargées vers {sink['name']}")
                
            except Exception as e:
                self.metrics.errors.append({
                    'timestamp': datetime.now(),
                    'error': str(e),
                    'sink': sink['name']
                })
                
                if self.config.error_handling == 'fail':
                    raise
                else:
                    logger.error(f"Erreur de chargement vers {sink['name']}: {e}")
    
    # Méthodes sectorielles
    def apply_sector_rules(self):
        """Applique les règles spécifiques au secteur"""
        sector_transformations = {
            'banque': [
                TransformationStep(
                    name='anonymize_pii',
                    function=self._anonymize_banking_data,
                    sector_specific=True,
                    order=1
                ),
                TransformationStep(
                    name='calculate_risk_metrics',
                    function=self._calculate_banking_metrics,
                    sector_specific=True,
                    order=10
                )
            ],
            'sante': [
                TransformationStep(
                    name='hipaa_compliance',
                    function=self._ensure_hipaa_compliance,
                    sector_specific=True,
                    order=1
                ),
                TransformationStep(
                    name='clinical_data_standardization',
                    function=self._standardize_clinical_data,
                    sector_specific=True,
                    order=5
                )
            ],
            'retail': [
                TransformationStep(
                    name='customer_segmentation',
                    function=self._segment_customers,
                    sector_specific=True,
                    order=10
                ),
                TransformationStep(
                    name='inventory_optimization',
                    function=self._optimize_inventory,
                    sector_specific=True,
                    order=15
                )
            ]
        }
        
        if self.config.sector in sector_transformations:
            for transformation in sector_transformations[self.config.sector]:
                self.add_transformation(transformation)
    
    # Méthodes utilitaires
    def _setup_cache(self):
        """Configure le système de cache"""
        try:
            return redis.Redis(host='localhost', port=6379, db=0)
        except:
            logger.warning("Redis non disponible, utilisation du cache mémoire")
            return {}
    
    def _setup_executor(self):
        """Configure l'exécuteur pour le traitement parallèle"""
        if self.config.parallel_processing:
            return ProcessPoolExecutor(max_workers=self.config.max_workers)
        return None
    
    def _get_validation_rules(self, stage: str) -> List[Dict[str, Any]]:
        """Retourne les règles de validation pour une étape"""
        base_rules = [
            {
                'name': 'not_empty',
                'function': lambda df: {
                    'passed': len(df) > 0,
                    'message': 'Dataset vide'
                },
                'severity': 'critical'
            },
            {
                'name': 'no_duplicates',
                'function': lambda df: {
                    'passed': df.duplicated().sum() == 0,
                    'message': f'{df.duplicated().sum()} doublons détectés',
                    'affected_records': df.duplicated().sum()
                },
                'severity': 'major'
            }
        ]
        
        # Ajouter des règles sectorielles
        sector_rules = self._get_sector_validation_rules(stage)
        
        return base_rules + sector_rules
    
    def _get_sector_validation_rules(self, stage: str) -> List[Dict[str, Any]]:
        """Règles de validation spécifiques au secteur"""
        sector_rules = {
            'banque': [
                {
                    'name': 'valid_account_numbers',
                    'function': self._validate_account_numbers,
                    'severity': 'critical'
                },
                {
                    'name': 'transaction_consistency',
                    'function': self._validate_transaction_consistency,
                    'severity': 'major'
                }
            ],
            'sante': [
                {
                    'name': 'patient_id_format',
                    'function': self._validate_patient_ids,
                    'severity': 'critical'
                },
                {
                    'name': 'medical_code_validity',
                    'function': self._validate_medical_codes,
                    'severity': 'major'
                }
            ]
        }
        
        return sector_rules.get(self.config.sector, [])
    
    def _save_checkpoint(self, name: str, data: pd.DataFrame):
        """Sauvegarde un checkpoint"""
        checkpoint_path = f"checkpoints/{self.config.name}_{name}_{datetime.now().isoformat()}.pkl"
        with open(checkpoint_path, 'wb') as f:
            pickle.dump(data, f)
        self.checkpoints[name] = checkpoint_path
    
    def restore_from_checkpoint(self, checkpoint_name: str) -> pd.DataFrame:
        """Restaure depuis un checkpoint"""
        if checkpoint_name in self.checkpoints:
            with open(self.checkpoints[checkpoint_name], 'rb') as f:
                return pickle.load(f)
        raise ValueError(f"Checkpoint {checkpoint_name} non trouvé")
    
    # Transformations sectorielles (exemples)
    def _anonymize_banking_data(self, df: pd.DataFrame, **params) -> pd.DataFrame:
        """Anonymisation des données bancaires"""
        # Masquer les numéros de compte
        if 'account_number' in df.columns:
            df['account_number'] = df['account_number'].apply(
                lambda x: f"****{str(x)[-4:]}" if pd.notna(x) else x
            )
        
        # Hasher les identifiants clients
        if 'customer_id' in df.columns:
            df['customer_id'] = df['customer_id'].apply(
                lambda x: hashlib.sha256(str(x).encode()).hexdigest()[:12] if pd.notna(x) else x
            )
        
        return df
    
    def _calculate_banking_metrics(self, df: pd.DataFrame, **params) -> pd.DataFrame:
        """Calcul des métriques bancaires"""
        # Exemple: calcul du ratio de créances douteuses
        if 'loan_amount' in df.columns and 'loan_status' in df.columns:
            npl_mask = df['loan_status'].isin(['default', 'overdue'])
            df['is_npl'] = npl_mask
            
        return df
    
    def _ensure_hipaa_compliance(self, df: pd.DataFrame, **params) -> pd.DataFrame:
        """Assure la conformité HIPAA"""
        # Suppression des identifiants directs
        phi_columns = ['patient_name', 'ssn', 'address', 'phone', 'email']
        for col in phi_columns:
            if col in df.columns:
                df = df.drop(columns=[col])
        
        # Généralisation des dates
        if 'birth_date' in df.columns:
            df['age_group'] = pd.cut(
                (datetime.now() - pd.to_datetime(df['birth_date'])).dt.days / 365,
                bins=[0, 18, 30, 50, 70, 100],
                labels=['<18', '18-30', '30-50', '50-70', '70+']
            )
            df = df.drop(columns=['birth_date'])
        
        return df

# Builder pour création facile de pipelines
class PipelineBuilder:
    """Builder pattern pour créer des pipelines"""
    
    def __init__(self, name: str, sector: str):
        self.config = PipelineConfig(name=name, sector=sector)
        self.pipeline = DataPipeline(self.config)
        
    def with_source(self, source: DataSource) -> 'PipelineBuilder':
        self.pipeline.add_source(source)
        return self
        
    def with_transformation(self, transformation: TransformationStep) -> 'PipelineBuilder':
        self.pipeline.add_transformation(transformation)
        return self
        
    def with_sink(self, sink: Dict[str, Any]) -> 'PipelineBuilder':
        self.pipeline.add_sink(sink)
        return self
        
    def with_parallel_processing(self, workers: int = 4) -> 'PipelineBuilder':
        self.config.parallel_processing = True
        self.config.max_workers = workers
        return self
        
    def with_monitoring(self) -> 'PipelineBuilder':
        self.config.monitoring_enabled = True
        return self
        
    def build(self) -> DataPipeline:
        # Appliquer les règles sectorielles
        self.pipeline.apply_sector_rules()
        return self.pipeline

# Fonction helper pour créer un pipeline rapidement
def create_sector_pipeline(sector: str, 
                          source_config: Dict[str, Any],
                          destination_config: Dict[str, Any]) -> DataPipeline:
    """
    Crée un pipeline préconfiguré pour un secteur
    
    Args:
        sector: Secteur d'activité
        source_config: Configuration de la source
        destination_config: Configuration de la destination
    
    Returns:
        Pipeline configuré
    """
    # Créer la source
    source = DataSource(
        name=source_config['name'],
        format=DataFormat(source_config['format']),
        location=source_config['location'],
        credentials=source_config.get('credentials'),
        schema=source_config.get('schema')
    )
    
    # Créer le pipeline
    builder = PipelineBuilder(f"{sector}_pipeline", sector)
    
    pipeline = (
        builder
        .with_source(source)
        .with_sink(destination_config)
        .with_parallel_processing()
        .with_monitoring()
        .build()
    )
    
    return pipeline