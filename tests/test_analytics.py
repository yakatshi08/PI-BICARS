# tests/test_analytics.py
"""
Tests unitaires pour les modules Analytics et Data Engineering
"""

import unittest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, MagicMock
import tempfile
import os

# Import des modules à tester
from app.analytics.intelligent_eda import IntelligentEDA, PatternDetection
from app.analytics.cohort_analysis import (
    CohortAnalysis, CohortConfig, CohortType, MetricType, CohortAnalyzer
)
from app.analytics.benchmarking import BenchmarkingEngine, BenchmarkMetric, PerformanceLevel
from app.data_engineering.data_pipeline import (
    PipelineBuilder, DataSource, DataFormat, PipelineStatus, DataPipeline
)
from app.data_engineering.data_lineage import (
    LineageManager, DataEntity, DataClassification, DataTransformation, DataOperation
)
from app.data_engineering.gdpr_anonymization import (
    AnonymizationEngine, AnonymizationProfile, AnonymizationRule,
    AnonymizationTechnique, PIICategory, DataSensitivity, anonymize_dataframe
)

class TestIntelligentEDA(unittest.TestCase):
    """Tests pour le module EDA Intelligent"""
    
    def setUp(self):
        """Préparation des données de test"""
        np.random.seed(42)
        self.df = pd.DataFrame({
            'numeric_col': np.random.randn(100),
            'category_col': np.random.choice(['A', 'B', 'C'], 100),
            'constant_col': [1] * 100,
            'high_cardinality': range(100),
            'correlated_col': np.random.randn(100)
        })
        # Créer une corrélation parfaite
        self.df['perfect_corr'] = self.df['numeric_col'] * 2 + 1
        
        self.eda = IntelligentEDA()
        
    def test_basic_stats(self):
        """Test des statistiques de base"""
        results = self.eda.analyze(self.df)
        
        self.assertIn('basic_stats', results)
        stats = results['basic_stats']
        
        self.assertEqual(stats['shape'], (100, 6))
        self.assertIn('numerical_columns', stats)
        self.assertIn('categorical_columns', stats)
        self.assertEqual(len(stats['numerical_columns']), 4)
        self.assertEqual(len(stats['categorical_columns']), 1)
        
    def test_pattern_detection(self):
        """Test de la détection de patterns"""
        results = self.eda.analyze(self.df)
        
        self.assertIn('patterns', results)
        patterns = results['patterns']
        
        # Vérifier la détection de colonnes constantes
        constant_patterns = [p for p in patterns if p.pattern_type == 'constant_column']
        self.assertEqual(len(constant_patterns), 1)
        self.assertEqual(constant_patterns[0].affected_columns[0], 'constant_col')
        
        # Vérifier la détection de corrélations parfaites
        corr_patterns = [p for p in patterns if p.pattern_type == 'perfect_correlation']
        self.assertTrue(len(corr_patterns) > 0)
        
    def test_data_quality_assessment(self):
        """Test de l'évaluation de la qualité des données"""
        # Ajouter des valeurs manquantes
        self.df.loc[0:10, 'numeric_col'] = np.nan
        
        results = self.eda.analyze(self.df)
        quality = results['data_quality']
        
        self.assertIn('missing_values', quality)
        self.assertIn('numeric_col', quality['missing_values'])
        self.assertEqual(quality['missing_values']['numeric_col']['count'], 11)
        
        # Le score de qualité devrait être réduit
        self.assertLess(quality['overall_score'], 100)
        
    def test_insights_generation(self):
        """Test de la génération d'insights"""
        results = self.eda.analyze(self.df, target_column='category_col')
        
        self.assertIn('insights', results)
        insights = results['insights']
        
        self.assertTrue(len(insights) > 0)
        # Vérifier la structure des insights
        for insight in insights:
            self.assertIn('type', insight)
            self.assertIn('priority', insight)
            self.assertIn('message', insight)

class TestCohortAnalysis(unittest.TestCase):
    """Tests pour l'analyse de cohortes"""
    
    def setUp(self):
        """Préparation des données de test"""
        # Créer des données de transactions simulées
        dates = pd.date_range('2024-01-01', periods=365, freq='D')
        users = [f'user_{i}' for i in range(100)]
        
        data = []
        for user in users[:50]:  # 50 utilisateurs actifs
            # Première apparition
            first_date = np.random.choice(dates[:90])
            data.append({
                'user_id': user,
                'date': first_date,
                'revenue': np.random.uniform(10, 100)
            })
            
            # Activité récurrente avec décroissance
            for i in range(1, np.random.randint(5, 20)):
                if np.random.random() > 0.1 * i:  # Probabilité décroissante
                    data.append({
                        'user_id': user,
                        'date': first_date + timedelta(days=i*7),
                        'revenue': np.random.uniform(10, 100)
                    })
                    
        self.df = pd.DataFrame(data)
        
    def test_retention_analysis(self):
        """Test de l'analyse de rétention"""
        results = CohortAnalysis.retention_analysis(
            self.df,
            user_col='user_id',
            date_col='date',
            time_period='weekly'
        )
        
        self.assertIn('metrics', results)
        self.assertIn('retention', results['metrics'])
        
        retention = results['metrics']['retention']
        self.assertIn('retention_matrix', retention)
        self.assertIn('average_retention_curve', retention)
        
        # Vérifier que la rétention décroît
        avg_curve = retention['average_retention_curve']
        if len(avg_curve) > 1:
            values = list(avg_curve.values())
            self.assertGreaterEqual(values[0], values[-1])
            
    def test_revenue_cohort_analysis(self):
        """Test de l'analyse de cohortes avec métriques de revenu"""
        results = CohortAnalysis.revenue_cohort_analysis(
            self.df,
            user_col='user_id',
            date_col='date',
            revenue_col='revenue',
            time_period='monthly'
        )
        
        self.assertIn('metrics', results)
        self.assertIn('revenue', results['metrics'])
        
        revenue = results['metrics']['revenue']
        self.assertIn('revenue_matrix', revenue)
        self.assertIn('arpu_matrix', revenue)
        self.assertIn('cumulative_revenue', revenue)
        
    def test_cohort_quality_assessment(self):
        """Test de l'évaluation de la qualité des cohortes"""
        config = CohortConfig(
            cohort_type=CohortType.TIME_BASED,
            time_period='monthly',
            metrics=[MetricType.RETENTION, MetricType.REVENUE]
        )
        
        analyzer = CohortAnalyzer(config)
        results = analyzer.analyze(self.df, 'user_id', 'date', value_col='revenue')
        
        self.assertIn('advanced_analysis', results)
        self.assertIn('cohort_quality', results['advanced_analysis'])
        
        quality = results['advanced_analysis']['cohort_quality']
        self.assertIn('overall_score', quality)
        self.assertGreaterEqual(quality['overall_score'], 0)
        self.assertLessEqual(quality['overall_score'], 100)

class TestBenchmarking(unittest.TestCase):
    """Tests pour le module de benchmarking"""
    
    def setUp(self):
        """Préparation des données de test"""
        self.metrics_df = pd.DataFrame({
            'roi': [12, 13, 14, 15, 14],
            'cost_income_ratio': [55, 52, 50, 48, 51],
            'npl_ratio': [2.5, 2.3, 2.1, 2.0, 2.2],
            'date': pd.date_range('2024-01-01', periods=5, freq='M')
        })
        
        self.engine = BenchmarkingEngine('banque', 'medium')
        
    def test_benchmark_metric(self):
        """Test du benchmarking d'une métrique"""
        metric_definitions = {
            'roi': 'higher_is_better',
            'cost_income_ratio': 'lower_is_better',
            'npl_ratio': 'lower_is_better'
        }
        
        results = self.engine.analyze(self.metrics_df, metric_definitions)
        
        self.assertIn('metric_benchmarks', results)
        self.assertIn('roi', results['metric_benchmarks'])
        
        roi_benchmark = results['metric_benchmarks']['roi']
        self.assertIsInstance(roi_benchmark, BenchmarkMetric)
        self.assertIn(roi_benchmark.performance_level, PerformanceLevel)
        
    def test_performance_score_calculation(self):
        """Test du calcul du score de performance"""
        metric_definitions = {'roi': 'higher_is_better'}
        results = self.engine.analyze(self.metrics_df, metric_definitions)
        
        self.assertIn('performance_score', results)
        score = results['performance_score']
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 100)
        
    def test_gap_analysis(self):
        """Test de l'analyse des écarts"""
        metric_definitions = {
            'roi': 'higher_is_better',
            'npl_ratio': 'lower_is_better'
        }
        results = self.engine.analyze(self.metrics_df, metric_definitions)
        
        self.assertIn('gaps', results)
        gaps = results['gaps']
        
        self.assertIn('summary', gaps)
        self.assertIn('by_metric', gaps)
        self.assertIn('total_metrics_analyzed', gaps['summary'])
        
    def test_action_plan_generation(self):
        """Test de la génération du plan d'action"""
        metric_definitions = {'roi': 'higher_is_better'}
        results = self.engine.analyze(self.metrics_df, metric_definitions)
        
        self.assertIn('action_plan', results)
        action_plan = results['action_plan']
        
        self.assertTrue(isinstance(action_plan, list))
        if action_plan:
            self.assertIn('phase', action_plan[0])
            self.assertIn('priority', action_plan[0])
            self.assertIn('actions', action_plan[0])

class TestDataPipeline(unittest.TestCase):
    """Tests pour le pipeline de données"""
    
    def setUp(self):
        """Préparation de l'environnement de test"""
        self.test_data = pd.DataFrame({
            'id': range(100),
            'value': np.random.randn(100),
            'category': np.random.choice(['A', 'B', 'C'], 100)
        })
        
        # Créer un fichier CSV temporaire
        self.temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False)
        self.test_data.to_csv(self.temp_file.name, index=False)
        
    def tearDown(self):
        """Nettoyage après les tests"""
        os.unlink(self.temp_file.name)
        
    def test_pipeline_builder(self):
        """Test du builder de pipeline"""
        source = DataSource(
            name='test_source',
            format=DataFormat.CSV,
            location=self.temp_file.name
        )
        
        builder = PipelineBuilder('test_pipeline', 'banque')
        pipeline = (
            builder
            .with_source(source)
            .with_parallel_processing(2)
            .with_monitoring()
            .build()
        )
        
        self.assertIsInstance(pipeline, DataPipeline)
        self.assertEqual(pipeline.config.name, 'test_pipeline')
        self.assertTrue(pipeline.config.parallel_processing)
        self.assertTrue(pipeline.config.monitoring_enabled)
        
    @patch('app.data_engineering.data_pipeline.DataPipeline._extract_from_source')
    async def test_pipeline_execution(self, mock_extract):
        """Test de l'exécution du pipeline"""
        mock_extract.return_value = self.test_data
        
        source = DataSource(
            name='test_source',
            format=DataFormat.CSV,
            location='mock_location'
        )
        
        builder = PipelineBuilder('test_pipeline', 'banque')
        pipeline = builder.with_source(source).build()
        
        # Ajouter une destination mock
        pipeline.add_sink({
            'name': 'test_sink',
            'type': 'database'
        })
        
        # Exécuter le pipeline
        metrics = await pipeline.run()
        
        self.assertEqual(pipeline.status, PipelineStatus.COMPLETED)
        self.assertIsNotNone(metrics.end_time)
        self.assertEqual(metrics.records_processed, 100)

class TestDataLineage(unittest.TestCase):
    """Tests pour le data lineage"""
    
    def setUp(self):
        """Préparation de l'environnement de test"""
        self.manager = LineageManager(':memory:')  # Base SQLite en mémoire
        
    def test_entity_tracking(self):
        """Test du suivi des entités"""
        entity = DataEntity(
            name='test_dataset',
            type='dataframe',
            classification=DataClassification.INTERNAL,
            row_count=1000,
            created_by='test_user'
        )
        
        entity_id = self.manager.track_entity(entity)
        
        self.assertIsNotNone(entity_id)
        self.assertIn(entity_id, self.manager.graph.entities)
        
    def test_transformation_tracking(self):
        """Test du suivi des transformations"""
        # Créer des entités source et cible
        source_entity = DataEntity(name='source_data')
        target_entity = DataEntity(name='target_data')
        
        source_id = self.manager.track_entity(source_entity)
        target_id = self.manager.track_entity(target_entity)
        
        # Créer une transformation
        transformation = DataTransformation(
            name='test_transform',
            operation=DataOperation.TRANSFORM,
            input_entities=[source_id],
            output_entities=[target_id],
            executed_by='test_user'
        )
        
        trans_id = self.manager.track_transformation(transformation)
        
        self.assertIsNotNone(trans_id)
        self.assertIn(trans_id, self.manager.graph.transformations)
        
    def test_lineage_retrieval(self):
        """Test de la récupération du lignage"""
        # Créer une chaîne de transformations
        entity1 = DataEntity(name='entity1')
        entity2 = DataEntity(name='entity2')
        entity3 = DataEntity(name='entity3')
        
        id1 = self.manager.track_entity(entity1)
        id2 = self.manager.track_entity(entity2)
        id3 = self.manager.track_entity(entity3)
        
        # Transformation 1->2
        trans1 = DataTransformation(
            name='trans1',
            operation=DataOperation.TRANSFORM,
            input_entities=[id1],
            output_entities=[id2]
        )
        self.manager.track_transformation(trans1)
        
        # Transformation 2->3
        trans2 = DataTransformation(
            name='trans2',
            operation=DataOperation.TRANSFORM,
            input_entities=[id2],
            output_entities=[id3]
        )
        self.manager.track_transformation(trans2)
        
        # Récupérer le lignage
        lineage = self.manager.graph.get_lineage(id2, direction='both')
        
        self.assertIsNotNone(lineage['entity'])
        self.assertTrue(len(lineage['upstream']) > 0)
        self.assertTrue(len(lineage['downstream']) > 0)
        
    def test_impact_analysis(self):
        """Test de l'analyse d'impact"""
        # Configuration similaire au test précédent
        entity1 = DataEntity(name='source_entity')
        id1 = self.manager.track_entity(entity1)
        
        # Analyse d'impact
        impact = self.manager.graph.get_impact_analysis(id1)
        
        self.assertIn('direct_impact', impact)
        self.assertIn('indirect_impact', impact)
        self.assertIn('affected_systems', impact)

class TestGDPRAnonymization(unittest.TestCase):
    """Tests pour l'anonymisation GDPR"""
    
    def setUp(self):
        """Préparation des données de test"""
        self.df = pd.DataFrame({
            'customer_name': ['John Doe', 'Jane Smith', 'Bob Johnson'],
            'email': ['john@example.com', 'jane@test.com', 'bob@demo.org'],
            'phone': ['0123456789', '0987654321', '0555555555'],
            'account_number': ['ACC001', 'ACC002', 'ACC003'],
            'balance': [1000.50, 2500.75, 500.25],
            'birth_date': pd.to_datetime(['1990-01-01', '1985-05-15', '1995-12-25'])
        })
        
    def test_auto_detection(self):
        """Test de la détection automatique des PII"""
        df_anon, result = anonymize_dataframe(self.df, 'banque', auto_detect=True)
        
        self.assertIn('customer_name', result.fields_anonymized)
        self.assertIn('email', result.fields_anonymized)
        self.assertIn('phone', result.fields_anonymized)
        
    def test_masking_technique(self):
        """Test de la technique de masquage"""
        rule = AnonymizationRule(
            field_name='email',
            pii_category=PIICategory.EMAIL,
            sensitivity=DataSensitivity.SENSITIVE,
            technique=AnonymizationTechnique.MASKING,
            preserve_format=True
        )
        
        profile = AnonymizationProfile(
            sector='test',
            rules=[rule],
            default_technique=AnonymizationTechnique.MASKING
        )
        
        engine = AnonymizationEngine(profile)
        df_anon, result = engine.anonymize(self.df, auto_detect=False)
        
        # Vérifier que les emails sont masqués mais gardent le format
        for email in df_anon['email']:
            self.assertIn('@', email)
            self.assertIn('*', email)
            
    def test_pseudonymization(self):
        """Test de la pseudonymisation"""
        rule = AnonymizationRule(
            field_name='customer_name',
            pii_category=PIICategory.NAME,
            sensitivity=DataSensitivity.SENSITIVE,
            technique=AnonymizationTechnique.PSEUDONYMIZATION,
            parameters={'method': 'mapping'},
            reversible=True
        )
        
        profile = AnonymizationProfile(
            sector='test',
            rules=[rule],
            default_technique=AnonymizationTechnique.PSEUDONYMIZATION
        )
        
        engine = AnonymizationEngine(profile)
        df_anon, result = engine.anonymize(self.df, auto_detect=False)
        
        # Vérifier que les noms sont pseudonymisés
        self.assertNotEqual(df_anon['customer_name'].tolist(), self.df['customer_name'].tolist())
        
        # Vérifier la réversibilité
        self.assertIn('customer_name', result.reversible_fields)
        df_reversed = engine.reverse_anonymization(df_anon, ['customer_name'])
        self.assertEqual(df_reversed['customer_name'].tolist(), self.df['customer_name'].tolist())
        
    def test_k_anonymity(self):
        """Test de k-anonymité"""
        # Créer un dataset avec des quasi-identifiants
        df_large = pd.DataFrame({
            'age_group': ['20-30', '30-40', '20-30', '30-40', '20-30'] * 20,
            'gender': ['M', 'F', 'M', 'F', 'M'] * 20,
            'postal_code': ['75001', '75002', '75001', '75002', '75001'] * 20,
            'salary': np.random.randint(30000, 80000, 100)
        })
        
        profile = AnonymizationProfile(
            sector='test',
            rules=[],
            default_technique=AnonymizationTechnique.GENERALIZATION,
            k_anonymity_threshold=5
        )
        
        engine = AnonymizationEngine(profile)
        df_anon, result = engine.anonymize(df_large, auto_detect=False)
        
        self.assertIsNotNone(result.k_anonymity_achieved)
        self.assertGreaterEqual(result.k_anonymity_achieved, 5)
        
    def test_data_quality_preservation(self):
        """Test de la préservation de la qualité des données"""
        # Tester la perturbation avec préservation statistique
        rule = AnonymizationRule(
            field_name='balance',
            pii_category=PIICategory.FINANCIAL,
            sensitivity=DataSensitivity.CONFIDENTIAL,
            technique=AnonymizationTechnique.PERTURBATION,
            parameters={'noise_type': 'gaussian', 'noise_level': 0.1}
        )
        
        profile = AnonymizationProfile(
            sector='test',
            rules=[rule],
            default_technique=AnonymizationTechnique.MASKING,
            retain_statistical_properties=True
        )
        
        engine = AnonymizationEngine(profile)
        df_anon, result = engine.anonymize(self.df, auto_detect=False)
        
        # Vérifier que les propriétés statistiques sont préservées
        orig_mean = self.df['balance'].mean()
        anon_mean = df_anon['balance'].mean()
        
        # La moyenne devrait être proche (tolérance 10%)
        self.assertAlmostEqual(orig_mean, anon_mean, delta=orig_mean * 0.1)
        
        # Vérifier le score de perte de données
        self.assertLess(result.data_loss_percentage, 20)

class TestIntegration(unittest.TestCase):
    """Tests d'intégration entre modules"""
    
    def test_pipeline_with_lineage(self):
        """Test d'intégration pipeline + lineage"""
        # Créer un manager de lineage
        lineage_manager = LineageManager(':memory:')
        
        # Créer des données
        df = pd.DataFrame({
            'id': range(10),
            'value': np.random.randn(10)
        })
        
        # Tracker l'entité source
        source_entity = DataEntity(
            name='source_data',
            type='dataframe',
            row_count=len(df)
        )
        source_id = lineage_manager.track_entity(source_entity)
        
        # Simuler une transformation
        df_transformed = df.copy()
        df_transformed['value'] = df_transformed['value'] * 2
        
        # Tracker le résultat
        result_entity = lineage_manager.track_dataframe_operation(
            df_transformed,
            'multiply_by_2',
            DataOperation.TRANSFORM,
            [source_id],
            'test_user'
        )
        
        # Vérifier le lineage
        self.assertIsNotNone(result_entity.checksum)
        self.assertEqual(result_entity.row_count, 10)
        
    def test_eda_with_anonymization(self):
        """Test EDA sur données anonymisées"""
        # Créer des données avec PII
        df = pd.DataFrame({
            'customer_name': ['Alice', 'Bob', 'Charlie'] * 10,
            'revenue': np.random.uniform(100, 1000, 30),
            'age': np.random.randint(20, 60, 30)
        })
        
        # Anonymiser
        df_anon, _ = anonymize_dataframe(df, 'retail', auto_detect=True)
        
        # Lancer EDA
        eda = IntelligentEDA()
        results = eda.analyze(df_anon)
        
        # Vérifier que l'analyse fonctionne sur données anonymisées
        self.assertIn('basic_stats', results)
        self.assertIn('patterns', results)
        self.assertEqual(results['basic_stats']['shape'][0], 30)

if __name__ == '__main__':
    unittest.main()