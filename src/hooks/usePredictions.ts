// usePredictions.ts - Hook pour gérer les prédictions
import { useState, useEffect, useCallback } from 'react';
import { predictionService } from '../services/api';

interface Model {
  id: string;
  name: string;
  type: string;
  status: string;
  metrics: {
    accuracy?: number;
    mse?: number;
    r2?: number;
  };
  created_at: string;
  last_used?: string;
}

interface TrainingJob {
  job_id: string;
  status: 'pending' | 'training' | 'completed' | 'failed';
  progress: number;
  current_model?: string;
  best_score?: number;
  estimated_remaining_time?: number;
}

export const useModels = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    try {
      setError(null);
      const data = await predictionService.listModels();
      setModels(data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des modèles');
      // Données de démo en cas d'erreur
      setModels([
        {
          id: 'model-1',
          name: 'Prédiction Défaut XGBoost',
          type: 'xgboost',
          status: 'production',
          metrics: { accuracy: 96.8 },
          created_at: '2024-01-15',
          last_used: '2024-01-20'
        },
        {
          id: 'model-2',
          name: 'Forecast Liquidité Prophet',
          type: 'prophet',
          status: 'staging',
          metrics: { mse: 0.045, r2: 0.92 },
          created_at: '2024-01-10'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return { models, loading, error, refresh: fetchModels };
};

export const useModelTraining = () => {
  const [trainingJobs, setTrainingJobs] = useState<Map<string, TrainingJob>>(new Map());
  const [training, setTraining] = useState(false);

  const trainModel = async (config: {
    dataset_id: string;
    target_column: string;
    model_type: string;
    task_type: string;
    optimization_metric?: string;
  }) => {
    setTraining(true);
    
    try {
      const result = await predictionService.trainModel(config);
      const jobId = result.job_id;
      
      // Ajouter le job à la liste
      setTrainingJobs(prev => {
        const newJobs = new Map(prev);
        newJobs.set(jobId, {
          job_id: jobId,
          status: 'training',
          progress: 0
        });
        return newJobs;
      });

      // Démarrer le polling pour le statut
      pollTrainingStatus(jobId);
      
      return result;
    } catch (err) {
      throw err;
    } finally {
      setTraining(false);
    }
  };

  const pollTrainingStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await predictionService.getTrainingStatus(jobId);
        
        setTrainingJobs(prev => {
          const newJobs = new Map(prev);
          newJobs.set(jobId, {
            job_id: jobId,
            status: status.status,
            progress: status.progress,
            current_model: status.current_model,
            best_score: status.best_score,
            estimated_remaining_time: status.eta
          });
          return newJobs;
        });

        // Arrêter le polling si terminé
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Erreur polling status:', err);
        clearInterval(interval);
      }
    }, 2000); // Toutes les 2 secondes
  };

  return { trainModel, trainingJobs, training };
};

export const useNLPDashboard = () => {
  const [generating, setGenerating] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateDashboard = async (query: string, datasetId?: string) => {
    setGenerating(true);
    setError(null);
    
    try {
      const result = await predictionService.generateDashboardNLP(query, datasetId);
      setDashboardConfig(result);
      return result;
    } catch (err) {
      setError(err.message || 'Erreur génération dashboard');
      throw err;
    } finally {
      setGenerating(false);
    }
  };

  return { generateDashboard, generating, dashboardConfig, error };
};

export const useAnomalyDetection = () => {
  const [detecting, setDetecting] = useState(false);
  const [anomalies, setAnomalies] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const detectAnomalies = async (datasetId: string, config?: {
    detection_methods?: string[];
    sensitivity?: number;
  }) => {
    setDetecting(true);
    setError(null);
    
    try {
      const result = await predictionService.detectAnomalies(datasetId, config || {});
      setAnomalies(result);
      return result;
    } catch (err) {
      setError(err.message || 'Erreur détection anomalies');
      throw err;
    } finally {
      setDetecting(false);
    }
  };

  return { detectAnomalies, detecting, anomalies, error };
};

export const useAlertConfiguration = () => {
  const [configuring, setConfiguring] = useState(false);
  const [alertConfig, setAlertConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const configureAlerts = async (config: any) => {
    setConfiguring(true);
    setError(null);
    
    try {
      const result = await predictionService.configureAlerts(config);
      setAlertConfig(result);
      return result;
    } catch (err) {
      setError(err.message || 'Erreur configuration alertes');
      throw err;
    } finally {
      setConfiguring(false);
    }
  };

  return { configureAlerts, configuring, alertConfig, error };
};