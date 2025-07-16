import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Zap, Shield, BarChart3, Activity, MessageSquare, Search, Play, Settings, AlertCircle, Loader, RefreshCw, Send, X, FileText, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend, ScatterChart, Scatter } from 'recharts';
import { useModels, useModelTraining, useNLPDashboard, useAnomalyDetection, useAlertConfiguration } from '../hooks/usePredictions';
import { useDatasets } from '../hooks/useDatasets';

interface PredictionsProps {
  isDarkMode: boolean;
}

const Predictions: React.FC<PredictionsProps> = ({ isDarkMode }) => {
  const { models, loading: modelsLoading, refresh: refreshModels } = useModels();
  const { trainModel, trainingJobs, training } = useModelTraining();
  const { generateDashboard, generating, dashboardConfig } = useNLPDashboard();
  const { detectAnomalies, detecting, anomalies } = useAnomalyDetection();
  const { configureAlerts, configuring, alertConfig } = useAlertConfiguration();
  const { datasets } = useDatasets(false);

  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [nlpQuery, setNlpQuery] = useState('');
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [trainingConfig, setTrainingConfig] = useState({
    target_column: '',
    model_type: 'auto',
    task_type: 'classification',
    optimization_metric: 'accuracy'
  });

  // Modèles existants (pour compatibilité)
  const predictionModels = [
    {
      name: "Prédiction de Churn",
      accuracy: "94.5%",
      type: "Classification",
      lastTrained: "Il y a 2 jours",
      status: "Actif",
      icon: Brain,
    },
    {
      name: "Prévision des Ventes",
      accuracy: "91.2%",
      type: "Régression",
      lastTrained: "Il y a 5 jours",
      status: "Actif",
      icon: TrendingUp,
    },
    {
      name: "Détection d'Anomalies",
      accuracy: "97.8%",
      type: "Clustering",
      lastTrained: "Il y a 1 jour",
      status: "En cours",
      icon: AlertTriangle,
    },
    {
      name: "Segmentation Clients",
      accuracy: "89.3%",
      type: "Clustering",
      lastTrained: "Il y a 1 semaine",
      status: "Inactif",
      icon: CheckCircle,
    },
  ];

  // Données pour les graphiques
  const predictionData = [
    { date: '01/01', actual: 4000, predicted: 4100, confidence_upper: 4300, confidence_lower: 3900 },
    { date: '02/01', actual: 3800, predicted: 3900, confidence_upper: 4100, confidence_lower: 3700 },
    { date: '03/01', actual: 4200, predicted: 4150, confidence_upper: 4350, confidence_lower: 3950 },
    { date: '04/01', actual: 4500, predicted: 4400, confidence_upper: 4600, confidence_lower: 4200 },
    { date: '05/01', actual: 4300, predicted: 4350, confidence_upper: 4550, confidence_lower: 4150 },
    { date: '06/01', actual: 4600, predicted: 4650, confidence_upper: 4850, confidence_lower: 4450 },
  ];

  const insightData = [
    { metric: "Précision globale", value: 92.5, target: 90 },
    { metric: "Rappel", value: 88.2, target: 85 },
    { metric: "F1-Score", value: 90.3, target: 87 },
  ];

  // Exemples de requêtes NLP
  const nlpExamples = [
    "Montre-moi l'évolution du NPL ratio sur les 6 derniers mois",
    "Compare le ROE de notre banque avec la moyenne du secteur",
    "Quelle est la tendance des provisions pour créances douteuses ?",
    "Analyse la corrélation entre LCR et stress test results"
  ];

  // Gestionnaire pour entraîner un modèle
  const handleTrainModel = async () => {
    if (!selectedDataset || !trainingConfig.target_column) {
      alert('Veuillez sélectionner un dataset et une colonne cible');
      return;
    }

    try {
      await trainModel({
        dataset_id: selectedDataset,
        ...trainingConfig
      });
      setShowTrainingModal(false);
      refreshModels();
    } catch (err) {
      console.error('Erreur entraînement:', err);
    }
  };

  // Gestionnaire pour générer un dashboard via NLP
  const handleNLPGenerate = async () => {
    if (!nlpQuery.trim()) return;

    try {
      await generateDashboard(nlpQuery, selectedDataset);
    } catch (err) {
      console.error('Erreur génération NLP:', err);
    }
  };

  // Gestionnaire pour détecter les anomalies
  const handleAnomalyDetection = async () => {
    if (!selectedDataset) {
      alert('Veuillez sélectionner un dataset');
      return;
    }

    try {
      await detectAnomalies(selectedDataset, {
        detection_methods: ['isolation_forest', 'lstm_autoencoder'],
        sensitivity: 0.95
      });
    } catch (err) {
      console.error('Erreur détection anomalies:', err);
    }
  };

  // Configurer les alertes
  const handleConfigureAlerts = async (alertTypes: string[]) => {
    if (!selectedDataset) {
      alert('Veuillez sélectionner un dataset');
      return;
    }

    try {
      await configureAlerts({
        dataset_id: selectedDataset,
        alert_types: alertTypes,
        thresholds: {
          npl_ratio: 3.0,
          cet1_ratio: 10.5,
          lcr: 100
        },
        channels: ['email', 'dashboard']
      });
      setShowAlertsModal(false);
    } catch (err) {
      console.error('Erreur configuration alertes:', err);
    }
  };

  // Afficher les anomalies détectées
  const renderAnomalies = () => {
    if (!anomalies) return null;

    const anomalyData = anomalies.anomalies_detected || [];
    
    return (
      <div className="space-y-4">
        <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Anomalies Détectées
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total analysé</p>
            <p className={`text-2xl font-bold text-blue-500`}>{anomalies.total_records_analyzed}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Anomalies</p>
            <p className={`text-2xl font-bold text-red-500`}>{anomalyData.length}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Niveau de risque</p>
            <p className={`text-2xl font-bold ${
              anomalies.risk_level === 'high' ? 'text-red-500' : 
              anomalies.risk_level === 'medium' ? 'text-orange-500' : 
              'text-green-500'
            }`}>{anomalies.risk_level?.toUpperCase()}</p>
          </div>
        </div>

        {anomalyData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="index" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis dataKey="score" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                }}
              />
              <Scatter name="Anomaly Score" data={anomalyData} fill="#EF4444" />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Prédictions & IA
          </h2>
          <div className="flex items-center gap-4">
            <select
              value={selectedDataset || ''}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-white text-gray-800'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Sélectionner un dataset</option>
              {datasets.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.name}
                </option>
              ))}
            </select>
            
            <button
              onClick={refreshModels}
              className={`p-2 rounded-lg transition-all ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modèles existants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {predictionModels.map((model, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <model.icon className="w-12 h-12 text-blue-500" />
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                model.status === 'Actif' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : model.status === 'En cours'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}>
                {model.status}
              </span>
            </div>
            <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {model.name}
            </h3>
            <div className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>Précision: <span className="font-semibold text-green-500">{model.accuracy}</span></p>
              <p>Type: {model.type}</p>
              <p>Entraîné: {model.lastTrained}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Graphique de prédiction existant */}
      <div className={`p-6 rounded-xl shadow-lg mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Prédictions vs Réalité
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={predictionData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
            <XAxis dataKey="date" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area type="monotone" dataKey="confidence_upper" stackId="1" stroke="#E5E7EB" fill="#E5E7EB" />
            <Area type="monotone" dataKey="confidence_lower" stackId="2" stroke="#E5E7EB" fill="#FFFFFF" />
            <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
            <Line type="monotone" dataKey="predicted" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#10B981' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Insights existants */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {insightData.map((insight, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {insight.metric}
            </h4>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className={`text-xs font-semibold inline-block uppercase ${
                    insight.value >= insight.target ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {insight.value}%
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold inline-block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Cible: {insight.target}%
                  </span>
                </div>
              </div>
              <div className={`overflow-hidden h-2 mb-4 text-xs flex rounded ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div 
                  style={{ width: `${insight.value}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    insight.value >= insight.target ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Séparateur */}
      <div className="flex items-center gap-4 my-8">
        <div className={`flex-1 h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
        <div className="flex items-center gap-2">
          <Brain className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            PRÉDICTIONS FINTECH AVANCÉES
          </span>
        </div>
        <div className={`flex-1 h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
      </div>

      {/* Interface NLP */}
      <div className={`p-6 rounded-xl shadow-lg mb-8 border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          <MessageSquare className="w-5 h-5 text-blue-500" />
          Génération de Dashboard en Langage Naturel
        </h3>
        
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={nlpQuery}
              onChange={(e) => setNlpQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNLPGenerate()}
              placeholder="Ex: Montre-moi l'évolution du NPL ratio sur les 6 derniers mois"
              className={`w-full px-4 py-3 pr-12 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 text-white placeholder-gray-400' 
                  : 'bg-gray-50 text-gray-800 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <button
              onClick={handleNLPGenerate}
              disabled={generating || !nlpQuery.trim()}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg ${
                generating || !nlpQuery.trim()
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              } transition-colors`}
            >
              {generating ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Exemples :
          </span>
          {nlpExamples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => setNlpQuery(example)}
              className={`text-sm px-3 py-1 rounded-full ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } transition-colors`}
            >
              {example}
            </button>
          ))}
        </div>

        {dashboardConfig && (
          <div className={`mt-4 p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Dashboard généré avec succès !
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {dashboardConfig.natural_language_summary}
            </p>
          </div>
        )}
      </div>

      {/* Modèles ML financiers */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Modèles ML Financiers
          </h3>
          <button
            onClick={() => setShowTrainingModal(true)}
            disabled={!selectedDataset}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              !selectedDataset
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } transition-colors`}
          >
            <Play className="w-4 h-4" />
            Entraîner un modèle
          </button>
        </div>

        {modelsLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Modèles depuis le backend */}
            {models.map((model) => (
              <div
                key={model.id}
                className={`p-6 rounded-xl shadow-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {model.name}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Type: {model.type} | Status: {model.status}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    model.status === 'production' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : model.status === 'staging'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {model.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {model.metrics.accuracy && (
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Accuracy
                      </span>
                      <span className="text-sm font-semibold text-green-500">
                        {(model.metrics.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {model.metrics.mse && (
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        MSE
                      </span>
                      <span className="text-sm font-semibold text-blue-500">
                        {model.metrics.mse.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  } transition-colors`}>
                    Prédire
                  </button>
                  <button className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  } transition-colors`}>
                    Retrainer
                  </button>
                </div>
              </div>
            ))}

            {/* Modèles prédéfinis */}
            <div className={`p-6 rounded-xl shadow-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Détection Fraude
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Isolation Forest + GNN
                  </p>
                </div>
                <Shield className="w-8 h-8 text-purple-500" />
              </div>

              <button
                onClick={handleAnomalyDetection}
                disabled={!selectedDataset || detecting}
                className={`w-full py-2 rounded-lg text-sm font-medium ${
                  !selectedDataset || detecting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                } transition-colors flex items-center justify-center gap-2`}
              >
                {detecting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Détection en cours...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Lancer la détection
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Jobs d'entraînement en cours */}
      {trainingJobs.size > 0 && (
        <div className="mb-8">
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Entraînements en cours
          </h3>
          <div className="space-y-3">
            {Array.from(trainingJobs.values()).map((job) => (
              <div
                key={job.job_id}
                className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {job.current_model || 'Initialisation...'}
                  </span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {job.progress}%
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${
                  isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}>
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                {job.best_score && (
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Meilleur score: {job.best_score.toFixed(4)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Résultats de détection d'anomalies */}
      {anomalies && renderAnomalies()}

      {/* Système d'alertes */}
      <div className={`p-6 rounded-xl shadow-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Alertes Prédictives
          </h3>
          <button
            onClick={() => setShowAlertsModal(true)}
            disabled={!selectedDataset}
            className={`px-4 py-2 rounded-lg text-sm ${
              !selectedDataset
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            } transition-colors flex items-center gap-2`}
          >
            <Settings className="w-4 h-4" />
            Configurer
          </button>
        </div>

        {alertConfig ? (
          <div className="space-y-3">
            <div className={`p-3 rounded-lg flex items-start gap-3 ${
              isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
            }`}>
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className={`font-medium ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                  NPL Ratio dépasse le seuil critique
                </p>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-red-400/80' : 'text-red-600'}`}>
                  Valeur actuelle: 3.2% | Seuil: 3.0%
                </p>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Recommandation: Renforcer les critères d'octroi de crédit
                </p>
              </div>
              <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full">
                Critique
              </span>
            </div>

            <div className={`p-3 rounded-lg flex items-start gap-3 ${
              isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'
            }`}>
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <p className={`font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  LCR en baisse tendancielle
                </p>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-yellow-400/80' : 'text-yellow-600'}`}>
                  Prévision 30j: 115% | Minimum requis: 100%
                </p>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Recommandation: Augmenter les actifs liquides
                </p>
              </div>
              <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                Warning
              </span>
            </div>
          </div>
        ) : (
          <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Aucune alerte configurée. Sélectionnez un dataset et configurez les alertes.
          </p>
        )}
      </div>

      {/* Modal d'entraînement */}
      {showTrainingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md w-full mx-4`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Entraîner un nouveau modèle
              </h3>
              <button
                onClick={() => setShowTrainingModal(false)}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Colonne cible
                </label>
                <input
                  type="text"
                  value={trainingConfig.target_column}
                  onChange={(e) => setTrainingConfig({...trainingConfig, target_column: e.target.value})}
                  placeholder="Ex: default_flag, npl_ratio"
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-white text-gray-800'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Type de modèle
                </label>
                <select
                  value={trainingConfig.model_type}
                  onChange={(e) => setTrainingConfig({...trainingConfig, model_type: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-white text-gray-800'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="auto">Auto (meilleur modèle)</option>
                  <option value="xgboost">XGBoost</option>
                  <option value="lstm">LSTM</option>
                  <option value="prophet">Prophet</option>
                  <option value="cox">Cox Model</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Type de tâche
                </label>
                <select
                  value={trainingConfig.task_type}
                  onChange={(e) => setTrainingConfig({...trainingConfig, task_type: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-white text-gray-800'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="classification">Classification</option>
                  <option value="regression">Régression</option>
                  <option value="time_series">Série temporelle</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTrainingModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                } transition-colors`}
              >
                Annuler
              </button>
              <button
                onClick={handleTrainModel}
                disabled={training || !trainingConfig.target_column}
                className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                  training || !trainingConfig.target_column
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } transition-colors`}
              >
                {training ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Entraînement...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Entraîner
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de configuration des alertes */}
      {showAlertsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md w-full mx-4`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Configurer les alertes
              </h3>
              <button
                onClick={() => setShowAlertsModal(false)}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {['credit_risk', 'liquidity_risk', 'market_risk', 'operational_risk'].map((alertType) => (
                <label key={alertType} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600"
                    defaultChecked
                  />
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {alertType.replace('_', ' ').charAt(0).toUpperCase() + alertType.slice(1).replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAlertsModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                } transition-colors`}
              >
                Annuler
              </button>
              <button
                onClick={() => handleConfigureAlerts(['credit_risk', 'liquidity_risk', 'market_risk'])}
                disabled={configuring}
                className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                  configuring
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                } transition-colors`}
              >
                {configuring ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Configuration...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Predictions;