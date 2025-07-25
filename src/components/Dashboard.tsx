import React, { useState } from 'react';
import { 
  Brain, Shield, CreditCard, TrendingUp, 
  BarChart3, FileText, Zap, Users,
  ChartBar, PieChart, LineChart, Target,
  Activity, AlertCircle, Cpu, Database,
  GitBranch, Settings, PlayCircle, CheckCircle,
  Upload // Icône ajoutée
} from 'lucide-react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart as RechartsLineChart, Line, Area, AreaChart
} from 'recharts';

const Dashboard = () => {
  const { darkMode } = useStore();
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState('xgboost');

  // Données pour les graphiques
  const modelPerformance = [
    { model: 'XGBoost', accuracy: 94, speed: 85, interpretability: 75 },
    { model: 'LSTM', accuracy: 92, speed: 60, interpretability: 45 },
    { model: 'Prophet', accuracy: 88, speed: 90, interpretability: 85 },
    { model: 'ARIMA', accuracy: 82, speed: 95, interpretability: 90 },
    { model: 'Cox', accuracy: 86, speed: 88, interpretability: 80 }
  ];

  const fraudDetectionData = [
    { month: 'Jan', detected: 142, falsePositive: 8 },
    { month: 'Fév', detected: 156, falsePositive: 6 },
    { month: 'Mar', detected: 189, falsePositive: 5 },
    { month: 'Avr', detected: 213, falsePositive: 4 },
    { month: 'Mai', detected: 245, falsePositive: 3 },
    { month: 'Jun', detected: 267, falsePositive: 3 }
  ];

  const secteurs = [
    {
      id: 'banking',
      title: 'Banking & Finance',
      description: 'Solutions ML complètes pour le secteur bancaire',
      icon: CreditCard,
      stats: { label: 'Modèles actifs', value: 12 },
      color: 'blue',
      modules: ['Credit Scoring', 'Fraud Detection', 'Risk Prediction', 'Customer Churn']
    },
    {
      id: 'insurance',
      title: 'Assurance',
      description: 'IA spécialisée pour les assureurs',
      icon: Shield,
      stats: { label: 'Modèles actifs', value: 10 },
      color: 'purple',
      modules: ['Claims Prediction', 'Underwriting ML', 'Fraud Detection', 'Customer Lifetime Value']
    },
    {
      id: 'fintech',
      title: 'Fintech & Innovation',
      description: 'Solutions IA pour la finance digitale',
      icon: Zap,
      stats: { label: 'En développement', value: 8 },
      color: 'green',
      modules: ['Real-time Scoring', 'Blockchain ML', 'Payment Fraud', 'AML Detection']
    }
  ];

  const mlModels = [
    {
      id: 'xgboost',
      name: 'XGBoost',
      description: 'Gradient Boosting optimisé pour le scoring crédit et la détection de fraude',
      accuracy: '94%',
      speed: 'Très rapide',
      useCases: ['Credit Scoring', 'Fraud Detection', 'Churn Prediction'],
      icon: GitBranch,
      color: 'blue'
    },
    {
      id: 'lstm',
      name: 'LSTM Networks',
      description: 'Réseaux de neurones pour séries temporelles et prédictions complexes',
      accuracy: '92%',
      speed: 'Modéré',
      useCases: ['Time Series', 'Market Prediction', 'Anomaly Detection'],
      icon: Cpu,
      color: 'purple'
    },
    {
      id: 'prophet',
      name: 'Prophet',
      description: 'Modèle Facebook pour prévisions avec saisonnalité et tendances',
      accuracy: '88%',
      speed: 'Rapide',
      useCases: ['Demand Forecasting', 'Revenue Prediction', 'Trend Analysis'],
      icon: TrendingUp,
      color: 'green'
    },
    {
      id: 'arima',
      name: 'ARIMA',
      description: 'Modèle statistique classique pour séries temporelles',
      accuracy: '82%',
      speed: 'Très rapide',
      useCases: ['Economic Forecasting', 'Risk Metrics', 'Portfolio Analysis'],
      icon: LineChart,
      color: 'orange'
    },
    {
      id: 'cox',
      name: 'Cox Models',
      description: 'Modèles de survie pour analyse de durée et risque',
      accuracy: '86%',
      speed: 'Rapide',
      useCases: ['Default Prediction', 'Customer Lifetime', 'Insurance Claims'],
      icon: Activity,
      color: 'red'
    }
  ];

  const analysesAvancees = [
    {
      title: 'Détection de Fraude',
      description: 'ML temps réel avec Isolation Forest et Graph Networks',
      icon: AlertCircle,
      features: ['99.2% précision', 'Temps réel', 'Auto-apprentissage'],
      metric: '267 fraudes/mois'
    },
    {
      title: 'Alertes Prédictives',
      description: 'Système d\'alertes basé sur patterns et anomalies',
      icon: Activity,
      features: ['Alertes personnalisées', 'Multi-canal', 'Priorisation IA'],
      metric: '1.2k alertes/jour'
    },
    {
      title: 'AutoML Pipeline',
      description: 'Pipeline automatisé de sélection et optimisation de modèles',
      icon: Settings,
      features: ['Feature engineering', 'Hyperparameter tuning', 'Model selection'],
      metric: '85% automatisé'
    },
    {
      title: 'Explainable AI',
      description: 'SHAP/LIME pour transparence et conformité réglementaire',
      icon: Database,
      features: ['Interprétabilité', 'Compliance ready', 'Audit trail'],
      metric: '100% explicable'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: darkMode ? 'bg-blue-900/20' : 'bg-blue-50',
        border: darkMode ? 'border-blue-700' : 'border-blue-200',
        icon: darkMode ? 'text-blue-400' : 'text-blue-600',
        badge: darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800',
        gradient: 'from-blue-500 to-cyan-500'
      },
      purple: {
        bg: darkMode ? 'bg-purple-900/20' : 'bg-purple-50',
        border: darkMode ? 'border-purple-700' : 'border-purple-200',
        icon: darkMode ? 'text-purple-400' : 'text-purple-600',
        badge: darkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800',
        gradient: 'from-purple-500 to-pink-500'
      },
      green: {
        bg: darkMode ? 'bg-green-900/20' : 'bg-green-50',
        border: darkMode ? 'border-green-700' : 'border-green-200',
        icon: darkMode ? 'text-green-400' : 'text-green-600',
        badge: darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
        gradient: 'from-green-500 to-emerald-500'
      },
      orange: {
        bg: darkMode ? 'bg-orange-900/20' : 'bg-orange-50',
        border: darkMode ? 'border-orange-700' : 'border-orange-200',
        icon: darkMode ? 'text-orange-400' : 'text-orange-600',
        badge: darkMode ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800',
        gradient: 'from-orange-500 to-yellow-500'
      },
      red: {
        bg: darkMode ? 'bg-red-900/20' : 'bg-red-50',
        border: darkMode ? 'border-red-700' : 'border-red-200',
        icon: darkMode ? 'text-red-400' : 'text-red-600',
        badge: darkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
        gradient: 'from-red-500 to-pink-500'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header Section */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-4">
            <Brain className={`h-10 w-10 mr-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Analyses Avancées ML & Prédictions
              </h1>
              <p className={`text-lg mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Pipeline AutoML avec XGBoost, LSTM, Prophet, ARIMA et Cox Models
              </p>
            </div>
          </div>
          
          {/* Métriques clés */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Modèles actifs</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>30+</p>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Précision moyenne</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>94.2%</p>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Prédictions/jour</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>1.5M</p>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>ROI moyen</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>320%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Modèles ML */}
        <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Modèles Machine Learning Disponibles
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Liste des modèles */}
          <div className="space-y-4">
            {mlModels.map((model) => {
              const Icon = model.icon;
              const colors = getColorClasses(model.color);
              const isSelected = selectedModel === model.id;
              
              return (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`rounded-xl p-6 border-2 transition-all cursor-pointer
                    ${isSelected 
                      ? `${colors.border} ${colors.bg}` 
                      : darkMode 
                        ? 'border-slate-700 hover:border-slate-600' 
                        : 'border-gray-200 hover:border-gray-300'
                    }
                    ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${colors.bg}`}>
                        <Icon className={`h-6 w-6 ${colors.icon}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {model.name}
                        </h3>
                        <p className={`text-sm mb-3 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          {model.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {model.useCases.map((useCase, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-1 rounded-full ${colors.badge}`}
                            >
                              {useCase}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${colors.icon}`}>{model.accuracy}</p>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Précision</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Graphique de performance */}
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Comparaison des Performances
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={modelPerformance}>
                <PolarGrid stroke={darkMode ? '#334155' : '#e5e7eb'} />
                <PolarAngleAxis dataKey="model" stroke={darkMode ? '#94a3b8' : '#6b7280'} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={darkMode ? '#94a3b8' : '#6b7280'} />
                <Radar name="Précision" dataKey="accuracy" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Radar name="Vitesse" dataKey="speed" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Radar name="Interprétabilité" dataKey="interpretability" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1e293b' : '#fff',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analyses Avancées & Fonctionnalités */}
        <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Fonctionnalités IA Avancées
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {analysesAvancees.map((analyse, index) => {
            const Icon = analyse.icon;
            return (
              <div
                key={index}
                className={`rounded-lg p-6 border transition-all hover:shadow-md
                  ${darkMode 
                    ? 'bg-slate-800 border-slate-700 hover:border-slate-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`inline-flex p-3 rounded-lg
                    ${darkMode ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                    <Icon className={`h-6 w-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <span className={`text-lg font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {analyse.metric}
                  </span>
                </div>
                
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {analyse.title}
                </h3>
                <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  {analyse.description}
                </p>
                
                <div className="space-y-1">
                  {analyse.features.map((feature, idx) => (
                    <div 
                      key={idx} 
                      className={`text-xs flex items-center ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}
                    >
                      <CheckCircle className="w-3 h-3 mr-1 text-emerald-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Graphique Détection de Fraude */}
        <div className={`rounded-xl p-6 mb-12 ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Performance Détection de Fraude (6 derniers mois)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={fraudDetectionData}>
              <defs>
                <linearGradient id="fraudGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e5e7eb'} />
              <XAxis dataKey="month" stroke={darkMode ? '#94a3b8' : '#6b7280'} />
              <YAxis stroke={darkMode ? '#94a3b8' : '#6b7280'} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1e293b' : '#fff',
                  border: 'none',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="detected" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#fraudGradient)"
                name="Fraudes détectées"
              />
              <Line 
                type="monotone" 
                dataKey="falsePositive" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Faux positifs"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Secteurs Section */}
        <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Applications par Secteur
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {secteurs.map((secteur) => {
            const Icon = secteur.icon;
            const colors = getColorClasses(secteur.color);
            
            return (
              <div
                key={secteur.id}
                className={`rounded-xl p-6 border-2 transition-all hover:shadow-lg cursor-pointer
                  ${colors.bg} ${colors.border}
                  ${darkMode ? 'hover:border-slate-600' : 'hover:border-gray-300'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-white'}`}>
                    <Icon className={`h-6 w-6 ${colors.icon}`} />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${colors.badge}`}>
                    {secteur.stats.value} {secteur.stats.label}
                  </span>
                </div>
                
                <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {secteur.title}
                </h3>
                <p className={`mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  {secteur.description}
                </p>
                
                <div className="space-y-1">
                  {secteur.modules.map((module, idx) => (
                    <div key={idx} className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                      • {module}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Ajout du bouton Import Intelligent */}
          <div 
            onClick={() => navigate('/import-advanced')}
            className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-6 cursor-pointer hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div>
              <Upload className="h-8 w-8 text-white mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Import Intelligent</h3>
              <p className="text-purple-100">OCR PDF & APIs temps réel</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={`rounded-2xl p-8 text-center bg-gradient-to-r from-purple-600 to-indigo-600`}>
          <h3 className="text-2xl font-bold text-white mb-4">
            Prêt à exploiter la puissance de l'IA ?
          </h3>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Notre pipeline AutoML analyse vos données et sélectionne automatiquement les meilleurs modèles 
            pour vos cas d'usage spécifiques en finance et assurance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/data-import')}
              className="bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center"
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              Démarrer l'analyse
            </button>
            <button
              onClick={() => navigate('/demo')}
              className="bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors border border-purple-500"
            >
              Voir une démo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};  // Fin de la fonction Dashboard

export { Dashboard };