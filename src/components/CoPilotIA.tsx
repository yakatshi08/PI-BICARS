import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, Brain, Loader, 
  FileText, TrendingUp, AlertCircle, 
  BarChart3, Calculator, HelpCircle,
  CheckCircle, XCircle, Clock,
  Shield, DollarSign, Percent
} from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: string;
  type?: string;
  data?: any;
  loading?: boolean;
}

interface Suggestion {
  text: string;
  query: string;
}

// Données mockées pour les calculs locaux
const MOCK_BANKING_DATA = {
  cet1: { value: 14.8, threshold: 10.5, unit: '%', status: 'healthy' },
  lcr: { value: 125.5, threshold: 100, unit: '%', status: 'healthy' },
  nsfr: { value: 112.3, threshold: 100, unit: '%', status: 'healthy' },
  npl: { value: 2.1, threshold: 5, unit: '%', status: 'healthy' },
  roe: { value: 12.8, threshold: 10, unit: '%', status: 'healthy' },
  nii: { value: 3240000, unit: '€', trend: 'up', variation: '+12.5%' },
  cost_income: { value: 48.2, threshold: 60, unit: '%', status: 'healthy' }
};

const MOCK_INSURANCE_DATA = {
  scr_coverage: { value: 185, threshold: 100, unit: '%', status: 'compliant' },
  combined_ratio: { value: 94.2, threshold: 100, unit: '%', status: 'compliant' },
  loss_ratio: { value: 62.5, threshold: 70, unit: '%', status: 'compliant' },
  expense_ratio: { value: 31.7, threshold: 35, unit: '%', status: 'compliant' },
  mcr: { value: 420, threshold: 100, unit: '%', status: 'compliant' },
  own_funds: { value: 850000000, unit: '€' },
  technical_provisions: { value: 650000000, unit: '€' }
};

// Patterns de reconnaissance pour les commandes
const COMMAND_PATTERNS = {
  // Banking
  'ratio cet1|cet1|capital tier 1|tier 1': 'cet1',
  'lcr|liquidity coverage|ratio de liquidité': 'lcr',
  'nsfr|net stable funding': 'nsfr',
  'npl|non performing|créances douteuses': 'npl',
  'roe|return on equity|rentabilité': 'roe',
  'nii|net interest income|marge nette': 'nii',
  'cost income|cost to income|coefficient exploitation': 'cost_income',
  
  // Insurance
  'scr|solvency capital|capital de solvabilité': 'scr_coverage',
  'combined ratio|ratio combiné': 'combined_ratio',
  'loss ratio|ratio de sinistralité': 'loss_ratio',
  'expense ratio|ratio de frais': 'expense_ratio',
  'mcr|minimum capital': 'mcr',
  'own funds|fonds propres': 'own_funds',
  'technical provisions|provisions techniques': 'technical_provisions',
  
  // Actions
  'stress test|test de résistance': 'stress_test',
  'rapport|report|générer': 'generate_report',
  'dashboard|tableau de bord': 'create_dashboard',
  'prédiction|forecast|prévision': 'prediction',
  'anomalie|detection': 'anomaly_detection',
  'aide|help|expliquer|explication': 'explain'
};

export const CoPilotIA: React.FC = () => {
  const { darkMode, selectedSector } = useStore();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'assistant',
    content: `Bonjour ! Je suis votre assistant IA spécialisé en ${selectedSector === 'banking' ? 'Finance Bancaire' : selectedSector === 'insurance' ? 'Assurance' : 'Finance & Assurance'}. 
    
Comment puis-je vous aider aujourd'hui ? Vous pouvez me demander :
- De calculer des ratios (ex: "Quel est mon ratio CET1 ?")
- De générer des rapports (ex: "Génère un rapport COREP")
- D'analyser des tendances (ex: "Analyse l'évolution du NPL")
- De créer des dashboards personnalisés`,
    timestamp: new Date()
  }]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadInitialSuggestions();
  }, [selectedSector]);

  const loadInitialSuggestions = () => {
    if (selectedSector === 'banking') {
      setSuggestions([
        { text: "Calcule mon ratio CET1", query: "Quel est mon ratio CET1 ?" },
        { text: "Génère un rapport COREP", query: "Génère un rapport COREP" },
        { text: "Analyse du NPL", query: "Analyse l'évolution du NPL ratio" }
      ]);
    } else if (selectedSector === 'insurance') {
      setSuggestions([
        { text: "Calcule le SCR", query: "Quel est mon ratio SCR ?" },
        { text: "Rapport Solvency II", query: "Génère un rapport Solvency II" },
        { text: "Combined Ratio", query: "Analyse le combined ratio" }
      ]);
    } else {
      setSuggestions([
        { text: "Vue d'ensemble", query: "Montre-moi une vue d'ensemble" },
        { text: "Ratios clés", query: "Quels sont mes ratios clés ?" },
        { text: "Créer un dashboard", query: "Crée un dashboard personnalisé" }
      ]);
    }
  };

  const detectIntent = (message: string): { intent: string; entity?: string } => {
    const lowerMessage = message.toLowerCase();
    
    // Détection des entités
    for (const [pattern, entity] of Object.entries(COMMAND_PATTERNS)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(lowerMessage)) {
        // Détection de l'intention
        if (lowerMessage.includes('calcul') || lowerMessage.includes('quel') || lowerMessage.includes('montre')) {
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

  const processLocalCommand = async (message: string): Promise<Message | null> => {
    const { intent, entity } = detectIntent(message);
    
    // Traitement local des commandes simples
    if (intent === 'calculate_ratio' && entity) {
      const data = selectedSector === 'insurance' ? MOCK_INSURANCE_DATA : MOCK_BANKING_DATA;
      const metric = data[entity as keyof typeof data];
      
      if (metric) {
        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Le ${entity.replace(/_/g, ' ').toUpperCase()} actuel est de **${metric.value}${metric.unit}**${metric.threshold ? ` (seuil: ${metric.threshold}${metric.unit})` : ''}.`,
          timestamp: new Date(),
          intent,
          type: 'calculation',
          data: {
            metric: entity,
            ...metric,
            visualization: true
          }
        };
      }
    }
    
    if (intent === 'explain_metric' && entity) {
      const explanations: Record<string, string> = {
        cet1: "Le ratio CET1 (Common Equity Tier 1) mesure la solidité financière d'une banque. Il compare les fonds propres de base aux actifs pondérés par le risque. Un ratio élevé indique une meilleure capacité à absorber les pertes.",
        lcr: "Le LCR (Liquidity Coverage Ratio) mesure la capacité d'une banque à faire face à ses besoins de liquidité à court terme (30 jours) en cas de stress. Il doit être supérieur à 100%.",
        scr_coverage: "Le ratio de couverture SCR mesure la capacité d'une compagnie d'assurance à faire face à ses engagements. Un ratio > 100% indique une solvabilité suffisante selon Solvency II.",
        combined_ratio: "Le Combined Ratio est la somme du Loss Ratio et de l'Expense Ratio. Un ratio < 100% indique une activité d'assurance rentable avant produits financiers."
      };
      
      const explanation = explanations[entity];
      if (explanation) {
        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: explanation,
          timestamp: new Date(),
          intent,
          type: 'explanation'
        };
      }
    }
    
    return null;
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Essayer d'abord le traitement local
    const localResponse = await processLocalCommand(message);
    
    if (localResponse) {
      // Ajouter un délai pour simuler le traitement
      setTimeout(() => {
        setMessages(prev => [...prev, localResponse]);
        setIsLoading(false);
        
        // Mettre à jour les suggestions basées sur le contexte
        updateContextualSuggestions(localResponse.intent || '', localResponse.data?.metric);
      }, 500);
      return;
    }

    // Si pas de traitement local, appeler l'API
    const loadingMessage: Message = {
      id: Date.now().toString() + '-loading',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      loading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await fetch('http://localhost:8000/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: message,
          context: {
            sector: selectedSector,
            darkMode,
            // Ajouter les données actuelles pour contexte
            currentData: selectedSector === 'insurance' ? MOCK_INSURANCE_DATA : MOCK_BANKING_DATA
          }
        })
      });

      const data = await response.json();
      setMessages(prev => prev.filter(m => m.id !== loadingMessage.id));

      const assistantMessage: Message = {
        id: Date.now().toString() + '-response',
        role: 'assistant',
        content: formatResponse(data.response),
        timestamp: new Date(),
        intent: data.intent,
        type: data.response?.type,
        data: data.response
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }

    } catch (error) {
      console.error('Erreur envoi message:', error);
      setMessages(prev => prev.filter(m => m.id !== loadingMessage.id));
      
      // Réponse de fallback en cas d'erreur
      const fallbackMessage: Message = {
        id: Date.now().toString() + '-fallback',
        role: 'assistant',
        content: "Je comprends votre demande, mais je ne peux pas me connecter au serveur pour le moment. Voici ce que je peux faire localement : calculer des ratios, expliquer des métriques, ou vous aider à naviguer dans l'application.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateContextualSuggestions = (lastIntent: string, lastMetric?: string) => {
    if (selectedSector === 'banking') {
      if (lastIntent === 'calculate_ratio') {
        setSuggestions([
          { text: "Comparer avec le mois dernier", query: `Compare le ${lastMetric} avec le mois dernier` },
          { text: "Faire un stress test", query: `Effectue un stress test sur le ${lastMetric}` },
          { text: "Voir tous les ratios", query: "Montre-moi tous les ratios prudentiels" }
        ]);
      } else if (lastIntent === 'explain_metric') {
        setSuggestions([
          { text: "Calculer ce ratio", query: `Calcule le ${lastMetric}` },
          { text: "Historique du ratio", query: `Montre l'évolution du ${lastMetric}` },
          { text: "Améliorer ce ratio", query: `Comment améliorer le ${lastMetric} ?` }
        ]);
      }
    } else if (selectedSector === 'insurance') {
      if (lastIntent === 'calculate_ratio') {
        setSuggestions([
          { text: "Détail du calcul", query: `Détaille le calcul du ${lastMetric}` },
          { text: "Projection 3 mois", query: `Projette le ${lastMetric} sur 3 mois` },
          { text: "Rapport Solvency II", query: "Génère le QRT correspondant" }
        ]);
      }
    }
  };

  const formatResponse = (response: any): string => {
    if (!response) {
      return 'Je suis désolé, je n\'ai pas pu traiter votre demande correctement.';
    }
    switch (response.type) {
      case 'calculation':
        return response.explanation || `${response.metric}: ${response.value}${response.unit}`;
      case 'explanation':
        return response.description || response.message;
      case 'report_generation':
        return `Rapport ${response.report_type} prêt à générer. Temps estimé: ${response.estimated_time}`;
      case 'dashboard_config':
        return `Dashboard "${response.name}" configuré avec ${response.widgets.length} widgets`;
      case 'trend_analysis':
        return response.insights?.map((i: any) => i.message).join('\n') || 'Analyse en cours';
      case 'anomaly_detection':
        return `${response.anomalies_found} anomalie(s) détectée(s). ${response.details?.[0]?.description || ''}`;
      default:
        return response.message || 'Réponse reçue';
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.loading) {
      return (
        <div className="flex items-center space-x-2">
          <Loader className="h-4 w-4 animate-spin" />
          <span className="text-sm">Analyse en cours...</span>
        </div>
      );
    }

    if (message.data && message.type) {
      switch (message.type) {
        case 'calculation':
          return (
            <div className="space-y-2">
              <p className="text-sm">{message.content}</p>
              {message.data.visualization && (
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500 uppercase mb-1">
                        {message.data.metric.replace(/_/g, ' ')}
                      </div>
                      <span className="text-2xl font-bold text-indigo-600">
                        {message.data.value}{message.data.unit}
                      </span>
                    </div>
                    {message.data.status === 'healthy' || message.data.status === 'compliant' ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-yellow-500" />
                    )}
                  </div>
                  {message.data.threshold && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Seuil réglementaire</span>
                        <span className="text-gray-400">{message.data.threshold}{message.data.unit}</span>
                      </div>
                      {message.data.variation && (
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-gray-500">Variation</span>
                          <span className={message.data.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                            {message.data.variation}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );

        case 'report_generation':
          return (
            <div className="space-y-3">
              <p className="text-sm">{message.content}</p>
              <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <span className="font-medium">Rapport {message.data.report_type}</span>
                  </div>
                  <span className="text-sm text-gray-500">{message.data.estimated_time}</span>
                </div>
                <div className="space-y-1">
                  {message.data.sections?.map((section: string, idx: number) => (
                    <div key={idx} className="text-sm text-gray-600 flex items-center space-x-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full" />
                      <span>{section}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-3 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Générer le rapport
                </button>
              </div>
            </div>
          );

        case 'dashboard_config':
          return (
            <div className="space-y-3">
              <p className="text-sm">{message.content}</p>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {message.data.widgets?.slice(0, 4).map((widget: any, idx: number) => (
                    <div key={idx} className={`p-2 rounded text-center text-xs
                      ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      {widget.type === 'kpi_card' ? <Calculator className="h-4 w-4 mx-auto mb-1" /> : 
                       widget.type === 'line_chart' ? <TrendingUp className="h-4 w-4 mx-auto mb-1" /> :
                       <BarChart3 className="h-4 w-4 mx-auto mb-1" />}
                      {widget.metric || widget.title}
                    </div>
                  ))}
                </div>
                <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Créer le dashboard
                </button>
              </div>
            </div>
          );

        default:
          return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
      }
    }

    return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
  };

  const getIntentIcon = (intent?: string) => {
    switch (intent) {
      case 'calculate_ratio':
        return <Calculator className="h-4 w-4" />;
      case 'generate_report':
        return <FileText className="h-4 w-4" />;
      case 'analyze_trend':
        return <TrendingUp className="h-4 w-4" />;
      case 'explain_metric':
        return <HelpCircle className="h-4 w-4" />;
      case 'detect_anomaly':
        return <AlertCircle className="h-4 w-4" />;
      case 'create_dashboard':
        return <BarChart3 className="h-4 w-4" />;
      case 'stress_test':
        return <Shield className="h-4 w-4" />;
      case 'prediction':
        return <Brain className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-600 rounded-xl">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Co-Pilot IA Finance & Assurance
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Assistant intelligent spécialisé {selectedSector === 'banking' ? 'Bancaire' : 
                                               selectedSector === 'insurance' ? 'Assurance' : 
                                               'Finance & Assurance'}
            </p>
          </div>
        </div>

        {/* Zone de chat */}
        <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                    ${message.role === 'user' 
                      ? 'bg-indigo-600 text-white' 
                      : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                    {message.role === 'user' ? 'U' : getIntentIcon(message.intent)}
                  </div>
                  
                  {/* Message */}
                  <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                    {message.intent && message.role === 'assistant' && (
                      <span className="text-xs text-indigo-600 mb-1 inline-block capitalize">
                        {message.intent.replace(/_/g, ' ')}
                      </span>
                    )}
                    <div className={`inline-block px-4 py-2 rounded-lg
                      ${message.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-900'}`}>
                      {renderMessageContent(message)}
                    </div>
                    <div className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className={`px-6 py-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Suggestions
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(suggestion.query)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors
                      ${darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Zone de saisie */}
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputMessage); }} 
                  className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Posez votre question ou tapez une commande..."
                disabled={isLoading}
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors
                  ${darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className={`px-4 py-2 rounded-lg font-medium transition-all
                  ${isLoading || !inputMessage.trim()
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                {isLoading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Capacités */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Calculator,
              title: 'Calculs Intelligents',
              description: 'Ratios réglementaires, KPIs sectoriels'
            },
            {
              icon: FileText,
              title: 'Rapports Automatiques',
              description: 'COREP, FINREP, Solvency II, Dashboards'
            },
            {
              icon: Brain,
              title: 'Analyses Prédictives',
              description: 'Tendances, anomalies, recommandations'
            }
          ].map((capability, idx) => (
            <div key={idx} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <capability.icon className="h-8 w-8 text-indigo-600 mb-2" />
              <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {capability.title}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {capability.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};