"""
Service de traitement intelligent des fichiers pour PI BICARS
Détection automatique du secteur et extraction des données
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
import json
import xml.etree.ElementTree as ET
from datetime import datetime
import re
from pathlib import Path

class FileProcessor:
    """Processeur intelligent de fichiers financiers"""
    
    def __init__(self):
        # Patterns pour détecter le secteur
        self.banking_patterns = [
            'assets', 'loans', 'deposits', 'nii', 'net_interest_income',
            'tier1', 'tier_1', 'cet1', 'capital_ratio', 'lcr', 'nsfr',
            'provisions', 'basel', 'basel_iii', 'car', 'rwas', 'risk_weighted',
            'non_performing', 'npl', 'credit_risk', 'pd', 'lgd', 'ead'
        ]
        
        self.insurance_patterns = [
            'premiums', 'premium', 'claims', 'claim', 'reserves', 'reserve',
            'scr', 'mcr', 'solvency', 'combined_ratio', 'loss_ratio',
            'underwriting', 'reinsurance', 'actuarial', 'mortality',
            'morbidity', 'lapse', 'expense_ratio', 'technical_provisions',
            'own_funds', 'risk_margin'
        ]
        
        # Mapping des KPIs par secteur
        self.kpi_mappings = {
            'banking': {
                'cet1_ratio': ['cet1', 'tier1', 'capital_ratio', 'car'],
                'lcr': ['lcr', 'liquidity_coverage', 'liquid_assets'],
                'nsfr': ['nsfr', 'stable_funding'],
                'npl_ratio': ['npl', 'non_performing', 'bad_loans'],
                'roe': ['roe', 'return_equity', 'profitability']
            },
            'insurance': {
                'scr_ratio': ['scr', 'solvency_capital', 'capital_requirement'],
                'combined_ratio': ['combined', 'loss_expense', 'underwriting_ratio'],
                'mcr_ratio': ['mcr', 'minimum_capital'],
                'loss_ratio': ['loss', 'claims_ratio', 'sinistralite'],
                'expense_ratio': ['expense', 'cost_ratio', 'frais']
            }
        }
    
    def process_file(self, file_path: str, file_type: str) -> Dict[str, Any]:
        """
        Traite un fichier et retourne les données analysées
        
        Args:
            file_path: Chemin vers le fichier
            file_type: Type MIME du fichier
            
        Returns:
            Dict contenant les données, le secteur détecté et les KPIs suggérés
        """
        try:
            # Chargement des données selon le type
            if 'sheet' in file_type or 'excel' in file_type:
                data = self._process_excel(file_path)
            elif 'csv' in file_type:
                data = self._process_csv(file_path)
            elif 'json' in file_type:
                data = self._process_json(file_path)
            elif 'xml' in file_type:
                data = self._process_xml(file_path)
            elif 'pdf' in file_type:
                data = self._process_pdf(file_path)
            else:
                raise ValueError(f"Type de fichier non supporté: {file_type}")
            
            # Détection du secteur
            sector = self._detect_sector(data)
            
            # Extraction des KPIs
            kpis = self._extract_kpis(data, sector)
            
            # Validation de la qualité des données
            quality_report = self._validate_data_quality(data)
            
            # Génération du schéma de données
            schema = self._generate_schema(data)
            
            return {
                'status': 'success',
                'data': data,
                'sector': sector,
                'suggested_kpis': kpis,
                'quality_report': quality_report,
                'schema': schema,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _process_excel(self, file_path: str) -> pd.DataFrame:
        """Traite les fichiers Excel"""
        df = pd.read_excel(file_path, sheet_name=0)
        return self._clean_dataframe(df)
    
    def _process_csv(self, file_path: str) -> pd.DataFrame:
        """Traite les fichiers CSV avec détection automatique du séparateur"""
        # Détection du séparateur
        with open(file_path, 'r', encoding='utf-8') as f:
            first_line = f.readline()
            if ';' in first_line:
                sep = ';'
            elif '\t' in first_line:
                sep = '\t'
            else:
                sep = ','
        
        df = pd.read_csv(file_path, sep=sep, encoding='utf-8')
        return self._clean_dataframe(df)
    
    def _process_json(self, file_path: str) -> pd.DataFrame:
        """Traite les fichiers JSON"""
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Si c'est une liste de dictionnaires
        if isinstance(data, list):
            df = pd.DataFrame(data)
        # Si c'est un dictionnaire avec des listes
        elif isinstance(data, dict):
            df = pd.DataFrame(data)
        else:
            raise ValueError("Format JSON non supporté")
        
        return self._clean_dataframe(df)
    
    def _process_xml(self, file_path: str) -> pd.DataFrame:
        """Traite les fichiers XML (incluant XBRL)"""
        tree = ET.parse(file_path)
        root = tree.getroot()
        
        # Extraction basique - à adapter selon le format XML spécifique
        data = []
        for child in root:
            row = {}
            for subchild in child:
                row[subchild.tag] = subchild.text
            data.append(row)
        
        df = pd.DataFrame(data)
        return self._clean_dataframe(df)
    
    def _process_pdf(self, file_path: str) -> pd.DataFrame:
        """
        Traite les fichiers PDF avec OCR si nécessaire
        Note: Nécessite des librairies supplémentaires (pdfplumber, pytesseract)
        """
        # Placeholder - à implémenter avec pdfplumber ou similar
        raise NotImplementedError("Le traitement PDF sera implémenté prochainement")
    
    def _clean_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """Nettoie et standardise un DataFrame"""
        # Suppression des lignes/colonnes vides
        df = df.dropna(how='all', axis=0)
        df = df.dropna(how='all', axis=1)
        
        # Standardisation des noms de colonnes
        df.columns = [self._standardize_column_name(col) for col in df.columns]
        
        # Conversion des types de données
        for col in df.columns:
            df[col] = self._infer_and_convert_type(df[col])
        
        return df
    
    def _standardize_column_name(self, name: str) -> str:
        """Standardise un nom de colonne"""
        # Conversion en minuscules et remplacement des espaces
        name = str(name).lower().strip()
        name = re.sub(r'[^\w\s]', '', name)
        name = re.sub(r'\s+', '_', name)
        return name
    
    def _infer_and_convert_type(self, series: pd.Series) -> pd.Series:
        """Infère et convertit le type de données d'une série"""
        try:
            # Tentative de conversion en numérique
            return pd.to_numeric(series, errors='coerce')
        except:
            try:
                # Tentative de conversion en date
                return pd.to_datetime(series, errors='coerce')
            except:
                # Garder comme string
                return series.astype(str)
    
    def _detect_sector(self, df: pd.DataFrame) -> str:
        """
        Détecte le secteur basé sur les colonnes et le contenu
        
        Returns:
            'banking', 'insurance' ou 'mixed'
        """
        # Récupération de tous les textes (colonnes + valeurs échantillon)
        text_content = ' '.join(df.columns.tolist())
        sample_values = df.head(100).values.flatten()
        text_content += ' '.join([str(v) for v in sample_values if pd.notna(v)])
        text_content = text_content.lower()
        
        # Comptage des patterns
        banking_score = sum(1 for pattern in self.banking_patterns if pattern in text_content)
        insurance_score = sum(1 for pattern in self.insurance_patterns if pattern in text_content)
        
        # Décision basée sur les scores
        if banking_score > insurance_score * 1.5:
            return 'banking'
        elif insurance_score > banking_score * 1.5:
            return 'insurance'
        else:
            return 'mixed'
    
    def _extract_kpis(self, df: pd.DataFrame, sector: str) -> List[Dict[str, Any]]:
        """Extrait et suggère les KPIs pertinents"""
        suggested_kpis = []
        
        if sector in ['banking', 'mixed']:
            for kpi_name, patterns in self.kpi_mappings['banking'].items():
                for col in df.columns:
                    if any(pattern in col.lower() for pattern in patterns):
                        suggested_kpis.append({
                            'name': kpi_name.replace('_', ' ').title(),
                            'column': col,
                            'sector': 'banking'
                        })
                        break
        
        if sector in ['insurance', 'mixed']:
            for kpi_name, patterns in self.kpi_mappings['insurance'].items():
                for col in df.columns:
                    if any(pattern in col.lower() for pattern in patterns):
                        suggested_kpis.append({
                            'name': kpi_name.replace('_', ' ').title(),
                            'column': col,
                            'sector': 'insurance'
                        })
                        break
        
        return suggested_kpis
    
    def _validate_data_quality(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Valide la qualité des données"""
        total_rows = len(df)
        total_cols = len(df.columns)
        
        # Calcul des métriques de qualité
        missing_values = df.isnull().sum().sum()
        missing_percentage = (missing_values / (total_rows * total_cols)) * 100
        
        # Détection des doublons
        duplicate_rows = df.duplicated().sum()
        
        # Analyse des types de données
        data_types = df.dtypes.value_counts().to_dict()
        
        return {
            'total_rows': total_rows,
            'total_columns': total_cols,
            'missing_values': missing_values,
            'missing_percentage': round(missing_percentage, 2),
            'duplicate_rows': duplicate_rows,
            'data_types': {str(k): v for k, v in data_types.items()},
            'quality_score': round(100 - missing_percentage - (duplicate_rows/total_rows)*10, 2)
        }
    
    def _generate_schema(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Génère le schéma des données"""
        schema = []
        
        for col in df.columns:
            col_info = {
                'name': col,
                'type': str(df[col].dtype),
                'nullable': df[col].isnull().any(),
                'unique_values': df[col].nunique(),
                'sample_values': df[col].dropna().head(5).tolist() if len(df[col].dropna()) > 0 else []
            }
            
            # Statistiques pour les colonnes numériques
            if pd.api.types.is_numeric_dtype(df[col]):
                col_info.update({
                    'min': float(df[col].min()) if not pd.isna(df[col].min()) else None,
                    'max': float(df[col].max()) if not pd.isna(df[col].max()) else None,
                    'mean': float(df[col].mean()) if not pd.isna(df[col].mean()) else None,
                    'std': float(df[col].std()) if not pd.isna(df[col].std()) else None
                })
            
            schema.append(col_info)
        
        return schema