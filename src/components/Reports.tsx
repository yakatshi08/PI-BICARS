import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, Eye, Shield, CheckCircle, AlertCircle, Clock, FileCheck, Lock, TrendingUp, Briefcase, RefreshCw, Send, X, Loader, ChevronRight, BarChart3 } from 'lucide-react';
import { useReportGeneration, useComplianceDashboard, useReportTemplates, useAuditTrail, useRegulatoryCalendar } from '../hooks/useReports';
import { useDatasets } from '../hooks/useDatasets';

interface ReportsProps {
  isDarkMode: boolean;
}

const Reports: React.FC<ReportsProps> = ({ isDarkMode }) => {
  const { generateReport, downloadReport, generating, report } = useReportGeneration();
  const { compliance, loading: complianceLoading, refresh: refreshCompliance } = useComplianceDashboard();
  const { templates, loading: templatesLoading } = useReportTemplates();
  const { auditLogs, fetchAuditTrail } = useAuditTrail();
  const { calendar, loading: calendarLoading } = useRegulatoryCalendar();
  const { datasets } = useDatasets(false);

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [reportConfig, setReportConfig] = useState({
    period_start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    period_end: new Date(),
    blockchain_audit: true
  });
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Rapports existants
  const reports = [
    {
      title: "Rapport Mensuel - Décembre 2024",
      type: "Mensuel",
      date: "31/12/2024",
      status: "Complété",
      size: "2.4 MB",
      icon: FileText,
    },
    {
      title: "Analyse Trimestrielle Q4 2024",
      type: "Trimestriel",
      date: "31/12/2024",
      status: "En cours",
      size: "5.1 MB",
      icon: TrendingUp,
    },
    {
      title: "Rapport Annuel 2024",
      type: "Annuel",
      date: "15/01/2025",
      status: "Brouillon",
      size: "12.3 MB",
      icon: Briefcase,
    },
    {
      title: "Synthèse Executive",
      type: "Ad-hoc",
      date: "10/01/2025",
      status: "Complété",
      size: "1.2 MB",
      icon: FileCheck,
    },
    {
      title: "Rapport de Conformité",
      type: "Réglementaire",
      date: "05/01/2025",
      status: "Validé",
      size: "3.7 MB",
      icon: Shield,
    },
    {
      title: "Analyse des Risques",
      type: "Risque",
      date: "20/12/2024",
      status: "Complété",
      size: "4.5 MB",
      icon: AlertCircle,
    },
  ];

  // Gestionnaire pour générer un rapport
  const handleGenerateReport = async () => {
    if (!selectedTemplate || selectedDatasets.length === 0) {
      alert('Veuillez sélectionner un template et au moins un dataset');
      return;
    }

    try {
      await generateReport({
        report_type: selectedTemplate,
        dataset_ids: selectedDatasets,
        period_start: reportConfig.period_start,
        period_end: reportConfig.period_end,
        blockchain_audit: reportConfig.blockchain_audit
      });
      
      setShowGenerateModal(false);
      // Réinitialiser
      setSelectedTemplate('');
      setSelectedDatasets([]);
    } catch (err) {
      console.error('Erreur génération rapport:', err);
    }
  };

  // Toggle dataset selection
  const toggleDatasetSelection = (datasetId: string) => {
    setSelectedDatasets(prev => 
      prev.includes(datasetId)
        ? prev.filter(id => id !== datasetId)
        : [...prev, datasetId]
    );
  };

  // Charger l'audit trail
  const handleShowAudit = async () => {
    await fetchAuditTrail({
      start_date: new Date(new Date().setMonth(new Date().getMonth() - 3)),
      end_date: new Date()
    });
    setShowAuditModal(true);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Rapports & Conformité
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Générer un rapport
            </button>
            <button
              onClick={refreshCompliance}
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

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select className={`px-4 py-2 rounded-lg ${
          isDarkMode 
            ? 'bg-gray-700 text-white' 
            : 'bg-white text-gray-800'
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}>
          <option>Tous les types</option>
          <option>Mensuel</option>
          <option>Trimestriel</option>
          <option>Annuel</option>
          <option>Réglementaire</option>
        </select>
        
        <select className={`px-4 py-2 rounded-lg ${
          isDarkMode 
            ? 'bg-gray-700 text-white' 
            : 'bg-white text-gray-800'
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}>
          <option>Tous les statuts</option>
          <option>Complété</option>
          <option>En cours</option>
          <option>Brouillon</option>
          <option>Validé</option>
        </select>
        
        <div className="flex items-center gap-2">
          <Calendar className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="date"
            className={`px-4 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-gray-700 text-white' 
                : 'bg-white text-gray-800'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      {/* Rapports existants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {reports.map((report, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <report.icon className={`w-10 h-10 ${
                report.type === 'Réglementaire' ? 'text-purple-500' :
                report.type === 'Risque' ? 'text-red-500' :
                'text-blue-500'
              }`} />
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                report.status === 'Complété' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : report.status === 'En cours'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : report.status === 'Validé'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}>
                {report.status}
              </span>
            </div>
            
            <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {report.title}
            </h3>
            
            <div className={`text-sm space-y-1 mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>Type: {report.type}</p>
              <p>Date: {report.date}</p>
              <p>Taille: {report.size}</p>
            </div>
            
            <div className="flex gap-2">
              <button className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors`}>
                <Eye className="w-4 h-4" />
                Voir
              </button>
              <button className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors`}>
                <Download className="w-4 h-4" />
                Télécharger
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Séparateur */}
      <div className="flex items-center gap-4 my-8">
        <div className={`flex-1 h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
        <div className="flex items-center gap-2">
          <Shield className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            REPORTING RÉGLEMENTAIRE & CONFORMITÉ
          </span>
        </div>
        <div className={`flex-1 h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
      </div>

      {/* Dashboard de conformité */}
      {complianceLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : compliance && (
        <div className={`p-6 rounded-xl shadow-lg mb-8 border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <BarChart3 className="w-5 h-5 text-green-500" />
            Dashboard de Conformité Réglementaire
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {/* COREP */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  COREP
                </span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="relative pt-1">
                <div className={`overflow-hidden h-2 text-xs flex rounded ${
                  isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}>
                  <div 
                    style={{ width: `${compliance.corep_status?.score || 0}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                  />
                </div>
                <p className={`text-xs mt-1 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {compliance.corep_status?.score || 0}%
                </p>
              </div>
            </div>

            {/* FINREP */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  FINREP
                </span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="relative pt-1">
                <div className={`overflow-hidden h-2 text-xs flex rounded ${
                  isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}>
                  <div 
                    style={{ width: `${compliance.finrep_status?.score || 0}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                  />
                </div>
                <p className={`text-xs mt-1 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {compliance.finrep_status?.score || 0}%
                </p>
              </div>
            </div>

            {/* Bâle III */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Bâle III
                </span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-center">
                <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {compliance.basel3_metrics?.cet1?.value || 0}%
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  CET1
                </p>
              </div>
            </div>

            {/* IFRS 9 */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  IFRS 9
                </span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  Conforme
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ECL OK
                </p>
              </div>
            </div>

            {/* GDPR */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  GDPR
                </span>
                <Shield className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-center">
                <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  100%
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Compliant
                </p>
              </div>
            </div>

            {/* SOC 2 */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  SOC 2
                </span>
                <Lock className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  Type II
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Certifié
                </p>
              </div>
            </div>
          </div>

          {/* Échéances à venir */}
          {compliance.upcoming_deadlines && compliance.upcoming_deadlines.length > 0 && (
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
              <h4 className={`text-sm font-medium mb-2 flex items-center gap-2 ${
                isDarkMode ? 'text-yellow-400' : 'text-yellow-700'
              }`}>
                <Clock className="w-4 h-4" />
                Prochaines échéances
              </h4>
              <div className="space-y-2">
                {compliance.upcoming_deadlines.slice(0, 3).map((deadline, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                      {deadline.type} - {deadline.description}
                    </span>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                      {new Date(deadline.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rapports réglementaires récents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {templatesLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          templates.filter(t => t.category === 'regulatory').map((template) => (
            <div
              key={template.id}
              className={`p-6 rounded-xl shadow-lg border transition-all duration-300 hover:scale-105 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <FileCheck className="w-8 h-8 text-green-500" />
                <button
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setShowGenerateModal(true);
                  }}
                  className="p-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {template.name}
              </h4>
              
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {template.description}
              </p>
              
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Prochain: 31/03/2025
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bouton Audit Trail */}
      <div className="flex justify-end mb-8">
        <button
          onClick={handleShowAudit}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          } transition-colors`}
        >
          <Lock className="w-4 h-4" />
          Voir l'historique d'audit
        </button>
      </div>

      {/* Modal de génération */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Générer un rapport réglementaire
              </h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template selection */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Type de rapport
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-white text-gray-800'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Sélectionner un template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dataset selection */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Datasets à inclure
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {datasets.map((dataset) => (
                  <label
                    key={dataset.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDatasets.includes(dataset.id)}
                      onChange={() => toggleDatasetSelection(dataset.id)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {dataset.name}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {dataset.rows} lignes • Qualité: {dataset.quality_score}%
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Period selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date de début
                </label>
                <input
                  type="date"
                  value={reportConfig.period_start.toISOString().split('T')[0]}
                  onChange={(e) => setReportConfig({
                    ...reportConfig,
                    period_start: new Date(e.target.value)
                  })}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-white text-gray-800'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date de fin
                </label>
                <input
                  type="date"
                  value={reportConfig.period_end.toISOString().split('T')[0]}
                  onChange={(e) => setReportConfig({
                    ...reportConfig,
                    period_end: new Date(e.target.value)
                  })}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-white text-gray-800'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            {/* Options */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reportConfig.blockchain_audit}
                  onChange={(e) => setReportConfig({
                    ...reportConfig,
                    blockchain_audit: e.target.checked
                  })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Activer l'audit blockchain pour la traçabilité
                </span>
              </label>
            </div>

            {/* Rapport généré */}
            {report && (
              <div className={`p-4 rounded-lg mb-6 ${
                isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                        Rapport généré avec succès !
                      </p>
                      {report.blockchain_hash && (
                        <p className={`text-sm ${isDarkMode ? 'text-green-400/80' : 'text-green-600'}`}>
                          Hash blockchain: {report.blockchain_hash.substring(0, 20)}...
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => downloadReport(report.report_id, 'pdf')}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </button>
                </div>
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowGenerateModal(false)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                } transition-colors`}
              >
                Annuler
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={generating || !selectedTemplate || selectedDatasets.length === 0}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  generating || !selectedTemplate || selectedDatasets.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } transition-colors`}
              >
                {generating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Générer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'audit trail */}
      {showAuditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <Lock className="w-5 h-5" />
                Historique d'Audit - Traçabilité Blockchain
              </h3>
              <button
                onClick={() => setShowAuditModal(false)}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {auditLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {log.action || 'Génération rapport'}
                      </p>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                      {log.hash && (
                        <p className={`text-xs mt-2 font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Hash: {log.hash}
                        </p>
                      )}
                    </div>
                    {log.verified && (
                      <CheckCircle className="w-5 h-5 text-green-500" title="Vérifié sur blockchain" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calendrier réglementaire */}
      {calendar && !calendarLoading && (
        <div className={`mt-8 p-6 rounded-xl shadow-lg border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <Calendar className="w-5 h-5 text-blue-500" />
            Calendrier Réglementaire {calendar.year}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-2xl font-bold text-orange-500`}>{calendar.upcoming_30_days}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Échéances 30j
              </p>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-2xl font-bold text-red-500`}>{calendar.overdue}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                En retard
              </p>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-2xl font-bold text-green-500`}>{calendar.completed}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Complétés
              </p>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-2xl font-bold text-blue-500`}>{calendar.deadlines?.length || 0}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total année
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;