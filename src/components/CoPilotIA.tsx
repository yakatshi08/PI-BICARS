import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Bot, User, Sparkles, BarChart3, LineChart,
  PieChart, TrendingUp, FileText, Database, Zap,
  Brain, Wand2, Settings, Copy, Download, Share2,
  ChevronDown, Check, X, Loader, MessageSquare
} from 'lucide-react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: Action[];
  dashboard?: DashboardConfig;
}

interface Action {
  type: 'create_dashboard' | 'analyze_data' | 'generate_report' | 'export';
  label: string;
  data?: any;
}

interface DashboardConfig {
  id: string;
  title: string;
  description: string;
  widgets: Widget[];
  layout: 'grid' | 'list';
}

interface Widget {
  id: string;
  type: 'chart' | 'kpi' | 'table' | 'text';
  title: string;
  data: any;
  config: any;
}

// Patterns pour la détection d'entités
const COMMAND_PATTERNS: Record<string, string> = {
  'cet1|tier\\s*1': 'cet1',
  'lcr': 'lcr',
  'nsfr': 'nsfr',
  'scr|solvency': 'scr_coverage'
};

// Fonction améliorée de détection d'intention
const detectIntent = (message: string): { intent: string; entity?: string } => {
  const lowerMessage = message.toLowerCase();
  
  // Détection directe pour les commandes courtes
  if (lowerMessage === 'cet1' || lowerMessage === 'tier 1') {
    return { intent: 'calculate_ratio', entity: 'cet1' };
  }
  
  if (lowerMessage === 'lcr') {
    return { intent: 'calculate_ratio', entity: 'lcr' };
  }
  
  if (lowerMessage === 'nsfr') {
    return { intent: 'calculate_ratio', entity: 'nsfr' };
  }
  
  if (lowerMessage === 'scr' || lowerMessage === 'solvency') {
    return { intent: 'calculate_ratio', entity: 'scr_coverage' };
  }
  
  // Détection des entités avec patterns
  for (const [pattern, entity] of Object.entries(COMMAND_PATTERNS)) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(lowerMessage)) {
      // Détection de l'intention
      if (lowerMessage.includes('calcul') || lowerMessage.includes('quel') || lowerMessage.includes('montre') || lowerMessage.length < 20) {
        return { intent: 'calculate_ratio', entity };
      } else if (lowerMessage.includes('rapport') || lowerMessage.includes('report') || lowerMessage.includes('génér')) {
        return { intent: 'generate_report', entity };
      } else if (lowerMessage.includes('expli') || lowerMessage.includes('aide') || lowerMessage.includes('comment')) {
        return { intent: 'explain_metric', entity };
      } else if (lowerMessage.includes('évolution') || lowerMessage.includes('tendance') || lowerMessage.includes('analys')) {
        return { intent: 'analyze_trend', entity };
      } else if (lowerMessage.includes('stress') || lowerMessage.includes('test')) {
        return { intent: 'stress_test', entity };
      } else if (lowerMessage.includes('dashboard') || lowerMessage.includes('tableau')) {
        return { intent: 'create_dashboard', entity };
      } else if (lowerMessage.includes('prédiction') || lowerMessage.includes('forecast') || lowerMessage.includes('prévision')) {
        return { intent: 'prediction', entity };
      } else if (lowerMessage.includes('anomalie') || lowerMessage.includes('detection')) {
        return { intent: 'anomaly_detection', entity };
      }
      return { intent: 'calculate_ratio', entity };
    }
  }
  
  return { intent: 'general_query' };
};

export const CoPilotIA: React.FC = () => {
  const { darkMode } = useStore();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis votre Co-Pilot IA. Je peux analyser vos données, créer des dashboards personnalisés et répondre à vos questions. Comment puis-je vous aider ?',
      timestamp: new Date(),
      actions: [
        { type: 'create_dashboard', label: 'Créer un dashboard' },
        { type: 'analyze_data', label: 'Analyser mes données' },
        { type: 'generate_report', label: 'Générer un rapport' }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDashboardPreview, setShowDashboardPreview] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardConfig | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Exemples de requêtes
  const exampleQueries = [
    "Crée un dashboard de performance financière",
    "Analyse les tendances de revenus Q4 2024",
    "Compare nos ratios avec la moyenne du secteur",
    "Génère un rapport de risque crédit",
    "Montre-moi l'évolution du CET1 sur 12 mois"
  ];

  // Génération automatique de dashboard
  const generateDashboard = (type: string): DashboardConfig => {
    const dashboards: { [key: string]: DashboardConfig } = {
      financial: {
        id: 'dash-fin-' + Date.now(),
        title: 'Dashboard Performance Financière',
        description: 'Vue d\'ensemble des indicateurs financiers clés',
        layout: 'grid',
        widgets: [
          {
            id: 'w1',
            type: 'kpi',
            title: 'Revenus YTD',
            data: { value: 125.4, unit: 'M€', trend: '+12.3%', status: 'up' },
            config: { color: 'green' }
          },
          {
            id: 'w2',
            type: 'kpi',
            title: 'EBITDA',
            data: { value: 45.2, unit: 'M€', trend: '+8.5%', status: 'up' },
            config: { color: 'blue' }
          },
          {
            id: 'w3',
            type: 'kpi',
            title: 'ROE',
            data: { value: 15.8, unit: '%', trend: '+2.1pp', status: 'up' },
            config: { color: 'purple' }
          },
          {
            id: 'w4',
            type: 'kpi',
            title: 'Cost/Income',
            data: { value: 52.3, unit: '%', trend: '-3.2pp', status: 'down' },
            config: { color: 'orange' }
          },
          {
            id: 'w5',
            type: 'chart',
            title: 'Évolution des Revenus',
            data: {
              labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
              datasets: [{
                label: '2024',
                data: [18.2, 19.5, 20.1, 21.3, 22.8, 23.5],
                color: 'blue'
              }, {
                label: '2023',
                data: [16.5, 17.2, 18.1, 18.9, 19.5, 20.2],
                color: 'gray'
              }]
            },
            config: { type: 'line' }
          },
          {
            id: 'w6',
            type: 'chart',
            title: 'Répartition des Revenus',
            data: {
              labels: ['Retail Banking', 'Corporate', 'Investment', 'Insurance'],
              datasets: [{
                data: [45, 30, 15, 10],
                colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
              }]
            },
            config: { type: 'pie' }
          }
        ]
      },
      risk: {
        id: 'dash-risk-' + Date.now(),
        title: 'Dashboard Gestion des Risques',
        description: 'Monitoring des indicateurs de risque',
        layout: 'grid',
        widgets: [
          {
            id: 'w1',
            type: 'kpi',
            title: 'CET1 Ratio',
            data: { value: 14.2, unit: '%', trend: '+0.3pp', status: 'up' },
            config: { color: 'green' }
          },
          {
            id: 'w2',
            type: 'kpi',
            title: 'NPL Ratio',
            data: { value: 2.1, unit: '%', trend: '-0.2pp', status: 'down' },
            config: { color: 'red' }
          },
          {
            id: 'w3',
            type: 'kpi',
            title: 'LCR',
            data: { value: 142, unit: '%', trend: '+5pp', status: 'up' },
            config: { color: 'blue' }
          },
          {
            id: 'w4',
            type: 'kpi',
            title: 'VaR 99%',
            data: { value: 8.5, unit: 'M€', trend: '-1.2M€', status: 'down' },
            config: { color: 'purple' }
          },
          {
            id: 'w5',
            type: 'chart',
            title: 'Évolution CET1',
            data: {
              labels: ['Q1', 'Q2', 'Q3', 'Q4'],
              datasets: [{
                label: 'CET1 Ratio',
                data: [13.8, 13.9, 14.0, 14.2],
                color: 'green'
              }]
            },
            config: { type: 'bar' }
          }
        ]
      },
      performance: {
        id: 'dash-perf-' + Date.now(),
        title: 'Dashboard Performance Globale',
        description: 'KPIs stratégiques et opérationnels',
        layout: 'grid',
        widgets: [
          {
            id: 'w1',
            type: 'kpi',
            title: 'NPS Score',
            data: { value: 72, unit: 'pts', trend: '+8pts', status: 'up' },
            config: { color: 'green' }
          },
          {
            id: 'w2',
            type: 'kpi',
            title: 'Efficacité Opérationnelle',
            data: { value: 89, unit: '%', trend: '+3%', status: 'up' },
            config: { color: 'blue' }
          },
          {
            id: 'w3',
            type: 'chart',
            title: 'Benchmark Sectoriel',
            data: {
              labels: ['ROE', 'CIR', 'NPL', 'CET1'],
              datasets: [{
                label: 'PI BICARS',
                data: [15.8, 52.3, 2.1, 14.2],
                color: 'blue'
              }, {
                label: 'Moyenne Secteur',
                data: [12.5, 58.7, 3.2, 13.1],
                color: 'gray'
              }]
            },
            config: { type: 'radar' }
          }
        ]
      }
    };

    return dashboards[type] || dashboards.financial;
  };

  // Traitement des messages
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Analyse NLP avec la nouvelle fonction
    const { intent, entity } = detectIntent(input);

    // Simulation de réponse
    setTimeout(() => {
      let assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      switch (intent) {
        case 'create_dashboard':
          const dashboardType = input.toLowerCase().includes('risk') || input.toLowerCase().includes('risque') 
            ? 'risk' 
            : input.toLowerCase().includes('performance') 
              ? 'performance' 
              : 'financial';
          const dashboard = generateDashboard(dashboardType);
          assistantResponse.content = `J'ai créé un dashboard ${dashboardType === 'financial' ? 'financier' : dashboardType === 'risk' ? 'de risques' : 'de performance'} personnalisé pour vous. Il contient ${dashboard.widgets.length} widgets avec vos KPIs les plus importants.`;
          assistantResponse.dashboard = dashboard;
          assistantResponse.actions = [
            { type: 'create_dashboard', label: 'Voir le dashboard', data: dashboard },
            { type: 'export', label: 'Exporter en PDF' }
          ];
          break;

        case 'calculate_ratio':
          assistantResponse.content = `Voici le ratio ${entity} :\n\n**14.2%** (dernière mise à jour: 24/07/2025)\n\n*Évolution sur 12 mois : +0.3pp*\n*Objectif réglementaire : > 10.5%*`;
          break;

        case 'analyze_trend':
          assistantResponse.content = `D'après mon analyse des données :\n\n📈 **Tendances positives :**\n- Revenus en hausse de +12.3% YoY\n- Amélioration du ROE (+2.1pp)\n- Ratio CET1 solide à 14.2%\n\n📉 **Points d'attention :**\n- Légère augmentation des NPL dans le retail\n- Pression sur les marges d'intérêt\n\n💡 **Recommandations :**\n- Optimiser le cost/income ratio\n- Diversifier les sources de revenus\n- Renforcer le monitoring des risques crédit`;
          assistantResponse.actions = [
            { type: 'generate_report', label: 'Rapport détaillé' },
            { type: 'create_dashboard', label: 'Dashboard d\'analyse' }
          ];
          break;

        case 'generate_report':
          assistantResponse.content = `Je prépare votre rapport. Quel type de rapport souhaitez-vous ?\n\n📊 **Rapports disponibles :**\n- Rapport de performance trimestriel\n- Analyse des risques\n- Benchmark concurrentiel\n- Rapport réglementaire BCE`;
          assistantResponse.actions = [
            { type: 'generate_report', label: 'Performance Q4' },
            { type: 'generate_report', label: 'Analyse risques' },
            { type: 'generate_report', label: 'Benchmark' }
          ];
          break;

        case 'explain_metric':
          assistantResponse.content = `**Explication du ratio ${entity} :**\n\nLe ratio ${entity} est un indicateur clé de solvabilité bancaire qui mesure les fonds propres de première catégorie (CET1) par rapport à l'ensemble des actifs pondérés par les risques. Il est crucial pour évaluer la résilience financière d'une banque face aux chocs économiques.`;
          break;

        case 'stress_test':
          assistantResponse.content = `**Résultats du stress test :**\n\nScénario adverse : CET1 à 9.8% (-4.4pp)\nScénario sévère : CET1 à 7.2% (-7.0pp)\n\n*Ces résultats restent au-dessus des minimums réglementaires dans tous les scénarios.*`;
          break;

        case 'prediction':
          assistantResponse.content = `**Prévisions basées sur l'analyse prédictive :**\n\n📈 **Projections 2025 :**\n- Revenus : +8-10% de croissance attendue\n- ROE : Objectif 16.5%\n- CET1 : Maintien > 14%\n\n🎯 **Scénarios :**\n- Optimiste : +15% revenus si taux remontent\n- Central : +10% croissance organique\n- Pessimiste : +5% avec headwinds macro`;
          break;

        case 'anomaly_detection':
          assistantResponse.content = `**Détection d'anomalies :**\n\n- Une baisse anormale des revenus du segment Corporate en avril détectée\n- Écart de 15% par rapport aux prévisions\n- Cause probable : perte d'un grand client\n\n*Recommandation : analyser les causes et contacter le département commercial.*`;
          break;

        default:
          assistantResponse.content = `Je comprends votre demande concernant "${input}". Voici ce que je peux faire pour vous :\n\n- Créer des dashboards personnalisés\n- Analyser vos données en temps réel\n- Générer des rapports détaillés\n- Comparer vos performances\n- Faire des prévisions\n\nQue souhaitez-vous explorer en premier ?`;
          assistantResponse.actions = [
            { type: 'create_dashboard', label: 'Créer un dashboard' },
            { type: 'analyze_data', label: 'Analyser les données' }
          ];
      }

      setMessages(prev => [...prev, assistantResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // Gestion des actions
  const handleAction = (action: Action, dashboard?: DashboardConfig) => {
    switch (action.type) {
      case 'create_dashboard':
        if (dashboard) {
          setSelectedDashboard(dashboard);
          setShowDashboardPreview(true);
        }
        break;
      case 'export':
        alert('Export du dashboard en PDF...');
        break;
      case 'generate_report':
        alert(`Génération du rapport : ${action.label}`);
        break;
    }
  };

  // Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Rendu des widgets
  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'kpi':
        return (
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {widget.title}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {widget.data.value}
              </span>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {widget.data.unit}
              </span>
              {widget.data.trend && (
                <span className={`text-sm font-medium ${
                  widget.data.status === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {widget.data.trend}
                </span>
              )}
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {widget.title}
            </p>
            <div className="h-32 flex items-center justify-center">
              {widget.config.type === 'line' && <LineChart className="h-20 w-20 text-blue-500" />}
              {widget.config.type === 'bar' && <BarChart3 className="h-20 w-20 text-green-500" />}
              {widget.config.type === 'pie' && <PieChart className="h-20 w-20 text-purple-500" />}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        } p-6`}>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Co-Pilot IA
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Assistant intelligent
              </p>
            </div>
          </div>

          {/* Capacités */}
          <div className="space-y-4 mb-8">
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Capacités IA
            </h3>
            <div className="space-y-2">
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Wand2 className="h-4 w-4 text-purple-500" />
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Génération Auto
                  </span>
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Dashboards personnalisés en 1 clic
                </p>
              </div>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-4 w-4 text-blue-500" />
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    NLP Avancé
                  </span>
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Compréhension du langage naturel
                </p>
              </div>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Analyse Prédictive
                  </span>
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Prévisions basées sur l'IA
                </p>
              </div>
            </div>
          </div>

          {/* Exemples */}
          <div className="space-y-4">
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Essayez ces requêtes
            </h3>
            <div className="space-y-2">
              {exampleQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => setInput(query)}
                  className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  "{query}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Conversation IA
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}>
                  <Download className="h-4 w-4" />
                </button>
                <button className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}>
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}
                <div className={`max-w-2xl ${message.role === 'user' ? 'order-1' : 'order-2'}`}>
                  <div className={`rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {/* Actions */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleAction(action, message.dashboard)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            darkMode 
                              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Dashboard Preview */}
                  {message.dashboard && (
                    <div className={`mt-3 p-4 rounded-lg border ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {message.dashboard.title}
                        </h4>
                        <button
                          onClick={() => {
                            setSelectedDashboard(message.dashboard!);
                            setShowDashboardPreview(true);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Voir en grand
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {message.dashboard.widgets.slice(0, 4).map(widget => (
                          <div key={widget.id}>
                            {renderWidget(widget)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center order-2">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className={`rounded-lg px-4 py-3 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Posez votre question ou décrivez ce que vous voulez créer..."
                className={`flex-1 px-4 py-3 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 text-white placeholder-gray-400' 
                    : 'bg-gray-100 text-gray-900 placeholder-gray-600'
                }`}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  input.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : darkMode 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Dashboard Preview */}
      {showDashboardPreview && selectedDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedDashboard.title}
                </h2>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedDashboard.description}
                </p>
              </div>
              <button
                onClick={() => setShowDashboardPreview(false)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedDashboard.widgets.map(widget => (
                <div key={widget.id} className={widget.type === 'chart' ? 'lg:col-span-2' : ''}>
                  {renderWidget(widget)}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Utiliser ce dashboard
              </button>
              <button
                onClick={() => alert('Export en cours...')}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Exporter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};