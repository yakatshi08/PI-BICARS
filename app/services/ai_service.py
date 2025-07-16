"""
Service IA pour PI BICARS Co-Pilot
Intelligence spécialisée Finance & Assurance
"""

from typing import Dict, List, Any, Optional, Tuple
import re
from datetime import datetime
import json
from enum import Enum

class IntentType(Enum):
    """Types d'intentions détectées"""
    CALCULATE_RATIO = "calculate_ratio"
    GENERATE_REPORT = "generate_report"
    ANALYZE_TREND = "analyze_trend"
    EXPLAIN_METRIC = "explain_metric"
    COMPARE_PERIODS = "compare_periods"
    PREDICT_VALUE = "predict_value"
    DETECT_ANOMALY = "detect_anomaly"
    CREATE_DASHBOARD = "create_dashboard"
    UNKNOWN = "unknown"

class SectorContext(Enum):
    """Contexte sectoriel"""
    BANKING = "banking"
    INSURANCE = "insurance"
    MIXED = "mixed"

class FinanceAIService:
    """Service IA spécialisé Finance & Assurance"""
    
    def __init__(self):
        # Patterns NLP pour la finance
        self.banking_patterns = {
            'cet1': ['cet1', 'tier 1', 'capital', 'fonds propres'],
            'lcr': ['lcr', 'liquidité', 'liquidity coverage'],
            'nsfr': ['nsfr', 'financement stable'],
            'npl': ['npl', 'créances douteuses', 'non performing'],
            'roe': ['roe', 'rentabilité', 'return on equity'],
            'car': ['car', 'ratio de capital', 'capital adequacy']
        }
        
        # Patterns NLP pour l'assurance
        self.insurance_patterns = {
            'scr': ['scr', 'solvency capital', 'capital de solvabilité'],
            'mcr': ['mcr', 'minimum capital', 'capital minimum'],
            'combined_ratio': ['combined', 'ratio combiné', 'loss expense'],
            'loss_ratio': ['loss ratio', 'sinistralité', 'ratio de sinistres'],
            'expense_ratio': ['expense', 'frais', 'coûts'],
            'premium': ['prime', 'premium', 'cotisation']
        }
        
        # Patterns d'intentions CORRIGÉS
        self.intent_patterns = {
            IntentType.CALCULATE_RATIO: [
                'calcul', 'calculate', 'compute', 'quel est mon', "what's my",
                'montant', 'valeur', 'ratio', 'taux', 'position'
            ],
            IntentType.GENERATE_REPORT: [
                'rapport', 'report', 'génère un rapport', 'generate report', 
                'crée un rapport', 'create report', 'prépare', 'prepare', 'document'
            ],
            IntentType.CREATE_DASHBOARD: [
                'dashboard', 'tableau de bord', 'crée un dashboard', 
                'configure un dashboard', 'visualise', 'affiche',
                'display', 'montre', 'show', 'graphique', 'chart'
            ],
            IntentType.EXPLAIN_METRIC: [
                'explique', 'explain', 'qu\'est-ce que', 'what is',
                'signifie', 'means', 'définition', 'pourquoi', 'why',
                'comment', 'how', 'comprendre', 'understand'
            ],
            IntentType.ANALYZE_TREND: [
                'tendance', 'trend', 'évolution', 'progression',
                'analyse', 'analyze', 'historique', 'variation'
            ],
            IntentType.PREDICT_VALUE: [
                'prédis', 'predict', 'prévision', 'forecast', 'futur',
                'future', 'projection', 'estimé', 'estimate'
            ],
            IntentType.DETECT_ANOMALY: [
                'anomalie', 'anomaly', 'anormal', 'unusual', 'bizarre',
                'strange', 'problème', 'problem', 'alerte', 'alert'
            ]
        }
        
        # Base de connaissances métier
        self.knowledge_base = {
            'cet1': {
                'name': 'CET1 Ratio',
                'description': 'Common Equity Tier 1 - Mesure la solidité financière d\'une banque. C\'est le ratio de capital de la plus haute qualité.',
                'threshold': 10.5,
                'unit': '%',
                'sector': 'banking',
                'regulation': 'Bâle III',
                'formula': 'Fonds propres de base / Actifs pondérés par le risque'
            },
            'scr': {
                'name': 'SCR Ratio',
                'description': 'Solvency Capital Requirement - Capital requis pour faire face aux risques sur un horizon d\'un an avec une probabilité de 99.5%',
                'threshold': 100,
                'unit': '%',
                'sector': 'insurance',
                'regulation': 'Solvency II',
                'formula': 'Fonds propres éligibles / Capital de solvabilité requis'
            },
            'lcr': {
                'name': 'Liquidity Coverage Ratio',
                'description': 'Ratio de liquidité à court terme mesurant la capacité à faire face aux sorties de trésorerie sur 30 jours',
                'threshold': 100,
                'unit': '%',
                'sector': 'banking',
                'regulation': 'Bâle III'
            },
            'mcr': {
                'name': 'MCR Ratio',
                'description': 'Minimum Capital Requirement - Niveau minimum de capital en dessous duquel l\'intervention du régulateur est automatique',
                'threshold': 100,
                'unit': '%',
                'sector': 'insurance',
                'regulation': 'Solvency II'
            },
            'combined_ratio': {
                'name': 'Combined Ratio',
                'description': 'Ratio combiné des coûts et sinistres - Mesure la rentabilité technique de l\'assureur',
                'threshold': 100,
                'unit': '%',
                'sector': 'insurance',
                'formula': 'Loss Ratio + Expense Ratio'
            }
        }
    
    async def process_query(self, query: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Traite une requête en langage naturel
        
        Args:
            query: Question de l'utilisateur
            context: Contexte additionnel (secteur, données disponibles, etc.)
            
        Returns:
            Réponse structurée avec action et données
        """
        # Normaliser la requête
        query_lower = query.lower().strip()
        
        # Détecter l'intention
        intent = self._detect_intent(query_lower)
        
        # Détecter le contexte sectoriel
        sector = self._detect_sector(query_lower, context)
        
        # Extraire les entités (ratios, périodes, etc.)
        entities = self._extract_entities(query_lower, sector)
        entities['original_query'] = query_lower  # Ajouter la requête originale
        
        # Générer la réponse selon l'intention
        response = await self._generate_response(intent, entities, sector, context)
        
        # Ajouter des suggestions contextuelles
        suggestions = self._generate_suggestions(intent, sector, entities)
        
        return {
            'query': query,
            'intent': intent.value,
            'sector': sector.value,
            'entities': entities,
            'response': response,
            'suggestions': suggestions,
            'timestamp': datetime.now().isoformat()
        }
    
    def _detect_intent(self, query: str) -> IntentType:
        """Détecte l'intention de la requête"""
        scores = {}
        
        for intent_type, patterns in self.intent_patterns.items():
            score = sum(1 for pattern in patterns if pattern in query)
            if score > 0:
                scores[intent_type] = score
        
        if scores:
            return max(scores.items(), key=lambda x: x[1])[0]
        
        return IntentType.UNKNOWN
    
    def _detect_sector(self, query: str, context: Optional[Dict]) -> SectorContext:
        """Détecte le contexte sectoriel"""
        # Si le contexte fournit déjà le secteur
        if context and 'sector' in context:
            return SectorContext(context['sector'])
        
        # Sinon, détecter depuis la requête
        banking_score = sum(1 for patterns in self.banking_patterns.values() 
                          for pattern in patterns if pattern in query)
        insurance_score = sum(1 for patterns in self.insurance_patterns.values() 
                            for pattern in patterns if pattern in query)
        
        if banking_score > insurance_score:
            return SectorContext.BANKING
        elif insurance_score > banking_score:
            return SectorContext.INSURANCE
        else:
            return SectorContext.MIXED
    
    def _extract_entities(self, query: str, sector: SectorContext) -> Dict[str, Any]:
        """Extrait les entités de la requête - CORRIGÉ"""
        entities = {
            'metrics': [],
            'dates': [],
            'values': [],
            'comparisons': [],
            'original_query': query  # AJOUT pour la correction
        }
        
        # Extraction des métriques selon le secteur
        if sector in [SectorContext.BANKING, SectorContext.MIXED]:
            for metric, patterns in self.banking_patterns.items():
                if any(pattern in query for pattern in patterns):
                    entities['metrics'].append(metric)
        
        if sector in [SectorContext.INSURANCE, SectorContext.MIXED]:
            for metric, patterns in self.insurance_patterns.items():
                if any(pattern in query for pattern in patterns):
                    entities['metrics'].append(metric)
        
        # Extraction des dates (patterns simplifiés)
        date_patterns = [
            r'\b(\d{4})\b',  # Années
            r'\b(q[1-4])\b',  # Trimestres
            r'\b(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\b',
            r'\b(january|february|march|april|may|june|july|august|september|october|november|december)\b'
        ]
        
        for pattern in date_patterns:
            matches = re.findall(pattern, query, re.IGNORECASE)
            entities['dates'].extend(matches)
        
        # Extraction des valeurs numériques
        number_pattern = r'\b(\d+(?:\.\d+)?)\s*(%|€|m|k)?\b'
        matches = re.findall(number_pattern, query, re.IGNORECASE)
        entities['values'] = [(float(num), unit) for num, unit in matches]
        
        # Extraction des comparaisons
        if any(word in query for word in ['vs', 'versus', 'contre', 'compare', 'différence']):
            entities['comparisons'].append('comparison_requested')
        
        return entities
    
    async def _generate_response(self, intent: IntentType, entities: Dict, 
                               sector: SectorContext, context: Optional[Dict]) -> Dict[str, Any]:
        """Génère la réponse selon l'intention"""
        
        if intent == IntentType.CALCULATE_RATIO:
            return await self._calculate_ratio_response(entities, sector, context)
        
        elif intent == IntentType.GENERATE_REPORT:
            return await self._generate_report_response(entities, sector, context)
        
        elif intent == IntentType.ANALYZE_TREND:
            return await self._analyze_trend_response(entities, sector, context)
        
        elif intent == IntentType.EXPLAIN_METRIC:
            return await self._explain_metric_response(entities, sector)
        
        elif intent == IntentType.CREATE_DASHBOARD:
            return await self._create_dashboard_response(entities, sector, context)
        
        elif intent == IntentType.DETECT_ANOMALY:
            return await self._detect_anomaly_response(entities, sector, context)
        
        else:
            return {
                'type': 'clarification',
                'message': 'Je n\'ai pas bien compris votre demande. Pouvez-vous reformuler ?',
                'examples': self._get_example_queries(sector)
            }
    
    async def _calculate_ratio_response(self, entities: Dict, sector: SectorContext, 
                                      context: Optional[Dict]) -> Dict[str, Any]:
        """Génère une réponse pour le calcul de ratio"""
        if not entities['metrics']:
            return {
                'type': 'error',
                'message': 'Quel ratio souhaitez-vous calculer ?',
                'available_ratios': list(self.banking_patterns.keys()) if sector == SectorContext.BANKING 
                                  else list(self.insurance_patterns.keys())
            }
        
        metric = entities['metrics'][0]
        metric_info = self.knowledge_base.get(metric, {})
        
        # Simulation d'un calcul (en production, appel aux vraies données)
        calculated_value = 14.8 if metric == 'cet1' else 168 if metric == 'scr' else 100
        
        return {
            'type': 'calculation',
            'metric': metric,
            'value': calculated_value,
            'unit': metric_info.get('unit', '%'),
            'threshold': metric_info.get('threshold'),
            'status': 'healthy' if calculated_value > metric_info.get('threshold', 0) else 'warning',
            'explanation': f"Le {metric_info.get('name', metric)} est de {calculated_value}%, " + 
                          f"{'au-dessus' if calculated_value > metric_info.get('threshold', 0) else 'en-dessous'} " +
                          f"du seuil réglementaire de {metric_info.get('threshold', 0)}%",
            'regulation': metric_info.get('regulation', ''),
            'visualization': {
                'type': 'gauge',
                'data': {
                    'value': calculated_value,
                    'max': 200,
                    'threshold': metric_info.get('threshold', 100)
                }
            }
        }
    
    async def _generate_report_response(self, entities: Dict, sector: SectorContext, 
                                      context: Optional[Dict]) -> Dict[str, Any]:
        """Génère une réponse pour la création de rapport"""
        report_type = 'regulatory' if any(word in str(entities) for word in ['corep', 'finrep', 'qrt']) else 'executive'
        
        return {
            'type': 'report_generation',
            'report_type': report_type,
            'sector': sector.value,
            'sections': [
                'Executive Summary',
                'Key Performance Indicators',
                'Risk Analysis',
                'Regulatory Compliance',
                'Recommendations'
            ],
            'status': 'ready_to_generate',
            'estimated_time': '2 minutes',
            'actions': [
                {
                    'label': 'Générer le rapport',
                    'action': 'generate_report',
                    'params': {
                        'type': report_type,
                        'sector': sector.value,
                        'period': entities.get('dates', ['current'])[0] if entities.get('dates') else 'current'
                    }
                }
            ]
        }
    
    async def _explain_metric_response(self, entities: Dict, sector: SectorContext) -> Dict[str, Any]:
        """Génère une explication pour une métrique - CORRIGÉ"""
        if not entities['metrics']:
            # Si aucune métrique détectée, chercher dans la requête originale
            original_query = entities.get('original_query', '').lower()
            for metric_key, patterns in {**self.banking_patterns, **self.insurance_patterns}.items():
                if any(pattern in original_query for pattern in patterns):
                    entities['metrics'].append(metric_key)
                    break
            
            if not entities['metrics']:
                return {
                    'type': 'info',
                    'message': 'Quelle métrique souhaitez-vous que je vous explique ?',
                    'suggestions': list(self.knowledge_base.keys())
                }
        
        metric = entities['metrics'][0]
        metric_info = self.knowledge_base.get(metric, {})
        
        return {
            'type': 'explanation',
            'metric': metric,
            'name': metric_info.get('name', metric.upper()),
            'description': metric_info.get('description', 'Métrique financière importante'),
            'sector': metric_info.get('sector', sector.value),
            'threshold': metric_info.get('threshold'),
            'unit': metric_info.get('unit', '%'),
            'regulation': metric_info.get('regulation', ''),
            'formula': metric_info.get('formula', ''),
            'importance': 'Cette métrique est cruciale pour évaluer la solidité financière et la conformité réglementaire.',
            'learn_more': f'/docs/metrics/{metric}'
        }
    
    async def _create_dashboard_response(self, entities: Dict, sector: SectorContext, 
                                       context: Optional[Dict]) -> Dict[str, Any]:
        """Génère une configuration de dashboard"""
        widgets = []
        
        # Widgets basés sur les métriques détectées
        if entities['metrics']:
            for metric in entities['metrics']:
                widgets.append({
                    'type': 'kpi_card',
                    'metric': metric,
                    'position': {'x': 0, 'y': len(widgets)},
                    'size': {'width': 3, 'height': 1}
                })
        else:
            # Dashboard par défaut selon le secteur
            if sector == SectorContext.BANKING:
                default_metrics = ['cet1', 'lcr', 'nsfr', 'npl']
            elif sector == SectorContext.INSURANCE:
                default_metrics = ['scr', 'mcr', 'combined_ratio', 'loss_ratio']
            else:
                default_metrics = ['revenue', 'costs', 'profit', 'roe']
            
            for i, metric in enumerate(default_metrics):
                widgets.append({
                    'type': 'kpi_card',
                    'metric': metric,
                    'position': {'x': (i % 4) * 3, 'y': i // 4},
                    'size': {'width': 3, 'height': 1}
                })
        
        # Ajouter des graphiques
        widgets.extend([
            {
                'type': 'line_chart',
                'title': 'Évolution temporelle',
                'metrics': entities['metrics'][:3] if entities['metrics'] else ['revenue'],
                'position': {'x': 0, 'y': 2},
                'size': {'width': 6, 'height': 2}
            },
            {
                'type': 'bar_chart',
                'title': 'Analyse comparative',
                'position': {'x': 6, 'y': 2},
                'size': {'width': 6, 'height': 2}
            }
        ])
        
        return {
            'type': 'dashboard_config',
            'name': f'Dashboard {sector.value.capitalize()}',
            'sector': sector.value,
            'widgets': widgets,
            'layout': 'responsive',
            'theme': 'dark' if context and context.get('darkMode') else 'light',
            'actions': [
                {
                    'label': 'Créer le dashboard',
                    'action': 'create_dashboard',
                    'params': {'widgets': widgets}
                }
            ]
        }
    
    async def _analyze_trend_response(self, entities: Dict, sector: SectorContext,
                                    context: Optional[Dict]) -> Dict[str, Any]:
        """Analyse de tendance"""
        return {
            'type': 'trend_analysis',
            'metrics': entities.get('metrics', []),
            'period': entities.get('dates', ['last_12_months']),
            'insights': [
                {
                    'type': 'positive',
                    'message': 'Amélioration constante sur les 3 derniers trimestres'
                },
                {
                    'type': 'warning',
                    'message': 'Volatilité accrue détectée au Q2'
                }
            ],
            'visualization': {
                'type': 'trend_chart',
                'trend': 'upward',
                'confidence': 0.85
            }
        }
    
    async def _detect_anomaly_response(self, entities: Dict, sector: SectorContext,
                                     context: Optional[Dict]) -> Dict[str, Any]:
        """Détection d'anomalies"""
        return {
            'type': 'anomaly_detection',
            'status': 'analysis_complete',
            'anomalies_found': 2,
            'details': [
                {
                    'metric': entities['metrics'][0] if entities['metrics'] else 'lcr',
                    'type': 'sudden_drop',
                    'severity': 'medium',
                    'date': '2024-11-15',
                    'description': 'Chute inhabituelle de 15% en une journée'
                }
            ],
            'recommendations': [
                'Vérifier les transactions importantes de cette période',
                'Analyser les corrélations avec d\'autres métriques'
            ]
        }
    
    def _generate_suggestions(self, intent: IntentType, sector: SectorContext, 
                            entities: Dict) -> List[Dict[str, str]]:
        """Génère des suggestions contextuelles"""
        suggestions = []
        
        if intent == IntentType.CALCULATE_RATIO and entities.get('metrics'):
            metric = entities['metrics'][0]
            suggestions.extend([
                {
                    'text': f'Comparer le {metric} avec le trimestre précédent',
                    'query': f'compare {metric} avec Q3 2024'
                },
                {
                    'text': f'Voir l\'évolution du {metric} sur 12 mois',
                    'query': f'montre la tendance du {metric} sur les 12 derniers mois'
                },
                {
                    'text': f'Expliquer ce qu\'est le {metric}',
                    'query': f'explique moi le {metric}'
                }
            ])
        
        elif sector == SectorContext.BANKING:
            suggestions.extend([
                {
                    'text': 'Calculer mon ratio CET1',
                    'query': 'calcule mon ratio CET1'
                },
                {
                    'text': 'Générer le rapport Bâle III',
                    'query': 'génère le rapport de conformité Bâle III'
                },
                {
                    'text': 'Analyser la liquidité',
                    'query': 'analyse ma position de liquidité LCR et NSFR'
                }
            ])
        
        elif sector == SectorContext.INSURANCE:
            suggestions.extend([
                {
                    'text': 'Vérifier la conformité Solvency II',
                    'query': 'vérifie ma conformité Solvency II'
                },
                {
                    'text': 'Analyser le ratio combiné',
                    'query': 'analyse mon ratio combiné et ses composantes'
                },
                {
                    'text': 'Préparer le QRT trimestriel',
                    'query': 'prépare le QRT pour le Q4 2024'
                }
            ])
        
        return suggestions[:3]  # Limiter à 3 suggestions
    
    def _get_example_queries(self, sector: SectorContext) -> List[str]:
        """Retourne des exemples de requêtes selon le secteur"""
        if sector == SectorContext.BANKING:
            return [
                "Calcule mon ratio CET1",
                "Quelle est ma position de liquidité LCR ?",
                "Génère un rapport de stress test",
                "Analyse l'évolution de mes NPL sur 6 mois"
            ]
        elif sector == SectorContext.INSURANCE:
            return [
                "Quel est mon ratio SCR ?",
                "Analyse mon ratio combiné",
                "Génère le rapport Solvency II",
                "Montre l'évolution des sinistres"
            ]
        else:
            return [
                "Analyse mes KPIs principaux",
                "Crée un dashboard de performance",
                "Compare les revenus T3 vs T4",
                "Détecte les anomalies dans mes données"
            ]