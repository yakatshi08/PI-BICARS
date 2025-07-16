// useAnalyses.ts - Hook pour gérer les analyses
import { useState, useCallback } from 'react';
import { analysisService } from '../services/api';

interface AnalysisResult {
  id: string;
  type: string;
  status: 'pending' | 'completed' | 'error';
  results?: any;
  error?: string;
  createdAt: Date;
}

export const useAnalyses = () => {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [running, setRunning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async (
    type: string,
    datasetId: string,
    config?: any
  ) => {
    setRunning(type);
    setError(null);

    const analysisId = `analysis_${Date.now()}`;
    
    // Ajouter l'analyse en état "pending"
    setAnalyses(prev => [...prev, {
      id: analysisId,
      type,
      status: 'pending',
      createdAt: new Date()
    }]);

    try {
      let result;
      
      switch (type) {
        case 'eda':
          result = await analysisService.runEDA(datasetId, config?.autoDetectPatterns);
          break;
        case 'cohort':
          result = await analysisService.runCohortAnalysis(datasetId, config);
          break;
        case 'ratios':
          result = await analysisService.calculateRatios(datasetId, config?.ratioTypes || ['all']);
          break;
        case 'credit_risk':
          result = await analysisService.runCreditRisk(datasetId, config?.analysisType);
          break;
        case 'stress_test':
          result = await analysisService.runStressTest(datasetId, config);
          break;
        case 'liquidity':
          result = await analysisService.runLiquidityAnalysis(datasetId, config?.analysisDate);
          break;
        case 'market_risk':
          result = await analysisService.runMarketRisk(datasetId, config);
          break;
        default:
          throw new Error(`Type d'analyse non supporté: ${type}`);
      }

      // Mettre à jour avec les résultats
      setAnalyses(prev => prev.map(a => 
        a.id === analysisId 
          ? { ...a, status: 'completed', results: result }
          : a
      ));

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de l\'analyse';
      
      // Mettre à jour avec l'erreur
      setAnalyses(prev => prev.map(a => 
        a.id === analysisId 
          ? { ...a, status: 'error', error: errorMessage }
          : a
      ));
      
      setError(errorMessage);
      throw err;
    } finally {
      setRunning(null);
    }
  }, []);

  const clearAnalyses = useCallback(() => {
    setAnalyses([]);
  }, []);

  return {
    analyses,
    running,
    error,
    runAnalysis,
    clearAnalyses
  };
};

export const useCreditRiskAnalysis = () => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runCreditRisk = async (datasetId: string, analysisType: string = 'full') => {
    setLoading(true);
    setError(null);

    try {
      const result = await analysisService.runCreditRisk(datasetId, analysisType);
      setAnalysis(result);
      return result;
    } catch (err) {
      setError(err.message || 'Erreur analyse credit risk');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { analysis, loading, error, runCreditRisk };
};

export const useStressTest = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const runStressTest = async (
    datasetId: string,
    config: {
      test_type?: string;
      scenarios?: string[];
      horizon_months?: number;
    }
  ) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    // Simuler la progression
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 1000);

    try {
      const result = await analysisService.runStressTest(datasetId, config);
      clearInterval(progressInterval);
      setProgress(100);
      setResults(result);
      return result;
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || 'Erreur stress test');
      throw err;
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return { results, loading, error, progress, runStressTest };
};

export const useBenchmarks = (sector: string) => {
  const [benchmarks, setBenchmarks] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBenchmarks = async (metrics?: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const data = await analysisService.getBenchmarks(sector, metrics);
      setBenchmarks(data);
      return data;
    } catch (err) {
      setError(err.message || 'Erreur chargement benchmarks');
      // Données de démo en cas d'erreur
      const demoData = {
        sector,
        benchmarks: {
          npl_ratio: { p25: 1.5, p50: 2.8, p75: 4.2, p90: 6.5 },
          cet1_ratio: { p25: 12.0, p50: 15.5, p75: 18.0, p90: 22.0 },
          roe: { p25: 8.0, p50: 12.0, p75: 15.0, p90: 18.0 }
        },
        peer_comparison: {
          your_position: 'p50',
          better_than: '50%'
        }
      };
      setBenchmarks(demoData);
      return demoData;
    } finally {
      setLoading(false);
    }
  };

  return { benchmarks, loading, error, fetchBenchmarks };
};