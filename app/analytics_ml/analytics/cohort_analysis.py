# app/analytics_ml/analytics/cohort_analysis.py
"""
Module d'Analyse de Cohortes
Analyse comportementale avancée par groupes temporels
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple, Optional, Union
from datetime import datetime, timedelta
from dataclasses import dataclass
import warnings
from enum import Enum
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import json

warnings.filterwarnings('ignore')

class CohortType(Enum):
    """Types de cohortes supportés"""
    TIME_BASED = "time_based"
    BEHAVIOR_BASED = "behavior_based"
    ACQUISITION_BASED = "acquisition_based"
    SEGMENT_BASED = "segment_based"
    CUSTOM = "custom"

class MetricType(Enum):
    """Types de métriques pour l'analyse"""
    RETENTION = "retention"
    REVENUE = "revenue"
    ENGAGEMENT = "engagement"
    CONVERSION = "conversion"
    CHURN = "churn"
    LTV = "ltv"
    ARPU = "arpu"
    CUSTOM = "custom"

@dataclass
class CohortConfig:
    """Configuration pour l'analyse de cohortes"""
    cohort_type: CohortType
    time_period: str  # 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    metrics: List[MetricType]
    min_cohort_size: int = 10
    max_periods: int = 24
    filters: Dict[str, Any] = None
    segment_by: Optional[str] = None

@dataclass
class CohortMetrics:
    """Métriques calculées pour une cohorte"""
    cohort_id: str
    cohort_date: datetime
    cohort_size: int
    periods: Dict[int, Dict[str, float]]
    summary_stats: Dict[str, float]
    trends: Dict[str, str]

class CohortAnalyzer:
    """
    Classe principale pour l'analyse de cohortes
    """
    
    def __init__(self, config: CohortConfig):
        self.config = config
        self.cohorts = {}
        self.cohort_matrix = None
        self.insights = []
        
    def analyze(self, 
                df: pd.DataFrame,
                user_col: str,
                date_col: str,
                event_col: Optional[str] = None,
                value_col: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyse principale des cohortes
        
        Args:
            df: DataFrame contenant les données
            user_col: Colonne identifiant utilisateur
            date_col: Colonne date
            event_col: Colonne événement (optionnel)
            value_col: Colonne valeur/montant (optionnel)
        """
        # Préparation des données
        df = self._prepare_data(df, date_col)
        
        # Création des cohortes
        cohorts_df = self._create_cohorts(df, user_col, date_col)
        
        # Calcul des métriques par cohorte
        results = {
            'cohort_summary': self._generate_cohort_summary(cohorts_df),
            'metrics': {}
        }
        
        for metric in self.config.metrics:
            if metric == MetricType.RETENTION:
                results['metrics']['retention'] = self._calculate_retention(
                    df, cohorts_df, user_col, date_col
                )
            elif metric == MetricType.REVENUE and value_col:
                results['metrics']['revenue'] = self._calculate_revenue_metrics(
                    df, cohorts_df, user_col, date_col, value_col
                )
            elif metric == MetricType.ENGAGEMENT and event_col:
                results['metrics']['engagement'] = self._calculate_engagement(
                    df, cohorts_df, user_col, date_col, event_col
                )
            elif metric == MetricType.CHURN:
                results['metrics']['churn'] = self._calculate_churn(
                    df, cohorts_df, user_col, date_col
                )
            elif metric == MetricType.LTV and value_col:
                results['metrics']['ltv'] = self._calculate_ltv(
                    df, cohorts_df, user_col, date_col, value_col
                )
                
        # Analyse avancée
        results['advanced_analysis'] = {
            'cohort_quality': self._assess_cohort_quality(results['metrics']),
            'trends': self._analyze_trends(results['metrics']),
            'predictions': self._predict_future_metrics(results['metrics']),
            'segments': self._analyze_segments(cohorts_df) if self.config.segment_by else None
        }
        
        # Génération d'insights
        results['insights'] = self._generate_insights(results)
        
        # Visualisations
        results['visualizations'] = self._prepare_visualizations(results)
        
        return results
    
    def _prepare_data(self, df: pd.DataFrame, date_col: str) -> pd.DataFrame:
        """Préparation et nettoyage des données"""
        df = df.copy()
        
        # Conversion de la colonne date
        df[date_col] = pd.to_datetime(df[date_col])
        
        # Application des filtres si spécifiés
        if self.config.filters:
            for col, value in self.config.filters.items():
                if col in df.columns:
                    if isinstance(value, list):
                        df = df[df[col].isin(value)]
                    else:
                        df = df[df[col] == value]
        
        return df.sort_values(date_col)
    
    def _create_cohorts(self, df: pd.DataFrame, user_col: str, date_col: str) -> pd.DataFrame:
        """Création des cohortes selon la configuration"""
        if self.config.cohort_type == CohortType.TIME_BASED:
            return self._create_time_based_cohorts(df, user_col, date_col)
        elif self.config.cohort_type == CohortType.ACQUISITION_BASED:
            return self._create_acquisition_cohorts(df, user_col, date_col)
        elif self.config.cohort_type == CohortType.BEHAVIOR_BASED:
            return self._create_behavior_cohorts(df, user_col, date_col)
        else:
            return self._create_custom_cohorts(df, user_col, date_col)
    
    def _create_time_based_cohorts(self, df: pd.DataFrame, user_col: str, date_col: str) -> pd.DataFrame:
        """Création de cohortes basées sur le temps"""
        # Première apparition de chaque utilisateur
        first_appearance = df.groupby(user_col)[date_col].min().reset_index()
        first_appearance.columns = [user_col, 'cohort_date']
        
        # Ajustement selon la période
        if self.config.time_period == 'weekly':
            first_appearance['cohort_date'] = pd.to_datetime(
                first_appearance['cohort_date'].dt.to_period('W').dt.start_time
            )
        elif self.config.time_period == 'monthly':
            first_appearance['cohort_date'] = pd.to_datetime(
                first_appearance['cohort_date'].dt.to_period('M').dt.start_time
            )
        elif self.config.time_period == 'quarterly':
            first_appearance['cohort_date'] = pd.to_datetime(
                first_appearance['cohort_date'].dt.to_period('Q').dt.start_time
            )
        elif self.config.time_period == 'yearly':
            first_appearance['cohort_date'] = pd.to_datetime(
                first_appearance['cohort_date'].dt.to_period('Y').dt.start_time
            )
            
        # Filtrage par taille minimale de cohorte
        cohort_sizes = first_appearance.groupby('cohort_date').size()
        valid_cohorts = cohort_sizes[cohort_sizes >= self.config.min_cohort_size].index
        first_appearance = first_appearance[first_appearance['cohort_date'].isin(valid_cohorts)]
        
        return first_appearance
    
    def _calculate_retention(self, df: pd.DataFrame, cohorts_df: pd.DataFrame, 
                           user_col: str, date_col: str) -> Dict[str, Any]:
        """Calcul des métriques de rétention"""
        # Fusion avec les données de cohorte
        df_with_cohort = df.merge(cohorts_df, on=user_col)
        
        # Calcul de la période relative
        df_with_cohort['period'] = self._calculate_period_number(
            df_with_cohort[date_col], 
            df_with_cohort['cohort_date']
        )
        
        # Matrice de rétention
        retention_matrix = df_with_cohort.groupby(['cohort_date', 'period'])[user_col].nunique().unstack(fill_value=0)
        
        # Calcul des taux de rétention
        cohort_sizes = retention_matrix.iloc[:, 0]
        retention_rate = retention_matrix.divide(cohort_sizes, axis=0) * 100
        
        # Métriques avancées
        results = {
            'retention_matrix': retention_rate.round(2).to_dict(),
            'average_retention_curve': retention_rate.mean().to_dict(),
            'cohort_sizes': cohort_sizes.to_dict(),
            'retention_benchmarks': self._calculate_retention_benchmarks(retention_rate)
        }
        
        # Analyse de la rétention par segment si applicable
        if self.config.segment_by and self.config.segment_by in df.columns:
            results['retention_by_segment'] = self._calculate_segmented_retention(
                df_with_cohort, user_col, self.config.segment_by
            )
            
        return results
    
    def _calculate_revenue_metrics(self, df: pd.DataFrame, cohorts_df: pd.DataFrame,
                                 user_col: str, date_col: str, value_col: str) -> Dict[str, Any]:
        """Calcul des métriques de revenu par cohorte"""
        df_with_cohort = df.merge(cohorts_df, on=user_col)
        df_with_cohort['period'] = self._calculate_period_number(
            df_with_cohort[date_col], 
            df_with_cohort['cohort_date']
        )
        
        # Revenu cumulé par cohorte et période
        revenue_matrix = df_with_cohort.groupby(['cohort_date', 'period'])[value_col].sum().unstack(fill_value=0)
        
        # Revenu cumulatif
        cumulative_revenue = revenue_matrix.cumsum(axis=1)
        
        # ARPU par période
        user_counts = df_with_cohort.groupby(['cohort_date', 'period'])[user_col].nunique().unstack(fill_value=0)
        arpu_matrix = revenue_matrix.divide(user_counts.replace(0, np.nan))
        
        # Calcul du Revenue Retention
        cohort_first_period_revenue = revenue_matrix.iloc[:, 0]
        revenue_retention = revenue_matrix.divide(cohort_first_period_revenue, axis=0) * 100
        
        return {
            'revenue_matrix': revenue_matrix.round(2).to_dict(),
            'cumulative_revenue': cumulative_revenue.round(2).to_dict(),
            'arpu_matrix': arpu_matrix.round(2).to_dict(),
            'revenue_retention': revenue_retention.round(2).to_dict(),
            'average_arpu_curve': arpu_matrix.mean().round(2).to_dict(),
            'revenue_growth_rates': self._calculate_growth_rates(revenue_matrix)
        }
    
    def _calculate_engagement(self, df: pd.DataFrame, cohorts_df: pd.DataFrame,
                            user_col: str, date_col: str, event_col: str) -> Dict[str, Any]:
        """Calcul des métriques d'engagement"""
        df_with_cohort = df.merge(cohorts_df, on=user_col)
        df_with_cohort['period'] = self._calculate_period_number(
            df_with_cohort[date_col], 
            df_with_cohort['cohort_date']
        )
        
        # Actions par utilisateur par période
        engagement_data = df_with_cohort.groupby(['cohort_date', 'period', user_col])[event_col].count().reset_index()
        engagement_matrix = engagement_data.groupby(['cohort_date', 'period'])[event_col].mean().unstack(fill_value=0)
        
        # Taux d'utilisateurs actifs
        active_users = df_with_cohort.groupby(['cohort_date', 'period'])[user_col].nunique().unstack(fill_value=0)
        cohort_sizes = active_users.iloc[:, 0]
        activity_rate = active_users.divide(cohort_sizes, axis=0) * 100
        
        # Distribution des niveaux d'engagement
        engagement_levels = self._categorize_engagement_levels(engagement_data)
        
        return {
            'engagement_matrix': engagement_matrix.round(2).to_dict(),
            'activity_rate': activity_rate.round(2).to_dict(),
            'average_engagement_curve': engagement_matrix.mean().round(2).to_dict(),
            'engagement_distribution': engagement_levels,
            'power_users': self._identify_power_users(engagement_data)
        }
    
    def _calculate_churn(self, df: pd.DataFrame, cohorts_df: pd.DataFrame,
                        user_col: str, date_col: str) -> Dict[str, Any]:
        """Calcul des métriques de churn"""
        # Utilise les données de rétention pour calculer le churn
        retention_data = self._calculate_retention(df, cohorts_df, user_col, date_col)
        retention_matrix = pd.DataFrame(retention_data['retention_matrix'])
        
        # Churn = 100 - Retention
        churn_matrix = 100 - retention_matrix
        
        # Churn rate par période (différence entre périodes consécutives)
        period_churn = -retention_matrix.diff(axis=1)
        
        # Prédiction de churn avec régression
        churn_predictions = self._predict_churn_rates(churn_matrix)
        
        return {
            'churn_matrix': churn_matrix.round(2).to_dict(),
            'period_churn_rate': period_churn.round(2).to_dict(),
            'average_churn_curve': churn_matrix.mean().round(2).to_dict(),
            'churn_predictions': churn_predictions,
            'high_risk_cohorts': self._identify_high_churn_cohorts(churn_matrix)
        }
    
    def _calculate_ltv(self, df: pd.DataFrame, cohorts_df: pd.DataFrame,
                      user_col: str, date_col: str, value_col: str) -> Dict[str, Any]:
        """Calcul de la Customer Lifetime Value"""
        # Récupération des données de revenu
        revenue_data = self._calculate_revenue_metrics(df, cohorts_df, user_col, date_col, value_col)
        cumulative_revenue = pd.DataFrame(revenue_data['cumulative_revenue'])
        cohort_sizes = pd.Series(self._calculate_retention(df, cohorts_df, user_col, date_col)['cohort_sizes'])
        
        # LTV par cohorte = Revenu cumulé / Taille de la cohorte
        ltv_matrix = cumulative_revenue.divide(cohort_sizes, axis=0)
        
        # Projection LTV
        ltv_projections = self._project_ltv(ltv_matrix)
        
        # Calcul du payback period
        # TODO: Nécessite les coûts d'acquisition (CAC)
        
        return {
            'ltv_matrix': ltv_matrix.round(2).to_dict(),
            'current_ltv': ltv_matrix.iloc[:, -1].round(2).to_dict(),
            'projected_ltv': ltv_projections,
            'ltv_velocity': self._calculate_ltv_velocity(ltv_matrix),
            'ltv_segments': self._segment_by_ltv(ltv_matrix)
        }
    
    def _assess_cohort_quality(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Évaluation de la qualité des cohortes"""
        quality_scores = {}
        
        # Score de rétention
        if 'retention' in metrics:
            retention_df = pd.DataFrame(metrics['retention']['retention_matrix'])
            if not retention_df.empty and len(retention_df.columns) > 3:
                # Rétention à 3 périodes
                retention_3p = retention_df.iloc[:, 3].mean() if len(retention_df.columns) > 3 else 0
                quality_scores['retention_score'] = min(retention_3p / 30 * 100, 100)  # Normaliser sur 100
        
        # Score de revenu
        if 'revenue' in metrics:
            arpu_curve = metrics['revenue']['average_arpu_curve']
            if arpu_curve:
                # Croissance ARPU
                arpu_values = list(arpu_curve.values())
                if len(arpu_values) > 1 and arpu_values[0] > 0:
                    arpu_growth = (arpu_values[-1] - arpu_values[0]) / arpu_values[0] * 100
                    quality_scores['revenue_score'] = min(max(arpu_growth, 0), 100)
        
        # Score global
        if quality_scores:
            quality_scores['overall_score'] = np.mean(list(quality_scores.values()))
        
        # Classification des cohortes
        quality_scores['cohort_classification'] = self._classify_cohorts(metrics)
        
        return quality_scores
    
    def _analyze_trends(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse des tendances dans les métriques"""
        trends = {}
        
        # Tendance de rétention
        if 'retention' in metrics:
            retention_curve = metrics['retention']['average_retention_curve']
            if retention_curve:
                trends['retention_trend'] = self._detect_trend(list(retention_curve.values()))
                trends['retention_stability'] = self._calculate_stability(list(retention_curve.values()))
        
        # Tendance de revenu
        if 'revenue' in metrics:
            arpu_curve = metrics['revenue']['average_arpu_curve']
            if arpu_curve:
                trends['revenue_trend'] = self._detect_trend(list(arpu_curve.values()))
                trends['revenue_acceleration'] = self._calculate_acceleration(list(arpu_curve.values()))
        
        # Points d'inflexion
        trends['inflection_points'] = self._find_inflection_points(metrics)
        
        return trends
    
    def _predict_future_metrics(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Prédiction des métriques futures"""
        predictions = {}
        
        # Prédiction de rétention
        if 'retention' in metrics:
            retention_matrix = pd.DataFrame(metrics['retention']['retention_matrix'])
            if not retention_matrix.empty:
                predictions['retention_forecast'] = self._forecast_retention(retention_matrix)
        
        # Prédiction de revenu
        if 'revenue' in metrics:
            revenue_matrix = pd.DataFrame(metrics['revenue']['revenue_matrix'])
            if not revenue_matrix.empty:
                predictions['revenue_forecast'] = self._forecast_revenue(revenue_matrix)
        
        # Intervalles de confiance
        predictions['confidence_intervals'] = self._calculate_confidence_intervals(predictions)
        
        return predictions
    
    def _analyze_segments(self, cohorts_df: pd.DataFrame) -> Dict[str, Any]:
        """Analyse par segments si configuré"""
        # TODO: Implémenter l'analyse par segments
        return {
            'segment_sizes': {},
            'segment_performance': {},
            'segment_recommendations': []
        }
    
    def _generate_insights(self, results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Génération d'insights automatiques"""
        insights = []
        
        # Insights sur la rétention
        if 'retention' in results.get('metrics', {}):
            retention_insights = self._generate_retention_insights(results['metrics']['retention'])
            insights.extend(retention_insights)
        
        # Insights sur le revenu
        if 'revenue' in results.get('metrics', {}):
            revenue_insights = self._generate_revenue_insights(results['metrics']['revenue'])
            insights.extend(revenue_insights)
        
        # Insights sur la qualité des cohortes
        if 'cohort_quality' in results.get('advanced_analysis', {}):
            quality_insights = self._generate_quality_insights(results['advanced_analysis']['cohort_quality'])
            insights.extend(quality_insights)
        
        # Priorisation des insights
        insights.sort(key=lambda x: x.get('priority', 0), reverse=True)
        
        return insights[:10]  # Top 10 insights
    
    def _prepare_visualizations(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Préparation des données pour visualisation"""
        viz_data = {}
        
        # Heatmap de rétention
        if 'retention' in results.get('metrics', {}):
            viz_data['retention_heatmap'] = {
                'data': results['metrics']['retention']['retention_matrix'],
                'type': 'heatmap',
                'title': 'Matrice de Rétention par Cohorte',
                'x_label': 'Période',
                'y_label': 'Cohorte'
            }
        
        # Courbes d'évolution
        if results.get('metrics'):
            curves = []
            if 'retention' in results['metrics']:
                curves.append({
                    'name': 'Rétention Moyenne',
                    'data': results['metrics']['retention']['average_retention_curve'],
                    'type': 'line'
                })
            if 'revenue' in results['metrics']:
                curves.append({
                    'name': 'ARPU Moyen',
                    'data': results['metrics']['revenue']['average_arpu_curve'],
                    'type': 'line',
                    'y_axis': 'secondary'
                })
            
            if curves:
                viz_data['evolution_curves'] = {
                    'series': curves,
                    'type': 'multi_line',
                    'title': 'Évolution des Métriques par Période'
                }
        
        # Waterfall chart pour LTV
        if 'ltv' in results.get('metrics', {}):
            viz_data['ltv_waterfall'] = {
                'data': results['metrics']['ltv']['ltv_velocity'],
                'type': 'waterfall',
                'title': 'Composition de la LTV par Période'
            }
        
        return viz_data
    
    # Méthodes utilitaires
    def _calculate_period_number(self, current_date: pd.Series, cohort_date: pd.Series) -> pd.Series:
        """Calcule le numéro de période selon la configuration"""
        if self.config.time_period == 'daily':
            return (current_date - cohort_date).dt.days
        elif self.config.time_period == 'weekly':
            return (current_date - cohort_date).dt.days // 7
        elif self.config.time_period == 'monthly':
            return ((current_date.dt.year - cohort_date.dt.year) * 12 + 
                    (current_date.dt.month - cohort_date.dt.month))
        elif self.config.time_period == 'quarterly':
            return ((current_date.dt.year - cohort_date.dt.year) * 4 + 
                    (current_date.dt.quarter - cohort_date.dt.quarter))
        else:  # yearly
            return current_date.dt.year - cohort_date.dt.year
    
    def _calculate_retention_benchmarks(self, retention_rate: pd.DataFrame) -> Dict[str, float]:
        """Calcule les benchmarks de rétention"""
        benchmarks = {}
        
        if len(retention_rate.columns) > 0:
            benchmarks['day_1'] = retention_rate.iloc[:, 1].mean() if len(retention_rate.columns) > 1 else 0
            benchmarks['day_7'] = retention_rate.iloc[:, 7].mean() if len(retention_rate.columns) > 7 else 0
            benchmarks['day_30'] = retention_rate.iloc[:, 30].mean() if len(retention_rate.columns) > 30 else 0
            
        return benchmarks
    
    def _detect_trend(self, values: List[float]) -> str:
        """Détecte la tendance dans une série de valeurs"""
        if len(values) < 3:
            return "insufficient_data"
        
        # Régression linéaire simple
        x = np.arange(len(values))
        slope = np.polyfit(x, values, 1)[0]
        
        if abs(slope) < 0.5:
            return "stable"
        elif slope > 0:
            return "increasing"
        else:
            return "decreasing"
    
    def _calculate_stability(self, values: List[float]) -> float:
        """Calcule la stabilité d'une métrique (0-100)"""
        if len(values) < 2:
            return 100
        
        cv = np.std(values) / (np.mean(values) + 1e-10) * 100
        return max(0, 100 - cv)
    
    def _forecast_retention(self, retention_matrix: pd.DataFrame) -> Dict[str, Any]:
        """Prévision de la rétention future"""
        # Modèle simple basé sur la moyenne des tendances
        avg_retention = retention_matrix.mean()
        
        if len(avg_retention) < 3:
            return {}
        
        # Extrapolation logarithmique
        x = np.arange(len(avg_retention))
        y = avg_retention.values
        
        # Fit logarithmique: y = a * log(x + 1) + b
        log_x = np.log(x + 1)
        coeffs = np.polyfit(log_x[1:], y[1:], 1)  # Exclure période 0
        
        # Prédiction pour les périodes futures
        future_periods = range(len(avg_retention), min(len(avg_retention) + 12, self.config.max_periods))
        predictions = {}
        
        for period in future_periods:
            pred_value = coeffs[0] * np.log(period + 1) + coeffs[1]
            predictions[period] = max(0, min(100, pred_value))
        
        return {
            'predictions': predictions,
            'model': 'logarithmic',
            'r_squared': self._calculate_r_squared(y[1:], coeffs, log_x[1:])
        }
    
    def _generate_retention_insights(self, retention_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Génère des insights sur la rétention"""
        insights = []
        
        # Analyse de la courbe de rétention moyenne
        avg_curve = retention_data.get('average_retention_curve', {})
        if avg_curve and len(avg_curve) > 3:
            values = list(avg_curve.values())
            
            # Chute initiale
            if len(values) > 1 and values[0] > 0:
                initial_drop = (values[0] - values[1]) / values[0] * 100
                if initial_drop > 50:
                    insights.append({
                        'type': 'retention_drop',
                        'priority': 9,
                        'title': 'Forte chute de rétention initiale',
                        'description': f'La rétention chute de {initial_drop:.1f}% après la première période',
                        'recommendation': 'Améliorer l\'onboarding et l\'activation des nouveaux utilisateurs'
                    })
            
            # Stabilisation
            if len(values) > 10:
                late_stability = np.std(values[7:]) / (np.mean(values[7:]) + 1e-10)
                if late_stability < 0.1:
                    stable_value = np.mean(values[7:])
                    insights.append({
                        'type': 'retention_stability',
                        'priority': 5,
                        'title': 'Rétention stable détectée',
                        'description': f'La rétention se stabilise autour de {stable_value:.1f}% après la période 7',
                        'recommendation': 'Focus sur l\'acquisition de nouveaux utilisateurs de qualité'
                    })
        
        return insights
    
    def _generate_revenue_insights(self, revenue_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Génère des insights sur le revenu"""
        insights = []
        
        # Analyse de l'ARPU
        arpu_curve = revenue_data.get('average_arpu_curve', {})
        if arpu_curve:
            values = list(arpu_curve.values())
            
            # Croissance de l'ARPU
            if len(values) > 1 and values[0] > 0:
                arpu_growth = (values[-1] - values[0]) / values[0] * 100
                if arpu_growth > 50:
                    insights.append({
                        'type': 'arpu_growth',
                        'priority': 8,
                        'title': 'Forte croissance de l\'ARPU',
                        'description': f'L\'ARPU a augmenté de {arpu_growth:.1f}% sur la période analysée',
                        'recommendation': 'Identifier et répliquer les facteurs de cette croissance'
                    })
                elif arpu_growth < -20:
                    insights.append({
                        'type': 'arpu_decline',
                        'priority': 9,
                        'title': 'Déclin de l\'ARPU détecté',
                        'description': f'L\'ARPU a diminué de {abs(arpu_growth):.1f}%',
                        'recommendation': 'Revoir la stratégie de pricing et l\'engagement utilisateur'
                    })
        
        return insights
    
    def _calculate_r_squared(self, y_true: np.ndarray, coeffs: np.ndarray, x: np.ndarray) -> float:
        """Calcule le coefficient de détermination R²"""
        y_pred = coeffs[0] * x + coeffs[1]
        ss_res = np.sum((y_true - y_pred) ** 2)
        ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
        return 1 - (ss_res / (ss_tot + 1e-10))

# Classes helper pour utilisation facile
class CohortAnalysis:
    """Interface simplifiée pour l'analyse de cohortes"""
    
    @staticmethod
    def retention_analysis(df: pd.DataFrame, 
                          user_col: str, 
                          date_col: str,
                          time_period: str = 'monthly') -> Dict[str, Any]:
        """Analyse de rétention simple"""
        config = CohortConfig(
            cohort_type=CohortType.TIME_BASED,
            time_period=time_period,
            metrics=[MetricType.RETENTION, MetricType.CHURN]
        )
        analyzer = CohortAnalyzer(config)
        return analyzer.analyze(df, user_col, date_col)
    
    @staticmethod
    def revenue_cohort_analysis(df: pd.DataFrame,
                               user_col: str,
                               date_col: str,
                               revenue_col: str,
                               time_period: str = 'monthly') -> Dict[str, Any]:
        """Analyse de cohortes avec métriques de revenu"""
        config = CohortConfig(
            cohort_type=CohortType.TIME_BASED,
            time_period=time_period,
            metrics=[MetricType.RETENTION, MetricType.REVENUE, MetricType.LTV, MetricType.ARPU]
        )
        analyzer = CohortAnalyzer(config)
        return analyzer.analyze(df, user_col, date_col, value_col=revenue_col)
    
    @staticmethod
    def engagement_cohort_analysis(df: pd.DataFrame,
                                  user_col: str,
                                  date_col: str,
                                  event_col: str,
                                  time_period: str = 'weekly') -> Dict[str, Any]:
        """Analyse de l'engagement par cohortes"""
        config = CohortConfig(
            cohort_type=CohortType.TIME_BASED,
            time_period=time_period,
            metrics=[MetricType.RETENTION, MetricType.ENGAGEMENT]
        )
        analyzer = CohortAnalyzer(config)
        return analyzer.analyze(df, user_col, date_col, event_col=event_col)