import React, { useState } from 'react';
import { Settings, User, Shield, Bell, Palette, Database, Globe, Brain, Link, FileCheck, AlertTriangle, Key, Server, Zap, Lock, Activity } from 'lucide-react';

interface ParametersProps {
  isDarkMode: boolean;
}

const Parameters: React.FC<ParametersProps> = ({ isDarkMode }) => {
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [selectedApi, setSelectedApi] = useState('');
  
  // PARAMÈTRES EXISTANTS - ON GARDE TOUT
  const settingsCategories = [
    {
      title: "Profil Utilisateur",
      icon: User,
      settings: [
        { name: "Nom d'utilisateur", value: "admin@company.com", type: "text" },
        { name: "Nom complet", value: "Administrateur Système", type: "text" },
        { name: "Rôle", value: "Super Admin", type: "select" }
      ]
    },
    {
      title: "Sécurité",
      icon: Shield,
      settings: [
        { name: "Authentification 2FA", value: true, type: "toggle" },
        { name: "Session timeout", value: "30 minutes", type: "select" },
        { name: "Connexions simultanées", value: "3", type: "number" }
      ]
    },
    {
      title: "Notifications",
      icon: Bell,
      settings: [
        { name: "Alertes email", value: true, type: "toggle" },
        { name: "Notifications push", value: false, type: "toggle" },
        { name: "Rapports automatiques", value: true, type: "toggle" }
      ]
    },
    {
      title: "Interface",
      icon: Palette,
      settings: [
        { name: "Thème", value: isDarkMode ? "Sombre" : "Clair", type: "select" },
        { name: "Langue", value: "Français", type: "select" },
        { name: "Format de date", value: "DD/MM/YYYY", type: "select" }
      ]
    },
    {
      title: "Base de Données",
      icon: Database,
      settings: [
        { name: "Sauvegarde automatique", value: true, type: "toggle" },
        { name: "Rétention des données", value: "12 mois", type: "select" },
        { name: "Compression", value: true, type: "toggle" }
      ]
    }
  ];

  // NOUVEAUX PARAMÈTRES FINTECH - AJOUT
  const fintechSettings = [
    {
      title: "Modèles Machine Learning",
      icon: Brain,
      settings: [
        { name: "AutoML activé", value: true, type: "toggle", description: "Pipeline AutoML avec XGBoost, LSTM, Prophet" },
        { name: "Seuil détection anomalies", value: "0.95", type: "number", unit: "confidence" },
        { name: "Fréquence retraining", value: "Hebdomadaire", type: "select", options: ["Quotidien", "Hebdomadaire", "Mensuel"] },
        { name: "A/B Testing modèles", value: true, type: "toggle", description: "Validation performance nouveaux modèles" },
        { name: "Monitoring drift", value: true, type: "toggle", description: "Détection dérive modèles avec Evidently AI" },
        { name: "Explainabilité SHAP", value: true, type: "toggle", description: "SHAP values pour interprétabilité" }
      ]
    },
    {
      title: "Intégrations API Financières",
      icon: Link,
      settings: [
        { name: "Bloomberg Terminal", value: false, type: "api", status: "Non configuré" },
        { name: "Reuters Eikon", value: false, type: "api", status: "Non configuré" },
        { name: "Banque de France", value: true, type: "api", status: "Actif" },
        { name: "ECB Statistics", value: true, type: "api", status: "Actif" },
        { name: "S&P Global", value: false, type: "api", status: "Non configuré" },
        { name: "Webhook URL", value: "https://api.company.com/webhook", type: "text" },
        { name: "Kafka Streaming", value: true, type: "toggle", description: "Apache Kafka pour données temps réel" }
      ]
    },
    {
      title: "Sécurité Avancée",
      icon: Lock,
      settings: [
        { name: "Architecture Zero Trust", value: true, type: "toggle", description: "Vérification continue de l'identité" },
        { name: "Chiffrement homomorphique", value: false, type: "toggle", description: "Calculs sur données chiffrées" },
        { name: "MFA obligatoire", value: true, type: "toggle", description: "Multi-factor authentication" },
        { name: "Rotation clés auto", value: "30 jours", type: "select", options: ["7 jours", "30 jours", "90 jours"] },
        { name: "Audit blockchain", value: true, type: "toggle", description: "Logs immutables sur blockchain" },
        { name: "SIEM intégration", value: "Splunk", type: "select", options: ["Splunk", "ELK", "QRadar", "Désactivé"] }
      ]
    },
    {
      title: "Conformité Réglementaire",
      icon: FileCheck,
      settings: [
        { name: "Mode COREP/FINREP", value: true, type: "toggle", description: "Reporting BCE automatisé" },
        { name: "Seuil alerte CET1", value: "12", type: "number", unit: "%" },
        { name: "Seuil alerte LCR", value: "110", type: "number", unit: "%" },
        { name: "Seuil alerte NPL", value: "4", type: "number", unit: "%" },
        { name: "Validation IFRS 9 auto", value: true, type: "toggle", description: "Contrôles provisions ECL" },
        { name: "Calendrier reporting", value: "Trimestriel", type: "select", options: ["Mensuel", "Trimestriel", "Annuel"] },
        { name: "Alertes non-conformité", value: true, type: "toggle", description: "Notifications temps réel" }
      ]
    },
    {
      title: "Performance & Infrastructure",
      icon: Zap,
      settings: [
        { name: "Edge Computing", value: true, type: "toggle", description: "Latence <50ms via CDN" },
        { name: "Cache Redis TTL", value: "300", type: "number", unit: "secondes" },
        { name: "Auto-scaling", value: true, type: "toggle", description: "Scaling prédictif Kubernetes" },
        { name: "Base analytique", value: "ClickHouse", type: "select", options: ["ClickHouse", "BigQuery", "Snowflake"] },
        { name: "Monitoring", value: "Prometheus + Grafana", type: "select", options: ["Prometheus + Grafana", "Datadog", "New Relic"] }
      ]
    }
  ];

  // État des APIs
  const apiProviders = [
    { id: 'bloomberg', name: 'Bloomberg Terminal', description: 'Market data temps réel', price: '€2,000/mois' },
    { id: 'reuters', name: 'Reuters Eikon', description: 'Données financières globales', price: '€1,500/mois' },
    { id: 'sp', name: 'S&P Global', description: 'Ratings et analytics', price: '€800/mois' },
    { id: 'moodys', name: "Moody's Analytics", description: 'Risk analytics', price: '€1,200/mois' },
    { id: 'refinitiv', name: 'Refinitiv', description: 'Market data + risk', price: '€1,800/mois' }
  ];

  return (
    <div className="space-y-6">
      {/* Header EXISTANT */}
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Paramètres
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Configurez votre plateforme d'analyse
        </p>
      </div>

      {/* Settings Categories EXISTANTES */}
      <div className="space-y-6">
        {settingsCategories.map((category, categoryIndex) => {
          const Icon = category.icon;
          return (
            <div
              key={categoryIndex}
              className={`rounded-xl shadow-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className={`px-6 py-4 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-blue-500" />
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {category.title}
                  </h3>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {category.settings.map((setting, settingIndex) => (
                  <div key={settingIndex} className="flex items-center justify-between">
                    <div>
                      <label className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {setting.name}
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      {setting.type === 'toggle' ? (
                        <button
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            setting.value 
                              ? 'bg-blue-500' 
                              : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              setting.value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      ) : setting.type === 'select' ? (
                        <select className={`px-3 py-2 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                          <option>{setting.value}</option>
                        </select>
                      ) : setting.type === 'number' ? (
                        <input
                          type="number"
                          value={setting.value}
                          className={`px-3 py-2 rounded-lg border w-20 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={setting.value}
                          className={`px-3 py-2 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION SÉPARATEUR - NOUVEAU */}
      <div className={`flex items-center justify-center my-8 ${
        isDarkMode ? 'text-gray-600' : 'text-gray-400'
      }`}>
        <div className="flex-1 border-t" style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}></div>
        <div className="mx-4 text-sm font-semibold flex items-center gap-2">
          <Settings size={16} />
          CONFIGURATION FINTECH AVANCÉE
        </div>
        <div className="flex-1 border-t" style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}></div>
      </div>

      {/* NOUVEAUX Paramètres FinTech */}
      <div className="space-y-6">
        {fintechSettings.map((category, categoryIndex) => {
          const Icon = category.icon;
          return (
            <div
              key={`fintech-${categoryIndex}`}
              className={`rounded-xl shadow-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className={`px-6 py-4 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-blue-500" />
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {category.title}
                  </h3>
                </div>
              </div>
              
              <div className="p-6 space-y-5">
                {category.settings.map((setting, settingIndex) => (
                  <div key={settingIndex}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <label className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {setting.name}
                          {setting.unit && <span className={`ml-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>({setting.unit})</span>}
                        </label>
                        {setting.description && (
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {setting.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {setting.type === 'toggle' ? (
                          <button
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              setting.value 
                                ? 'bg-blue-500' 
                                : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                setting.value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        ) : setting.type === 'api' ? (
                          <>
                            <span className={`text-sm px-2 py-1 rounded ${
                              setting.status === 'Actif' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {setting.status}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedApi(setting.name);
                                setShowApiKeyModal(true);
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                isDarkMode 
                                  ? 'hover:bg-gray-700 text-gray-400' 
                                  : 'hover:bg-gray-100 text-gray-600'
                              }`}
                            >
                              <Key size={16} />
                            </button>
                          </>
                        ) : setting.type === 'select' ? (
                          <select className={`px-3 py-2 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                            <option>{setting.value}</option>
                            {setting.options?.map((option, idx) => (
                              <option key={idx} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : setting.type === 'number' ? (
                          <input
                            type="number"
                            value={setting.value}
                            className={`px-3 py-2 rounded-lg border w-24 ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        ) : (
                          <input
                            type="text"
                            value={setting.value}
                            className={`px-3 py-2 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* NOUVEAU - Statut Infrastructure */}
      <div className={`p-6 rounded-xl shadow-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <Activity size={20} className="text-green-500" />
          Statut Infrastructure Cloud
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'CPU Usage', value: '42%', status: 'ok' },
            { label: 'Memory', value: '68%', status: 'warning' },
            { label: 'Storage', value: '2.3TB/5TB', status: 'ok' },
            { label: 'API Calls', value: '1.2M/jour', status: 'ok' },
            { label: 'Latency', value: '47ms', status: 'ok' },
            { label: 'Uptime', value: '99.98%', status: 'ok' },
            { label: 'Active Users', value: '3,542', status: 'ok' },
            { label: 'ML Models', value: '12 actifs', status: 'ok' }
          ].map((metric, idx) => (
            <div key={idx} className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <p className={`text-xs mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {metric.label}
              </p>
              <p className={`text-lg font-bold ${
                metric.status === 'ok' ? 'text-green-500' : 'text-yellow-500'
              }`}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons EXISTANTS */}
      <div className="flex gap-4 pt-6">
        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          Sauvegarder les modifications
        </button>
        <button className={`px-6 py-3 rounded-lg transition-colors ${
          isDarkMode 
            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}>
          Annuler
        </button>
      </div>

      {/* MODAL Configuration API - NOUVEAU */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-full max-w-md p-6 rounded-xl shadow-xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Configuration API - {selectedApi}
            </h3>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Clé API
                </label>
                <input
                  type="password"
                  placeholder="Entrez votre clé API"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Secret API (optionnel)
                </label>
                <input
                  type="password"
                  placeholder="Entrez le secret si nécessaire"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Endpoint (si personnalisé)
                </label>
                <input
                  type="text"
                  placeholder="https://api.provider.com/v2"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              {/* Tarification */}
              <div className={`p-3 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tarif estimé : <span className="font-bold">€1,500/mois</span>
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Annuler
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Tester la connexion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parameters;