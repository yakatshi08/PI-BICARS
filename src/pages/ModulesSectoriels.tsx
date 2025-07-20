import React, { useState } from 'react';
import { 
  Brain, Shield, CreditCard, TrendingUp, 
  BarChart3, FileText, Zap, Users,
  BarChart2, PieChart, LineChart, Target,
  Activity, AlertCircle, Cpu, Database,
  GitBranch, Settings, PlayCircle, CheckCircle,
  ArrowLeft, Building2, Info
} from 'lucide-react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer, LineChart as RechartsLineChart,
  Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const ModulesSectoriels = () => {
  const { darkMode } = useStore();
  const navigate = useNavigate();
  const [activeModel, setActiveModel] = useState('xgboost');
  const [showModelsModal, setShowModelsModal] = useState(false);
  const [selectedSector, setSelectedSector] = useState(null);

  // Données pour le graphique radar avec espacement amélioré
  const performanceData = [
    { model: 'XGBoost', accuracy: 92, speed: 95, interpretability: 85, scalability: 90, robustness: 88 },
    { model: 'LSTM', accuracy: 89, speed: 70, interpretability: 60, scalability: 85, robustness: 82 },
    { model: 'Prophet', accuracy: 85, speed: 88, interpretability: 90, scalability: 75, robustness: 80 },
    { model: 'ARIMA', accuracy: 82, speed: 92, interpretability: 95, scalability: 70, robustness: 78 },
    { model: 'Cox', accuracy: 87, speed: 85, interpretability: 88, scalability: 80, robustness: 85 }
  ];

  // Données pour le graphique de détection de fraude
  const fraudData = [
    { month: 'Jan', detected: 245, prevented: 89 },
    { month: 'Fév', detected: 256, prevented: 92 },
    { month: 'Mar', detected: 267, prevented: 95 },
    { month: 'Avr', detected: 278, prevented: 98 },
    { month: 'Mai', detected: 289, prevented: 102 },
    { month: 'Jun', detected: 295, prevented: 105 }
  ];

  // Modules sectoriels avec détails
  const modules = [
    {
      id: 'banking',
      title: 'Banking & Finance',
      icon: <Building2 className="h-6 w-6" />,
      count: '12 modèles actifs',
      description: 'Solutions ML complètes pour le secteur bancaire',
      route: '/banking',
      models: ['Credit Scoring', 'Fraud Detection', 'Risk Prediction', 'Customer Churn'],
      features: ['Credit Scoring', 'Fraud Detection', 'Risk Prediction', 'Customer Churn']
    },
    {
      id: 'insurance',
      title: 'Assurance',
      icon: <Shield className="h-6 w-6" />,
      count: '10 modèles actifs',
      description: 'IA spécialisée pour les assureurs',
      route: '/assurance',
      models: ['Claims Prediction', 'Underwriting ML', 'Fraud Detection', 'Customer Lifetime Value'],
      features: ['Claims Prediction', 'Underwriting ML', 'Fraud Detection', 'Customer Lifetime Value']
    },
    {
      id: 'fintech',
      title: 'Fintech & Innovation',
      icon: <Zap className="h-6 w-6" />,
      count: '8 en développement',
      description: 'Solutions IA pour la finance digitale',
      route: '/fintech',
      models: ['Real-time Scoring', 'Blockchain ML', 'Payment Fraud', 'AML Detection'],
      features: ['Real-time Scoring', 'Blockchain ML', 'Payment Fraud', 'AML Detection']
    }
  ];

  const mlModels = [
    {
      name: 'XGBoost',
      description: 'Gradient Boosting optimisé pour risque crédit et scoring',
      accuracy: '94.2%',
      useCase: 'Credit scoring, détection défaut',
      icon: <BarChart2 className="h-5 w-5" />
    },
    {
      name: 'LSTM Networks',
      description: 'Réseaux récurrents pour séries temporelles financières',
      accuracy: '89.7%',
      useCase: 'Prédiction marchés, volatilité',
      icon: <GitBranch className="h-5 w-5" />
    },
    {
      name: 'Prophet',
      description: 'Forecasting avec saisonnalité pour assurance',
      accuracy: '85.3%',
      useCase: 'Prévision sinistres, primes',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      name: 'ARIMA',
      description: 'Modèles autorégressifs pour analyses actuarielles',
      accuracy: '82.1%',
      useCase: 'Réserves techniques, projections',
      icon: <LineChart className="h-5 w-5" />
    },
    {
      name: 'Cox Models',
      description: 'Survie et durée pour assurance vie',
      accuracy: '87.5%',
      useCase: 'Mortalité, longévité, lapses',
      icon: <Activity className="h-5 w-5" />
    }
  ];

  // Fonctionnalités IA avec détails
  const iaFeatures = [
    {
      title: 'Détection de Fraude',
      value: '267',
      unit: 'fraudes/mois',
      icon: <AlertCircle className="h-5 w-5" />,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
      route: '/fraude',
      details: {
        precision: '99.2% précision',
        realtime: 'Temps réel',
        learning: 'Auto-apprentissage'
      },
      description: 'ML temps réel avec Isolation Forest et Graph Networks'
    },
    {
      title: 'Alertes Prédictives',
      value: '1.2k',
      unit: 'alertes/jour',
      icon: <Activity className="h-5 w-5" />,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
      route: '/alertes',
      details: {
        personalized: 'Alertes personnalisées',
        multichannel: 'Multi-canal',
        priority: 'Priorisation IA'
      },
      description: 'Système d\'alertes basé sur patterns et anomalies'
    },
    {
      title: 'AutoML Pipeline',
      value: '85%',
      unit: 'automatisé',
      icon: <Cpu className="h-5 w-5" />,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      route: '/automl',
      details: {
        feature: 'Feature engineering',
        tuning: 'Hyperparameter tuning',
        selection: 'Model selection'
      },
      description: 'Pipeline automatisé de sélection et optimisation de modèles'
    },
    {
      title: 'Explainable AI',
      value: '100%',
      unit: 'explicable',
      icon: <Database className="h-5 w-5" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      route: '/explainable',
      details: {
        interpretability: 'Interprétabilité',
        compliance: 'Compliance ready',
        audit: 'Audit trail'
      },
      description: 'SHAP/LIME pour transparence et conformité réglementaire'
    }
  ];

  const handleSectorClick = (sector) => {
    setSelectedSector(sector);
    setShowModelsModal(true);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec bouton retour */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-white hover:bg-gray-100 text-gray-900'
              } shadow-sm hover:shadow-md`}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Analyses Avancées ML & Prédictions
              </h1>
              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Intelligence artificielle et Machine Learning pour Finance & Assurance
              </p>
            </div>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Modèles actifs</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>30+</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Précision moyenne</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>94.2%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Prédictions/jour</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>1.5M</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ROI moyen</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>320%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Modèles ML disponibles */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Modèles ML Spécialisés
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mlModels.map((model, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer`}
                onClick={() => setActiveModel(model.name.toLowerCase().replace(' ', ''))}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {model.name}
                  </h3>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    {model.icon}
                  </div>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                  {model.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {model.useCase}
                  </span>
                  <span className="text-xs font-semibold text-green-500">
                    {model.accuracy}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Graphiques côte à côte */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Graphique radar avec espacement amélioré */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Comparaison des Performances
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={performanceData} margin={{ top: 30, right: 40, bottom: 30, left: 40 }}>
                  <PolarGrid stroke={darkMode ? '#374151' : '#E5E7EB'} />
                  <PolarAngleAxis 
                    dataKey="model" 
                    tick={{ 
                      fontSize: 14, 
                      fill: darkMode ? '#9CA3AF' : '#6B7280',
                      dy: 8
                    }}
                    className="text-sm"
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]}
                    tick={{ 
                      fontSize: 11, 
                      fill: darkMode ? '#9CA3AF' : '#6B7280',
                      dx: -10
                    }}
                    tickCount={6}
                  />
                  <Radar 
                    name="Accuracy" 
                    dataKey="accuracy" 
                    stroke="#8B5CF6" 
                    fill="#8B5CF6" 
                    fillOpacity={0.3} 
                  />
                  <Radar 
                    name="Speed" 
                    dataKey="speed" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.3} 
                  />
                  <Radar 
                    name="Interpretability" 
                    dataKey="interpretability" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.3} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graphique de détection de fraude */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Évolution Détection de Fraude
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={fraudData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                  <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                      border: 'none',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="detected" 
                    stroke="#EF4444" 
                    name="Fraudes détectées"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="prevented" 
                    stroke="#10B981" 
                    name="Fraudes prévenues"
                    strokeWidth={2}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Fonctionnalités IA Avancées - Interactives */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Fonctionnalités IA Avancées
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {iaFeatures.map((feature, index) => (
              <div
                key={index}
                onClick={() => navigate(feature.route)}
                className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : feature.bgColor} ${feature.color} transition-all duration-300 group-hover:scale-110`}>
                    {feature.icon}
                  </div>
                  <Info className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <div className="flex items-baseline mt-1">
                  <span className={`text-2xl font-bold ${feature.color}`}>
                    {feature.value}
                  </span>
                  <span className={`text-sm ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.unit}
                  </span>
                </div>
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {feature.description}
                </p>
                <div className="mt-3 flex gap-1">
                  {Object.entries(feature.details).map(([key, value]) => (
                    <span key={key} className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      ✓ {value}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Applications par Secteur - Interactives */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Applications par Secteur
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {modules.map((module) => (
              <div
                key={module.id}
                onClick={() => navigate(module.route)}
                className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-indigo-500 transform hover:-translate-y-1 group`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} group-hover:scale-110 transition-transform`}>
                    {module.icon}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSectorClick(module);
                    }}
                    className={`text-sm font-semibold ${module.id === 'fintech' ? 'text-yellow-500' : 'text-green-500'} hover:underline flex items-center gap-1`}
                  >
                    {module.count}
                    <Info className="h-3 w-3" />
                  </button>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {module.title}
                </h3>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {module.description}
                </p>
                <div className="space-y-1">
                  {module.features.map((feature, idx) => (
                    <div key={idx} className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} flex items-center gap-1`}>
                      <span className="text-indigo-500">•</span> {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal pour afficher les modèles */}
        {showModelsModal && selectedSector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md w-full`}>
              <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedSector.title} - Modèles
              </h3>
              <div className="space-y-2">
                {selectedSector.models.map((model, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{model}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowModelsModal(false)}
                className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* CTA Final */}
        <div className={`mt-12 p-8 rounded-2xl ${darkMode ? 'bg-gradient-to-r from-indigo-900 to-purple-900' : 'bg-gradient-to-r from-indigo-500 to-purple-600'} text-white text-center`}>
          <h2 className="text-2xl font-bold mb-4">
            Prêt à transformer vos analyses avec l'IA ?
          </h2>
          <p className="mb-6 text-indigo-100">
            Découvrez comment nos modèles ML peuvent optimiser vos décisions
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => navigate('/demo')}
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors hover:scale-105 transform"
            >
              Voir une démo
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="px-6 py-3 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-800 transition-colors hover:scale-105 transform"
            >
              Contactez-nous
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulesSectoriels;