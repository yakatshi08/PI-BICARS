# src/components/analytics/Benchmarking.tsx
"""
Module de Benchmarking Automatique
Comparaison avec les standards du secteur et détection d'opportunités
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple, Optional, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, field
import warnings
from enum import Enum
import json
from scipy import stats
import requests

warnings.filterwarnings('ignore')

class BenchmarkSource(Enum):
    """Sources de données de benchmark"""
    INTERNAL = "internal"  # Données internes historiques
    INDUSTRY = "industry"  # Standards du secteur
    COMPETITOR = "competitor"  # Données concurrentielles
    REGULATORY = "regulatory"  # Standards réglementaires
    BEST_PRACTICE = "best_practice"  # Meilleures pratiques
    CUSTOM = "custom"  # Benchmarks personnalisés

class PerformanceLevel(Enum):
    """Niveaux de performance"""
    EXCELLENT = "excellent"  # Top 10%
    GOOD = "good"  # Top 25%
    AVERAGE = "average"  # 25-75%
    BELOW_AVERAGE = "below_average"  # Bottom 25%
    POOR = "poor"  # Bottom 10%

@dataclass
class BenchmarkMetric:
    """Métrique de benchmark"""
    name: str
    value: float
    unit: str
    source: BenchmarkSource
    percentile: float
    performance_level: PerformanceLevel
    industry_average: float
    best_in_class: float
    improvement_potential: float
    recommendations: List[str] = field(default_factory=list)

@dataclass
class BenchmarkProfile:
    """Profil de benchmark sectoriel"""
    sector: str
    sub_sector: Optional[str]
    company_size: str  # 'small', 'medium', 'large', 'enterprise'
    geography: Optional[str]
    metrics: Dict[str, Dict[str, float]]  # metric_name -> {p10, p25, p50, p75, p90}
    last_updated: datetime
    source_info: Dict[str, Any]

class BenchmarkingEngine:
    """
    Moteur principal de benchmarking automatique
    """
    
    def __init__(self, sector: str, company_size: str = 'medium'):
        self.sector = sector
        self.company_size = company_size
        self.benchmark_profiles = self._load_benchmark_profiles()
        self.custom_benchmarks = {}
        
    def analyze(self, 
                metrics_df: pd.DataFrame,
                metric_definitions: Dict[str, str],
                time_period: Optional[str] = None,
                comparison_groups: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Analyse de benchmarking complète
        
        Args:
            metrics_df: DataFrame avec les métriques à analyser
            metric_definitions: Mapping nom_métrique -> type_métrique
            time_period: Période d'analyse
            comparison_groups: Groupes de comparaison spécifiques
        """
        results = {
            'summary': self._generate_summary(metrics_df),
            'metric_benchmarks': {},
            'performance_score': 0,
            'rankings': {},
            'gaps': {},
            'opportunities': [],
            'action_plan': []
        }
        
        # Benchmark par métrique
        for metric_name, metric_type in metric_definitions.items():
            if metric_name in metrics_df.columns:
                benchmark_result = self._benchmark_metric(
                    metrics_df[metric_name],
                    metric_name,
                    metric_type
                )
                results['metric_benchmarks'][metric_name] = benchmark_result
        
        # Score de performance global
        results['performance_score'] = self._calculate_performance_score(
            results['metric_benchmarks']
        )
        
        # Rankings et positionnement
        results['rankings'] = self._calculate_rankings(results['metric_benchmarks'])
        
        # Analyse des écarts
        results['gaps'] = self._analyze_gaps(results['metric_benchmarks'])
        
        # Identification des opportunités
        results['opportunities'] = self._identify_opportunities(
            results['metric_benchmarks'],
            results['gaps']
        )
        
        # Plan d'action priorisé
        results['action_plan'] = self._generate_action_plan(
            results['opportunities'],
            results['gaps']
        )
        
        # Analyse temporelle si applicable
        if time_period:
            results['trend_analysis'] = self._analyze_trends(
                metrics_df,
                results['metric_benchmarks']
            )
        
        # Analyse comparative si groupes spécifiés
        if comparison_groups:
            results['comparative_analysis'] = self._comparative_analysis(
                metrics_df,
                comparison_groups
            )
        
        return results
    
    def _load_benchmark_profiles(self) -> Dict[str, BenchmarkProfile]:
        """Charge les profils de benchmark sectoriels"""
        # En production, charger depuis une base de données ou API
        profiles = {
            'banque': BenchmarkProfile(
                sector='banque',
                sub_sector=None,
                company_size=self.company_size,
                geography='global',
                metrics={
                    'roi': {'p10': 5, 'p25': 8, 'p50': 12, 'p75': 15, 'p90': 20},
                    'cost_income_ratio': {'p10': 70, 'p25': 60, 'p50': 50, 'p75': 45, 'p90': 40},
                    'npl_ratio': {'p10': 5, 'p25': 3, 'p50': 2, 'p75': 1.5, 'p90': 1},
                    'tier1_ratio': {'p10': 10, 'p25': 12, 'p50': 14, 'p75': 16, 'p90': 18},
                    'customer_acquisition_cost': {'p10': 500, 'p25': 300, 'p50': 200, 'p75': 150, 'p90': 100}
                },
                last_updated=datetime.now(),
                source_info={'provider': 'Industry Reports 2024', 'sample_size': 500}
            ),
            'sante': BenchmarkProfile(
                sector='sante',
                sub_sector=None,
                company_size=self.company_size,
                geography='global',
                metrics={
                    'patient_satisfaction': {'p10': 70, 'p25': 75, 'p50': 80, 'p75': 85, 'p90': 90},
                    'readmission_rate': {'p10': 20, 'p25': 15, 'p50': 12, 'p75': 10, 'p90': 8},
                    'average_length_of_stay': {'p10': 7, 'p25': 6, 'p50': 5, 'p75': 4.5, 'p90': 4},
                    'operational_efficiency': {'p10': 60, 'p25': 70, 'p50': 75, 'p75': 80, 'p90': 85},
                    'cost_per_patient': {'p10': 5000, 'p25': 4000, 'p50': 3500, 'p75': 3000, 'p90': 2500}
                },
                last_updated=datetime.now(),
                source_info={'provider': 'Healthcare Analytics 2024', 'sample_size': 300}
            ),
            'retail': BenchmarkProfile(
                sector='retail',
                sub_sector=None,
                company_size=self.company_size,
                geography='global',
                metrics={
                    'conversion_rate': {'p10': 1, 'p25': 2, 'p50': 3, 'p75': 4, 'p90': 5},
                    'average_order_value': {'p10': 30, 'p25': 50, 'p50': 75, 'p75': 100, 'p90': 150},
                    'customer_retention_rate': {'p10': 20, 'p25': 30, 'p50': 40, 'p75': 50, 'p90': 60},
                    'inventory_turnover': {'p10': 4, 'p25': 6, 'p50': 8, 'p75': 10, 'p90': 12},
                    'gross_margin': {'p10': 20, 'p25': 30, 'p50': 40, 'p75': 50, 'p90': 60}
                },
                last_updated=datetime.now(),
                source_info={'provider': 'Retail Insights 2024', 'sample_size': 1000}
            ),
            'tech': BenchmarkProfile(
                sector='tech',
                sub_sector=None,
                company_size=self.company_size,
                geography='global',
                metrics={
                    'monthly_active_users_growth': {'p10': 5, 'p25': 10, 'p50': 20, 'p75': 35, 'p90': 50},
                    'churn_rate': {'p10': 15, 'p25': 10, 'p50': 7, 'p75': 5, 'p90': 3},
                    'ltv_cac_ratio': {'p10': 1, 'p25': 2, 'p50': 3, 'p75': 4, 'p90': 5},
                    'gross_margin': {'p10': 60, 'p25': 70, 'p50': 75, 'p75': 80, 'p90': 85},
                    'burn_rate': {'p10': 500000, 'p25': 300000, 'p50': 200000, 'p75': 150000, 'p90': 100000}
                },
                last_updated=datetime.now(),
                source_info={'provider': 'Tech Benchmarks 2024', 'sample_size': 800}
            )
        }
        
        return profiles
    
    def _benchmark_metric(self, 
                         metric_values: pd.Series,
                         metric_name: str,
                         metric_type: str) -> BenchmarkMetric:
        """Benchmark une métrique spécifique"""
        current_value = metric_values.mean() if len(metric_values) > 0 else 0
        
        # Récupérer les benchmarks sectoriels
        sector_profile = self.benchmark_profiles.get(self.sector.lower())
        if not sector_profile or metric_name not in sector_profile.metrics:
            # Utiliser des benchmarks génériques si non disponibles
            return self._generic_benchmark(current_value, metric_name, metric_type)
        
        benchmarks = sector_profile.metrics[metric_name]
        
        # Calculer le percentile
        percentile = self._calculate_percentile(current_value, benchmarks, metric_type)
        
        # Déterminer le niveau de performance
        performance_level = self._determine_performance_level(percentile)
        
        # Calculer le potentiel d'amélioration
        best_in_class = benchmarks['p90'] if metric_type != 'lower_is_better' else benchmarks['p10']
        improvement_potential = abs(best_in_class - current_value) / abs(current_value) * 100 if current_value != 0 else 0
        
        # Générer des recommandations
        recommendations = self._generate_metric_recommendations(
            metric_name,
            current_value,
            benchmarks,
            performance_level
        )
        
        return BenchmarkMetric(
            name=metric_name,
            value=current_value,
            unit=self._get_metric_unit(metric_name),
            source=BenchmarkSource.INDUSTRY,
            percentile=percentile,
            performance_level=performance_level,
            industry_average=benchmarks['p50'],
            best_in_class=best_in_class,
            improvement_potential=improvement_potential,
            recommendations=recommendations
        )
    
    def _calculate_percentile(self, 
                            value: float,
                            benchmarks: Dict[str, float],
                            metric_type: str) -> float:
        """Calcule le percentile d'une valeur par rapport aux benchmarks"""
        # Créer une série avec les percentiles
        percentiles = [10, 25, 50, 75, 90]
        values = [benchmarks[f'p{p}'] for p in percentiles]
        
        # Inverser pour les métriques où moins = mieux
        if metric_type == 'lower_is_better':
            value = -value
            values = [-v for v in values]
        
        # Interpolation pour trouver le percentile exact
        if value <= values[0]:
            return 0
        elif value >= values[-1]:
            return 100
        else:
            return np.interp(value, values, percentiles)
    
    def _determine_performance_level(self, percentile: float) -> PerformanceLevel:
        """Détermine le niveau de performance basé sur le percentile"""
        if percentile >= 90:
            return PerformanceLevel.EXCELLENT
        elif percentile >= 75:
            return PerformanceLevel.GOOD
        elif percentile >= 25:
            return PerformanceLevel.AVERAGE
        elif percentile >= 10:
            return PerformanceLevel.BELOW_AVERAGE
        else:
            return PerformanceLevel.POOR
    
    def _generate_metric_recommendations(self,
                                       metric_name: str,
                                       current_value: float,
                                       benchmarks: Dict[str, float],
                                       performance_level: PerformanceLevel) -> List[str]:
        """Génère des recommandations spécifiques pour une métrique"""
        recommendations = []
        
        # Recommandations génériques basées sur le niveau
        if performance_level in [PerformanceLevel.POOR, PerformanceLevel.BELOW_AVERAGE]:
            recommendations.append(f"Prioriser l'amélioration de {metric_name} - performance significativement en dessous de la moyenne du secteur")
            
            # Recommandations spécifiques par métrique
            metric_specific_recs = {
                'roi': [
                    "Analyser la structure de coûts et identifier les inefficacités",
                    "Optimiser le mix produit/service vers des offres à plus forte marge",
                    "Implémenter des initiatives de pricing dynamique"
                ],
                'customer_retention_rate': [
                    "Lancer un programme de fidélité client",
                    "Améliorer l'expérience client et le support",
                    "Implémenter un système de NPS et agir sur les feedbacks"
                ],
                'conversion_rate': [
                    "Optimiser le parcours client avec des tests A/B",
                    "Améliorer la proposition de valeur et les messages marketing",
                    "Réduire les frictions dans le processus d'achat"
                ],
                'churn_rate': [
                    "Identifier les principales causes de churn via des enquêtes",
                    "Développer un modèle prédictif de churn",
                    "Créer des programmes de rétention ciblés"
                ]
            }
            
            if metric_name in metric_specific_recs:
                recommendations.extend(metric_specific_recs[metric_name])
        
        elif performance_level == PerformanceLevel.AVERAGE:
            recommendations.append(f"Opportunité d'amélioration pour {metric_name} - viser le top 25% du secteur")
            recommendations.append(f"Objectif suggéré: atteindre {benchmarks['p75']:.1f} (actuellement {current_value:.1f})")
        
        elif performance_level in [PerformanceLevel.GOOD, PerformanceLevel.EXCELLENT]:
            recommendations.append(f"Maintenir l'excellence sur {metric_name}")
            recommendations.append("Documenter et partager les bonnes pratiques en interne")
            if performance_level == PerformanceLevel.EXCELLENT:
                recommendations.append("Considérer la monétisation de cette expertise (consulting, formations)")
        
        return recommendations
    
    def _calculate_performance_score(self, 
                                   metric_benchmarks: Dict[str, BenchmarkMetric]) -> float:
        """Calcule un score de performance global (0-100)"""
        if not metric_benchmarks:
            return 0
        
        # Pondération par importance des métriques
        weights = self._get_metric_weights()
        
        total_score = 0
        total_weight = 0
        
        for metric_name, benchmark in metric_benchmarks.items():
            weight = weights.get(metric_name, 1.0)
            # Convertir le percentile en score (0-100)
            score = benchmark.percentile
            total_score += score * weight
            total_weight += weight
        
        return total_score / total_weight if total_weight > 0 else 0
    
    def _calculate_rankings(self, 
                          metric_benchmarks: Dict[str, BenchmarkMetric]) -> Dict[str, Any]:
        """Calcule les rankings et positionnements"""
        rankings = {
            'overall_ranking': '',
            'metric_rankings': {},
            'strengths': [],
            'weaknesses': []
        }
        
        # Ranking global
        perf_score = self._calculate_performance_score(metric_benchmarks)
        if perf_score >= 80:
            rankings['overall_ranking'] = 'Leader du secteur (Top 20%)'
        elif perf_score >= 60:
            rankings['overall_ranking'] = 'Performant (Top 40%)'
        elif perf_score >= 40:
            rankings['overall_ranking'] = 'Dans la moyenne'
        else:
            rankings['overall_ranking'] = 'En retard sur le secteur'
        
        # Rankings par métrique et identification forces/faiblesses
        for metric_name, benchmark in metric_benchmarks.items():
            rankings['metric_rankings'][metric_name] = {
                'percentile': benchmark.percentile,
                'level': benchmark.performance_level.value
            }
            
            if benchmark.percentile >= 75:
                rankings['strengths'].append({
                    'metric': metric_name,
                    'percentile': benchmark.percentile,
                    'description': f"Top {100-benchmark.percentile:.0f}% du secteur"
                })
            elif benchmark.percentile <= 25:
                rankings['weaknesses'].append({
                    'metric': metric_name,
                    'percentile': benchmark.percentile,
                    'gap_to_average': abs(benchmark.value - benchmark.industry_average)
                })
        
        return rankings
    
    def _analyze_gaps(self, 
                     metric_benchmarks: Dict[str, BenchmarkMetric]) -> Dict[str, Any]:
        """Analyse les écarts par rapport aux benchmarks"""
        gaps = {
            'summary': {},
            'by_metric': {},
            'financial_impact': {},
            'effort_required': {}
        }
        
        total_gap_value = 0
        critical_gaps = 0
        
        for metric_name, benchmark in metric_benchmarks.items():
            gap = benchmark.industry_average - benchmark.value
            gap_percent = abs(gap) / abs(benchmark.industry_average) * 100 if benchmark.industry_average != 0 else 0
            
            gap_analysis = {
                'current': benchmark.value,
                'target': benchmark.industry_average,
                'gap': gap,
                'gap_percent': gap_percent,
                'to_best_in_class': benchmark.best_in_class - benchmark.value
            }
            
            # Estimer l'impact financier (simplifié)
            financial_impact = self._estimate_financial_impact(metric_name, gap)
            gap_analysis['financial_impact'] = financial_impact
            total_gap_value += financial_impact
            
            # Estimer l'effort requis
            effort = self._estimate_effort_required(metric_name, gap_percent)
            gap_analysis['effort_required'] = effort
            
            gaps['by_metric'][metric_name] = gap_analysis
            
            if gap_percent > 30:
                critical_gaps += 1
        
        gaps['summary'] = {
            'total_metrics_analyzed': len(metric_benchmarks),
            'metrics_below_average': sum(1 for b in metric_benchmarks.values() if b.percentile < 50),
            'critical_gaps': critical_gaps,
            'total_financial_impact': total_gap_value
        }
        
        return gaps
    
    def _identify_opportunities(self,
                              metric_benchmarks: Dict[str, BenchmarkMetric],
                              gaps: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identifie et priorise les opportunités d'amélioration"""
        opportunities = []
        
        for metric_name, gap_data in gaps['by_metric'].items():
            if gap_data['gap_percent'] > 10:  # Seuil d'opportunité significative
                benchmark = metric_benchmarks[metric_name]
                
                opportunity = {
                    'metric': metric_name,
                    'current_performance': benchmark.performance_level.value,
                    'improvement_potential': benchmark.improvement_potential,
                    'financial_impact': gap_data['financial_impact'],
                    'effort_required': gap_data['effort_required'],
                    'roi_score': gap_data['financial_impact'] / (gap_data['effort_required'] + 1),
                    'quick_wins': [],
                    'strategic_initiatives': []
                }
                
                # Identifier quick wins vs initiatives stratégiques
                if gap_data['effort_required'] < 3:
                    opportunity['quick_wins'] = self._get_quick_wins(metric_name)
                else:
                    opportunity['strategic_initiatives'] = self._get_strategic_initiatives(metric_name)
                
                opportunities.append(opportunity)
        
        # Trier par ROI score
        opportunities.sort(key=lambda x: x['roi_score'], reverse=True)
        
        return opportunities
    
    def _generate_action_plan(self,
                            opportunities: List[Dict[str, Any]],
                            gaps: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Génère un plan d'action priorisé"""
        action_plan = []
        
        # Phase 1: Quick wins (0-3 mois)
        quick_wins = [opp for opp in opportunities if opp['effort_required'] < 3]
        for i, opp in enumerate(quick_wins[:3]):  # Top 3 quick wins
            action_plan.append({
                'phase': 'Quick Wins (0-3 mois)',
                'priority': i + 1,
                'metric': opp['metric'],
                'actions': opp['quick_wins'],
                'expected_impact': f"{opp['improvement_potential']:.1f}% d'amélioration",
                'resources_needed': self._estimate_resources(opp['effort_required']),
                'success_metrics': self._define_success_metrics(opp['metric'])
            })
        
        # Phase 2: Initiatives moyen terme (3-6 mois)
        medium_term = [opp for opp in opportunities if 3 <= opp['effort_required'] < 7]
        for i, opp in enumerate(medium_term[:2]):  # Top 2 medium term
            action_plan.append({
                'phase': 'Moyen terme (3-6 mois)',
                'priority': len(quick_wins) + i + 1,
                'metric': opp['metric'],
                'actions': opp['strategic_initiatives'][:2],
                'expected_impact': f"{opp['improvement_potential']:.1f}% d'amélioration",
                'resources_needed': self._estimate_resources(opp['effort_required']),
                'success_metrics': self._define_success_metrics(opp['metric'])
            })
        
        # Phase 3: Transformation stratégique (6-12 mois)
        strategic = [opp for opp in opportunities if opp['effort_required'] >= 7]
        if strategic:
            top_strategic = strategic[0]
            action_plan.append({
                'phase': 'Transformation stratégique (6-12 mois)',
                'priority': len(action_plan) + 1,
                'metric': top_strategic['metric'],
                'actions': top_strategic['strategic_initiatives'],
                'expected_impact': f"{top_strategic['improvement_potential']:.1f}% d'amélioration",
                'resources_needed': self._estimate_resources(top_strategic['effort_required']),
                'success_metrics': self._define_success_metrics(top_strategic['metric'])
            })
        
        return action_plan
    
    def _analyze_trends(self,
                       metrics_df: pd.DataFrame,
                       metric_benchmarks: Dict[str, BenchmarkMetric]) -> Dict[str, Any]:
        """Analyse les tendances temporelles vs benchmarks"""
        trends = {}
        
        for metric_name in metric_benchmarks:
            if metric_name in metrics_df.columns:
                metric_series = metrics_df[metric_name]
                
                # Tendance générale
                if len(metric_series) > 3:
                    trend_direction = 'improving' if metric_series.iloc[-1] > metric_series.iloc[0] else 'declining'
                    trend_rate = (metric_series.iloc[-1] - metric_series.iloc[0]) / abs(metric_series.iloc[0]) * 100 if metric_series.iloc[0] != 0 else 0
                    
                    trends[metric_name] = {
                        'direction': trend_direction,
                        'rate': trend_rate,
                        'volatility': metric_series.std() / metric_series.mean() if metric_series.mean() != 0 else 0,
                        'projection': self._project_metric(metric_series),
                        'time_to_benchmark': self._estimate_time_to_benchmark(
                            metric_series,
                            metric_benchmarks[metric_name].industry_average
                        )
                    }
        
        return trends
    
    # Méthodes utilitaires
    def _generic_benchmark(self, value: float, metric_name: str, metric_type: str) -> BenchmarkMetric:
        """Benchmark générique quand pas de données sectorielles"""
        # Utiliser des percentiles génériques
        percentile = 50  # Assumer moyenne par défaut
        
        return BenchmarkMetric(
            name=metric_name,
            value=value,
            unit=self._get_metric_unit(metric_name),
            source=BenchmarkSource.INTERNAL,
            percentile=percentile,
            performance_level=PerformanceLevel.AVERAGE,
            industry_average=value,  # Pas de référence
            best_in_class=value * 1.5 if metric_type != 'lower_is_better' else value * 0.5,
            improvement_potential=50,
            recommendations=["Données de benchmark sectorielles non disponibles - utiliser des comparaisons internes"]
        )
    
    def _get_metric_unit(self, metric_name: str) -> str:
        """Détermine l'unité d'une métrique"""
        units = {
            'roi': '%',
            'conversion_rate': '%',
            'churn_rate': '%',
            'retention_rate': '%',
            'margin': '%',
            'cost': '€',
            'revenue': '€',
            'time': 'jours',
            'count': 'unités'
        }
        
        for key, unit in units.items():
            if key in metric_name.lower():
                return unit
        
        return 'unités'
    
    def _get_metric_weights(self) -> Dict[str, float]:
        """Poids des métriques pour le score global"""
        # Poids par défaut par secteur
        sector_weights = {
            'banque': {
                'roi': 2.0,
                'cost_income_ratio': 1.5,
                'npl_ratio': 1.5,
                'tier1_ratio': 2.0,
                'customer_acquisition_cost': 1.0
            },
            'sante': {
                'patient_satisfaction': 2.0,
                'readmission_rate': 1.5,
                'operational_efficiency': 1.5,
                'cost_per_patient': 1.0
            },
            'retail': {
                'conversion_rate': 2.0,
                'customer_retention_rate': 2.0,
                'inventory_turnover': 1.0,
                'gross_margin': 1.5
            },
            'tech': {
                'monthly_active_users_growth': 2.0,
                'churn_rate': 2.0,
                'ltv_cac_ratio': 1.5,
                'burn_rate': 1.0
            }
        }
        
        return sector_weights.get(self.sector.lower(), {})
    
    def _estimate_financial_impact(self, metric_name: str, gap: float) -> float:
        """Estime l'impact financier d'un gap (€)"""
        # Logique simplifiée - en production, utiliser des modèles financiers
        impact_multipliers = {
            'roi': 100000,
            'conversion_rate': 50000,
            'churn_rate': 75000,
            'customer_retention_rate': 80000,
            'operational_efficiency': 60000
        }
        
        multiplier = impact_multipliers.get(metric_name, 10000)
        return abs(gap) * multiplier
    
    def _estimate_effort_required(self, metric_name: str, gap_percent: float) -> float:
        """Estime l'effort requis (1-10)"""
        # Base effort sur la complexité de la métrique
        complexity = {
            'roi': 8,
            'conversion_rate': 5,
            'churn_rate': 7,
            'customer_retention_rate': 6,
            'operational_efficiency': 9,
            'cost': 4
        }
        
        base_effort = complexity.get(metric_name, 5)
        
        # Ajuster selon l'ampleur du gap
        if gap_percent > 50:
            return min(base_effort * 1.5, 10)
        elif gap_percent > 30:
            return min(base_effort * 1.2, 10)
        else:
            return base_effort
    
    def _get_quick_wins(self, metric_name: str) -> List[str]:
        """Retourne les quick wins pour une métrique"""
        quick_wins_db = {
            'conversion_rate': [
                "Optimiser les CTA sur les pages principales",
                "Réduire le temps de chargement des pages",
                "Simplifier le formulaire de checkout"
            ],
            'customer_retention_rate': [
                "Lancer une campagne email de réengagement",
                "Offrir des incentives pour les clients à risque",
                "Améliorer la réactivité du support client"
            ],
            'operational_efficiency': [
                "Automatiser les tâches répétitives",
                "Optimiser les plannings du personnel",
                "Réduire les gaspillages identifiés"
            ]
        }
        
        return quick_wins_db.get(metric_name, ["Analyser les processus actuels", "Identifier les inefficacités"])
    
    def _get_strategic_initiatives(self, metric_name: str) -> List[str]:
        """Retourne les initiatives stratégiques pour une métrique"""
        strategic_db = {
            'roi': [
                "Refonte du modèle de pricing",
                "Transformation digitale des processus",
                "Programme d'optimisation des coûts à grande échelle"
            ],
            'churn_rate': [
                "Implémenter un système de customer success",
                "Développer un programme de fidélité innovant",
                "Créer une plateforme d'engagement client"
            ],
            'operational_efficiency': [
                "Migration vers le cloud",
                "Implémentation d'un ERP moderne",
                "Programme de transformation Lean/Six Sigma"
            ]
        }
        
        return strategic_db.get(metric_name, ["Lancer un projet de transformation", "Investir dans de nouvelles capacités"])
    
    def _estimate_resources(self, effort_level: float) -> Dict[str, Any]:
        """Estime les ressources nécessaires"""
        if effort_level < 3:
            return {
                'team_size': '1-2 personnes',
                'budget': '< 50k€',
                'duration': '1-3 mois'
            }
        elif effort_level < 7:
            return {
                'team_size': '3-5 personnes',
                'budget': '50-200k€',
                'duration': '3-6 mois'
            }
        else:
            return {
                'team_size': '5+ personnes',
                'budget': '> 200k€',
                'duration': '6-12 mois'
            }
    
    def _define_success_metrics(self, metric_name: str) -> List[str]:
        """Définit les métriques de succès"""
        return [
            f"Amélioration de {metric_name} de X%",
            f"Atteindre le percentile 75 du secteur",
            f"ROI positif en 6 mois",
            f"Adoption par 80% des équipes concernées"
        ]
    
    def _project_metric(self, metric_series: pd.Series) -> Dict[str, float]:
        """Projette l'évolution future d'une métrique"""
        if len(metric_series) < 3:
            return {}
        
        # Régression linéaire simple
        x = np.arange(len(metric_series))
        y = metric_series.values
        slope, intercept = np.polyfit(x, y, 1)
        
        # Projections
        projections = {}
        for months in [3, 6, 12]:
            future_index = len(metric_series) + months
            projected_value = slope * future_index + intercept
            projections[f'{months}_months'] = projected_value
        
        return projections
    
    def _estimate_time_to_benchmark(self, 
                                  metric_series: pd.Series,
                                  benchmark_value: float) -> Optional[int]:
        """Estime le temps pour atteindre le benchmark"""
        if len(metric_series) < 3:
            return None
        
        current = metric_series.iloc[-1]
        if current == benchmark_value:
            return 0
        
        # Tendance
        x = np.arange(len(metric_series))
        y = metric_series.values
        slope, intercept = np.polyfit(x, y, 1)
        
        if slope == 0:
            return None  # Pas de progression
        
        # Calculer quand on atteindra le benchmark
        months_needed = (benchmark_value - current) / slope
        
        return int(max(0, months_needed)) if months_needed > 0 else None

# Fonction helper pour utilisation facile
def run_benchmarking(metrics_df: pd.DataFrame,
                    sector: str,
                    metric_definitions: Dict[str, str],
                    company_size: str = 'medium') -> Dict[str, Any]:
    """
    Lance une analyse de benchmarking complète
    
    Args:
        metrics_df: DataFrame avec les métriques
        sector: Secteur d'activité
        metric_definitions: Mapping métrique -> type
        company_size: Taille de l'entreprise
    
    Returns:
        Résultats complets du benchmarking
    """
    engine = BenchmarkingEngine(sector, company_size)
    return engine.analyze(metrics_df, metric_definitions)