# app/analytics/intelligent_eda.py
"""
Module d'Analyse Exploratoire Intelligente (EDA)
Détection automatique de patterns et insights
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import warnings
from scipy import stats
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import DBSCAN
from sklearn.ensemble import IsolationForest
import json

warnings.filterwarnings('ignore')

@dataclass
class PatternDetection:
    """Structure pour stocker les patterns détectés"""
    pattern_type: str
    confidence: float
    description: str
    affected_columns: List[str]
    details: Dict[str, Any]
    recommendations: List[str]

class IntelligentEDA:
    """
    Classe principale pour l'analyse exploratoire intelligente
    """
    
    def __init__(self):
        self.patterns = []
        self.insights = {}
        self.data_quality_score = 0
        
    def analyze(self, df: pd.DataFrame, 
                target_column: Optional[str] = None,
                sector: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyse complète et intelligente du dataset
        """
        self.df = df
        self.target_column = target_column
        self.sector = sector
        
        results = {
            'basic_stats': self._compute_basic_stats(),
            'data_quality': self._assess_data_quality(),
            'patterns': self._detect_patterns(),
            'correlations': self._analyze_correlations(),
            'anomalies': self._detect_anomalies(),
            'time_patterns': self._analyze_time_patterns() if self._has_datetime_columns() else None,
            'distributions': self._analyze_distributions(),
            'insights': self._generate_insights(),
            'recommendations': self._generate_recommendations()
        }
        
        return results
    
    def _compute_basic_stats(self) -> Dict[str, Any]:
        """Calcul des statistiques de base améliorées"""
        stats = {
            'shape': self.df.shape,
            'memory_usage': f"{self.df.memory_usage(deep=True).sum() / 1024**2:.2f} MB",
            'dtypes': self.df.dtypes.value_counts().to_dict(),
            'numerical_columns': self.df.select_dtypes(include=[np.number]).columns.tolist(),
            'categorical_columns': self.df.select_dtypes(include=['object', 'category']).columns.tolist(),
            'datetime_columns': self.df.select_dtypes(include=['datetime64']).columns.tolist()
        }
        
        # Statistiques avancées pour colonnes numériques
        numeric_df = self.df.select_dtypes(include=[np.number])
        if not numeric_df.empty:
            stats['advanced_stats'] = {
                'skewness': numeric_df.skew().to_dict(),
                'kurtosis': numeric_df.kurtosis().to_dict(),
                'coefficient_variation': (numeric_df.std() / numeric_df.mean()).to_dict()
            }
            
        return stats
    
    def _assess_data_quality(self) -> Dict[str, Any]:
        """Évaluation approfondie de la qualité des données"""
        quality_report = {
            'missing_values': {},
            'duplicates': {},
            'outliers': {},
            'data_types_issues': {},
            'overall_score': 0
        }
        
        # Analyse des valeurs manquantes
        missing = self.df.isnull().sum()
        missing_pct = (missing / len(self.df)) * 100
        
        for col in missing[missing > 0].index:
            quality_report['missing_values'][col] = {
                'count': int(missing[col]),
                'percentage': float(missing_pct[col]),
                'pattern': self._analyze_missing_pattern(col)
            }
        
        # Détection des doublons
        duplicates = self.df.duplicated().sum()
        quality_report['duplicates'] = {
            'total': int(duplicates),
            'percentage': float((duplicates / len(self.df)) * 100),
            'duplicate_rows': self._find_duplicate_patterns()
        }
        
        # Calcul du score global
        penalties = {
            'missing': len(quality_report['missing_values']) * 5,
            'duplicates': min(quality_report['duplicates']['percentage'] * 2, 20),
            'outliers': 0  # Calculé après
        }
        
        quality_report['overall_score'] = max(100 - sum(penalties.values()), 0)
        self.data_quality_score = quality_report['overall_score']
        
        return quality_report
    
    def _detect_patterns(self) -> List[PatternDetection]:
        """Détection automatique de patterns dans les données"""
        patterns = []
        
        # Pattern 1: Colonnes constantes
        for col in self.df.columns:
            if self.df[col].nunique() == 1:
                patterns.append(PatternDetection(
                    pattern_type="constant_column",
                    confidence=1.0,
                    description=f"La colonne '{col}' contient une valeur unique",
                    affected_columns=[col],
                    details={'unique_value': str(self.df[col].iloc[0])},
                    recommendations=[f"Envisager de supprimer la colonne '{col}'"]
                ))
        
        # Pattern 2: Colonnes quasi-constantes
        for col in self.df.columns:
            value_counts = self.df[col].value_counts()
            if len(value_counts) > 1 and value_counts.iloc[0] / len(self.df) > 0.95:
                patterns.append(PatternDetection(
                    pattern_type="quasi_constant",
                    confidence=0.9,
                    description=f"La colonne '{col}' est dominée par une valeur",
                    affected_columns=[col],
                    details={
                        'dominant_value': str(value_counts.index[0]),
                        'percentage': float(value_counts.iloc[0] / len(self.df) * 100)
                    },
                    recommendations=[f"Vérifier la pertinence de la colonne '{col}'"]
                ))
        
        # Pattern 3: Corrélations parfaites
        numeric_df = self.df.select_dtypes(include=[np.number])
        if len(numeric_df.columns) > 1:
            corr_matrix = numeric_df.corr()
            for i in range(len(corr_matrix.columns)):
                for j in range(i+1, len(corr_matrix.columns)):
                    if abs(corr_matrix.iloc[i, j]) > 0.99:
                        patterns.append(PatternDetection(
                            pattern_type="perfect_correlation",
                            confidence=abs(corr_matrix.iloc[i, j]),
                            description="Corrélation parfaite détectée",
                            affected_columns=[corr_matrix.columns[i], corr_matrix.columns[j]],
                            details={'correlation': float(corr_matrix.iloc[i, j])},
                            recommendations=["Envisager de supprimer l'une des colonnes redondantes"]
                        ))
        
        # Pattern 4: Séquences temporelles
        for col in self.df.select_dtypes(include=[np.number]).columns:
            if self._is_sequential(self.df[col]):
                patterns.append(PatternDetection(
                    pattern_type="sequential_data",
                    confidence=0.95,
                    description=f"La colonne '{col}' semble être une séquence",
                    affected_columns=[col],
                    details={'type': 'incremental' if self.df[col].is_monotonic_increasing else 'pattern'},
                    recommendations=[f"Vérifier si '{col}' est un identifiant ou un index"]
                ))
        
        self.patterns = patterns
        return patterns
    
    def _analyze_correlations(self) -> Dict[str, Any]:
        """Analyse avancée des corrélations"""
        numeric_df = self.df.select_dtypes(include=[np.number])
        
        if numeric_df.empty:
            return {'message': 'Aucune colonne numérique pour l\'analyse de corrélation'}
        
        correlations = {
            'pearson': numeric_df.corr(method='pearson').to_dict(),
            'significant_correlations': [],
            'target_correlations': None
        }
        
        # Corrélations significatives
        corr_matrix = numeric_df.corr()
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                corr_value = corr_matrix.iloc[i, j]
                if abs(corr_value) > 0.5 and abs(corr_value) < 0.99:
                    correlations['significant_correlations'].append({
                        'columns': [corr_matrix.columns[i], corr_matrix.columns[j]],
                        'correlation': float(corr_value),
                        'strength': 'forte' if abs(corr_value) > 0.7 else 'modérée'
                    })
        
        # Corrélations avec la cible si spécifiée
        if self.target_column and self.target_column in numeric_df.columns:
            target_corr = numeric_df.corr()[self.target_column].sort_values(ascending=False)
            correlations['target_correlations'] = {
                'top_positive': target_corr[target_corr > 0.3].to_dict(),
                'top_negative': target_corr[target_corr < -0.3].to_dict()
            }
        
        return correlations
    
    def _detect_anomalies(self) -> Dict[str, Any]:
        """Détection d'anomalies multi-méthodes"""
        anomalies = {
            'statistical_outliers': {},
            'isolation_forest': {},
            'multivariate_outliers': []
        }
        
        numeric_df = self.df.select_dtypes(include=[np.number])
        
        # 1. Outliers statistiques (IQR method)
        for col in numeric_df.columns:
            Q1 = numeric_df[col].quantile(0.25)
            Q3 = numeric_df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outliers = numeric_df[(numeric_df[col] < lower_bound) | (numeric_df[col] > upper_bound)]
            if len(outliers) > 0:
                anomalies['statistical_outliers'][col] = {
                    'count': len(outliers),
                    'percentage': float(len(outliers) / len(self.df) * 100),
                    'bounds': {'lower': float(lower_bound), 'upper': float(upper_bound)},
                    'indices': outliers.index.tolist()[:10]  # Top 10 pour éviter trop de données
                }
        
        # 2. Isolation Forest pour anomalies multivariées
        if len(numeric_df.columns) > 1 and len(numeric_df) > 10:
            try:
                iso_forest = IsolationForest(contamination=0.1, random_state=42)
                predictions = iso_forest.fit_predict(numeric_df.fillna(numeric_df.median()))
                anomaly_indices = np.where(predictions == -1)[0]
                
                anomalies['isolation_forest'] = {
                    'count': len(anomaly_indices),
                    'percentage': float(len(anomaly_indices) / len(self.df) * 100),
                    'indices': anomaly_indices.tolist()[:20]
                }
            except:
                pass
        
        return anomalies
    
    def _analyze_time_patterns(self) -> Dict[str, Any]:
        """Analyse des patterns temporels si données temporelles présentes"""
        time_patterns = {}
        datetime_cols = self.df.select_dtypes(include=['datetime64']).columns
        
        for col in datetime_cols:
            patterns = {
                'range': {
                    'start': str(self.df[col].min()),
                    'end': str(self.df[col].max()),
                    'duration_days': (self.df[col].max() - self.df[col].min()).days
                },
                'frequency': self._detect_frequency(self.df[col]),
                'seasonality': self._detect_seasonality(self.df[col]),
                'trends': self._detect_time_trends(self.df[col])
            }
            time_patterns[col] = patterns
            
        return time_patterns
    
    def _analyze_distributions(self) -> Dict[str, Any]:
        """Analyse des distributions des variables"""
        distributions = {
            'numerical': {},
            'categorical': {}
        }
        
        # Distributions numériques
        for col in self.df.select_dtypes(include=[np.number]).columns:
            data = self.df[col].dropna()
            if len(data) > 0:
                distributions['numerical'][col] = {
                    'type': self._identify_distribution(data),
                    'normality_test': stats.normaltest(data).pvalue if len(data) > 8 else None,
                    'histogram_bins': np.histogram(data, bins='auto')[0].tolist()[:20]
                }
        
        # Distributions catégorielles
        for col in self.df.select_dtypes(include=['object', 'category']).columns:
            value_counts = self.df[col].value_counts()
            distributions['categorical'][col] = {
                'unique_values': int(self.df[col].nunique()),
                'top_values': value_counts.head(10).to_dict(),
                'entropy': self._calculate_entropy(self.df[col])
            }
            
        return distributions
    
    def _generate_insights(self) -> List[Dict[str, Any]]:
        """Génération d'insights automatiques"""
        insights = []
        
        # Insight 1: Qualité des données
        if self.data_quality_score < 70:
            insights.append({
                'type': 'data_quality',
                'priority': 'high',
                'message': f"La qualité des données est faible ({self.data_quality_score}/100)",
                'action': "Nettoyer les données avant l'analyse approfondie"
            })
        
        # Insight 2: Déséquilibre de classes (si target définie)
        if self.target_column and self.target_column in self.df.columns:
            if self.df[self.target_column].dtype == 'object':
                value_counts = self.df[self.target_column].value_counts()
                if len(value_counts) > 1:
                    imbalance_ratio = value_counts.iloc[0] / value_counts.iloc[-1]
                    if imbalance_ratio > 5:
                        insights.append({
                            'type': 'class_imbalance',
                            'priority': 'high',
                            'message': f"Déséquilibre important détecté dans '{self.target_column}'",
                            'action': "Considérer des techniques de rééquilibrage (SMOTE, undersampling)"
                        })
        
        # Insight 3: Dimensionnalité
        if len(self.df.columns) > 50:
            insights.append({
                'type': 'high_dimensionality',
                'priority': 'medium',
                'message': f"Dataset de haute dimension ({len(self.df.columns)} colonnes)",
                'action': "Envisager une réduction de dimension (PCA, sélection de features)"
            })
        
        # Insight 4: Patterns détectés
        for pattern in self.patterns[:3]:  # Top 3 patterns
            insights.append({
                'type': 'pattern_detected',
                'priority': 'medium',
                'message': pattern.description,
                'action': pattern.recommendations[0] if pattern.recommendations else "Analyser plus en détail"
            })
            
        return insights
    
    def _generate_recommendations(self) -> List[Dict[str, str]]:
        """Génération de recommandations basées sur l'analyse"""
        recommendations = []
        
        # Recommandations basées sur la qualité des données
        if self.data_quality_score < 80:
            recommendations.append({
                'category': 'preprocessing',
                'recommendation': 'Implémenter un pipeline de nettoyage des données',
                'priority': 'high',
                'details': 'Traiter les valeurs manquantes, supprimer les doublons, gérer les outliers'
            })
        
        # Recommandations pour features engineering
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 3:
            recommendations.append({
                'category': 'feature_engineering',
                'recommendation': 'Créer des features polynomiales ou d\'interaction',
                'priority': 'medium',
                'details': 'Explorer les interactions entre variables numériques'
            })
        
        # Recommandations sectorielles
        if self.sector:
            sector_recommendations = self._get_sector_recommendations()
            recommendations.extend(sector_recommendations)
            
        return recommendations
    
    # Méthodes utilitaires
    def _analyze_missing_pattern(self, column: str) -> str:
        """Analyse le pattern des valeurs manquantes"""
        missing_mask = self.df[column].isnull()
        if missing_mask.sum() == 0:
            return "no_missing"
        
        # Vérifier si les manquants sont consécutifs
        missing_indices = np.where(missing_mask)[0]
        if len(missing_indices) > 1:
            diffs = np.diff(missing_indices)
            if np.all(diffs == 1):
                return "consecutive"
            elif np.std(diffs) < 5:
                return "clustered"
        
        return "random"
    
    def _find_duplicate_patterns(self) -> Dict[str, Any]:
        """Trouve les patterns de duplication"""
        dup_mask = self.df.duplicated(keep=False)
        if dup_mask.sum() == 0:
            return {}
            
        dup_groups = self.df[dup_mask].groupby(list(self.df.columns)).size()
        
        return {
            'max_duplicates': int(dup_groups.max()),
            'duplicate_groups': len(dup_groups),
            'most_duplicated': dup_groups.head(5).to_dict()
        }
    
    def _is_sequential(self, series: pd.Series) -> bool:
        """Vérifie si une série est séquentielle"""
        if len(series.dropna()) < 3:
            return False
            
        diffs = series.dropna().diff().dropna()
        return diffs.std() < 0.001 or series.is_monotonic_increasing or series.is_monotonic_decreasing
    
    def _has_datetime_columns(self) -> bool:
        """Vérifie la présence de colonnes datetime"""
        return len(self.df.select_dtypes(include=['datetime64']).columns) > 0
    
    def _detect_frequency(self, datetime_series: pd.Series) -> str:
        """Détecte la fréquence d'une série temporelle"""
        if len(datetime_series) < 2:
            return "unknown"
            
        deltas = datetime_series.sort_values().diff().dropna()
        mode_delta = deltas.mode()[0] if len(deltas.mode()) > 0 else deltas.median()
        
        if mode_delta <= timedelta(hours=1):
            return "hourly"
        elif mode_delta <= timedelta(days=1):
            return "daily"
        elif mode_delta <= timedelta(days=7):
            return "weekly"
        elif mode_delta <= timedelta(days=31):
            return "monthly"
        else:
            return "irregular"
    
    def _detect_seasonality(self, datetime_series: pd.Series) -> Dict[str, Any]:
        """Détecte la saisonnalité dans une série temporelle"""
        if len(datetime_series) < 365:
            return {'detected': False, 'message': 'Pas assez de données pour détecter la saisonnalité'}
            
        # Analyse basique par mois
        months = pd.to_datetime(datetime_series).dt.month
        month_counts = months.value_counts()
        
        # Test de chi-carré pour l'uniformité
        expected = len(months) / 12
        chi2, p_value = stats.chisquare(month_counts.sort_index())
        
        return {
            'detected': p_value < 0.05,
            'p_value': float(p_value),
            'peak_months': month_counts.nlargest(3).index.tolist() if p_value < 0.05 else []
        }
    
    def _detect_time_trends(self, datetime_series: pd.Series) -> Dict[str, str]:
        """Détecte les tendances temporelles"""
        # Simplified trend detection
        sorted_series = datetime_series.sort_values()
        time_range = (sorted_series.iloc[-1] - sorted_series.iloc[0]).days
        
        return {
            'coverage': f"{time_range} jours",
            'completeness': f"{len(datetime_series.dropna()) / len(datetime_series) * 100:.1f}%"
        }
    
    def _identify_distribution(self, data: pd.Series) -> str:
        """Identifie le type de distribution"""
        # Tests simplifiés pour différentes distributions
        _, p_normal = stats.normaltest(data)
        
        if p_normal > 0.05:
            return "normal"
        
        skew = stats.skew(data)
        if abs(skew) > 2:
            return "highly_skewed"
        elif abs(skew) > 1:
            return "moderately_skewed"
        
        # Test pour distribution uniforme
        _, p_uniform = stats.kstest(data, 'uniform')
        if p_uniform > 0.05:
            return "uniform"
            
        return "other"
    
    def _calculate_entropy(self, series: pd.Series) -> float:
        """Calcule l'entropie d'une série catégorielle"""
        value_counts = series.value_counts()
        probabilities = value_counts / len(series)
        entropy = -np.sum(probabilities * np.log2(probabilities + 1e-10))
        return float(entropy)
    
    def _get_sector_recommendations(self) -> List[Dict[str, str]]:
        """Recommandations spécifiques par secteur"""
        sector_recs = {
            'banque': [
                {
                    'category': 'compliance',
                    'recommendation': 'Implémenter des contrôles de conformité RGPD',
                    'priority': 'high',
                    'details': 'Anonymiser les données sensibles, tracer les traitements'
                },
                {
                    'category': 'risk_analysis',
                    'recommendation': 'Ajouter des métriques de risque',
                    'priority': 'high',
                    'details': 'Calculer VaR, stress tests, ratios prudentiels'
                }
            ],
            'sante': [
                {
                    'category': 'privacy',
                    'recommendation': 'Appliquer les standards HIPAA/RGPD santé',
                    'priority': 'high',
                    'details': 'Chiffrer les données patients, pseudonymiser'
                },
                {
                    'category': 'clinical_metrics',
                    'recommendation': 'Calculer des indicateurs cliniques',
                    'priority': 'medium',
                    'details': 'Taux de réadmission, durée de séjour, outcomes'
                }
            ],
            'retail': [
                {
                    'category': 'customer_analysis',
                    'recommendation': 'Segmenter la clientèle',
                    'priority': 'high',
                    'details': 'RFM analysis, CLV, churn prediction'
                },
                {
                    'category': 'seasonality',
                    'recommendation': 'Analyser les patterns saisonniers',
                    'priority': 'medium',
                    'details': 'Identifier pics de vente, optimiser stocks'
                }
            ]
        }
        
        return sector_recs.get(self.sector.lower(), [])

# Fonction helper pour l'utilisation facile
def run_intelligent_eda(df: pd.DataFrame, 
                       target_column: Optional[str] = None,
                       sector: Optional[str] = None) -> Dict[str, Any]:
    """
    Fonction wrapper pour exécuter l'EDA intelligent
    
    Args:
        df: DataFrame à analyser
        target_column: Colonne cible (optionnel)
        sector: Secteur d'activité (optionnel)
    
    Returns:
        Dictionnaire avec tous les résultats de l'analyse
    """
    eda = IntelligentEDA()
    return eda.analyze(df, target_column, sector)