# app/analytics_ml/data_engineering/gdpr_anonymization.py
"""
Module d'Anonymisation GDPR by Design
Techniques avancées de protection des données personnelles
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple, Union, Callable
from dataclasses import dataclass, field
from enum import Enum
import hashlib
import secrets
from datetime import datetime, timedelta
import re
from faker import Faker
import warnings
from abc import ABC, abstractmethod
import json

warnings.filterwarnings('ignore')

# Initialisation Faker pour données synthétiques
fake = Faker(['fr_FR', 'en_US'])

class AnonymizationTechnique(Enum):
    """Techniques d'anonymisation disponibles"""
    SUPPRESSION = "suppression"
    MASKING = "masking"
    PSEUDONYMIZATION = "pseudonymization"
    GENERALIZATION = "generalization"
    PERTURBATION = "perturbation"
    ENCRYPTION = "encryption"
    TOKENIZATION = "tokenization"
    SYNTHETIC = "synthetic"
    K_ANONYMITY = "k_anonymity"
    L_DIVERSITY = "l_diversity"
    T_CLOSENESS = "t_closeness"

class DataSensitivity(Enum):
    """Niveaux de sensibilité des données"""
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    SENSITIVE = "sensitive"
    HIGHLY_SENSITIVE = "highly_sensitive"

class PIICategory(Enum):
    """Catégories de données personnelles identifiables"""
    NAME = "name"
    EMAIL = "email"
    PHONE = "phone"
    ADDRESS = "address"
    ID_NUMBER = "id_number"
    FINANCIAL = "financial"
    HEALTH = "health"
    BIOMETRIC = "biometric"
    GENETIC = "genetic"
    LOCATION = "location"
    ONLINE_ID = "online_id"
    DEMOGRAPHIC = "demographic"

@dataclass
class AnonymizationRule:
    """Règle d'anonymisation pour un champ"""
    field_name: str
    pii_category: PIICategory
    sensitivity: DataSensitivity
    technique: AnonymizationTechnique
    parameters: Dict[str, Any] = field(default_factory=dict)
    preserve_format: bool = True
    preserve_uniqueness: bool = False
    reversible: bool = False

@dataclass
class AnonymizationProfile:
    """Profil d'anonymisation pour un secteur"""
    sector: str
    rules: List[AnonymizationRule]
    default_technique: AnonymizationTechnique
    k_anonymity_threshold: int = 5
    l_diversity_threshold: int = 3
    retain_statistical_properties: bool = True
    audit_trail: bool = True

@dataclass
class AnonymizationResult:
    """Résultat de l'anonymisation"""
    original_shape: Tuple[int, int]
    anonymized_shape: Tuple[int, int]
    fields_anonymized: List[str]
    techniques_used: Dict[str, str]
    data_loss_percentage: float
    k_anonymity_achieved: Optional[int]
    privacy_risk_score: float
    reversible_fields: List[str]
    audit_log: List[Dict[str, Any]]

class AnonymizationEngine:
    """
    Moteur principal d'anonymisation GDPR
    """
    
    def __init__(self, profile: AnonymizationProfile):
        self.profile = profile
        self.mapping_store = {}  # Pour la pseudonymisation réversible
        self.audit_log = []
        self.salt = secrets.token_hex(16)  # Sel pour le hachage
        
    def anonymize(self, 
                 df: pd.DataFrame,
                 auto_detect: bool = True,
                 custom_rules: Optional[List[AnonymizationRule]] = None) -> Tuple[pd.DataFrame, AnonymizationResult]:
        """
        Anonymise un DataFrame selon le profil et les règles
        
        Args:
            df: DataFrame à anonymiser
            auto_detect: Détection automatique des PII
            custom_rules: Règles personnalisées additionnelles
            
        Returns:
            Tuple (DataFrame anonymisé, Résultat)
        """
        df_anon = df.copy()
        original_shape = df.shape
        
        # Détection automatique des PII si activée
        if auto_detect:
            detected_rules = self._auto_detect_pii(df_anon)
            self.profile.rules.extend(detected_rules)
        
        # Ajouter les règles personnalisées
        if custom_rules:
            self.profile.rules.extend(custom_rules)
        
        # Appliquer les règles d'anonymisation
        fields_anonymized = []
        techniques_used = {}
        
        for rule in self.profile.rules:
            if rule.field_name in df_anon.columns:
                self._log_action(f"Anonymisation de {rule.field_name}", rule)
                
                # Appliquer la technique appropriée
                df_anon[rule.field_name] = self._apply_technique(
                    df_anon[rule.field_name],
                    rule
                )
                
                fields_anonymized.append(rule.field_name)
                techniques_used[rule.field_name] = rule.technique.value
        
        # Appliquer k-anonymité si requis
        k_achieved = None
        if self.profile.k_anonymity_threshold > 1:
            df_anon, k_achieved = self._apply_k_anonymity(
                df_anon,
                self.profile.k_anonymity_threshold
            )
        
        # Calculer les métriques
        data_loss = self._calculate_data_loss(df, df_anon)
        privacy_risk = self._assess_privacy_risk(df_anon)
        
        # Créer le résultat
        result = AnonymizationResult(
            original_shape=original_shape,
            anonymized_shape=df_anon.shape,
            fields_anonymized=fields_anonymized,
            techniques_used=techniques_used,
            data_loss_percentage=data_loss,
            k_anonymity_achieved=k_achieved,
            privacy_risk_score=privacy_risk,
            reversible_fields=[r.field_name for r in self.profile.rules if r.reversible],
            audit_log=self.audit_log
        )
        
        return df_anon, result
    
    def _apply_technique(self, 
                        series: pd.Series,
                        rule: AnonymizationRule) -> pd.Series:
        """Applique une technique d'anonymisation à une série"""
        
        if rule.technique == AnonymizationTechnique.SUPPRESSION:
            return self._suppress(series, rule)
            
        elif rule.technique == AnonymizationTechnique.MASKING:
            return self._mask(series, rule)
            
        elif rule.technique == AnonymizationTechnique.PSEUDONYMIZATION:
            return self._pseudonymize(series, rule)
            
        elif rule.technique == AnonymizationTechnique.GENERALIZATION:
            return self._generalize(series, rule)
            
        elif rule.technique == AnonymizationTechnique.PERTURBATION:
            return self._perturb(series, rule)
            
        elif rule.technique == AnonymizationTechnique.ENCRYPTION:
            return self._encrypt(series, rule)
            
        elif rule.technique == AnonymizationTechnique.TOKENIZATION:
            return self._tokenize(series, rule)
            
        elif rule.technique == AnonymizationTechnique.SYNTHETIC:
            return self._generate_synthetic(series, rule)
            
        else:
            return series
    
    def _suppress(self, series: pd.Series, rule: AnonymizationRule) -> pd.Series:
        """Suppression complète ou partielle"""
        suppress_type = rule.parameters.get('type', 'full')
        
        if suppress_type == 'full':
            return pd.Series([None] * len(series), index=series.index)
        elif suppress_type == 'partial':
            # Supprimer certains caractères
            pattern = rule.parameters.get('pattern', r'\d')  # Par défaut, supprimer les chiffres
            return series.apply(lambda x: re.sub(pattern, '*', str(x)) if pd.notna(x) else x)
        
        return series
    
    def _mask(self, series: pd.Series, rule: AnonymizationRule) -> pd.Series:
        """Masquage des données"""
        mask_char = rule.parameters.get('mask_char', '*')
        preserve_length = rule.parameters.get('preserve_length', True)
        show_last_n = rule.parameters.get('show_last_n', 0)
        
        def mask_value(value):
            if pd.isna(value):
                return value
                
            str_val = str(value)
            
            if rule.preserve_format:
                # Préserver le format (ex: email, téléphone)
                if rule.pii_category == PIICategory.EMAIL:
                    parts = str_val.split('@')
                    if len(parts) == 2:
                        masked_local = mask_char * max(1, len(parts[0]) - 2) + parts[0][-2:]
                        return f"{masked_local}@{parts[1]}"
                        
                elif rule.pii_category == PIICategory.PHONE:
                    # Garder l'indicatif et masquer le reste
                    if len(str_val) >= 10:
                        return str_val[:2] + mask_char * (len(str_val) - 4) + str_val[-2:]
            
            # Masquage générique
            if show_last_n > 0:
                masked_part = mask_char * max(0, len(str_val) - show_last_n)
                visible_part = str_val[-show_last_n:]
                return masked_part + visible_part
            else:
                return mask_char * len(str_val) if preserve_length else mask_char * 8
                
        return series.apply(mask_value)
    
    def _pseudonymize(self, series: pd.Series, rule: AnonymizationRule) -> pd.Series:
        """Pseudonymisation avec possibilité de réversibilité"""
        method = rule.parameters.get('method', 'hash')
        
        if method == 'hash':
            # Hachage irréversible
            return series.apply(
                lambda x: hashlib.sha256(
                    f"{x}{self.salt}".encode()
                ).hexdigest()[:12] if pd.notna(x) else x
            )
            
        elif method == 'mapping':
            # Mapping réversible
            if rule.field_name not in self.mapping_store:
                self.mapping_store[rule.field_name] = {}
                
            mapping = self.mapping_store[rule.field_name]
            
            def create_pseudo(value):
                if pd.isna(value):
                    return value
                    
                if value not in mapping:
                    # Créer un pseudonyme unique
                    if rule.pii_category == PIICategory.NAME:
                        mapping[value] = fake.name()
                    elif rule.pii_category == PIICategory.EMAIL:
                        mapping[value] = fake.email()
                    elif rule.pii_category == PIICategory.ADDRESS:
                        mapping[value] = fake.address().replace('\n', ', ')
                    else:
                        mapping[value] = f"PSEUDO_{len(mapping) + 1:06d}"
                        
                return mapping[value]
                
            return series.apply(create_pseudo)
            
        elif method == 'consistent':
            # Pseudonymisation cohérente (même valeur = même pseudo)
            unique_values = series.dropna().unique()
            
            # Générer des pseudonymes pour chaque valeur unique
            pseudo_map = {}
            for val in unique_values:
                if rule.pii_category == PIICategory.NAME:
                    pseudo_map[val] = fake.name()
                else:
                    pseudo_map[val] = f"{rule.field_name.upper()}_{hashlib.md5(str(val).encode()).hexdigest()[:8]}"
                    
            return series.map(pseudo_map).fillna(series)
    
    def _generalize(self, series: pd.Series, rule: AnonymizationRule) -> pd.Series:
        """Généralisation des données"""
        
        if series.dtype in ['int64', 'float64']:
            # Généralisation numérique
            method = rule.parameters.get('method', 'rounding')
            
            if method == 'rounding':
                precision = rule.parameters.get('precision', 0)
                return series.round(precision)
                
            elif method == 'binning':
                bins = rule.parameters.get('bins', 5)
                labels = rule.parameters.get('labels')
                return pd.cut(series, bins=bins, labels=labels)
                
            elif method == 'range':
                range_size = rule.parameters.get('range_size', 10)
                return series.apply(
                    lambda x: f"{int(x // range_size) * range_size}-{int(x // range_size + 1) * range_size}" 
                    if pd.notna(x) else x
                )
                
        elif series.dtype == 'object':
            # Généralisation textuelle
            if rule.pii_category == PIICategory.ADDRESS:
                # Garder seulement la ville ou le code postal
                level = rule.parameters.get('level', 'city')
                if level == 'postal_code':
                    # Extraire et généraliser le code postal
                    return series.apply(
                        lambda x: re.search(r'\d{5}', str(x)).group()[:3] + 'XX' 
                        if pd.notna(x) and re.search(r'\d{5}', str(x)) else 'Unknown'
                    )
                    
            elif 'date' in rule.field_name.lower():
                # Généralisation temporelle
                try:
                    dates = pd.to_datetime(series)
                    level = rule.parameters.get('level', 'month')
                    
                    if level == 'year':
                        return dates.dt.year
                    elif level == 'month':
                        return dates.dt.to_period('M').astype(str)
                    elif level == 'quarter':
                        return dates.dt.to_period('Q').astype(str)
                except:
                    pass
                    
        return series
    
    def _perturb(self, series: pd.Series, rule: AnonymizationRule) -> pd.Series:
        """Perturbation des données (ajout de bruit)"""
        if series.dtype not in ['int64', 'float64']:
            return series
            
        noise_type = rule.parameters.get('noise_type', 'gaussian')
        noise_level = rule.parameters.get('noise_level', 0.1)
        
        if noise_type == 'gaussian':
            # Bruit gaussien
            std = series.std() * noise_level
            noise = np.random.normal(0, std, len(series))
            return series + noise
            
        elif noise_type == 'uniform':
            # Bruit uniforme
            range_val = series.max() - series.min()
            noise = np.random.uniform(-range_val * noise_level, range_val * noise_level, len(series))
            return series + noise
            
        elif noise_type == 'laplace':
            # Bruit de Laplace (differential privacy)
            sensitivity = rule.parameters.get('sensitivity', 1.0)
            epsilon = rule.parameters.get('epsilon', 1.0)
            scale = sensitivity / epsilon
            noise = np.random.laplace(0, scale, len(series))
            return series + noise
            
        return series
    
    def _encrypt(self, series: pd.Series, rule: AnonymizationRule) -> pd.Series:
        """Chiffrement des données (simulé pour l'exemple)"""
        # En production, utiliser une vraie bibliothèque de chiffrement
        return series.apply(
            lambda x: f"ENC[{hashlib.sha256(f'{x}{self.salt}'.encode()).hexdigest()}]" 
            if pd.notna(x) else x
        )
    
    def _tokenize(self, series: pd.Series, rule: AnonymizationRule) -> pd.Series:
        """Tokenisation des données"""
        token_prefix = rule.parameters.get('prefix', 'TOK')
        
        # Créer un mapping token pour chaque valeur unique
        unique_values = series.dropna().unique()
        token_map = {
            val: f"{token_prefix}_{secrets.token_urlsafe(8)}"
            for val in unique_values
        }
        
        # Stocker le mapping si réversible
        if rule.reversible:
            if rule.field_name not in self.mapping_store:
                self.mapping_store[rule.field_name] = {}
            self.mapping_store[rule.field_name].update({v: k for k, v in token_map.items()})
            
        return series.map(token_map).fillna(series)
    
    def _generate_synthetic(self, series: pd.Series, rule: AnonymizationRule) -> pd.Series:
        """Génération de données synthétiques"""
        preserve_distribution = rule.parameters.get('preserve_distribution', True)
        
        if rule.pii_category == PIICategory.NAME:
            # Générer des noms synthétiques
            gender_ratio = rule.parameters.get('gender_ratio', 0.5)
            return pd.Series([
                fake.name_male() if np.random.random() < gender_ratio else fake.name_female()
                for _ in range(len(series))
            ], index=series.index)
            
        elif rule.pii_category == PIICategory.EMAIL:
            # Générer des emails synthétiques
            domains = rule.parameters.get('domains', ['example.com', 'test.org'])
            return pd.Series([
                fake.user_name() + '@' + np.random.choice(domains)
                for _ in range(len(series))
            ], index=series.index)
            
        elif rule.pii_category == PIICategory.PHONE:
            # Générer des numéros de téléphone
            return pd.Series([fake.phone_number() for _ in range(len(series))], index=series.index)
            
        elif rule.pii_category == PIICategory.ADDRESS:
            # Générer des adresses
            return pd.Series([fake.address().replace('\n', ', ') for _ in range(len(series))], index=series.index)
            
        elif series.dtype in ['int64', 'float64'] and preserve_distribution:
            # Préserver la distribution statistique
            mean = series.mean()
            std = series.std()
            min_val = series.min()
            max_val = series.max()
            
            # Générer des valeurs synthétiques avec la même distribution
            synthetic = np.random.normal(mean, std, len(series))
            synthetic = np.clip(synthetic, min_val, max_val)
            
            if series.dtype == 'int64':
                synthetic = synthetic.astype(int)
                
            return pd.Series(synthetic, index=series.index)
            
        return series
    
    def _apply_k_anonymity(self, 
                          df: pd.DataFrame,
                          k: int) -> Tuple[pd.DataFrame, int]:
        """Applique k-anonymité au DataFrame"""
        # Identifier les quasi-identifiants
        quasi_identifiers = self._identify_quasi_identifiers(df)
        
        if not quasi_identifiers:
            return df, None
            
        # Grouper par quasi-identifiants
        grouped = df.groupby(quasi_identifiers)
        group_sizes = grouped.size()
        
        # Supprimer les groupes < k
        valid_groups = group_sizes[group_sizes >= k].index
        df_k_anon = df[df.set_index(quasi_identifiers).index.isin(valid_groups)].copy()
        
        # Calculer le k effectif
        if len(df_k_anon) > 0:
            k_achieved = group_sizes[group_sizes >= k].min()
        else:
            k_achieved = 0
            
        self._log_action(
            f"K-anonymité appliquée",
            {"k_requis": k, "k_atteint": k_achieved, "lignes_supprimées": len(df) - len(df_k_anon)}
        )
        
        return df_k_anon, k_achieved
    
    def _auto_detect_pii(self, df: pd.DataFrame) -> List[AnonymizationRule]:
        """Détection automatique des PII dans le DataFrame"""
        detected_rules = []
        
        for column in df.columns:
            # Détection basée sur les patterns et noms de colonnes
            col_lower = column.lower()
            sample_values = df[column].dropna().astype(str).head(100)
            
            # Détection des noms
            if any(word in col_lower for word in ['name', 'nom', 'prenom', 'surname']):
                detected_rules.append(AnonymizationRule(
                    field_name=column,
                    pii_category=PIICategory.NAME,
                    sensitivity=DataSensitivity.SENSITIVE,
                    technique=AnonymizationTechnique.PSEUDONYMIZATION
                ))
                
            # Détection des emails
            elif any(word in col_lower for word in ['email', 'mail', 'courriel']):
                detected_rules.append(AnonymizationRule(
                    field_name=column,
                    pii_category=PIICategory.EMAIL,
                    sensitivity=DataSensitivity.SENSITIVE,
                    technique=AnonymizationTechnique.MASKING,
                    parameters={'show_last_n': 0}
                ))
                
            # Détection des téléphones
            elif any(word in col_lower for word in ['phone', 'tel', 'mobile', 'telephone']):
                detected_rules.append(AnonymizationRule(
                    field_name=column,
                    pii_category=PIICategory.PHONE,
                    sensitivity=DataSensitivity.SENSITIVE,
                    technique=AnonymizationTechnique.MASKING,
                    parameters={'show_last_n': 2}
                ))
                
            # Détection des adresses
            elif any(word in col_lower for word in ['address', 'adresse', 'street', 'rue']):
                detected_rules.append(AnonymizationRule(
                    field_name=column,
                    pii_category=PIICategory.ADDRESS,
                    sensitivity=DataSensitivity.SENSITIVE,
                    technique=AnonymizationTechnique.GENERALIZATION,
                    parameters={'level': 'city'}
                ))
                
            # Détection par patterns dans les données
            else:
                # Pattern email
                email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
                if sample_values.str.match(email_pattern).any():
                    detected_rules.append(AnonymizationRule(
                        field_name=column,
                        pii_category=PIICategory.EMAIL,
                        sensitivity=DataSensitivity.SENSITIVE,
                        technique=AnonymizationTechnique.MASKING
                    ))
                    
                # Pattern téléphone
                phone_pattern = r'^[\d\s\-\+\(\)]+$'
                if sample_values.str.match(phone_pattern).any() and sample_values.str.len().median() > 8:
                    detected_rules.append(AnonymizationRule(
                        field_name=column,
                        pii_category=PIICategory.PHONE,
                        sensitivity=DataSensitivity.SENSITIVE,
                        technique=AnonymizationTechnique.MASKING
                    ))
        
        return detected_rules
    
    def _identify_quasi_identifiers(self, df: pd.DataFrame) -> List[str]:
        """Identifie les quasi-identifiants potentiels"""
        quasi_ids = []
        
        for col in df.columns:
            # Critères pour quasi-identifiants
            if df[col].dtype == 'object':
                unique_ratio = df[col].nunique() / len(df)
                # Ni trop unique, ni trop commun
                if 0.01 < unique_ratio < 0.7:
                    quasi_ids.append(col)
            elif df[col].dtype in ['int64', 'float64']:
                # Variables catégorielles numériques
                if df[col].nunique() < 20:
                    quasi_ids.append(col)
                    
        return quasi_ids[:5]  # Limiter à 5 quasi-identifiants
    
    def _calculate_data_loss(self, 
                           original: pd.DataFrame,
                           anonymized: pd.DataFrame) -> float:
        """Calcule la perte d'information due à l'anonymisation"""
        total_loss = 0
        total_cells = original.size
        
        for col in original.columns:
            if col not in anonymized.columns:
                # Colonne supprimée
                total_loss += len(original)
            else:
                # Calculer la perte par colonne
                if original[col].dtype in ['int64', 'float64']:
                    # Perte de précision numérique
                    if anonymized[col].dtype in ['int64', 'float64']:
                        orig_std = original[col].std()
                        anon_std = anonymized[col].std()
                        if orig_std > 0:
                            loss = abs(orig_std - anon_std) / orig_std
                            total_loss += loss * len(original)
                else:
                    # Perte d'information catégorielle
                    orig_unique = original[col].nunique()
                    anon_unique = anonymized[col].nunique()
                    if orig_unique > 0:
                        loss = 1 - (anon_unique / orig_unique)
                        total_loss += loss * len(original)
                        
        return (total_loss / total_cells) * 100 if total_cells > 0 else 0
    
    def _assess_privacy_risk(self, df: pd.DataFrame) -> float:
        """Évalue le risque résiduel pour la vie privée"""
        risk_score = 0
        max_score = 100
        
        # Facteurs de risque
        factors = {
            'unique_combinations': 30,  # Combinaisons uniques d'attributs
            'rare_values': 20,          # Valeurs rares
            'high_dimensionality': 20,  # Nombreuses colonnes
            'linkability': 30           # Possibilité de liaison
        }
        
        # Évaluer les combinaisons uniques
        if len(df.columns) > 1:
            # Échantillonner pour performance
            sample_size = min(1000, len(df))
            sample = df.sample(n=sample_size) if len(df) > sample_size else df
            
            # Combinaisons de 2-3 colonnes
            for n in [2, 3]:
                if len(df.columns) >= n:
                    cols = df.columns[:n]
                    unique_ratio = sample[cols].drop_duplicates().shape[0] / len(sample)
                    if unique_ratio > 0.9:
                        risk_score += factors['unique_combinations'] * (n / 3)
                        
        # Évaluer les valeurs rares
        for col in df.select_dtypes(include=['object']).columns[:10]:
            value_counts = df[col].value_counts()
            rare_values = (value_counts == 1).sum()
            if rare_values > 0:
                risk_score += factors['rare_values'] * (rare_values / len(value_counts))
                
        # Dimensionnalité
        if len(df.columns) > 50:
            risk_score += factors['high_dimensionality']
            
        # Normaliser le score
        return min(risk_score, max_score)
    
    def _log_action(self, action: str, details: Any):
        """Enregistre une action dans l'audit trail"""
        self.audit_log.append({
            'timestamp': datetime.now().isoformat(),
            'action': action,
            'details': details
        })
    
    def reverse_anonymization(self, 
                            df: pd.DataFrame,
                            fields: List[str]) -> pd.DataFrame:
        """Inverse l'anonymisation pour les champs réversibles"""
        df_reversed = df.copy()
        
        for field in fields:
            if field in self.mapping_store:
                # Inverser le mapping
                reverse_map = {v: k for k, v in self.mapping_store[field].items()}
                df_reversed[field] = df_reversed[field].map(reverse_map).fillna(df_reversed[field])
                
        return df_reversed
    
    def export_mappings(self, filepath: str):
        """Exporte les mappings pour sauvegarde sécurisée"""
        with open(filepath, 'w') as f:
            json.dump(self.mapping_store, f, indent=2)
            
    def import_mappings(self, filepath: str):
        """Importe les mappings sauvegardés"""
        with open(filepath, 'r') as f:
            self.mapping_store = json.load(f)

# Profils préconfigurés par secteur
SECTOR_PROFILES = {
    'banque': AnonymizationProfile(
        sector='banque',
        rules=[
            AnonymizationRule(
                field_name='account_number',
                pii_category=PIICategory.FINANCIAL,
                sensitivity=DataSensitivity.HIGHLY_SENSITIVE,
                technique=AnonymizationTechnique.TOKENIZATION,
                reversible=True
            ),
            AnonymizationRule(
                field_name='customer_name',
                pii_category=PIICategory.NAME,
                sensitivity=DataSensitivity.SENSITIVE,
                technique=AnonymizationTechnique.PSEUDONYMIZATION,
                parameters={'method': 'mapping'},
                reversible=True
            ),
            AnonymizationRule(
                field_name='transaction_amount',
                pii_category=PIICategory.FINANCIAL,
                sensitivity=DataSensitivity.CONFIDENTIAL,
                technique=AnonymizationTechnique.PERTURBATION,
                parameters={'noise_type': 'laplace', 'epsilon': 1.0}
            )
        ],
        default_technique=AnonymizationTechnique.PSEUDONYMIZATION,
        k_anonymity_threshold=5
    ),
    
    'sante': AnonymizationProfile(
        sector='sante',
        rules=[
            AnonymizationRule(
                field_name='patient_id',
                pii_category=PIICategory.ID_NUMBER,
                sensitivity=DataSensitivity.HIGHLY_SENSITIVE,
                technique=AnonymizationTechnique.PSEUDONYMIZATION,
                preserve_uniqueness=True,
                reversible=True
            ),
            AnonymizationRule(
                field_name='patient_name',
                pii_category=PIICategory.NAME,
                sensitivity=DataSensitivity.HIGHLY_SENSITIVE,
                technique=AnonymizationTechnique.SUPPRESSION
            ),
            AnonymizationRule(
                field_name='diagnosis',
                pii_category=PIICategory.HEALTH,
                sensitivity=DataSensitivity.HIGHLY_SENSITIVE,
                technique=AnonymizationTechnique.GENERALIZATION,
                parameters={'method': 'category_grouping'}
            ),
            AnonymizationRule(
                field_name='birth_date',
                pii_category=PIICategory.DEMOGRAPHIC,
                sensitivity=DataSensitivity.SENSITIVE,
                technique=AnonymizationTechnique.GENERALIZATION,
                parameters={'level': 'year'}
            )
        ],
        default_technique=AnonymizationTechnique.SUPPRESSION,
        k_anonymity_threshold=10,
        l_diversity_threshold=3
    ),
    
    'retail': AnonymizationProfile(
        sector='retail',
        rules=[
            AnonymizationRule(
                field_name='customer_email',
                pii_category=PIICategory.EMAIL,
                sensitivity=DataSensitivity.SENSITIVE,
                technique=AnonymizationTechnique.MASKING,
                parameters={'show_last_n': 0}
            ),
            AnonymizationRule(
                field_name='shipping_address',
                pii_category=PIICategory.ADDRESS,
                sensitivity=DataSensitivity.SENSITIVE,
                technique=AnonymizationTechnique.GENERALIZATION,
                parameters={'level': 'postal_code'}
            ),
            AnonymizationRule(
                field_name='purchase_history',
                pii_category=PIICategory.FINANCIAL,
                sensitivity=DataSensitivity.CONFIDENTIAL,
                technique=AnonymizationTechnique.SYNTHETIC,
                parameters={'preserve_distribution': True}
            )
        ],
        default_technique=AnonymizationTechnique.MASKING,
        k_anonymity_threshold=3
    )
}

# Fonction helper pour anonymisation rapide
def anonymize_dataframe(df: pd.DataFrame,
                       sector: str,
                       auto_detect: bool = True,
                       custom_rules: Optional[List[AnonymizationRule]] = None) -> Tuple[pd.DataFrame, AnonymizationResult]:
    """
    Fonction helper pour anonymiser rapidement un DataFrame
    
    Args:
        df: DataFrame à anonymiser
        sector: Secteur d'activité
        auto_detect: Détection automatique des PII
        custom_rules: Règles personnalisées
        
    Returns:
        Tuple (DataFrame anonymisé, Résultat)
    """
    # Obtenir le profil du secteur
    profile = SECTOR_PROFILES.get(
        sector, 
        AnonymizationProfile(
            sector='general',
            rules=[],
            default_technique=AnonymizationTechnique.MASKING
        )
    )
    
    # Créer le moteur d'anonymisation
    engine = AnonymizationEngine(profile)
    
    # Anonymiser
    return engine.anonymize(df, auto_detect, custom_rules)

# Classe pour l'analyse de risque de ré-identification
class ReidentificationRiskAnalyzer:
    """Analyse le risque de ré-identification après anonymisation"""
    
    @staticmethod
    def analyze(original_df: pd.DataFrame,
               anonymized_df: pd.DataFrame,
               external_data: Optional[pd.DataFrame] = None) -> Dict[str, Any]:
        """
        Analyse le risque de ré-identification
        
        Args:
            original_df: DataFrame original
            anonymized_df: DataFrame anonymisé
            external_data: Données externes pour test de liaison
            
        Returns:
            Analyse de risque
        """
        risk_analysis = {
            'prosecutor_risk': 0,      # Risque pour un attaquant ciblé
            'journalist_risk': 0,       # Risque pour un attaquant opportuniste
            'marketer_risk': 0,         # Risque commercial
            'k_anonymity_level': 0,
            'l_diversity_level': 0,
            'uniqueness_score': 0,
            'linkability_score': 0,
            'inference_risk': 0,
            'overall_risk': 'low'
        }
        
        # Analyse de k-anonymité
        quasi_ids = []
        for col in anonymized_df.columns:
            if anonymized_df[col].nunique() < len(anonymized_df) * 0.5:
                quasi_ids.append(col)
                
        if quasi_ids:
            group_sizes = anonymized_df.groupby(quasi_ids[:3]).size()
            risk_analysis['k_anonymity_level'] = group_sizes.min() if len(group_sizes) > 0 else 0
            
            # Risque prosecutor (1/k)
            if risk_analysis['k_anonymity_level'] > 0:
                risk_analysis['prosecutor_risk'] = 1 / risk_analysis['k_anonymity_level']
                
        # Analyse d'unicité
        for col in anonymized_df.columns:
            unique_ratio = anonymized_df[col].nunique() / len(anonymized_df)
            risk_analysis['uniqueness_score'] = max(risk_analysis['uniqueness_score'], unique_ratio)
            
        # Test de liaison avec données externes
        if external_data is not None:
            common_cols = set(anonymized_df.columns) & set(external_data.columns)
            if common_cols:
                # Simuler une attaque par liaison
                merged = pd.merge(
                    anonymized_df.sample(min(100, len(anonymized_df))),
                    external_data.sample(min(100, len(external_data))),
                    on=list(common_cols),
                    how='inner'
                )
                risk_analysis['linkability_score'] = len(merged) / 100
                
        # Calcul du risque global
        risk_scores = [
            risk_analysis['prosecutor_risk'],
            risk_analysis['uniqueness_score'],
            risk_analysis['linkability_score']
        ]
        
        avg_risk = np.mean([s for s in risk_scores if s > 0])
        
        if avg_risk < 0.1:
            risk_analysis['overall_risk'] = 'low'
        elif avg_risk < 0.3:
            risk_analysis['overall_risk'] = 'medium'
        else:
            risk_analysis['overall_risk'] = 'high'
            
        return risk_analysis