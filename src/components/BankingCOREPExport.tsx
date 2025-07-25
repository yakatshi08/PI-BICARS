import React, { useState } from 'react';
import {
  FileText, Download, Check, AlertCircle, Calendar,
  Building2, Clock, FileSpreadsheet, Send, Eye,
  CheckCircle, XCircle, Info, Shield, Activity, TrendingUp, X
} from 'lucide-react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

// Types pour COREP
interface COREPTemplate {
  id: string;
  code: string;
  name: string;
  description: string;
  frequency: 'quarterly' | 'semi-annual' | 'annual';
  category: 'capital' | 'liquidity' | 'leverage' | 'large_exposures';
  required: boolean;
  status: 'ready' | 'pending' | 'draft';
}

interface ValidationResult {
  template: string;
  status: 'valid' | 'warning' | 'error';
  messages: string[];
}

// Données simulées pour l'export
interface COREPData {
  [key: string]: {
    value: number;
    currency: string;
    description: string;
  }[];
}

export const BankingCOREPExport: React.FC = () => {
  const navigate = useNavigate();
  
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [reportingDate, setReportingDate] = useState(new Date().toISOString().split('T')[0]);
  const [validating, setValidating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Templates COREP standards
  const corepTemplates: COREPTemplate[] = [
    {
      id: 'ca1',
      code: 'C 01.00',
      name: 'Own funds',
      description: 'Fonds propres réglementaires',
      frequency: 'quarterly',
      category: 'capital',
      required: true,
      status: 'ready'
    },
    {
      id: 'ca2',
      code: 'C 02.00',
      name: 'Own funds requirements',
      description: 'Exigences de fonds propres',
      frequency: 'quarterly',
      category: 'capital',
      required: true,
      status: 'ready'
    },
    {
      id: 'ca3',
      code: 'C 03.00',
      name: 'Capital ratios',
      description: 'Ratios de capital (CET1, T1, Total)',
      frequency: 'quarterly',
      category: 'capital',
      required: true,
      status: 'ready'
    },
    {
      id: 'ca4',
      code: 'C 04.00',
      name: 'Memorandum items',
      description: 'Éléments pour mémoire',
      frequency: 'quarterly',
      category: 'capital',
      required: false,
      status: 'ready'
    },
    {
      id: 'lc1',
      code: 'C 72.00',
      name: 'Liquidity Coverage Ratio',
      description: 'Ratio de couverture de liquidité (LCR)',
      frequency: 'quarterly',
      category: 'liquidity',
      required: true,
      status: 'ready'
    },
    {
      id: 'lc2',
      code: 'C 73.00',
      name: 'Outflows',
      description: 'Sorties de trésorerie LCR',
      frequency: 'quarterly',
      category: 'liquidity',
      required: true,
      status: 'pending'
    },
    {
      id: 'lc3',
      code: 'C 74.00',
      name: 'Inflows',
      description: 'Entrées de trésorerie LCR',
      frequency: 'quarterly',
      category: 'liquidity',
      required: true,
      status: 'pending'
    },
    {
      id: 'lc4',
      code: 'C 84.00',
      name: 'Net Stable Funding Ratio',
      description: 'Ratio de financement stable net (NSFR)',
      frequency: 'quarterly',
      category: 'liquidity',
      required: true,
      status: 'ready'
    },
    {
      id: 'lv1',
      code: 'C 47.00',
      name: 'Leverage Ratio',
      description: 'Ratio de levier',
      frequency: 'quarterly',
      category: 'leverage',
      required: true,
      status: 'ready'
    },
    {
      id: 'le1',
      code: 'C 28.00',
      name: 'Large exposures',
      description: 'Grandes expositions',
      frequency: 'quarterly',
      category: 'large_exposures',
      required: true,
      status: 'draft'
    }
  ];

  // Données simulées pour les templates
  const getTemplateData = (templateId: string): COREPData => {
    const dataMap: { [key: string]: COREPData } = {
      'ca1': {
        'C_01.00': [
          { value: 125000000, currency: 'EUR', description: 'Common Equity Tier 1 capital' },
          { value: 15000000, currency: 'EUR', description: 'Additional Tier 1 capital' },
          { value: 25000000, currency: 'EUR', description: 'Tier 2 capital' },
          { value: 165000000, currency: 'EUR', description: 'Total capital' }
        ]
      },
      'ca2': {
        'C_02.00': [
          { value: 850000000, currency: 'EUR', description: 'Risk weighted exposure amounts' },
          { value: 68000000, currency: 'EUR', description: 'Own funds requirements' },
          { value: 97000000, currency: 'EUR', description: 'Capital surplus' }
        ]
      },
      'ca3': {
        'C_03.00': [
          { value: 14.7, currency: '%', description: 'CET1 capital ratio' },
          { value: 16.5, currency: '%', description: 'T1 capital ratio' },
          { value: 19.4, currency: '%', description: 'Total capital ratio' }
        ]
      },
      'lc1': {
        'C_72.00': [
          { value: 142, currency: '%', description: 'Liquidity Coverage Ratio' },
          { value: 1250000000, currency: 'EUR', description: 'Liquid assets' },
          { value: 880000000, currency: 'EUR', description: 'Net cash outflows' }
        ]
      },
      'lv1': {
        'C_47.00': [
          { value: 5.2, currency: '%', description: 'Leverage ratio' },
          { value: 165000000, currency: 'EUR', description: 'Tier 1 capital' },
          { value: 3173000000, currency: 'EUR', description: 'Total leverage ratio exposure' }
        ]
      }
    };

    return dataMap[templateId] || { 'No data': [{ value: 0, currency: 'EUR', description: 'No data available' }] };
  };

  // Grouper par catégorie
  const templatesByCategory = corepTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, COREPTemplate[]>);

  // Sélectionner/désélectionner un template
  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  // Sélectionner tous les templates requis
  const selectRequired = () => {
    const requiredIds = corepTemplates
      .filter(t => t.required)
      .map(t => t.id);
    setSelectedTemplates(requiredIds);
  };

  // Valider les données
  const validateData = async () => {
    setValidating(true);
    setValidationResults([]);

    // Simulation de validation
    setTimeout(() => {
      const results: ValidationResult[] = selectedTemplates.map(templateId => {
        const template = corepTemplates.find(t => t.id === templateId)!;
        
        if (template.status === 'draft') {
          return {
            template: template.code,
            status: 'error',
            messages: ['Template non finalisé', 'Données manquantes']
          };
        } else if (template.status === 'pending') {
          return {
            template: template.code,
            status: 'warning',
            messages: ['Certaines données sont en attente de validation']
          };
        } else {
          return {
            template: template.code,
            status: 'valid',
            messages: ['Toutes les validations réussies']
          };
        }
      });

      setValidationResults(results);
      setValidating(false);
    }, 2000);
  };

  // Générer le contenu XML pour XBRL
  const generateXBRLContent = () => {
    const selectedTemplateObjects = selectedTemplates
      .map(id => corepTemplates.find(t => t.id === id))
      .filter(Boolean) as COREPTemplate[];

    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<xbrl xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
      xmlns:link="http://www.xbrl.org/2003/linkbase"
      xmlns:corep="http://www.eba.europa.eu/xbrl/crr/dict/dom"
      xmlns:iso4217="http://www.xbrl.org/2003/iso4217">
  
  <context id="c1">
    <entity>
      <identifier scheme="http://www.eba.europa.eu/xbrl">PI_BICARS_BANK</identifier>
    </entity>
    <period>
      <instant>${reportingDate}</instant>
    </period>
  </context>
  
  <unit id="EUR">
    <measure>iso4217:EUR</measure>
  </unit>
  
  <unit id="percent">
    <measure>xbrli:pure</measure>
  </unit>\n\n`;

    // Ajouter les données pour chaque template sélectionné
    selectedTemplateObjects.forEach(template => {
      const data = getTemplateData(template.id);
      xmlContent += `  <!-- ${template.code} - ${template.name} -->\n`;
      
      Object.entries(data).forEach(([section, values]) => {
        values.forEach((item, index) => {
          const unitRef = item.currency === '%' ? 'percent' : item.currency;
          xmlContent += `  <corep:${template.code.replace(/\s/g, '_')}_${index + 1} 
    contextRef="c1" 
    unitRef="${unitRef}" 
    decimals="${item.currency === '%' ? '2' : '0'}">${item.value}</corep:${template.code.replace(/\s/g, '_')}_${index + 1}>
    <!-- ${item.description} -->\n`;
        });
      });
      xmlContent += '\n';
    });

    xmlContent += '</xbrl>';
    return xmlContent;
  };

  // Générer le contenu CSV pour Excel
  const generateCSVContent = () => {
    const selectedTemplateObjects = selectedTemplates
      .map(id => corepTemplates.find(t => t.id === id))
      .filter(Boolean) as COREPTemplate[];

    let csvContent = 'Template Code,Template Name,Description,Value,Currency,Reporting Date,Institution\n';

    selectedTemplateObjects.forEach(template => {
      const data = getTemplateData(template.id);
      Object.entries(data).forEach(([section, values]) => {
        values.forEach(item => {
          csvContent += `"${template.code}","${template.name}","${item.description}",${item.value},"${item.currency}","${reportingDate}","PI BICARS Bank"\n`;
        });
      });
    });

    return csvContent;
  };

  // Télécharger un fichier
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Générer l'export XBRL
  const generateExport = async () => {
    if (selectedTemplates.length === 0) {
      alert('Veuillez sélectionner au moins un template avant de générer l\'export.');
      return;
    }

    setGenerating(true);

    setTimeout(() => {
      const xbrlContent = generateXBRLContent();
      const filename = `COREP_${reportingDate.replace(/-/g, '')}_PI_BICARS.xbrl`;
      
      downloadFile(xbrlContent, filename, 'application/xml');
      
      setGenerating(false);
      alert(`Export XBRL généré avec succès !\n\nFichier : ${filename}`);
    }, 2000);
  };

  // Export Excel
  const exportToExcel = () => {
    if (selectedTemplates.length === 0) {
      alert('Veuillez sélectionner au moins un template avant d\'exporter.');
      return;
    }
    
    setExporting(true);
    
    setTimeout(() => {
      const csvContent = generateCSVContent();
      const filename = `COREP_Export_${reportingDate}.csv`;
      
      downloadFile(csvContent, filename, 'text/csv');
      
      setExporting(false);
      alert(`Export Excel généré avec succès !\n\nFichier : ${filename}\n\nLe fichier CSV peut être ouvert dans Excel.`);
    }, 1500);
  };

  // Prévisualiser
  const previewReport = () => {
    if (selectedTemplates.length === 0) {
      alert('Veuillez sélectionner au moins un template avant de prévisualiser.');
      return;
    }
    
    if (validationResults.length === 0) {
      alert('Veuillez d\'abord valider les données avant de prévisualiser le rapport.');
      return;
    }
    
    setPreviewing(true);
    
    setTimeout(() => {
      // Préparer les données pour la prévisualisation
      const selectedTemplateObjects = selectedTemplates
        .map(id => corepTemplates.find(t => t.id === id))
        .filter(Boolean) as COREPTemplate[];

      const previewInfo = {
        reportingDate,
        institution: 'PI BICARS Bank',
        templates: selectedTemplateObjects.map(t => ({
          code: t.code,
          name: t.name,
          status: t.status,
          data: getTemplateData(t.id)
        })),
        validationResults,
        hasErrors: validationResults.some(r => r.status === 'error'),
        hasWarnings: validationResults.some(r => r.status === 'warning')
      };

      setPreviewData(previewInfo);
      setShowPreview(true);
      setPreviewing(false);
    }, 1000);
  };

  // Obtenir le nom de la catégorie
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'capital': return 'Adéquation du capital';
      case 'liquidity': return 'Liquidité';
      case 'leverage': return 'Levier';
      case 'large_exposures': return 'Grandes expositions';
      default: return category;
    }
  };

  // Obtenir l'icône de la catégorie
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'capital': return Shield;
      case 'liquidity': return Activity;
      case 'leverage': return TrendingUp;
      case 'large_exposures': return AlertCircle;
      default: return FileText;
    }
  };

  // Statistiques
  const stats = {
    total: corepTemplates.length,
    selected: selectedTemplates.length,
    required: corepTemplates.filter(t => t.required).length,
    ready: corepTemplates.filter(t => t.status === 'ready').length
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0f172a' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#ffffff' }}>
              Export COREP
            </h1>
            <p className="mt-1" style={{ color: '#94a3b8' }}>
              Génération des rapports réglementaires COREP pour la BCE
            </p>
          </div>
          <button
            onClick={() => navigate('/banking/dashboard')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Retour Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Paramètres de base */}
            <div className="rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                Paramètres du rapport
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                    Date de reporting
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={reportingDate}
                      onChange={(e) => setReportingDate(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: '#374151',
                        color: '#ffffff'
                      }}
                    />
                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 pointer-events-none" style={{ color: '#94a3b8' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                    Institution
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value="PI BICARS Bank"
                      disabled
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: '#374151',
                        color: '#94a3b8'
                      }}
                    />
                    <Building2 className="absolute right-3 top-2.5 h-5 w-5 pointer-events-none" style={{ color: '#94a3b8' }} />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={selectRequired}
                    className="text-sm font-medium hover:opacity-80 transition-opacity"
                    style={{ color: '#6366f1' }}
                  >
                    Sélectionner les requis
                  </button>
                  <button
                    onClick={() => setSelectedTemplates(corepTemplates.map(t => t.id))}
                    className="text-sm font-medium hover:opacity-80 transition-opacity"
                    style={{ color: '#6366f1' }}
                  >
                    Tout sélectionner
                  </button>
                  <button
                    onClick={() => setSelectedTemplates([])}
                    className="text-sm hover:opacity-80 transition-opacity"
                    style={{ color: '#94a3b8' }}
                  >
                    Tout désélectionner
                  </button>
                </div>
                <div className="text-sm" style={{ color: '#94a3b8' }}>
                  {stats.selected} / {stats.total} sélectionnés
                </div>
              </div>
            </div>

            {/* Sélection des templates */}
            {Object.entries(templatesByCategory).map(([category, templates]) => {
              const Icon = getCategoryIcon(category);
              return (
                <div key={category} className="rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="h-5 w-5" style={{ color: '#8b5cf6' }} />
                    <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
                      {getCategoryName(category)}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {templates.map(template => (
                      <div
                        key={template.id}
                        className="p-4 rounded-lg border-2 transition-all cursor-pointer"
                        style={{
                          borderColor: selectedTemplates.includes(template.id) ? '#6366f1' : '#374151',
                          backgroundColor: selectedTemplates.includes(template.id) ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                        }}
                        onClick={() => toggleTemplate(template.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-5 h-5 rounded border-2 flex items-center justify-center"
                                style={{
                                  backgroundColor: selectedTemplates.includes(template.id) ? '#6366f1' : 'transparent',
                                  borderColor: selectedTemplates.includes(template.id) ? '#6366f1' : '#4B5563'
                                }}
                              >
                                {selectedTemplates.includes(template.id) && (
                                  <Check className="h-3 w-3" style={{ color: '#ffffff' }} />
                                )}
                              </div>
                              <span className="font-medium" style={{ color: '#ffffff' }}>
                                {template.code}
                              </span>
                              <span style={{ color: '#94a3b8' }}>
                                {template.name}
                              </span>
                              {template.required && (
                                <span 
                                  className="text-xs px-2 py-1 rounded-full"
                                  style={{ 
                                    backgroundColor: '#fee2e2',
                                    color: '#991b1b'
                                  }}
                                >
                                  Requis
                                </span>
                              )}
                            </div>
                            <p className="text-sm mt-1 ml-8" style={{ color: '#94a3b8' }}>
                              {template.description}
                            </p>
                          </div>
                          <div className="ml-4">
                            <span 
                              className="text-xs px-2 py-1 rounded-full"
                              style={{
                                backgroundColor: template.status === 'ready' ? '#d1fae5' : 
                                               template.status === 'pending' ? '#fef3c7' : '#f3f4f6',
                                color: template.status === 'ready' ? '#065f46' :
                                      template.status === 'pending' ? '#92400e' : '#374151'
                              }}
                            >
                              {template.status === 'ready' ? 'Prêt' :
                               template.status === 'pending' ? 'En attente' : 'Brouillon'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Panneau de validation et export */}
          <div className="lg:col-span-1 space-y-6">
            {/* Résumé */}
            <div className="rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                Résumé de l'export
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span style={{ color: '#94a3b8' }}>
                    Templates sélectionnés
                  </span>
                  <span className="font-medium" style={{ color: '#ffffff' }}>
                    {stats.selected}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: '#94a3b8' }}>
                    Templates requis
                  </span>
                  <span className="font-medium" style={{ color: '#ffffff' }}>
                    {stats.required}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: '#94a3b8' }}>
                    Prêts à exporter
                  </span>
                  <span className="font-medium" style={{ color: '#ffffff' }}>
                    {selectedTemplates.filter(id => 
                      corepTemplates.find(t => t.id === id)?.status === 'ready'
                    ).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Validation */}
            <div className="rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                Validation des données
              </h3>
              
              <button
                onClick={validateData}
                disabled={selectedTemplates.length === 0 || validating}
                className="w-full px-4 py-3 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: selectedTemplates.length === 0 || validating ? '#6B7280' : '#6366f1',
                  color: '#ffffff',
                  cursor: selectedTemplates.length === 0 || validating ? 'not-allowed' : 'pointer'
                }}
              >
                {validating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    <span>Validation en cours...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="h-5 w-5" />
                    <span>Valider les données</span>
                  </div>
                )}
              </button>

              {validationResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {validationResults.map((result, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: result.status === 'valid' ? 'rgba(16, 185, 129, 0.1)' :
                                       result.status === 'warning' ? 'rgba(245, 158, 11, 0.1)' :
                                       'rgba(239, 68, 68, 0.1)'
                      }}
                    >
                      <div className="flex items-start gap-2">
                        {result.status === 'valid' ? (
                          <CheckCircle className="h-4 w-4 mt-0.5" style={{ color: '#10b981' }} />
                        ) : result.status === 'warning' ? (
                          <AlertCircle className="h-4 w-4 mt-0.5" style={{ color: '#f59e0b' }} />
                        ) : (
                          <XCircle className="h-4 w-4 mt-0.5" style={{ color: '#ef4444' }} />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: '#ffffff' }}>
                            {result.template}
                          </p>
                          {result.messages.map((msg, idx) => (
                            <p key={idx} className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                              • {msg}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions d'export */}
            <div className="rounded-xl p-6" style={{ backgroundColor: '#1e293b' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                Format d'export
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={generateExport}
                  disabled={
                    selectedTemplates.length === 0 || 
                    generating ||
                    validationResults.some(r => r.status === 'error')
                  }
                  className="w-full px-4 py-3 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: selectedTemplates.length === 0 || generating || validationResults.some(r => r.status === 'error') 
                      ? '#6B7280' 
                      : '#10b981',
                    color: '#ffffff',
                    cursor: selectedTemplates.length === 0 || generating || validationResults.some(r => r.status === 'error') 
                      ? 'not-allowed' 
                      : 'pointer'
                  }}
                >
                  {generating ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Génération en cours...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Download className="h-5 w-5" />
                      <span>Générer XBRL</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={exportToExcel}
                  disabled={exporting}
                  className="w-full px-4 py-3 rounded-lg font-medium transition-all hover:opacity-80"
                  style={{
                    backgroundColor: exporting ? '#6B7280' : '#374151',
                    color: '#ffffff',
                    cursor: exporting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {exporting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Export en cours...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <FileSpreadsheet className="h-5 w-5" />
                      <span>Export Excel</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={previewReport}
                  disabled={previewing}
                  className="w-full px-4 py-3 rounded-lg font-medium transition-all hover:opacity-80"
                  style={{
                    backgroundColor: previewing ? '#6B7280' : '#374151',
                    color: '#ffffff',
                    cursor: previewing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {previewing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Préparation...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Eye className="h-5 w-5" />
                      <span>Prévisualiser</span>
                    </div>
                  )}
                </button>
              </div>

              <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5" style={{ color: '#3b82f6' }} />
                  <p className="text-xs" style={{ color: '#93bbfe' }}>
                    Les fichiers seront générés au format XBRL conforme aux exigences de la BCE.
                    Un rapport Excel sera également disponible pour révision interne.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de prévisualisation */}
        {showPreview && previewData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div 
              className="rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: '#1e293b' }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                  Prévisualisation du rapport COREP
                </h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" style={{ color: '#94a3b8' }} />
                </button>
              </div>

              {/* Informations générales */}
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#0f172a' }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>Date de reporting</p>
                    <p className="font-semibold" style={{ color: '#ffffff' }}>{previewData.reportingDate}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>Institution</p>
                    <p className="font-semibold" style={{ color: '#ffffff' }}>{previewData.institution}</p>
                  </div>
                </div>
              </div>

              {/* Statut de validation */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#ffffff' }}>
                  Statut de validation
                </h3>
                <div className="flex items-center gap-4">
                  {previewData.hasErrors ? (
                    <div className="flex items-center gap-2 text-red-500">
                      <XCircle className="h-5 w-5" />
                      <span>Erreurs détectées</span>
                    </div>
                  ) : previewData.hasWarnings ? (
                    <div className="flex items-center gap-2 text-yellow-500">
                      <AlertCircle className="h-5 w-5" />
                      <span>Avertissements</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircle className="h-5 w-5" />
                      <span>Prêt pour soumission</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Templates et données */}
              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#ffffff' }}>
                  Templates inclus ({previewData.templates.length})
                </h3>
                <div className="space-y-4">
                  {previewData.templates.map((template: any, index: number) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: '#0f172a' }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold" style={{ color: '#ffffff' }}>
                            {template.code} - {template.name}
                          </h4>
                        </div>
                        <span 
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: template.status === 'ready' ? '#d1fae5' : 
                                           template.status === 'pending' ? '#fef3c7' : '#f3f4f6',
                            color: template.status === 'ready' ? '#065f46' :
                                  template.status === 'pending' ? '#92400e' : '#374151'
                          }}
                        >
                          {template.status === 'ready' ? 'Prêt' :
                           template.status === 'pending' ? 'En attente' : 'Brouillon'}
                        </span>
                      </div>
                      
                      {/* Aperçu des données */}
                      <div className="mt-3 space-y-1">
                        {Object.entries(template.data).map(([section, values]: [string, any]) => (
                          <div key={section}>
                            {values.slice(0, 2).map((item: any, idx: number) => (
                              <div 
                                key={idx} 
                                className="flex justify-between text-sm"
                                style={{ color: '#94a3b8' }}
                              >
                                <span>{item.description}</span>
                                <span className="font-mono">{item.value} {item.currency}</span>
                              </div>
                            ))}
                            {values.length > 2 && (
                              <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                                ... et {values.length - 2} autres lignes
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: '#374151', color: '#ffffff' }}
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    generateExport();
                  }}
                  disabled={previewData.hasErrors}
                  className="px-4 py-2 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: previewData.hasErrors ? '#6B7280' : '#10b981',
                    color: '#ffffff',
                    cursor: previewData.hasErrors ? 'not-allowed' : 'pointer'
                  }}
                >
                  Procéder à l'export
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};