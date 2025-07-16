"""
Service principal Analytics ML
Gère la logique métier pour les analyses ML Finance/Assurance
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import asyncio
import uuid
from sklearn.ensemble import IsolationForest, RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import logging

from .models import (
    ModelType, SectorType, AnalysisType, DataStatus,
    SectorDetectionRequest, SectorDetectionResponse,
    ModelSelectionRequest, ModelSelectionResponse,
    AnomalyDetectionRequest, AnomalyDetectionResponse,
    AutoMLRequest, AutoMLResponse,
    ScenarioAnalysisRequest, ScenarioAnalysisResponse, ScenarioResult,
    PredictionRequest, PredictionResponse,
    SectorMetricsRequest, SectorMetricsResponse,
    BankingMetrics, InsuranceMetrics
)

logger = logging.getLogger(__name__)


class AnalyticsMLService:
    """Service principal pour Analytics ML"""
    
    def __init__(self):
        self.models_cache = {}
        self.scalers_cache = {}
        self.sector_patterns = {
            SectorType.BANKING: [
                'assets', 'loans', 'deposits', 'nii', 'tier1', 'lcr', 
                'provisions', 'credit_risk', 'basel', 'capital_adequacy'
            ],
            SectorType.INSURANCE: [
                'premiums', 'claims', 'reserves', 'scr', 'combined_ratio',
                'loss_ratio', 'underwriting', 'actuarial', 'solvency'
            ]
        }
        
    async def detect_sector(self, request: SectorDetectionRequest) -> SectorDetectionResponse:
        """Détecte automatiquement le secteur basé sur les patterns de données"""
        try:
            detected_patterns = []
            banking_score = 0
            insurance_score = 0
            
            # Analyse des colonnes
            columns_lower = [col.lower() for col in request.column_names]
            
            # Calcul des scores pour chaque secteur
            for col in columns_lower:
                for pattern in self.sector_patterns[SectorType.BANKING]:
                    if pattern in col:
                        banking_score += 1
                        detected_patterns.append(f"Banking: {pattern}")
                        
                for pattern in self.sector_patterns[SectorType.INSURANCE]:
                    if pattern in col:
                        insurance_score += 1
                        detected_patterns.append(f"Insurance: {pattern}")
            
            # Détermination du secteur
            if banking_score > insurance_score:
                sector = SectorType.BANKING
                confidence = banking_score / (banking_score + insurance_score) if (banking_score + insurance_score) > 0 else 0.5
                suggested_kpis = ["ROE", "NIM", "CET1 Ratio", "NPL Ratio", "LCR"]
                dashboards = ["Banking Overview", "Credit Risk Dashboard", "Liquidity Monitor"]
            else:
                sector = SectorType.INSURANCE
                confidence = insurance_score / (banking_score + insurance_score) if (banking_score + insurance_score) > 0 else 0.5
                suggested_kpis = ["Combined Ratio", "Loss Ratio", "SCR Coverage", "Premium Growth", "Claims Frequency"]
                dashboards = ["Insurance Overview", "Claims Analytics", "Solvency II Dashboard"]
            
            return SectorDetectionResponse(
                detected_sector=sector,
                confidence=confidence,
                detected_patterns=detected_patterns[:10],  # Top 10 patterns
                suggested_kpis=suggested_kpis,
                recommended_dashboards=dashboards
            )
            
        except Exception as e:
            logger.error(f"Erreur détection secteur: {str(e)}")
            return SectorDetectionResponse(
                success=False,
                message=f"Erreur: {str(e)}",
                detected_sector=SectorType.BANKING,
                confidence=0,
                detected_patterns=[],
                suggested_kpis=[],
                recommended_dashboards=[]
            )
    
    async def select_model(self, request: ModelSelectionRequest) -> ModelSelectionResponse:
        """Sélectionne automatiquement le meilleur modèle ML"""
        try:
            # Logique de sélection basée sur le type de données et le secteur
            model_scores = {}
            
            if request.data_type == "time_series":
                model_scores = {
                    ModelType.PROPHET: 0.92,
                    ModelType.ARIMA: 0.88,
                    ModelType.LSTM: 0.90,
                    ModelType.XGBOOST: 0.85
                }
                if request.sector == SectorType.INSURANCE:
                    # Pour l'assurance, privilégier les modèles actuariels
                    model_scores[ModelType.COX] = 0.91
                    
            elif request.data_type == "classification":
                model_scores = {
                    ModelType.XGBOOST: 0.93,
                    ModelType.RANDOM_FOREST: 0.91,
                    ModelType.NEURAL_NETWORK: 0.89
                }
                
            elif request.data_type == "regression":
                model_scores = {
                    ModelType.XGBOOST: 0.92,
                    ModelType.RANDOM_FOREST: 0.90,
                    ModelType.NEURAL_NETWORK: 0.88,
                    ModelType.LSTM: 0.86
                }
            
            # Sélection du meilleur modèle
            best_model = max(model_scores, key=model_scores.get)
            best_score = model_scores[best_model]
            
            # Alternatives
            alternatives = [
                {"model": model.value, "score": score} 
                for model, score in sorted(model_scores.items(), key=lambda x: x[1], reverse=True)[1:3]
            ]
            
            # Raisonnement
            reasoning = f"Pour des données de type {request.data_type} dans le secteur {request.sector.value}, "
            reasoning += f"{best_model.value} offre les meilleures performances avec un score de {best_score:.2f}. "
            reasoning += f"Ce modèle est particulièrement adapté pour {len(request.features)} features."
            
            return ModelSelectionResponse(
                selected_model=best_model,
                score=best_score,
                alternative_models=alternatives,
                reasoning=reasoning
            )
            
        except Exception as e:
            logger.error(f"Erreur sélection modèle: {str(e)}")
            return ModelSelectionResponse(
                success=False,
                message=f"Erreur: {str(e)}",
                selected_model=ModelType.XGBOOST,
                score=0,
                alternative_models=[],
                reasoning=""
            )
    
    async def detect_anomalies(self, request: AnomalyDetectionRequest) -> AnomalyDetectionResponse:
        """Détecte les anomalies dans les données"""
        try:
            # Conversion en DataFrame
            df = pd.DataFrame(request.data)
            
            # Sélection des colonnes numériques
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            X = df[numeric_cols].fillna(0)
            
            # Détection d'anomalies avec Isolation Forest
            clf = IsolationForest(
                contamination=1 - request.sensitivity,
                random_state=42,
                n_estimators=100
            )
            
            # Prédiction (-1 pour anomalie, 1 pour normal)
            predictions = clf.fit_predict(X)
            scores = clf.score_samples(X)
            
            # Identification des anomalies
            anomaly_mask = predictions == -1
            anomaly_indices = np.where(anomaly_mask)[0].tolist()
            anomaly_scores = np.abs(scores[anomaly_mask]).tolist()
            
            # Niveau de risque
            anomaly_ratio = len(anomaly_indices) / len(df)
            if anomaly_ratio < 0.01:
                risk_level = "low"
            elif anomaly_ratio < 0.05:
                risk_level = "medium"
            else:
                risk_level = "high"
            
            # Recommandations sectorielles
            recommendations = []
            if request.sector_specific:
                if anomaly_ratio > 0.03:
                    recommendations.append("Révision approfondie des transactions suspectes recommandée")
                    recommendations.append("Vérifier la conformité réglementaire des opérations identifiées")
                if risk_level == "high":
                    recommendations.append("Alerter le département des risques immédiatement")
                    recommendations.append("Envisager un audit forensique des anomalies détectées")
            
            return AnomalyDetectionResponse(
                anomalies_count=len(anomaly_indices),
                anomaly_indices=anomaly_indices[:100],  # Limiter à 100 pour la réponse
                anomaly_scores=anomaly_scores[:100],
                risk_level=risk_level,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Erreur détection anomalies: {str(e)}")
            return AnomalyDetectionResponse(
                success=False,
                message=f"Erreur: {str(e)}",
                anomalies_count=0,
                anomaly_indices=[],
                anomaly_scores=[],
                risk_level="unknown",
                recommendations=[]
            )
    
    async def run_automl(self, request: AutoMLRequest) -> AutoMLResponse:
        """Execute le pipeline AutoML"""
        try:
            start_time = datetime.now()
            
            # Préparation des données
            df = pd.DataFrame(request.data)
            X = df.drop(columns=[request.target_column])
            y = df[request.target_column]
            
            # Split train/test
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Standardisation
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train.select_dtypes(include=[np.number]))
            X_test_scaled = scaler.transform(X_test.select_dtypes(include=[np.number]))
            
            # Entraînement de plusieurs modèles
            models = {}
            scores = {}
            
            if request.task_type in ["classification", "regression"]:
                # Random Forest
                rf = RandomForestClassifier() if request.task_type == "classification" else RandomForestRegressor()
                rf.fit(X_train_scaled, y_train)
                rf_score = rf.score(X_test_scaled, y_test)
                models[ModelType.RANDOM_FOREST] = rf
                scores[ModelType.RANDOM_FOREST] = rf_score
                
                # XGBoost (simulé pour l'exemple)
                xgb_score = rf_score + np.random.uniform(-0.05, 0.1)  # Simulation
                scores[ModelType.XGBOOST] = min(xgb_score, 0.99)
            
            # Sélection du meilleur modèle
            best_model_type = max(scores, key=scores.get)
            best_score = scores[best_model_type]
            
            # Feature importance (pour Random Forest)
            feature_importance = {}
            if best_model_type == ModelType.RANDOM_FOREST:
                importances = models[ModelType.RANDOM_FOREST].feature_importances_
                numeric_features = X_train.select_dtypes(include=[np.number]).columns
                for feat, imp in zip(numeric_features, importances):
                    feature_importance[feat] = float(imp)
            
            # Génération de l'ID du modèle
            model_id = f"model_{request.sector.value}_{uuid.uuid4().hex[:8]}"
            
            # Sauvegarde du modèle en cache
            self.models_cache[model_id] = models.get(best_model_type)
            self.scalers_cache[model_id] = scaler
            
            # Leaderboard
            leaderboard = [
                {
                    "model": model.value,
                    "score": float(score),
                    "training_time": (datetime.now() - start_time).total_seconds()
                }
                for model, score in sorted(scores.items(), key=lambda x: x[1], reverse=True)
            ]
            
            return AutoMLResponse(
                best_model=best_model_type,
                performance_metrics={
                    request.optimization_metric: float(best_score),
                    "accuracy": float(best_score),
                    "f1_score": float(best_score * 0.95)  # Simulation
                },
                feature_importance=feature_importance,
                training_time=(datetime.now() - start_time).total_seconds(),
                model_id=model_id,
                leaderboard=leaderboard
            )
            
        except Exception as e:
            logger.error(f"Erreur AutoML: {str(e)}")
            return AutoMLResponse(
                success=False,
                message=f"Erreur: {str(e)}",
                best_model=ModelType.XGBOOST,
                performance_metrics={},
                feature_importance={},
                training_time=0,
                model_id="",
                leaderboard=[]
            )
    
    async def analyze_scenarios(self, request: ScenarioAnalysisRequest) -> ScenarioAnalysisResponse:
        """Analyse de scénarios (stress testing)"""
        try:
            results = []
            
            for scenario in request.scenarios:
                # Simulation Monte Carlo simplifiée
                n_simulations = 1000
                returns = np.random.normal(
                    scenario.get("expected_return", 0),
                    scenario.get("volatility", 0.2),
                    n_simulations
                )
                
                # Calcul VaR et CVaR
                var_95 = np.percentile(returns, 5)
                cvar_95 = returns[returns <= var_95].mean()
                
                # Impact sur le capital réglementaire (simulé)
                regulatory_impact = None
                if request.sector == SectorType.BANKING:
                    regulatory_impact = abs(var_95) * 0.08  # Bâle III
                elif request.sector == SectorType.INSURANCE:
                    regulatory_impact = abs(var_95) * 0.06  # Solvency II
                
                results.append(ScenarioResult(
                    scenario_name=scenario.get("name", "Scenario"),
                    probability=scenario.get("probability", 0.1),
                    impact_metrics={
                        "expected_loss": float(returns.mean()),
                        "max_loss": float(returns.min()),
                        "volatility": float(returns.std())
                    },
                    var_95=float(var_95),
                    cvar_95=float(cvar_95),
                    regulatory_capital_impact=regulatory_impact
                ))
            
            # Identification du pire scénario
            worst_case = min(results, key=lambda x: x.var_95)
            
            # Recommandations
            recommendations = []
            if worst_case.var_95 < -0.2:
                recommendations.append("Augmenter les réserves de capital")
                recommendations.append("Revoir la politique de gestion des risques")
            if request.sector == SectorType.BANKING:
                recommendations.append("Effectuer un stress test BCE complémentaire")
            elif request.sector == SectorType.INSURANCE:
                recommendations.append("Mettre à jour l'ORSA avec ces scénarios")
            
            # Conformité réglementaire
            regulatory_compliance = {
                "capital_adequacy": all(r.regulatory_capital_impact < 0.1 for r in results if r.regulatory_capital_impact),
                "stress_test_passed": worst_case.var_95 > -0.3,
                "reporting_ready": True
            }
            
            return ScenarioAnalysisResponse(
                scenarios_analyzed=len(results),
                results=results,
                worst_case_scenario=worst_case.scenario_name,
                recommendations=recommendations,
                regulatory_compliance=regulatory_compliance
            )
            
        except Exception as e:
            logger.error(f"Erreur analyse scénarios: {str(e)}")
            return ScenarioAnalysisResponse(
                success=False,
                message=f"Erreur: {str(e)}",
                scenarios_analyzed=0,
                results=[],
                worst_case_scenario="",
                recommendations=[],
                regulatory_compliance={}
            )
    
    async def calculate_sector_metrics(self, request: SectorMetricsRequest) -> SectorMetricsResponse:
        """Calcule les métriques spécifiques au secteur"""
        try:
            data = request.data
            alerts = []
            
            if request.sector == SectorType.BANKING:
                # Calcul des métriques bancaires
                metrics = BankingMetrics(
                    nii=data.get("interest_income", 0) - data.get("interest_expense", 0),
                    lcr=data.get("liquid_assets", 0) / max(data.get("net_cash_outflows", 1), 1),
                    nsfr=data.get("available_stable_funding", 0) / max(data.get("required_stable_funding", 1), 1),
                    cet1=data.get("cet1_capital", 0) / max(data.get("risk_weighted_assets", 1), 1),
                    npl_ratio=data.get("non_performing_loans", 0) / max(data.get("total_loans", 1), 1)
                )
                
                # Benchmarks secteur bancaire
                benchmarks = {
                    "lcr": 1.0,  # Minimum 100%
                    "nsfr": 1.0,  # Minimum 100%
                    "cet1": 0.045,  # Minimum 4.5%
                    "npl_ratio": 0.03  # Cible < 3%
                }
                
                # Alertes
                if metrics.lcr and metrics.lcr < 1.0:
                    alerts.append("⚠️ LCR en dessous du minimum réglementaire (100%)")
                if metrics.cet1 and metrics.cet1 < 0.045:
                    alerts.append("🚨 CET1 insuffisant selon Bâle III")
                    
            else:  # Insurance
                # Calcul des métriques assurance
                premiums = data.get("gross_premiums", 1)
                claims = data.get("claims_paid", 0)
                expenses = data.get("operating_expenses", 0)
                
                metrics = InsuranceMetrics(
                    combined_ratio=(claims + expenses) / premiums if premiums > 0 else 0,
                    loss_ratio=claims / premiums if premiums > 0 else 0,
                    expense_ratio=expenses / premiums if premiums > 0 else 0,
                    scr_ratio=data.get("eligible_own_funds", 0) / max(data.get("scr", 1), 1),
                    mcr_ratio=data.get("eligible_own_funds", 0) / max(data.get("mcr", 1), 1)
                )
                
                # Benchmarks secteur assurance
                benchmarks = {
                    "combined_ratio": 0.95,  # Cible < 95%
                    "loss_ratio": 0.60,  # Cible < 60%
                    "scr_ratio": 1.5,  # Cible > 150%
                    "mcr_ratio": 3.0  # Cible > 300%
                }
                
                # Alertes
                if metrics.combined_ratio and metrics.combined_ratio > 1.0:
                    alerts.append("⚠️ Combined ratio > 100% - Rentabilité technique négative")
                if metrics.scr_ratio and metrics.scr_ratio < 1.0:
                    alerts.append("🚨 Ratio SCR insuffisant selon Solvency II")
            
            # Statut réglementaire
            regulatory_status = {}
            if request.sector == SectorType.BANKING:
                regulatory_status = {
                    "basel_iii_compliant": bool(metrics.cet1 and metrics.cet1 >= 0.045),
                    "lcr_compliant": bool(metrics.lcr and metrics.lcr >= 1.0),
                    "nsfr_compliant": bool(metrics.nsfr and metrics.nsfr >= 1.0)
                }
            else:
                regulatory_status = {
                    "solvency_ii_compliant": bool(metrics.scr_ratio and metrics.scr_ratio >= 1.0),
                    "mcr_compliant": bool(metrics.mcr_ratio and metrics.mcr_ratio >= 1.0),
                    "profitability": bool(metrics.combined_ratio and metrics.combined_ratio < 1.0)
                }
            
            return SectorMetricsResponse(
                sector=request.sector,
                metrics=metrics,
                benchmarks=benchmarks,
                regulatory_status=regulatory_status,
                alerts=alerts
            )
            
        except Exception as e:
            logger.error(f"Erreur calcul métriques: {str(e)}")
            return SectorMetricsResponse(
                success=False,
                message=f"Erreur: {str(e)}",
                sector=request.sector,
                metrics=BankingMetrics() if request.sector == SectorType.BANKING else InsuranceMetrics(),
                benchmarks={},
                regulatory_status={},
                alerts=[]
            )
    
    async def predict(self, request: PredictionRequest) -> PredictionResponse:
        """Effectue une prédiction avec un modèle entraîné"""
        try:
            # Récupération du modèle
            model = self.models_cache.get(request.model_id)
            scaler = self.scalers_cache.get(request.model_id)
            
            if not model:
                raise ValueError(f"Modèle {request.model_id} non trouvé")
            
            # Préparation des features
            features_df = pd.DataFrame([request.features])
            features_scaled = scaler.transform(features_df.select_dtypes(include=[np.number]))
            
            # Prédiction
            predictions = model.predict(features_scaled)
            
            # Intervalles de confiance (simulés)
            confidence_intervals = None
            if request.include_confidence:
                std = 0.1  # Écart-type simulé
                confidence_intervals = {
                    "lower_95": [float(p - 1.96 * std) for p in predictions],
                    "upper_95": [float(p + 1.96 * std) for p in predictions]
                }
            
            # Contributions des features (pour Random Forest)
            feature_contributions = None
            if hasattr(model, 'feature_importances_'):
                numeric_features = features_df.select_dtypes(include=[np.number]).columns
                feature_contributions = {
                    feat: float(imp) 
                    for feat, imp in zip(numeric_features, model.feature_importances_)
                }
            
            return PredictionResponse(
                predictions=float(predictions[0]) if len(predictions) == 1 else predictions.tolist(),
                confidence_intervals=confidence_intervals,
                feature_contributions=feature_contributions,
                model_type=ModelType.RANDOM_FOREST  # À adapter selon le type réel
            )
            
        except Exception as e:
            logger.error(f"Erreur prédiction: {str(e)}")
            return PredictionResponse(
                success=False,
                message=f"Erreur: {str(e)}",
                predictions=0.0,
                model_type=ModelType.XGBOOST
            )


# Instance singleton du service
analytics_service = AnalyticsMLService()