// Script pour créer le fichier ClaimsUnderwriting manquant
const fs = require('fs');
const path = require('path');

// Créer le dossier claims s'il n'existe pas
const claimsDir = path.join(process.cwd(), 'src/components/claims');
if (!fs.existsSync(claimsDir)) {
  fs.mkdirSync(claimsDir, { recursive: true });
  console.log('✅ Dossier créé : src/components/claims');
}

// Contenu du fichier ClaimsUnderwriting
const claimsContent = `import React, { useState } from 'react';
import { Shield, DollarSign, Brain, Clock, RefreshCw, Download, ChevronDown } from 'lucide-react';

const ClaimsUnderwriting: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('fraudDetection');
  const [timeRange, setTimeRange] = useState('7');
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);

  const metrics = [
    {
      icon: Shield,
      title: 'Taux de Fraude Détecté',
      value: '60.0%',
      description: '3 sinistres suspects sur 5',
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10'
    },
    {
      icon: DollarSign,
      title: 'Économies Réalisées',
      value: '54 400 €',
      description: 'Fraudes évitées ce mois',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    {
      icon: Brain,
      title: 'Précision ML',
      value: '94.2%',
      description: 'Accuracy du modèle de détection',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Clock,
      title: 'Temps Traitement',
      value: '2.3h',
      description: 'Temps moyen par dossier',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10'
    }
  ];

  const tabs = [
    { id: 'fraudDetection', label: 'Détection de Fraude' },
    { id: 'costPrediction', label: 'Prédiction des Coûts' },
    { id: 'pricingOptimization', label: 'Optimisation Pricing' },
    { id: 'adverseSelection', label: 'Sélection Adverse' }
  ];

  const timeRangeOptions = [
    { value: '7', label: '7 derniers jours' },
    { value: '30', label: 'Dernier mois' },
    { value: '90', label: 'Dernier trimestre' },
    { value: '365', label: 'Dernière année' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-violet-500" />
          <h1 className="text-3xl font-bold">Claims & Underwriting Intelligence</h1>
        </div>
        <p className="text-slate-400">Détection de fraude, prédiction des coûts et optimisation du pricing</p>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <button
            onClick={() => setIsTimeRangeOpen(!isTimeRangeOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <span>{timeRangeOptions.find(opt => opt.value === timeRange)?.label}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {isTimeRangeOpen && (
            <div className="absolute top-full mt-2 left-0 w-48 bg-slate-800 rounded-lg shadow-lg z-10">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setTimeRange(option.value);
                    setIsTimeRangeOpen(false);
                  }}
                  className={\`w-full px-4 py-2 text-left hover:bg-slate-700 transition-colors \${
                    timeRange === option.value ? 'bg-slate-700' : ''
                  }\`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Rapport
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-slate-400 text-sm">{metric.title}</h3>
                <div className={\`p-2 rounded-lg \${metric.bgColor}\`}>
                  <Icon className={\`w-5 h-5 \${metric.color}\`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{metric.value}</p>
                <p className="text-sm text-slate-500">{metric.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 rounded-xl">
        <div className="flex border-b border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={\`px-6 py-4 font-medium transition-colors \${
                selectedTab === tab.id
                  ? 'text-indigo-500 border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-white'
              }\`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="p-6">
          <div className="h-96 flex items-center justify-center text-slate-500">
            Chargement...
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimsUnderwriting;`;

// Créer le fichier
const filePath = path.join(claimsDir, 'ClaimsUnderwriting.tsx');
fs.writeFileSync(filePath, claimsContent);
console.log('✅ Fichier créé : src/components/claims/ClaimsUnderwriting.tsx');

console.log('\n🎉 Le fichier ClaimsUnderwriting.tsx a été créé avec succès !');
console.log('\n💡 Votre application devrait maintenant fonctionner.');