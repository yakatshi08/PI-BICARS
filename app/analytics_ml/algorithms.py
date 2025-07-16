"""
Algorithmes ML spécialisés pour Finance & Assurance
Implémentation des modèles prédictifs et analytiques
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
from sklearn.ensemble import IsolationForest, RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.model_selection import cross_val_score, TimeSeriesSplit
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.cluster import DBSCAN, KMeans
from scipy import stats
import warnings
warnings.filterwarnings('ignore')


class FinanceMLAlgorithms:
    """Algorithmes ML spécialisés pour le secteur Finance"""
    
    @staticmethod
    def calculate_credit_risk_pd(features: pd.DataFrame) -> Dict[str, float]:
        """
        Calcule la Probabilité de Défaut (PD) pour IFRS 9
        
        Args:
            features: DataFrame avec les caractéristiques du crédit
            
        Returns:
            Dict avec PD à 12 mois et lifetime
        """
        # Simulation d'un modèle de credit scoring
        # En production, utiliser un modèle entraîné sur données historiques
        
        # Features importantes pour le credit risk
        risk_factors = {
            'debt_to_income': 0.3,
            'credit_history_length': -0.2,
            'payment_delays': 0.4,
            'credit_utilization': 0.25,
            'income_stability': -0.15
        }
        
        # Score de base
        base_score = 0.05  # 5% PD de base
        
        # Ajustement selon les features
        for factor, weight in risk_factors.items():
            if factor in features.columns:
                normalized_value = (features[factor] - features[factor].mean()) / features[factor].std()
                base_score *= (1 + weight * normalized_value.mean())
        
        # PD 12 mois
        pd_12m = np.clip(base_score, 0.001, 0.999)
        
        # PD lifetime (simplifiée)
        pd_lifetime = 1 - (1 - pd_12m) ** 5  # Sur 5 ans
        
        return {
            'pd_12_months': float(pd_12m),
            'pd_lifetime': float(pd_lifetime),
            'risk_grade': 'A' if pd_12m < 0.01 else 'B' if pd_12m < 0.05 else 'C'
        }
    
    @staticmethod
    def calculate_lgd(collateral_value: float, exposure: float, 
                     recovery_rate: float = 0.4) -> float:
        """
        Calcule la Loss Given Default (LGD)
        
        Args:
            collateral_value: Valeur du collatéral
            exposure: Exposition totale
            recovery_rate: Taux de récupération estimé
            
        Returns:
            LGD en pourcentage
        """
        if exposure <= 0:
            return 0.0
            
        # LGD = 1 - Recovery Rate
        collateral_coverage = min(collateral_value / exposure, 1.0)
        effective_recovery = collateral_coverage * recovery_rate
        
        lgd = 1 - effective_recovery
        return float(np.clip(lgd, 0, 1))
    
    @staticmethod
    def calculate_expected_loss(pd: float, lgd: float, ead: float) -> float:
        """
        Calcule l'Expected Loss selon IFRS 9
        
        Args:
            pd: Probabilité de défaut
            lgd: Loss Given Default
            ead: Exposure At Default
            
        Returns:
            Expected Loss
        """
        return pd * lgd * ead
    
    @staticmethod
    def stress_test_portfolio(portfolio: pd.DataFrame, 
                            scenarios: List[Dict[str, float]]) -> pd.DataFrame:
        """
        Effectue un stress test sur un portefeuille bancaire
        
        Args:
            portfolio: DataFrame du portefeuille
            scenarios: Liste de scénarios de stress
            
        Returns:
            DataFrame avec les résultats par scénario
        """
        results = []
        
        for scenario in scenarios:
            # Copie du portfolio
            stressed_portfolio = portfolio.copy()
            
            # Application des stress factors
            if 'gdp_shock' in scenario:
                # Impact sur les PDs
                stressed_portfolio['pd'] *= (1 + scenario['gdp_shock'] * 0.5)
                
            if 'property_shock' in scenario:
                # Impact sur les collatéraux immobiliers
                stressed_portfolio['collateral_value'] *= (1 + scenario['property_shock'])
                
            if 'interest_rate_shock' in scenario:
                # Impact sur les expositions
                stressed_portfolio['ead'] *= (1 + scenario['interest_rate_shock'] * 0.3)
            
            # Recalcul des pertes
            total_loss = 0
            for _, row in stressed_portfolio.iterrows():
                lgd = FinanceMLAlgorithms.calculate_lgd(
                    row.get('collateral_value', 0),
                    row.get('ead', 0)
                )
                loss = FinanceMLAlgorithms.calculate_expected_loss(
                    row.get('pd', 0.05),
                    lgd,
                    row.get('ead', 0)
                )
                total_loss += loss
            
            results.append({
                'scenario': scenario.get('name', 'Unnamed'),
                'total_loss': total_loss,
                'loss_ratio': total_loss / portfolio['ead'].sum() if portfolio['ead'].sum() > 0 else 0,
                'capital_impact': total_loss * 0.08  # Bâle III simplified
            })
        
        return pd.DataFrame(results)
    
    @staticmethod
    def detect_money_laundering(transactions: pd.DataFrame, 
                              threshold: float = 0.95) -> Dict[str, Any]:
        """
        Détecte les patterns de blanchiment d'argent
        
        Args:
            transactions: DataFrame des transactions
            threshold: Seuil de détection
            
        Returns:
            Dict avec les transactions suspectes
        """
        suspicious_patterns = []
        
        # Pattern 1: Structuring (Smurfing)
        # Transactions juste en dessous du seuil de déclaration
        if 'amount' in transactions.columns:
            smurfing_threshold = 10000  # Seuil réglementaire
            potential_smurfing = transactions[
                (transactions['amount'] > smurfing_threshold * 0.9) & 
                (transactions['amount'] < smurfing_threshold)
            ]
            if len(potential_smurfing) > 5:
                suspicious_patterns.append({
                    'pattern': 'structuring',
                    'count': len(potential_smurfing),
                    'risk_score': 0.8
                })
        
        # Pattern 2: Rapid Movement
        # Argent qui entre et sort rapidement
        if 'timestamp' in transactions.columns and 'transaction_type' in transactions.columns:
            transactions['timestamp'] = pd.to_datetime(transactions['timestamp'])
            for account in transactions['account_id'].unique():
                account_trans = transactions[transactions['account_id'] == account].sort_values('timestamp')
                
                # Chercher des patterns in/out rapides
                for i in range(len(account_trans) - 1):
                    if (account_trans.iloc[i]['transaction_type'] == 'deposit' and
                        account_trans.iloc[i+1]['transaction_type'] == 'withdrawal'):
                        time_diff = (account_trans.iloc[i+1]['timestamp'] - 
                                   account_trans.iloc[i]['timestamp']).total_seconds() / 3600
                        if time_diff < 24:  # Moins de 24h
                            suspicious_patterns.append({
                                'pattern': 'rapid_movement',
                                'account': account,
                                'risk_score': 0.9
                            })
        
        # Pattern 3: Unusual Volume
        # Volume inhabituel par rapport à l'historique
        if 'amount' in transactions.columns:
            account_stats = transactions.groupby('account_id')['amount'].agg(['mean', 'std'])
            for account in account_stats.index:
                account_trans = transactions[transactions['account_id'] == account]
                recent_trans = account_trans.tail(10)  # 10 dernières transactions
                
                if len(recent_trans) > 0:
                    recent_avg = recent_trans['amount'].mean()
                    historical_avg = account_stats.loc[account, 'mean']
                    historical_std = account_stats.loc[account, 'std']
                    
                    if historical_std > 0:
                        z_score = (recent_avg - historical_avg) / historical_std
                        if abs(z_score) > 3:  # 3 écarts-types
                            suspicious_patterns.append({
                                'pattern': 'unusual_volume',
                                'account': account,
                                'z_score': float(z_score),
                                'risk_score': min(abs(z_score) / 5, 1.0)
                            })
        
        # Calcul du score global
        if suspicious_patterns:
            max_risk = max(p['risk_score'] for p in suspicious_patterns)
        else:
            max_risk = 0
        
        return {
            'suspicious_transactions': len(suspicious_patterns),
            'patterns_detected': suspicious_patterns[:10],  # Top 10
            'overall_risk_score': max_risk,
            'alert_level': 'high' if max_risk > 0.8 else 'medium' if max_risk > 0.5 else 'low'
        }


class InsuranceMLAlgorithms:
    """Algorithmes ML spécialisés pour le secteur Assurance"""
    
    @staticmethod
    def predict_claim_severity(features: pd.DataFrame, 
                             claim_history: Optional[pd.DataFrame] = None) -> Dict[str, float]:
        """
        Prédit la sévérité des sinistres
        
        Args:
            features: Caractéristiques du risque
            claim_history: Historique des sinistres (optionnel)
            
        Returns:
            Dict avec prédictions de sévérité
        """
        # Features importantes pour la sévérité des sinistres
        severity_factors = {
            'age': -0.1,  # Plus âgé = sinistres plus sévères
            'vehicle_value': 0.3,  # Valeur élevée = sinistres plus coûteux
            'driving_experience': -0.2,  # Plus d'expérience = moins sévère
            'urban_area': 0.15,  # Zone urbaine = sinistres plus fréquents
            'previous_claims': 0.4  # Historique = prédicteur fort
        }
        
        # Sévérité de base
        base_severity = 5000  # Montant moyen
        
        # Ajustement selon les features
        severity_multiplier = 1.0
        for factor, weight in severity_factors.items():
            if factor in features.columns:
                normalized = (features[factor] - features[factor].mean()) / (features[factor].std() + 1e-6)
                severity_multiplier *= (1 + weight * normalized.mean())
        
        predicted_severity = base_severity * severity_multiplier
        
        # Intervalles de confiance
        std_dev = predicted_severity * 0.3  # 30% de variation
        
        return {
            'expected_severity': float(predicted_severity),
            'confidence_interval_low': float(predicted_severity - 1.96 * std_dev),
            'confidence_interval_high': float(predicted_severity + 1.96 * std_dev),
            'severity_class': 'low' if predicted_severity < 3000 else 'medium' if predicted_severity < 10000 else 'high'
        }
    
    @staticmethod
    def calculate_technical_provisions(claims_triangle: pd.DataFrame, 
                                     method: str = 'chain_ladder') -> Dict[str, float]:
        """
        Calcule les provisions techniques (Solvency II)
        
        Args:
            claims_triangle: Triangle de développement des sinistres
            method: Méthode de calcul ('chain_ladder', 'bornhuetter_ferguson')
            
        Returns:
            Dict avec les provisions calculées
        """
        if method == 'chain_ladder':
            # Méthode Chain Ladder simplifiée
            development_factors = []
            
            # Calcul des facteurs de développement
            for col in range(len(claims_triangle.columns) - 1):
                col_sum = claims_triangle.iloc[:, col].sum()
                next_col_sum = claims_triangle.iloc[:, col + 1].sum()
                if col_sum > 0:
                    factor = next_col_sum / col_sum
                    development_factors.append(factor)
                else:
                    development_factors.append(1.0)
            
            # Projection des sinistres ultimes
            ultimate_claims = claims_triangle.copy()
            for i in range(len(claims_triangle)):
                for j in range(i + 1, len(claims_triangle.columns)):
                    if pd.isna(ultimate_claims.iloc[i, j]):
                        ultimate_claims.iloc[i, j] = ultimate_claims.iloc[i, j-1] * development_factors[j-1]
            
            # Calcul des provisions
            paid_claims = claims_triangle.sum().sum()
            ultimate_total = ultimate_claims.sum().sum()
            provisions = ultimate_total - paid_claims
            
            # Risk margin (Solvency II - simplified)
            risk_margin = provisions * 0.06  # 6% CoC
            
            return {
                'best_estimate': float(provisions),
                'risk_margin': float(risk_margin),
                'technical_provisions': float(provisions + risk_margin),
                'ultimate_claims': float(ultimate_total),
                'development_factors': development_factors
            }
        
        else:  # Autres méthodes à implémenter
            return {
                'best_estimate': 0,
                'risk_margin': 0,
                'technical_provisions': 0,
                'ultimate_claims': 0,
                'development_factors': []
            }
    
    @staticmethod
    def optimize_pricing(risk_features: pd.DataFrame, 
                        loss_ratio_target: float = 0.65) -> Dict[str, Any]:
        """
        Optimise la tarification pour atteindre un loss ratio cible
        
        Args:
            risk_features: Features des risques
            loss_ratio_target: Loss ratio cible
            
        Returns:
            Dict avec les recommandations de pricing
        """
        # Segmentation des risques
        risk_segments = []
        
        # Analyse par segment
        if 'risk_score' in risk_features.columns:
            # Clustering des risques
            kmeans = KMeans(n_clusters=5, random_state=42)
            risk_features['cluster'] = kmeans.fit_predict(
                risk_features[['risk_score']].fillna(0)
            )
            
            for cluster in range(5):
                cluster_data = risk_features[risk_features['cluster'] == cluster]
                
                # Calcul du pricing optimal par segment
                avg_risk = cluster_data['risk_score'].mean()
                current_premium = cluster_data.get('current_premium', 1000).mean()
                expected_loss = avg_risk * 10000  # Conversion score -> montant
                
                # Prix optimal pour atteindre le loss ratio cible
                optimal_premium = expected_loss / loss_ratio_target
                
                # Ajustement pour les frais (expense ratio ~30%)
                optimal_premium *= 1.3
                
                risk_segments.append({
                    'segment': f'Segment_{cluster}',
                    'size': len(cluster_data),
                    'avg_risk_score': float(avg_risk),
                    'current_premium': float(current_premium),
                    'recommended_premium': float(optimal_premium),
                    'premium_change': float((optimal_premium / current_premium - 1) * 100)
                })
        
        # Recommandations globales
        total_current = sum(s['current_premium'] * s['size'] for s in risk_segments)
        total_recommended = sum(s['recommended_premium'] * s['size'] for s in risk_segments)
        total_size = sum(s['size'] for s in risk_segments)
        
        return {
            'segments': risk_segments,
            'overall_premium_change': float((total_recommended / total_current - 1) * 100) if total_current > 0 else 0,
            'expected_loss_ratio': loss_ratio_target,
            'recommendations': [
                f"Augmenter les primes de {s['premium_change']:.1f}% pour {s['segment']}" 
                for s in risk_segments if s['premium_change'] > 10
            ]
        }
    
    @staticmethod
    def predict_churn_insurance(customer_features: pd.DataFrame) -> Dict[str, Any]:
        """
        Prédit le risque de résiliation (churn) des contrats d'assurance
        
        Args:
            customer_features: Features des clients
            
        Returns:
            Dict avec les prédictions de churn
        """
        # Features importantes pour le churn en assurance
        churn_factors = {
            'claims_frequency': 0.3,  # Plus de sinistres = plus de churn
            'premium_increase': 0.4,  # Augmentation prime = churn
            'customer_tenure': -0.3,  # Ancienneté = fidélité
            'contact_frequency': -0.2,  # Contact régulier = rétention
            'payment_delays': 0.25  # Retards = risque de churn
        }
        
        # Score de churn de base
        churn_scores = []
        
        for idx, row in customer_features.iterrows():
            score = 0.2  # Base 20% de churn
            
            for factor, weight in churn_factors.items():
                if factor in row and pd.notna(row[factor]):
                    # Normalisation simple
                    value = row[factor]
                    if factor == 'customer_tenure':
                        # Plus c'est long, moins de risque
                        normalized = min(value / 10, 1)  # Cap à 10 ans
                    else:
                        normalized = value
                    
                    score *= (1 + weight * normalized)
            
            churn_scores.append(min(score, 1.0))  # Cap à 100%
        
        # Segmentation par risque
        high_risk = sum(1 for s in churn_scores if s > 0.7)
        medium_risk = sum(1 for s in churn_scores if 0.3 <= s <= 0.7)
        low_risk = sum(1 for s in churn_scores if s < 0.3)
        
        return {
            'churn_predictions': churn_scores[:100],  # Limiter la réponse
            'high_risk_count': high_risk,
            'medium_risk_count': medium_risk,
            'low_risk_count': low_risk,
            'average_churn_risk': float(np.mean(churn_scores)),
            'retention_actions': [
                "Contacter les clients à haut risque",
                "Proposer des réductions fidélité",
                "Améliorer le service sinistres"
            ] if np.mean(churn_scores) > 0.3 else []
        }


class RegulatoryMLAlgorithms:
    """Algorithmes pour la conformité réglementaire"""
    
    @staticmethod
    def calculate_basel_iii_ratios(bank_data: Dict[str, float]) -> Dict[str, Any]:
        """
        Calcule les ratios Bâle III
        
        Args:
            bank_data: Données bancaires (capital, RWA, etc.)
            
        Returns:
            Dict avec les ratios réglementaires
        """
        # Common Equity Tier 1 (CET1)
        cet1_capital = bank_data.get('cet1_capital', 0)
        rwa = bank_data.get('risk_weighted_assets', 1)  # Éviter division par 0
        cet1_ratio = cet1_capital / rwa if rwa > 0 else 0
        
        # Tier 1 Capital Ratio
        tier1_capital = bank_data.get('tier1_capital', cet1_capital)
        tier1_ratio = tier1_capital / rwa if rwa > 0 else 0
        
        # Total Capital Ratio
        total_capital = bank_data.get('total_capital', tier1_capital)
        total_capital_ratio = total_capital / rwa if rwa > 0 else 0
        
        # Leverage Ratio
        exposure = bank_data.get('total_exposure', rwa * 1.5)
        leverage_ratio = tier1_capital / exposure if exposure > 0 else 0
        
        # Liquidity Coverage Ratio (LCR)
        hqla = bank_data.get('high_quality_liquid_assets', 0)
        net_outflows = bank_data.get('net_cash_outflows_30d', 1)
        lcr = hqla / net_outflows if net_outflows > 0 else 0
        
        # Net Stable Funding Ratio (NSFR)
        asf = bank_data.get('available_stable_funding', 0)
        rsf = bank_data.get('required_stable_funding', 1)
        nsfr = asf / rsf if rsf > 0 else 0
        
        # Vérification de conformité
        compliant = all([
            cet1_ratio >= 0.045,  # 4.5% minimum
            tier1_ratio >= 0.06,  # 6% minimum
            total_capital_ratio >= 0.08,  # 8% minimum
            leverage_ratio >= 0.03,  # 3% minimum
            lcr >= 1.0,  # 100% minimum
            nsfr >= 1.0  # 100% minimum
        ])
        
        return {
            'cet1_ratio': float(cet1_ratio),
            'tier1_ratio': float(tier1_ratio),
            'total_capital_ratio': float(total_capital_ratio),
            'leverage_ratio': float(leverage_ratio),
            'lcr': float(lcr),
            'nsfr': float(nsfr),
            'basel_iii_compliant': compliant,
            'deficiencies': [
                f"CET1 ratio below minimum" if cet1_ratio < 0.045 else None,
                f"LCR below minimum" if lcr < 1.0 else None,
                f"NSFR below minimum" if nsfr < 1.0 else None
            ]
        }
    
    @staticmethod
    def calculate_solvency_ii_scr(insurance_data: Dict[str, float]) -> Dict[str, Any]:
        """
        Calcule le Solvency Capital Requirement (SCR) pour Solvency II
        
        Args:
            insurance_data: Données d'assurance
            
        Returns:
            Dict avec les calculs SCR
        """
        # Modules de risque SCR (formule standard simplifiée)
        scr_modules = {
            'market_risk': insurance_data.get('market_risk_capital', 0),
            'counterparty_risk': insurance_data.get('counterparty_risk_capital', 0),
            'life_underwriting_risk': insurance_data.get('life_risk_capital', 0),
            'non_life_underwriting_risk': insurance_data.get('non_life_risk_capital', 0),
            'health_underwriting_risk': insurance_data.get('health_risk_capital', 0),
            'operational_risk': insurance_data.get('operational_risk_capital', 0)
        }
        
        # Matrice de corrélation simplifiée
        correlation = 0.5  # Simplification - en réalité matrice complexe
        
        # BSCR (Basic SCR) avec corrélation
        bscr = 0
        for module1, value1 in scr_modules.items():
            for module2, value2 in scr_modules.items():
                if module1 != module2:
                    bscr += value1 * value2 * correlation
                else:
                    bscr += value1 ** 2
        bscr = np.sqrt(bscr)
        
        # SCR total
        scr_total = bscr + scr_modules['operational_risk']
        
        # MCR (Minimum Capital Requirement)
        mcr = scr_total * 0.25  # Entre 25% et 45% du SCR
        
        # Fonds propres éligibles
        eligible_own_funds = insurance_data.get('eligible_own_funds', 0)
        
        # Ratios de couverture
        scr_ratio = eligible_own_funds / scr_total if scr_total > 0 else 0
        mcr_ratio = eligible_own_funds / mcr if mcr > 0 else 0
        
        return {
            'scr_total': float(scr_total),
            'mcr': float(mcr),
            'bscr': float(bscr),
            'scr_modules': {k: float(v) for k, v in scr_modules.items()},
            'eligible_own_funds': float(eligible_own_funds),
            'scr_ratio': float(scr_ratio),
            'mcr_ratio': float(mcr_ratio),
            'solvency_ii_compliant': scr_ratio >= 1.0 and mcr_ratio >= 1.0,
            'capital_surplus': float(eligible_own_funds - scr_total),
            'recommendations': [
                "Augmenter les fonds propres" if scr_ratio < 1.5 else None,
                "Réduire l'exposition au risque de marché" if scr_modules['market_risk'] > bscr * 0.4 else None
            ]
        }


# Classe principale qui combine tous les algorithmes
class AnalyticsMLAlgorithms:
    """Classe principale regroupant tous les algorithmes ML"""
    
    def __init__(self):
        self.finance_algos = FinanceMLAlgorithms()
        self.insurance_algos = InsuranceMLAlgorithms()
        self.regulatory_algos = RegulatoryMLAlgorithms()
    
    def get_algorithm(self, sector: str, algorithm_type: str):
        """Retourne l'algorithme approprié selon le secteur et le type"""
        if sector.lower() == 'banking':
            return getattr(self.finance_algos, algorithm_type, None)
        elif sector.lower() == 'insurance':
            return getattr(self.insurance_algos, algorithm_type, None)
        else:
            return getattr(self.regulatory_algos, algorithm_type, None)