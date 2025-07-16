# app/analytics_ml/data_engineering/data_lineage.py
"""
Module de Traçabilité des Données (Data Lineage)
Suivi complet du cycle de vie des données pour conformité et gouvernance
"""

import uuid
import json
import hashlib
from typing import Dict, List, Any, Optional, Set, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field, asdict
from enum import Enum
import networkx as nx
import pandas as pd
from sqlalchemy import create_engine, Column, String, DateTime, JSON, Text, Float, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import logging
from abc import ABC, abstractmethod
import yaml
import pickle

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Base pour SQLAlchemy
Base = declarative_base()

class DataOperation(Enum):
    """Types d'opérations sur les données"""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    TRANSFORM = "transform"
    AGGREGATE = "aggregate"
    FILTER = "filter"
    JOIN = "join"
    ANONYMIZE = "anonymize"
    VALIDATE = "validate"

class DataClassification(Enum):
    """Classification des données pour la sécurité"""
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"
    PII = "pii"  # Personally Identifiable Information
    PHI = "phi"  # Protected Health Information
    PCI = "pci"  # Payment Card Industry

class ComplianceFramework(Enum):
    """Frameworks de conformité"""
    GDPR = "gdpr"
    HIPAA = "hipaa"
    SOX = "sox"
    PCI_DSS = "pci_dss"
    BASEL_III = "basel_iii"
    MIFID_II = "mifid_ii"

@dataclass
class DataEntity:
    """Entité de données avec métadonnées complètes"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    type: str = "dataset"
    source_system: str = ""
    classification: DataClassification = DataClassification.INTERNAL
    schema: Dict[str, Any] = field(default_factory=dict)
    tags: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    created_by: str = ""
    row_count: Optional[int] = None
    size_bytes: Optional[int] = None
    checksum: Optional[str] = None
    quality_score: Optional[float] = None
    retention_days: Optional[int] = None
    compliance_frameworks: List[ComplianceFramework] = field(default_factory=list)
    custom_metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class DataTransformation:
    """Transformation appliquée aux données"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    operation: DataOperation = DataOperation.TRANSFORM
    input_entities: List[str] = field(default_factory=list)
    output_entities: List[str] = field(default_factory=list)
    transformation_logic: str = ""
    parameters: Dict[str, Any] = field(default_factory=dict)
    executed_at: datetime = field(default_factory=datetime.now)
    executed_by: str = ""
    execution_time_ms: Optional[int] = None
    success: bool = True
    error_message: Optional[str] = None
    affected_rows: Optional[int] = None
    data_quality_impact: Optional[Dict[str, float]] = None

@dataclass
class DataAccess:
    """Enregistrement d'accès aux données"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    entity_id: str = ""
    accessed_by: str = ""
    accessed_at: datetime = field(default_factory=datetime.now)
    access_type: DataOperation = DataOperation.READ
    purpose: str = ""
    ip_address: Optional[str] = None
    location: Optional[str] = None
    authorized: bool = True
    compliance_check: Dict[str, bool] = field(default_factory=dict)

class LineageGraph:
    """Graphe de lignage des données"""
    
    def __init__(self):
        self.graph = nx.DiGraph()
        self.entities: Dict[str, DataEntity] = {}
        self.transformations: Dict[str, DataTransformation] = {}
        self.access_logs: List[DataAccess] = []
        
    def add_entity(self, entity: DataEntity):
        """Ajoute une entité de données"""
        self.entities[entity.id] = entity
        self.graph.add_node(
            entity.id,
            type='entity',
            name=entity.name,
            classification=entity.classification.value,
            created_at=entity.created_at.isoformat()
        )
        logger.info(f"Entité ajoutée: {entity.name} ({entity.id})")
        
    def add_transformation(self, transformation: DataTransformation):
        """Ajoute une transformation"""
        self.transformations[transformation.id] = transformation
        
        # Ajouter le nœud de transformation
        self.graph.add_node(
            transformation.id,
            type='transformation',
            name=transformation.name,
            operation=transformation.operation.value,
            executed_at=transformation.executed_at.isoformat()
        )
        
        # Ajouter les liens
        for input_id in transformation.input_entities:
            self.graph.add_edge(input_id, transformation.id)
            
        for output_id in transformation.output_entities:
            self.graph.add_edge(transformation.id, output_id)
            
        logger.info(f"Transformation ajoutée: {transformation.name} ({transformation.id})")
        
    def log_access(self, access: DataAccess):
        """Enregistre un accès aux données"""
        self.access_logs.append(access)
        
        # Vérifier la conformité
        entity = self.entities.get(access.entity_id)
        if entity:
            access.compliance_check = self._check_compliance(entity, access)
            
        logger.info(f"Accès enregistré: {access.accessed_by} -> {access.entity_id}")
        
    def get_lineage(self, entity_id: str, direction: str = 'both') -> Dict[str, Any]:
        """Obtient le lignage complet d'une entité"""
        if entity_id not in self.graph:
            return {}
            
        lineage = {
            'entity': self.entities.get(entity_id),
            'upstream': [],
            'downstream': [],
            'transformations': []
        }
        
        if direction in ['upstream', 'both']:
            # Remonter la chaîne
            upstream_nodes = nx.ancestors(self.graph, entity_id)
            lineage['upstream'] = [
                self.entities.get(node_id) or self.transformations.get(node_id)
                for node_id in upstream_nodes
            ]
            
        if direction in ['downstream', 'both']:
            # Descendre la chaîne
            downstream_nodes = nx.descendants(self.graph, entity_id)
            lineage['downstream'] = [
                self.entities.get(node_id) or self.transformations.get(node_id)
                for node_id in downstream_nodes
            ]
            
        # Trouver toutes les transformations impliquées
        all_nodes = {entity_id}
        if direction == 'both':
            all_nodes.update(upstream_nodes)
            all_nodes.update(downstream_nodes)
            
        lineage['transformations'] = [
            trans for trans_id, trans in self.transformations.items()
            if any(node in all_nodes for node in trans.input_entities + trans.output_entities)
        ]
        
        return lineage
        
    def get_impact_analysis(self, entity_id: str) -> Dict[str, Any]:
        """Analyse d'impact si une entité change"""
        impact = {
            'direct_impact': [],
            'indirect_impact': [],
            'affected_systems': set(),
            'affected_users': set(),
            'compliance_risks': []
        }
        
        # Impact direct (entités immédiatement en aval)
        direct_descendants = list(self.graph.successors(entity_id))
        for desc_id in direct_descendants:
            if desc_id in self.entities:
                impact['direct_impact'].append(self.entities[desc_id])
                
        # Impact indirect (toute la chaîne en aval)
        all_descendants = nx.descendants(self.graph, entity_id)
        for desc_id in all_descendants:
            if desc_id in self.entities and desc_id not in direct_descendants:
                entity = self.entities[desc_id]
                impact['indirect_impact'].append(entity)
                impact['affected_systems'].add(entity.source_system)
                
        # Analyser les accès récents
        for access in self.access_logs:
            if access.entity_id in all_descendants or access.entity_id == entity_id:
                impact['affected_users'].add(access.accessed_by)
                
        # Risques de conformité
        entity = self.entities.get(entity_id)
        if entity:
            impact['compliance_risks'] = self._assess_compliance_risks(entity, impact)
            
        return impact
        
    def generate_compliance_report(self, 
                                 framework: ComplianceFramework,
                                 start_date: Optional[datetime] = None,
                                 end_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Génère un rapport de conformité"""
        if not start_date:
            start_date = datetime.now() - timedelta(days=30)
        if not end_date:
            end_date = datetime.now()
            
        report = {
            'framework': framework.value,
            'period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            },
            'entities_analyzed': 0,
            'compliant_entities': [],
            'non_compliant_entities': [],
            'data_flows': [],
            'access_violations': [],
            'recommendations': []
        }
        
        # Analyser chaque entité
        for entity_id, entity in self.entities.items():
            if framework in entity.compliance_frameworks:
                report['entities_analyzed'] += 1
                
                # Vérifier la conformité
                compliance_status = self._check_entity_compliance(entity, framework)
                
                if compliance_status['compliant']:
                    report['compliant_entities'].append({
                        'entity': entity.name,
                        'classification': entity.classification.value
                    })
                else:
                    report['non_compliant_entities'].append({
                        'entity': entity.name,
                        'issues': compliance_status['issues']
                    })
                    
        # Analyser les flux de données
        report['data_flows'] = self._analyze_data_flows(framework)
        
        # Vérifier les violations d'accès
        for access in self.access_logs:
            if start_date <= access.accessed_at <= end_date:
                if not access.authorized or False in access.compliance_check.values():
                    report['access_violations'].append({
                        'user': access.accessed_by,
                        'entity': self.entities.get(access.entity_id, {}).name,
                        'timestamp': access.accessed_at.isoformat(),
                        'reason': access.compliance_check
                    })
                    
        # Générer des recommandations
        report['recommendations'] = self._generate_compliance_recommendations(report)
        
        return report
        
    def visualize_lineage(self, entity_id: Optional[str] = None) -> Dict[str, Any]:
        """Prépare les données pour la visualisation du lignage"""
        if entity_id:
            # Sous-graphe centré sur une entité
            relevant_nodes = {entity_id}
            relevant_nodes.update(nx.ancestors(self.graph, entity_id))
            relevant_nodes.update(nx.descendants(self.graph, entity_id))
            subgraph = self.graph.subgraph(relevant_nodes)
        else:
            subgraph = self.graph
            
        # Convertir pour la visualisation
        nodes = []
        edges = []
        
        for node_id, attrs in subgraph.nodes(data=True):
            node_data = {
                'id': node_id,
                'label': attrs.get('name', 'Unknown'),
                'type': attrs.get('type', 'entity'),
                'group': attrs.get('classification', 'internal')
            }
            
            if node_id in self.entities:
                entity = self.entities[node_id]
                node_data['metadata'] = {
                    'created_at': entity.created_at.isoformat(),
                    'row_count': entity.row_count,
                    'quality_score': entity.quality_score
                }
                
            nodes.append(node_data)
            
        for source, target in subgraph.edges():
            edge_data = {
                'source': source,
                'target': target
            }
            
            # Ajouter des métadonnées sur la transformation si applicable
            for trans in self.transformations.values():
                if trans.id == source or trans.id == target:
                    edge_data['transformation'] = trans.operation.value
                    break
                    
            edges.append(edge_data)
            
        return {
            'nodes': nodes,
            'edges': edges,
            'stats': {
                'total_entities': len([n for n in nodes if n['type'] == 'entity']),
                'total_transformations': len([n for n in nodes if n['type'] == 'transformation']),
                'max_depth': nx.dag_longest_path_length(subgraph) if nx.is_directed_acyclic_graph(subgraph) else None
            }
        }
        
    # Méthodes privées
    def _check_compliance(self, entity: DataEntity, access: DataAccess) -> Dict[str, bool]:
        """Vérifie la conformité d'un accès"""
        checks = {}
        
        # GDPR
        if ComplianceFramework.GDPR in entity.compliance_frameworks:
            checks['gdpr_purpose'] = bool(access.purpose)
            checks['gdpr_consent'] = entity.classification != DataClassification.PII or access.authorized
            
        # HIPAA
        if ComplianceFramework.HIPAA in entity.compliance_frameworks:
            checks['hipaa_minimum_necessary'] = access.access_type == DataOperation.READ
            checks['hipaa_authorization'] = access.authorized
            
        # PCI-DSS
        if ComplianceFramework.PCI_DSS in entity.compliance_frameworks:
            checks['pci_encryption'] = entity.custom_metadata.get('encrypted', False)
            checks['pci_access_control'] = access.authorized
            
        return checks
        
    def _check_entity_compliance(self, 
                               entity: DataEntity, 
                               framework: ComplianceFramework) -> Dict[str, Any]:
        """Vérifie la conformité d'une entité"""
        result = {
            'compliant': True,
            'issues': []
        }
        
        if framework == ComplianceFramework.GDPR:
            # Vérifier la rétention des données
            if entity.classification == DataClassification.PII:
                if not entity.retention_days or entity.retention_days > 365:
                    result['compliant'] = False
                    result['issues'].append("Période de rétention PII trop longue")
                    
                # Vérifier l'anonymisation
                if not any(trans.operation == DataOperation.ANONYMIZE 
                          for trans in self.transformations.values()
                          if entity.id in trans.input_entities):
                    result['compliant'] = False
                    result['issues'].append("Pas d'anonymisation détectée pour les PII")
                    
        elif framework == ComplianceFramework.HIPAA:
            # Vérifier le chiffrement
            if entity.classification == DataClassification.PHI:
                if not entity.custom_metadata.get('encrypted', False):
                    result['compliant'] = False
                    result['issues'].append("PHI non chiffrées")
                    
                # Vérifier l'audit trail
                access_count = sum(1 for access in self.access_logs 
                                 if access.entity_id == entity.id)
                if access_count == 0:
                    result['compliant'] = False
                    result['issues'].append("Pas d'audit trail")
                    
        return result
        
    def _assess_compliance_risks(self, 
                               entity: DataEntity, 
                               impact: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Évalue les risques de conformité"""
        risks = []
        
        # Risque GDPR
        if entity.classification in [DataClassification.PII, DataClassification.CONFIDENTIAL]:
            affected_pii_count = sum(
                1 for e in impact['direct_impact'] + impact['indirect_impact']
                if self.entities.get(e.id, e).classification == DataClassification.PII
            )
            
            if affected_pii_count > 0:
                risks.append({
                    'framework': 'GDPR',
                    'severity': 'high',
                    'description': f"{affected_pii_count} entités PII affectées",
                    'mitigation': "Effectuer une analyse d'impact sur la protection des données (DPIA)"
                })
                
        # Risque HIPAA
        phi_entities = [
            e for e in impact['direct_impact'] + impact['indirect_impact']
            if self.entities.get(e.id, e).classification == DataClassification.PHI
        ]
        
        if phi_entities:
            risks.append({
                'framework': 'HIPAA',
                'severity': 'critical',
                'description': f"{len(phi_entities)} entités PHI affectées",
                'mitigation': "Notifier le Privacy Officer et documenter l'incident"
            })
            
        return risks
        
    def _analyze_data_flows(self, framework: ComplianceFramework) -> List[Dict[str, Any]]:
        """Analyse les flux de données pour un framework"""
        flows = []
        
        # Trouver tous les chemins entre sources et destinations sensibles
        sensitive_entities = [
            entity_id for entity_id, entity in self.entities.items()
            if framework in entity.compliance_frameworks
        ]
        
        for source_id in sensitive_entities:
            for target_id in sensitive_entities:
                if source_id != target_id:
                    try:
                        paths = list(nx.all_simple_paths(
                            self.graph, source_id, target_id, cutoff=5
                        ))
                        
                        for path in paths:
                            flow = {
                                'source': self.entities[source_id].name,
                                'target': self.entities[target_id].name,
                                'path_length': len(path),
                                'transformations': []
                            }
                            
                            # Identifier les transformations dans le chemin
                            for node_id in path:
                                if node_id in self.transformations:
                                    trans = self.transformations[node_id]
                                    flow['transformations'].append({
                                        'name': trans.name,
                                        'operation': trans.operation.value
                                    })
                                    
                            flows.append(flow)
                            
                    except nx.NetworkXNoPath:
                        continue
                        
        return flows
        
    def _generate_compliance_recommendations(self, report: Dict[str, Any]) -> List[str]:
        """Génère des recommandations de conformité"""
        recommendations = []
        
        # Recommandations basées sur les entités non conformes
        if report['non_compliant_entities']:
            recommendations.append(
                f"Remédier aux {len(report['non_compliant_entities'])} "
                f"problèmes de conformité identifiés en priorité"
            )
            
        # Recommandations sur les violations d'accès
        if report['access_violations']:
            recommendations.append(
                "Renforcer les contrôles d'accès et la formation "
                f"des utilisateurs ({len(report['access_violations'])} violations détectées)"
            )
            
        # Recommandations spécifiques au framework
        if report['framework'] == 'gdpr':
            recommendations.extend([
                "Implémenter un processus de suppression automatique des données après la période de rétention",
                "Mettre en place un registre des traitements de données personnelles",
                "Développer des procédures pour les demandes d'accès des personnes concernées"
            ])
        elif report['framework'] == 'hipaa':
            recommendations.extend([
                "Chiffrer toutes les données PHI au repos et en transit",
                "Implémenter un système d'audit trail complet",
                "Former le personnel sur les procédures de protection des données de santé"
            ])
            
        return recommendations

# Modèle de persistance SQLAlchemy
class LineageRecord(Base):
    """Modèle pour stocker le lignage en base de données"""
    __tablename__ = 'data_lineage'
    
    id = Column(String(36), primary_key=True)
    entity_type = Column(String(50))
    entity_name = Column(String(255))
    operation = Column(String(50))
    source_entities = Column(JSON)
    target_entities = Column(JSON)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.now)
    created_by = Column(String(255))
    
class LineageManager:
    """Gestionnaire de lignage avec persistance"""
    
    def __init__(self, connection_string: str):
        self.engine = create_engine(connection_string)
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.graph = LineageGraph()
        
    def track_entity(self, entity: DataEntity) -> str:
        """Enregistre une nouvelle entité"""
        self.graph.add_entity(entity)
        
        # Persister en base
        session = self.Session()
        try:
            record = LineageRecord(
                id=entity.id,
                entity_type='entity',
                entity_name=entity.name,
                metadata=asdict(entity)
            )
            session.add(record)
            session.commit()
            
            return entity.id
            
        finally:
            session.close()
            
    def track_transformation(self, transformation: DataTransformation) -> str:
        """Enregistre une transformation"""
        self.graph.add_transformation(transformation)
        
        # Persister en base
        session = self.Session()
        try:
            record = LineageRecord(
                id=transformation.id,
                entity_type='transformation',
                entity_name=transformation.name,
                operation=transformation.operation.value,
                source_entities=transformation.input_entities,
                target_entities=transformation.output_entities,
                metadata=asdict(transformation),
                created_at=transformation.executed_at,
                created_by=transformation.executed_by
            )
            session.add(record)
            session.commit()
            
            return transformation.id
            
        finally:
            session.close()
            
    def track_dataframe_operation(self,
                                df: pd.DataFrame,
                                operation_name: str,
                                operation_type: DataOperation,
                                input_entities: List[str] = None,
                                user: str = "system") -> DataEntity:
        """Méthode helper pour tracker les opérations DataFrame"""
        # Créer l'entité de sortie
        output_entity = DataEntity(
            name=f"{operation_name}_output",
            type="dataframe",
            source_system="pandas",
            created_by=user,
            row_count=len(df),
            size_bytes=df.memory_usage(deep=True).sum(),
            schema={col: str(dtype) for col, dtype in df.dtypes.items()},
            checksum=hashlib.md5(pd.util.hash_pandas_object(df).values).hexdigest()
        )
        
        # Enregistrer l'entité
        self.track_entity(output_entity)
        
        # Créer et enregistrer la transformation
        if input_entities:
            transformation = DataTransformation(
                name=operation_name,
                operation=operation_type,
                input_entities=input_entities,
                output_entities=[output_entity.id],
                executed_by=user,
                affected_rows=len(df)
            )
            self.track_transformation(transformation)
            
        return output_entity
        
    def load_from_database(self):
        """Charge le lignage depuis la base de données"""
        session = self.Session()
        try:
            records = session.query(LineageRecord).order_by(LineageRecord.created_at).all()
            
            for record in records:
                if record.entity_type == 'entity':
                    # Recréer l'entité
                    entity_data = record.metadata
                    entity = DataEntity(**{
                        k: v for k, v in entity_data.items()
                        if k in DataEntity.__dataclass_fields__
                    })
                    self.graph.add_entity(entity)
                    
                elif record.entity_type == 'transformation':
                    # Recréer la transformation
                    trans_data = record.metadata
                    transformation = DataTransformation(**{
                        k: v for k, v in trans_data.items()
                        if k in DataTransformation.__dataclass_fields__
                    })
                    self.graph.add_transformation(transformation)
                    
        finally:
            session.close()

# Décorateur pour auto-tracking
def track_lineage(lineage_manager: LineageManager, 
                 operation: DataOperation = DataOperation.TRANSFORM):
    """Décorateur pour tracker automatiquement le lignage des fonctions"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Capturer les inputs
            input_entities = kwargs.get('input_entities', [])
            user = kwargs.get('user', 'system')
            
            # Exécuter la fonction
            start_time = datetime.now()
            try:
                result = func(*args, **kwargs)
                success = True
                error_msg = None
            except Exception as e:
                success = False
                error_msg = str(e)
                raise
            finally:
                execution_time = (datetime.now() - start_time).total_seconds() * 1000
                
                # Tracker le résultat
                if success and isinstance(result, pd.DataFrame):
                    output_entity = lineage_manager.track_dataframe_operation(
                        result,
                        func.__name__,
                        operation,
                        input_entities,
                        user
                    )
                    
                    # Ajouter l'ID de l'entité au résultat
                    result.attrs['lineage_id'] = output_entity.id
                    
            return result
            
        return wrapper
    return decorator

# Fonctions helpers pour utilisation facile
def create_lineage_manager(db_url: str = "sqlite:///data_lineage.db") -> LineageManager:
    """Crée un gestionnaire de lignage"""
    return LineageManager(db_url)

def quick_track(df: pd.DataFrame, 
               name: str,
               manager: LineageManager,
               classification: DataClassification = DataClassification.INTERNAL) -> str:
    """Tracking rapide d'un DataFrame"""
    entity = DataEntity(
        name=name,
        type="dataframe",
        classification=classification,
        row_count=len(df),
        schema={col: str(dtype) for col, dtype in df.dtypes.items()}
    )
    
    return manager.track_entity(entity)