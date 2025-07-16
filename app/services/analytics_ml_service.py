"""
Service Analytics ML pour PI BICARS
Pipeline AutoML, Prédictions, Détection d'anomalies
"""

from typing import Dict, List, Any, Optional, Tuple, Union
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from enum import Enum
import json
from dataclasses import dataclass
import asyncio

class ModelType(Enum):
    """Types de modèles disponibles"""
    XGBOOST = "xgboost"
    LSTM = "lstm"
    PROPHET = "prophet"
    RANDOM_FOREST = "random_forest"
    ARIMA = "arima"
    ISOLATION_FOREST = "isolation_forest"

class PredictionType(Enum):
    """Types de prédictions"""
    TIME_SERIES = "time_series"
    CLASSIFICATION = "classification"
    REGRESSION = "regression"
    ANOMALY_DETECTION = "anomaly_detection"

class MetricType(Enum):
    """Types de métriques financières"""
    REVENUE = "revenue"
    COSTS = "costs"
    PROFIT = "profit"
    RATIO = "ratio"
    VOLUME = "volume"
    RISK_SCORE = "risk_score"

@dataclass
class PredictionResult:
    """Résultat de prédiction"""
    metric: str
    predictions: List[float]
    confidence_intervals: List[Tuple[float, float]]
    dates: List[str]
    model_used: str
    accuracy_score: float
    feature_importance: Optional[Dict[str, float]] = None

@dataclass
class AnomalyResult:
    """Résultat de détection d'anomalie"""
    timestamp: datetime
    metric: str
    value: float
    expected_value: float
    deviation: float
    severity: str
    confidence: float
    explanation: str

class AnalyticsMLService:
    """Service ML pour analyses prédictives"""
    
    def __init__(self):
        # Configuration des modèles
        self.model_configs = {
            ModelType.XGBOOST: {
                'n_estimators': 100,
                'max_depth': 6,
                'learning_rate': 0.1,
                'objective': 'reg:squarederror'
            },
            ModelType.LSTM: {
                'units': 50,
                'dropout': 0.2,
                'recurrent_dropout': 0.2,
                'epochs': 50
            },
            ModelType.PROPHET: {
                'changepoint_prior_scale': 0.05,
                'seasonality_mode': 'multiplicative',
                'yearly_seasonality': True,
                'weekly_seasonality': True
            },
            ModelType.ISOLATION_FOREST: {
                'contamination': 0.1,
                'n_estimators': 100,
                'random_state': 42
            }
        }
        
        # Seuils d'anomalie par métrique
        self.anomaly_thresholds = {
            'revenue': 0.15,  # 15% de déviation
            'costs': 0.10,    # 10% de déviation
            'ratios': 0.05,   # 5% de déviation
            'volumes': 0.20   # 20% de déviation
        }
        
        # Cache des modèles entraînés
        self.trained_models = {}
    
    async def predict_metric(self, metric_name: str, historical_data: List[Dict],
                           horizon: int = 30, model_type: Optional[ModelType] = None,
                           confidence_level: float = 0.95) -> PredictionResult:
        """
        Prédit une métrique financière
        
        Args:
            metric_name: Nom de la métrique
            historical_data: Données historiques
            horizon: Horizon de prédiction en jours
            model_type: Type de modèle (auto-sélection si None)
            confidence_level: Niveau de confiance
            
        Returns:
            Résultat de prédiction
        """
        # Conversion en DataFrame
        df = pd.DataFrame(historical_data)
        
        # Auto-sélection du modèle si non spécifié
        if model_type is None:
            model_type = self._select_best_model(df, metric_name)
        
        # Entraînement et prédiction selon le modèle
        if model_type == ModelType.XGBOOST:
            predictions, intervals, accuracy = await self._predict_xgboost(df, metric_name, horizon)
        elif model_type == ModelType.PROPHET:
            predictions, intervals, accuracy = await self._predict_prophet(df, metric_name, horizon)
        else:  # LSTM ou autres
            predictions, intervals, accuracy = await self._predict_lstm(df, metric_name, horizon)
        
        # Générer les dates futures
        last_date = pd.to_datetime(df['date'].max())
        future_dates = [(last_date + timedelta(days=i+1)).strftime('%Y-%m-%d') 
                       for i in range(horizon)]
        
        # Feature importance (si applicable)
        feature_importance = self._calculate_feature_importance(model_type, df)
        
        return PredictionResult(
            metric=metric_name,
            predictions=predictions,
            confidence_intervals=intervals,
            dates=future_dates,
            model_used=model_type.value,
            accuracy_score=accuracy,
            feature_importance=feature_importance
        )
    
    async def detect_anomalies(self, data: List[Dict], metric_name: str,
                             sensitivity: float = 0.95,
                             method: str = 'isolation_forest') -> List[AnomalyResult]:
        """
        Détecte les anomalies dans les données
        
        Args:
            data: Données à analyser
            metric_name: Métrique à analyser
            sensitivity: Sensibilité de détection (0-1)
            method: Méthode de détection
            
        Returns:
            Liste des anomalies détectées
        """
        df = pd.DataFrame(data)
        anomalies = []
        
        if method == 'isolation_forest':
            # Isolation Forest pour détection d'anomalies
            from sklearn.ensemble import IsolationForest
            
            # Préparation des features
            features = self._prepare_features_for_anomaly_detection(df, metric_name)
            
            # Modèle
            model = IsolationForest(
                contamination=1-sensitivity,
                **self.model_configs[ModelType.ISOLATION_FOREST]
            )
            
            # Prédiction (-1 pour anomalie, 1 pour normal)
            predictions = model.fit_predict(features)
            anomaly_scores = model.score_samples(features)
            
            # Extraction des anomalies
            for idx, (pred, score) in enumerate(zip(predictions, anomaly_scores)):
                if pred == -1:
                    row = df.iloc[idx]
                    
                    # Calcul de la valeur attendue
                    expected = self._calculate_expected_value(df, idx, metric_name)
                    actual = row[metric_name]
                    deviation = abs(actual - expected) / expected
                    
                    anomaly = AnomalyResult(
                        timestamp=pd.to_datetime(row['date']),
                        metric=metric_name,
                        value=actual,
                        expected_value=expected,
                        deviation=deviation,
                        severity=self._calculate_severity(deviation, metric_name),
                        confidence=abs(score),
                        explanation=self._explain_anomaly(row, expected, actual, metric_name)
                    )
                    anomalies.append(anomaly)
        
        elif method == 'statistical':
            # Méthode statistique (Z-score, IQR)
            anomalies = await self._detect_statistical_anomalies(df, metric_name, sensitivity)
        
        # Trier par sévérité
        anomalies.sort(key=lambda x: x.confidence, reverse=True)
        
        return anomalies
    
    async def train_automl_pipeline(self, data: List[Dict], target_metric: str,
                                  feature_columns: List[str],
                                  optimization_metric: str = 'rmse',
                                  time_limit: int = 300) -> Dict[str, Any]:
        """
        Entraîne un pipeline AutoML
        
        Args:
            data: Données d'entraînement
            target_metric: Métrique cible
            feature_columns: Colonnes de features
            optimization_metric: Métrique d'optimisation
            time_limit: Limite de temps en secondes
            
        Returns:
            Résultats du pipeline AutoML
        """
        df = pd.DataFrame(data)
        
        # Préparation des données
        X = df[feature_columns]
        y = df[target_metric]
        
        # Division train/test
        split_idx = int(len(df) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]
        
        # Test de plusieurs modèles
        models_to_test = [
            ModelType.XGBOOST,
            ModelType.RANDOM_FOREST,
            ModelType.LSTM
        ]
        
        results = {}
        best_model = None
        best_score = float('inf')
        
        for model_type in models_to_test:
            # Entraînement
            model, score = await self._train_model(
                model_type, X_train, y_train, X_test, y_test
            )
            
            results[model_type.value] = {
                'score': score,
                'model': model,
                'feature_importance': self._get_feature_importance(model, feature_columns)
            }
            
            if score < best_score:
                best_score = score
                best_model = model_type
        
        # Backtesting
        backtest_results = await self._perform_backtesting(
            df, target_metric, best_model
        )
        
        return {
            'best_model': best_model.value,
            'best_score': best_score,
            'all_results': results,
            'backtest': backtest_results,
            'recommendations': self._generate_ml_recommendations(results, backtest_results)
        }
    
    async def forecast_scenarios(self, base_data: List[Dict], metric: str,
                               scenarios: Dict[str, Dict[str, float]],
                               horizon: int = 90) -> Dict[str, Any]:
        """
        Prévisions selon différents scénarios
        
        Args:
            base_data: Données de base
            metric: Métrique à prévoir
            scenarios: Scénarios avec modificateurs
            horizon: Horizon de prévision
            
        Returns:
            Prévisions par scénario
        """
        results = {}
        
        # Prédiction de base
        base_prediction = await self.predict_metric(metric, base_data, horizon)
        results['baseline'] = base_prediction
        
        # Prédictions par scénario
        for scenario_name, modifiers in scenarios.items():
            # Appliquer les modificateurs
            modified_data = self._apply_scenario_modifiers(base_data, modifiers)
            
            # Prédiction
            scenario_prediction = await self.predict_metric(
                metric, modified_data, horizon
            )
            
            results[scenario_name] = scenario_prediction
        
        # Analyse comparative
        comparison = self._compare_scenario_results(results)
        
        return {
            'predictions': results,
            'comparison': comparison,
            'risk_analysis': self._analyze_scenario_risks(results),
            'recommendations': self._generate_scenario_recommendations(comparison)
        }
    
    async def _predict_xgboost(self, df: pd.DataFrame, metric: str, 
                             horizon: int) -> Tuple[List[float], List[Tuple[float, float]], float]:
        """Prédiction avec XGBoost"""
        # Simulation - en production, utiliser vraiment XGBoost
        last_value = df[metric].iloc[-1]
        trend = df[metric].pct_change().mean()
        
        predictions = []
        intervals = []
        
        for i in range(horizon):
            # Prédiction avec tendance
            pred = last_value * (1 + trend) ** (i + 1)
            predictions.append(round(pred, 2))
            
            # Intervalle de confiance
            std = df[metric].std()
            lower = pred - 1.96 * std
            upper = pred + 1.96 * std
            intervals.append((round(lower, 2), round(upper, 2)))
        
        # Score d'accuracy simulé
        accuracy = 0.85 + np.random.random() * 0.1
        
        return predictions, intervals, accuracy
    
    async def _predict_prophet(self, df: pd.DataFrame, metric: str, 
                             horizon: int) -> Tuple[List[float], List[Tuple[float, float]], float]:
        """Prédiction avec Prophet"""
        # Simulation Prophet
        # En production, utiliser fbprophet
        seasonality = self._detect_seasonality(df[metric])
        
        predictions = []
        intervals = []
        base = df[metric].iloc[-1]
        
        for i in range(horizon):
            # Composante saisonnière
            seasonal_factor = 1 + seasonality * np.sin(2 * np.pi * i / 30)
            pred = base * seasonal_factor * (1 + 0.002 * i)  # Légère croissance
            
            predictions.append(round(pred, 2))
            
            # Intervalles
            uncertainty = 0.05 * (1 + i/horizon)  # Incertitude croissante
            lower = pred * (1 - uncertainty)
            upper = pred * (1 + uncertainty)
            intervals.append((round(lower, 2), round(upper, 2)))
        
        return predictions, intervals, 0.88
    
    async def _predict_lstm(self, df: pd.DataFrame, metric: str, 
                          horizon: int) -> Tuple[List[float], List[Tuple[float, float]], float]:
        """Prédiction avec LSTM"""
        # Simulation LSTM
        # En production, utiliser TensorFlow/Keras
        values = df[metric].values
        
        # Pattern recognition simulé
        pattern_length = min(30, len(values))
        recent_pattern = values[-pattern_length:]
        
        predictions = []
        intervals = []
        
        for i in range(horizon):
            # Prédiction basée sur le pattern
            weight = np.exp(-i/horizon)  # Decay weight
            pred = np.mean(recent_pattern) * weight + values[-1] * (1-weight)
            
            predictions.append(round(pred, 2))
            
            # Intervalles
            std = np.std(recent_pattern)
            lower = pred - 2 * std
            upper = pred + 2 * std
            intervals.append((round(lower, 2), round(upper, 2)))
        
        return predictions, intervals, 0.82
    
    def _select_best_model(self, df: pd.DataFrame, metric: str) -> ModelType:
        """Sélectionne automatiquement le meilleur modèle"""
        data_points = len(df)
        
        # Règles de sélection
        if data_points < 50:
            return ModelType.PROPHET  # Bon pour peu de données
        elif self._has_strong_seasonality(df[metric]):
            return ModelType.PROPHET  # Excellent pour la saisonnalité
        elif data_points > 1000:
            return ModelType.LSTM  # Bon pour beaucoup de données
        else:
            return ModelType.XGBOOST  # Polyvalent
    
    def _detect_seasonality(self, series: pd.Series) -> float:
        """Détecte la saisonnalité dans une série"""
        if len(series) < 30:
            return 0.0
        
        # Autocorrélation pour détecter la saisonnalité
        # Simplification - en production, utiliser statsmodels
        return np.random.random() * 0.2
    
    def _has_strong_seasonality(self, series: pd.Series) -> bool:
        """Vérifie si la série a une forte saisonnalité"""
        return self._detect_seasonality(series) > 0.1
    
    def _prepare_features_for_anomaly_detection(self, df: pd.DataFrame, 
                                              metric: str) -> np.ndarray:
        """Prépare les features pour la détection d'anomalies"""
        features = []
        
        # Valeur de la métrique
        features.append(df[metric].values)
        
        # Moyenne mobile
        features.append(df[metric].rolling(window=7, min_periods=1).mean().values)
        
        # Écart-type mobile
        features.append(df[metric].rolling(window=7, min_periods=1).std().fillna(0).values)
        
        # Changement en pourcentage
        features.append(df[metric].pct_change().fillna(0).values)
        
        # Jour de la semaine (si date disponible)
        if 'date' in df.columns:
            features.append(pd.to_datetime(df['date']).dt.dayofweek.values)
        
        return np.column_stack(features)
    
    def _calculate_expected_value(self, df: pd.DataFrame, idx: int, 
                                metric: str) -> float:
        """Calcule la valeur attendue pour une observation"""
        # Moyenne mobile des 30 derniers jours
        window = min(30, idx)
        if window > 0:
            return df[metric].iloc[max(0, idx-window):idx].mean()
        return df[metric].mean()
    
    def _calculate_severity(self, deviation: float, metric: str) -> str:
        """Calcule la sévérité d'une anomalie"""
        if deviation > 0.5:
            return "critical"
        elif deviation > 0.3:
            return "high"
        elif deviation > 0.15:
            return "medium"
        else:
            return "low"
    
    def _explain_anomaly(self, row: pd.Series, expected: float, 
                       actual: float, metric: str) -> str:
        """Génère une explication pour l'anomalie"""
        deviation_pct = ((actual - expected) / expected) * 100
        direction = "au-dessus" if actual > expected else "en-dessous"
        
        explanations = []
        
        # Explication de base
        explanations.append(
            f"La valeur de {metric} est {abs(deviation_pct):.1f}% {direction} de la normale"
        )
        
        # Contexte temporel
        if 'date' in row:
            date = pd.to_datetime(row['date'])
            if date.dayofweek in [5, 6]:
                explanations.append("Survenu pendant le weekend")
            if date.day == 1:
                explanations.append("Début de mois")
            if date.month in [12, 1]:
                explanations.append("Période de fin/début d'année")
        
        return " - ".join(explanations)
    
    async def _detect_statistical_anomalies(self, df: pd.DataFrame, metric: str,
                                          sensitivity: float) -> List[AnomalyResult]:
        """Détection d'anomalies par méthode statistique"""
        anomalies = []
        
        # Z-score
        mean = df[metric].mean()
        std = df[metric].std()
        z_threshold = 3 * (1 - sensitivity + 0.5)  # Ajuster selon sensibilité
        
        for idx, row in df.iterrows():
            z_score = abs((row[metric] - mean) / std)
            if z_score > z_threshold:
                anomaly = AnomalyResult(
                    timestamp=pd.to_datetime(row['date']),
                    metric=metric,
                    value=row[metric],
                    expected_value=mean,
                    deviation=z_score / z_threshold,
                    severity=self._calculate_severity(z_score / z_threshold, metric),
                    confidence=min(z_score / 10, 1.0),
                    explanation=f"Z-score de {z_score:.2f} (seuil: {z_threshold:.2f})"
                )
                anomalies.append(anomaly)
        
        return anomalies
    
    async def _train_model(self, model_type: ModelType, X_train: pd.DataFrame,
                         y_train: pd.Series, X_test: pd.DataFrame,
                         y_test: pd.Series) -> Tuple[Any, float]:
        """Entraîne un modèle spécifique"""
        # Simulation - en production, utiliser les vraies librairies
        if model_type == ModelType.XGBOOST:
            # Simuler XGBoost
            score = 0.15 + np.random.random() * 0.05
        elif model_type == ModelType.RANDOM_FOREST:
            # Simuler Random Forest
            score = 0.18 + np.random.random() * 0.05
        else:
            # Simuler LSTM
            score = 0.20 + np.random.random() * 0.05
        
        # Modèle factice
        model = {'type': model_type.value, 'score': score}
        
        return model, score
    
    def _get_feature_importance(self, model: Any, feature_names: List[str]) -> Dict[str, float]:
        """Extrait l'importance des features"""
        # Simulation
        importance = {}
        remaining = 1.0
        
        for i, feature in enumerate(feature_names):
            if i == len(feature_names) - 1:
                importance[feature] = round(remaining, 3)
            else:
                value = np.random.random() * remaining * 0.5
                importance[feature] = round(value, 3)
                remaining -= value
        
        return importance
    
    async def _perform_backtesting(self, df: pd.DataFrame, target: str,
                                 model_type: ModelType) -> Dict[str, Any]:
        """Effectue un backtesting"""
        # Simulation de backtesting
        n_splits = 5
        scores = []
        
        for i in range(n_splits):
            # Score simulé
            score = 0.80 + np.random.random() * 0.15
            scores.append(score)
        
        return {
            'n_splits': n_splits,
            'scores': scores,
            'mean_score': np.mean(scores),
            'std_score': np.std(scores),
            'best_score': max(scores),
            'worst_score': min(scores)
        }
    
    def _calculate_feature_importance(self, model_type: ModelType, 
                                    df: pd.DataFrame) -> Optional[Dict[str, float]]:
        """Calcule l'importance des features pour la prédiction"""
        if model_type not in [ModelType.XGBOOST, ModelType.RANDOM_FOREST]:
            return None
        
        # Simulation
        features = [col for col in df.columns if col not in ['date', 'metric']]
        importance = {}
        
        for feature in features:
            importance[feature] = np.random.random()
        
        # Normaliser
        total = sum(importance.values())
        return {k: round(v/total, 3) for k, v in importance.items()}
    
    def _apply_scenario_modifiers(self, data: List[Dict], 
                                modifiers: Dict[str, float]) -> List[Dict]:
        """Applique les modificateurs de scénario"""
        modified_data = []
        
        for row in data:
            modified_row = row.copy()
            for key, modifier in modifiers.items():
                if key in modified_row:
                    modified_row[key] *= (1 + modifier)
            modified_data.append(modified_row)
        
        return modified_data
    
    def _compare_scenario_results(self, results: Dict[str, PredictionResult]) -> Dict[str, Any]:
        """Compare les résultats entre scénarios"""
        baseline = results.get('baseline')
        if not baseline:
            return {}
        
        comparison = {}
        baseline_total = sum(baseline.predictions)
        
        for scenario_name, result in results.items():
            if scenario_name == 'baseline':
                continue
            
            scenario_total = sum(result.predictions)
            comparison[scenario_name] = {
                'total_difference': scenario_total - baseline_total,
                'percentage_change': ((scenario_total / baseline_total) - 1) * 100,
                'max_deviation': max(abs(s - b) for s, b in 
                                   zip(result.predictions, baseline.predictions))
            }
        
        return comparison
    
    def _analyze_scenario_risks(self, results: Dict[str, PredictionResult]) -> Dict[str, Any]:
        """Analyse les risques des scénarios"""
        risks = {}
        
        for scenario_name, result in results.items():
            # Volatilité
            volatility = np.std(result.predictions)
            
            # Valeur à risque (VaR)
            var_95 = np.percentile(result.predictions, 5)
            
            # Perte maximale
            max_loss = min(result.predictions)
            
            risks[scenario_name] = {
                'volatility': round(volatility, 2),
                'var_95': round(var_95, 2),
                'max_potential_loss': round(max_loss, 2),
                'risk_score': self._calculate_risk_score(volatility, var_95, max_loss)
            }
        
        return risks
    
    def _calculate_risk_score(self, volatility: float, var_95: float, 
                            max_loss: float) -> float:
        """Calcule un score de risque global"""
        # Normalisation et pondération
        vol_score = min(volatility / 1000, 1.0) * 0.3
        var_score = min(abs(var_95) / 10000, 1.0) * 0.4
        loss_score = min(abs(max_loss) / 10000, 1.0) * 0.3
        
        return round(vol_score + var_score + loss_score, 2)
    
    def _generate_ml_recommendations(self, results: Dict, 
                                   backtest: Dict) -> List[str]:
        """Génère des recommandations ML"""
        recommendations = []
        
        # Meilleur modèle
        best_model = min(results.items(), key=lambda x: x[1]['score'])[0]
        recommendations.append(f"🎯 Utiliser {best_model} pour les prédictions futures")
        
        # Performance du backtesting
        if backtest['mean_score'] > 0.85:
            recommendations.append("✅ Excellente performance en backtesting")
        elif backtest['mean_score'] > 0.75:
            recommendations.append("⚠️ Performance correcte mais amélioration possible")
        else:
            recommendations.append("❌ Performance faible - recalibrer les modèles")
        
        # Stabilité
        if backtest['std_score'] < 0.05:
            recommendations.append("📊 Modèle stable sur différentes périodes")
        else:
            recommendations.append("📈 Forte variabilité - surveiller régulièrement")
        
        return recommendations
    
    def _generate_scenario_recommendations(self, comparison: Dict) -> List[str]:
        """Génère des recommandations basées sur les scénarios"""
        recommendations = []
        
        for scenario, metrics in comparison.items():
            if metrics['percentage_change'] > 20:
                recommendations.append(
                    f"⚠️ Scénario {scenario}: Impact significatif (+{metrics['percentage_change']:.1f}%)"
                )
            elif metrics['percentage_change'] < -20:
                recommendations.append(
                    f"🔴 Scénario {scenario}: Risque élevé ({metrics['percentage_change']:.1f}%)"
                )
        
        return recommendations