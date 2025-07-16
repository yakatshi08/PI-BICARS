"""
Service Credit Risk pour PI BICARS
Modèles IFRS 9 : PD, LGD, EAD
"""

from typing import Dict, List, Any, Optional, Tuple
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from enum import Enum
import json
from dataclasses import dataclass

class RatingClass(Enum):
    """Classes de rating selon l'échelle standard"""
    AAA = "AAA"
    AA = "AA"
    A = "A"
    BBB = "BBB"
    BB = "BB"
    B = "B"
    CCC = "CCC"
    CC = "CC"
    C = "C"
    D = "D"  # Default

class StressScenario(Enum):
    """Scénarios de stress BCE"""
    BASELINE = "baseline"
    ADVERSE = "adverse"
    SEVERE = "severe"

@dataclass
class CreditExposure:
    """Exposition de crédit"""
    exposure_id: str
    borrower_id: str
    exposure_amount: float
    rating: RatingClass
    maturity: int  # en mois
    collateral_value: float
    sector: str
    country: str
    
class CreditRiskService:
    """Service de calcul du risque de crédit"""
    
    def __init__(self):
        # Matrices de transition de rating (annuelles)
        self.transition_matrix = {
            'baseline': self._get_baseline_transition_matrix(),
            'adverse': self._get_adverse_transition_matrix(),
            'severe': self._get_severe_transition_matrix()
        }
        
        # PD par rating (1 an)
        self.pd_by_rating = {
            RatingClass.AAA: 0.0001,
            RatingClass.AA: 0.0003,
            RatingClass.A: 0.0008,
            RatingClass.BBB: 0.0018,
            RatingClass.BB: 0.0088,
            RatingClass.B: 0.0420,
            RatingClass.CCC: 0.1687,
            RatingClass.CC: 0.2817,
            RatingClass.C: 0.4630,
            RatingClass.D: 1.0000
        }
        
        # LGD par type de garantie
        self.lgd_by_collateral = {
            'unsecured': 0.45,
            'real_estate': 0.25,
            'financial': 0.35,
            'guarantee': 0.40,
            'other': 0.50
        }
        
        # Facteurs de stress par secteur
        self.sector_stress_factors = {
            'baseline': {'retail': 1.0, 'corporate': 1.0, 'real_estate': 1.0, 'financial': 1.0},
            'adverse': {'retail': 1.3, 'corporate': 1.5, 'real_estate': 1.8, 'financial': 1.4},
            'severe': {'retail': 1.8, 'corporate': 2.2, 'real_estate': 2.5, 'financial': 2.0}
        }
    
    async def calculate_pd(self, rating: RatingClass, horizon: int = 12, 
                          scenario: StressScenario = StressScenario.BASELINE) -> float:
        """
        Calcule la Probability of Default
        
        Args:
            rating: Classe de rating
            horizon: Horizon temporel en mois
            scenario: Scénario de stress
            
        Returns:
            PD sur l'horizon donné
        """
        # PD annuelle de base
        pd_annual = self.pd_by_rating[rating]
        
        # Ajustement pour l'horizon
        pd_horizon = 1 - (1 - pd_annual) ** (horizon / 12)
        
        # Ajustement pour le scénario de stress
        if scenario != StressScenario.BASELINE:
            stress_multiplier = 1.5 if scenario == StressScenario.ADVERSE else 2.0
            pd_horizon = min(pd_horizon * stress_multiplier, 1.0)
        
        return round(pd_horizon, 4)
    
    async def calculate_lgd(self, exposure_amount: float, collateral_value: float,
                           collateral_type: str = 'unsecured',
                           scenario: StressScenario = StressScenario.BASELINE) -> float:
        """
        Calcule la Loss Given Default
        
        Args:
            exposure_amount: Montant de l'exposition
            collateral_value: Valeur de la garantie
            collateral_type: Type de garantie
            scenario: Scénario de stress
            
        Returns:
            LGD en pourcentage
        """
        # LGD de base selon le type de garantie
        base_lgd = self.lgd_by_collateral.get(collateral_type, 0.45)
        
        # Ajustement pour la couverture
        if collateral_value > 0:
            coverage_ratio = min(collateral_value / exposure_amount, 1.0)
            
            # Haircut sur la valeur de la garantie selon le scénario
            haircut = {
                StressScenario.BASELINE: 0.0,
                StressScenario.ADVERSE: 0.15,
                StressScenario.SEVERE: 0.30
            }[scenario]
            
            adjusted_coverage = coverage_ratio * (1 - haircut)
            lgd = base_lgd * (1 - adjusted_coverage)
        else:
            lgd = base_lgd
        
        # Ajustement stress
        if scenario != StressScenario.BASELINE:
            stress_factor = 1.2 if scenario == StressScenario.ADVERSE else 1.4
            lgd = min(lgd * stress_factor, 1.0)
        
        return round(lgd, 4)
    
    async def calculate_ead(self, drawn_amount: float, undrawn_amount: float,
                           ccf: float = 0.75, product_type: str = 'loan') -> float:
        """
        Calcule l'Exposure at Default
        
        Args:
            drawn_amount: Montant tiré
            undrawn_amount: Montant non tiré
            ccf: Credit Conversion Factor
            product_type: Type de produit
            
        Returns:
            EAD total
        """
        # CCF par type de produit
        ccf_by_product = {
            'loan': 1.0,
            'credit_line': 0.75,
            'guarantee': 0.50,
            'commitment': 0.35
        }
        
        adjusted_ccf = ccf_by_product.get(product_type, ccf)
        
        # EAD = Montant tiré + (CCF × Montant non tiré)
        ead = drawn_amount + (adjusted_ccf * undrawn_amount)
        
        return round(ead, 2)
    
    async def calculate_expected_loss(self, pd: float, lgd: float, ead: float) -> Dict[str, float]:
        """
        Calcule la perte attendue (ECL - Expected Credit Loss)
        
        Args:
            pd: Probability of Default
            lgd: Loss Given Default
            ead: Exposure at Default
            
        Returns:
            Détail des pertes attendues
        """
        # ECL = PD × LGD × EAD
        ecl = pd * lgd * ead
        
        # Stages IFRS 9
        if pd < 0.01:  # Stage 1
            stage = 1
            ecl_12m = ecl
            ecl_lifetime = ecl * 3  # Simplification
        elif pd < 0.20:  # Stage 2
            stage = 2
            ecl_12m = pd * lgd * ead
            ecl_lifetime = ecl * 5  # Simplification
        else:  # Stage 3
            stage = 3
            ecl_12m = ecl
            ecl_lifetime = ecl
        
        return {
            'stage': stage,
            'ecl_12_months': round(ecl_12m, 2),
            'ecl_lifetime': round(ecl_lifetime, 2),
            'pd': pd,
            'lgd': lgd,
            'ead': ead,
            'provision_rate': round((ecl_lifetime / ead) * 100, 2)
        }
    
    async def run_stress_test(self, portfolio: List[Dict], scenarios: List[StressScenario]) -> Dict[str, Any]:
        """
        Exécute un stress test sur un portefeuille
        
        Args:
            portfolio: Liste des expositions
            scenarios: Scénarios à tester
            
        Returns:
            Résultats du stress test
        """
        results = {}
        
        for scenario in scenarios:
            total_ead = 0
            total_ecl = 0
            by_rating = {}
            by_sector = {}
            
            for exposure in portfolio:
                # Calculs pour chaque exposition
                rating = RatingClass[exposure['rating']]
                pd = await self.calculate_pd(rating, 12, scenario)
                lgd = await self.calculate_lgd(
                    exposure['exposure_amount'],
                    exposure.get('collateral_value', 0),
                    exposure.get('collateral_type', 'unsecured'),
                    scenario
                )
                ead = await self.calculate_ead(
                    exposure['drawn_amount'],
                    exposure.get('undrawn_amount', 0)
                )
                
                ecl_data = await self.calculate_expected_loss(pd, lgd, ead)
                ecl = ecl_data['ecl_lifetime']
                
                # Agrégations
                total_ead += ead
                total_ecl += ecl
                
                # Par rating
                if rating.value not in by_rating:
                    by_rating[rating.value] = {'ead': 0, 'ecl': 0, 'count': 0}
                by_rating[rating.value]['ead'] += ead
                by_rating[rating.value]['ecl'] += ecl
                by_rating[rating.value]['count'] += 1
                
                # Par secteur
                sector = exposure.get('sector', 'other')
                if sector not in by_sector:
                    by_sector[sector] = {'ead': 0, 'ecl': 0, 'count': 0}
                by_sector[sector]['ead'] += ead
                by_sector[sector]['ecl'] += ecl
                by_sector[sector]['count'] += 1
            
            results[scenario.value] = {
                'total_ead': round(total_ead, 2),
                'total_ecl': round(total_ecl, 2),
                'ecl_rate': round((total_ecl / total_ead * 100) if total_ead > 0 else 0, 2),
                'by_rating': by_rating,
                'by_sector': by_sector,
                'capital_impact': round(total_ecl * 0.08, 2),  # 8% capital requirement
                'scenario': scenario.value,
                'timestamp': datetime.now().isoformat()
            }
        
        return {
            'portfolio_size': len(portfolio),
            'scenarios': results,
            'comparison': self._compare_scenarios(results),
            'recommendations': self._generate_recommendations(results)
        }
    
    async def generate_rating_migration_matrix(self, portfolio: List[Dict], 
                                             time_period: int = 12) -> Dict[str, Any]:
        """
        Génère une matrice de migration des ratings
        
        Args:
            portfolio: Portefeuille avec historique
            time_period: Période en mois
            
        Returns:
            Matrice de migration
        """
        # Simulation d'une matrice de migration
        ratings = [r.value for r in RatingClass]
        matrix = {}
        
        for from_rating in ratings:
            matrix[from_rating] = {}
            for to_rating in ratings:
                # Probabilités de transition simulées
                if from_rating == to_rating:
                    prob = 0.85  # Probabilité de rester dans la même classe
                elif ratings.index(to_rating) == ratings.index(from_rating) + 1:
                    prob = 0.10  # Dégradation d'un cran
                elif ratings.index(to_rating) == ratings.index(from_rating) - 1:
                    prob = 0.03  # Amélioration d'un cran
                else:
                    prob = 0.01  # Autres transitions
                
                matrix[from_rating][to_rating] = round(prob, 4)
        
        return {
            'matrix': matrix,
            'period_months': time_period,
            'portfolio_migrations': self._analyze_migrations(portfolio, matrix),
            'stability_index': self._calculate_stability_index(matrix)
        }
    
    def _get_baseline_transition_matrix(self) -> Dict[str, Dict[str, float]]:
        """Matrice de transition baseline"""
        # Simplification - en production, utiliser des données historiques
        return {
            'AAA': {'AAA': 0.95, 'AA': 0.04, 'A': 0.01},
            'AA': {'AAA': 0.02, 'AA': 0.93, 'A': 0.04, 'BBB': 0.01},
            # ... etc
        }
    
    def _get_adverse_transition_matrix(self) -> Dict[str, Dict[str, float]]:
        """Matrice de transition adverse"""
        # Plus de dégradations dans le scénario adverse
        return {
            'AAA': {'AAA': 0.90, 'AA': 0.08, 'A': 0.02},
            'AA': {'AAA': 0.01, 'AA': 0.88, 'A': 0.08, 'BBB': 0.03},
            # ... etc
        }
    
    def _get_severe_transition_matrix(self) -> Dict[str, Dict[str, float]]:
        """Matrice de transition severe"""
        # Beaucoup plus de dégradations
        return {
            'AAA': {'AAA': 0.85, 'AA': 0.12, 'A': 0.03},
            'AA': {'AAA': 0.005, 'AA': 0.80, 'A': 0.15, 'BBB': 0.045},
            # ... etc
        }
    
    def _compare_scenarios(self, results: Dict) -> Dict[str, Any]:
        """Compare les résultats entre scénarios"""
        baseline = results.get('baseline', {})
        adverse = results.get('adverse', {})
        severe = results.get('severe', {})
        
        return {
            'ecl_increase_adverse': round(
                ((adverse.get('total_ecl', 0) / baseline.get('total_ecl', 1)) - 1) * 100, 2
            ) if baseline.get('total_ecl') else 0,
            'ecl_increase_severe': round(
                ((severe.get('total_ecl', 0) / baseline.get('total_ecl', 1)) - 1) * 100, 2
            ) if baseline.get('total_ecl') else 0,
            'capital_buffer_required': round(
                max(adverse.get('capital_impact', 0), severe.get('capital_impact', 0)) -
                baseline.get('capital_impact', 0), 2
            )
        }
    
    def _generate_recommendations(self, results: Dict) -> List[str]:
        """Génère des recommandations basées sur les résultats"""
        recommendations = []
        
        # Analyse du scénario sévère
        severe = results.get('severe', {})
        if severe.get('ecl_rate', 0) > 5:
            recommendations.append("⚠️ Taux de perte élevé en scénario sévère - Renforcer les provisions")
        
        # Analyse par secteur
        for scenario_results in results.values():
            for sector, data in scenario_results.get('by_sector', {}).items():
                if data['ecl'] / data['ead'] > 0.08:
                    recommendations.append(f"📊 Exposition élevée au risque dans le secteur {sector}")
        
        # Capital
        comparison = self._compare_scenarios(results)
        if comparison.get('capital_buffer_required', 0) > 1000000:
            recommendations.append("💰 Buffer de capital supplémentaire recommandé")
        
        return recommendations
    
    def _analyze_migrations(self, portfolio: List[Dict], matrix: Dict) -> Dict:
        """Analyse les migrations de rating du portefeuille"""
        # Simulation
        return {
            'upgrades': 12,
            'downgrades': 45,
            'defaults': 3,
            'stable': 140
        }
    
    def _calculate_stability_index(self, matrix: Dict) -> float:
        """Calcule un indice de stabilité de la matrice"""
        # Somme des probabilités diagonales
        diagonal_sum = sum(matrix.get(r, {}).get(r, 0) for r in matrix.keys())
        return round(diagonal_sum / len(matrix) * 100, 2) if matrix else 0