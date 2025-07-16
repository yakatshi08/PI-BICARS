import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  FileText, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2,
  Calendar,
  Download,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  Upload
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  generatePDFReport,
  generateExcelReport,
  validateReportData,
  autoGenerateReport,
  regulatoryTemplates,
  ReportData
} from '../../../utils/reportGenerators/regulatoryReports';
// Ajout des imports ML
import { 
  enrichReportWithMLInsights, 
  MLPrediction, 
  AnomalyAlert 
} from '../../../utils/mlReportIntegration';

interface ReportsComplianceProps {
  sector: string;
}

export const ReportsCompliance: React.FC<ReportsComplianceProps> = ({ sector }) => {
  // États existants
  const [selectedReport, setSelectedReport] = useState('monthly');
  const [complianceScore, setComplianceScore] = useState(0);
  const [reportData, setReportData] = useState<any[]>([]);
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [regulatoryMetrics, setRegulatoryMetrics] = useState<any[]>([]);

  // Nouveaux états pour la génération de rapports
  const [selectedReportType, setSelectedReportType] = useState<'COREP' | 'FINREP' | 'SOLVENCY_II' | 'BASEL_III'>('COREP');
  const [reportPeriod, setReportPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [entityName, setEntityName] = useState('My Financial Institution');
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null);
  const [validationResults, setValidationResults] = useState<{ isValid: boolean; errors: string[]; warnings: string[] } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Nouveaux états pour l'intégration ML
  const [mlPredictions, setMlPredictions] = useState<MLPrediction[]>([]);
  const [mlAlerts, setMlAlerts] = useState<AnomalyAlert[]>([]);
  const [mlDataTimestamp, setMlDataTimestamp] = useState<string | null>(null);

  useEffect(() => {
    // Générer des données selon le secteur
    if (sector === 'banking') {
      setReportData([
        { month: 'Jan', corep: 95, finrep: 98, basel: 92 },
        { month: 'Feb', corep: 96, finrep: 97, basel: 93 },
        { month: 'Mar', corep: 97, finrep: 98, basel: 94 },
        { month: 'Apr', corep: 98, finrep: 99, basel: 95 },
        { month: 'May', corep: 97, finrep: 98, basel: 96 },
        { month: 'Jun', corep: 98, finrep: 99, basel: 97 }
      ]);
      
      setComplianceData([
        { name: 'COREP', value: 98, status: 'compliant' },
        { name: 'FINREP', value: 99, status: 'compliant' },
        { name: 'Basel III', value: 95, status: 'compliant' },
        { name: 'IFRS 9', value: 87, status: 'warning' }
      ]);
      
      setRegulatoryMetrics([
        { metric: 'CET1 Ratio', value: 14.5, requirement: 4.5, buffer: 2.5 },
        { metric: 'Tier 1 Ratio', value: 16.2, requirement: 6.0, buffer: 2.5 },
        { metric: 'Total Capital Ratio', value: 18.7, requirement: 8.0, buffer: 2.5 },
        { metric: 'LCR', value: 142, requirement: 100, buffer: 0 },
        { metric: 'NSFR', value: 118, requirement: 100, buffer: 0 }
      ]);
    } else {
      setReportData([
        { month: 'Jan', solvency: 165, qrt: 96, orsa: 92 },
        { month: 'Feb', solvency: 168, qrt: 97, orsa: 93 },
        { month: 'Mar', solvency: 172, qrt: 98, orsa: 94 },
        { month: 'Apr', solvency: 170, qrt: 98, orsa: 95 },
        { month: 'May', solvency: 175, qrt: 99, orsa: 96 },
        { month: 'Jun', solvency: 178, qrt: 99, orsa: 97 }
      ]);
      
      setComplianceData([
        { name: 'Solvency II', value: 98, status: 'compliant' },
        { name: 'QRT', value: 99, status: 'compliant' },
        { name: 'ORSA', value: 96, status: 'compliant' },
        { name: 'Pillar 3', value: 94, status: 'compliant' }
      ]);
      
      setRegulatoryMetrics([
        { metric: 'SCR Ratio', value: 178, requirement: 100, buffer: 50 },
        { metric: 'MCR Ratio', value: 412, requirement: 25, buffer: 0 },
        { metric: 'Own Funds', value: 890, requirement: 500, buffer: 0 },
        { metric: 'Tier 1', value: 750, requirement: 400, buffer: 0 },
        { metric: 'Tier 2', value: 120, requirement: 0, buffer: 0 }
      ]);
    }
    
    // Calculer le score de conformité global
    const avgCompliance = complianceData.reduce((acc, item) => acc + item.value, 0) / complianceData.length;
    setComplianceScore(Math.round(avgCompliance));
  }, [sector]);

  // Fonction pour importer les données ML
  const importMLData = () => {
    const predictions = localStorage.getItem('ml_predictions');
    const alerts = localStorage.getItem('ml_alerts');
    const timestamp = localStorage.getItem('ml_export_timestamp');
    
    if (predictions && alerts) {
      setMlPredictions(JSON.parse(predictions));
      setMlAlerts(JSON.parse(alerts));
      setMlDataTimestamp(timestamp || new Date().toISOString());
      alert('ML data imported successfully!');
    } else {
      alert('No ML data available. Please run ML analysis first.');
    }
  };

  // Génération de rapport enrichie avec les insights ML
  const handleGenerateReportEnhanced = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const report = autoGenerateReport(
        sector as 'banking' | 'insurance',
        {
          // Pour banking
          cet1Capital: 150000000,
          at1Capital: 50000000,
          t2Capital: 30000000,
          totalCapital: 230000000,
          rwa: 2000000000,
          cet1Ratio: 0.075,
          tier1Ratio: 0.10,
          totalCapitalRatio: 0.115,
          creditRisk: 1600000000,
          marketRisk: 200000000,
          operationalRisk: 200000000,
          // Pour insurance
          totalAssets: 5000000000,
          technicalProvisions: 3500000000,
          otherLiabilities: 500000000,
          ownFunds: 1000000000,
          tier1: 800000000,
          tier2: 150000000,
          tier3: 50000000,
          eligibleOwnFunds: 1000000000,
          scr: 600000000,
          mcr: 150000000,
          marketRisk: 200000000,
          defaultRisk: 150000000,
          lifeRisk: 100000000,
          healthRisk: 50000000,
          nonLifeRisk: 100000000
        },
        reportPeriod,
        entityName
      );
      
      // Enrichir le rapport avec les insights ML si disponibles
      const enhancedReport = mlPredictions.length > 0 
        ? enrichReportWithMLInsights(report, mlPredictions, mlAlerts)
        : report;
      
      setGeneratedReport(enhancedReport);
      
      const validation = validateReportData(enhancedReport);
      setValidationResults(validation);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = () => {
    if (!generatedReport) return;
    
    const blob = generatePDFReport(generatedReport);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedReport.type}_${reportPeriod}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    if (!generatedReport) return;
    
    const blob = generateExcelReport(generatedReport);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedReport.type}_${reportPeriod}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Reports & Compliance</h2>
      
      {/* Score de conformité global */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Overall Compliance Score
          </h3>
          <div className="text-3xl font-bold text-green-600">{complianceScore}%</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-green-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${complianceScore}%` }}
          />
        </div>
      </Card>

      {/* Section ML Integration */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            ML Analytics Integration
          </h3>
          <button
            onClick={importMLData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import ML Data
          </button>
        </div>
        
        {mlDataTimestamp && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Last import: {new Date(mlDataTimestamp).toLocaleString()}
            </p>
            
            {/* Affichage des prédictions ML */}
            {mlPredictions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">ML Predictions</h4>
                  <div className="space-y-2">
                    {mlPredictions.map((pred, idx) => (
                      <div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                        <span>{pred.metric}</span>
                        <span className={`font-medium ${
                          pred.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {pred.predicted.toFixed(2)} ({pred.trend})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Risk Alerts ({mlAlerts.length})</h4>
                  <div className="space-y-2">
                    {mlAlerts.slice(0, 3).map((alert, idx) => (
                      <div key={idx} className={`text-sm p-2 rounded ${
                        alert.severity === 'high' ? 'bg-red-50' : 
                        alert.severity === 'medium' ? 'bg-yellow-50' : 'bg-blue-50'
                      }`}>
                        <div className="font-medium">{alert.metric}</div>
                        <div className="text-xs">{alert.recommendation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Métriques réglementaires */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Regulatory Metrics</h3>
        <div className="space-y-4">
          {regulatoryMetrics.map((metric, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{metric.metric}</span>
                <span className="font-medium">{metric.value}%</span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-2">
                <div
                  className="absolute bg-red-500 h-2 rounded-full"
                  style={{ width: `${metric.requirement}%`, maxWidth: '100%' }}
                />
                {metric.buffer > 0 && (
                  <div
                    className="absolute bg-yellow-500 h-2 rounded-full"
                    style={{
                      left: `${metric.requirement}%`,
                      width: `${metric.buffer}%`,
                      maxWidth: `${100 - metric.requirement}%`
                    }}
                  />
                )}
                <div
                  className="absolute bg-green-500 h-2 rounded-full"
                  style={{ width: `${Math.min(metric.value, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Min: {metric.requirement}%</span>
                {metric.buffer > 0 && <span>Buffer: {metric.buffer}%</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Évolution de la conformité */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Compliance Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={reportData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            {sector === 'banking' ? (
              <>
                <Line type="monotone" dataKey="corep" stroke="#6366f1" name="COREP" />
                <Line type="monotone" dataKey="finrep" stroke="#8b5cf6" name="FINREP" />
                <Line type="monotone" dataKey="basel" stroke="#ec4899" name="Basel III" />
              </>
            ) : (
              <>
                <Line type="monotone" dataKey="solvency" stroke="#6366f1" name="Solvency II" />
                <Line type="monotone" dataKey="qrt" stroke="#8b5cf6" name="QRT" />
                <Line type="monotone" dataKey="orsa" stroke="#ec4899" name="ORSA" />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* État de conformité par catégorie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Compliance by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={complianceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {complianceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Compliance Status</h3>
          <div className="space-y-4">
            {complianceData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  {item.status === 'compliant' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  )}
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className={`text-sm font-semibold ${
                  item.status === 'compliant' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Section Génération de Rapports Réglementaires */}
      <div className="mt-8 space-y-6">
        <h3 className="text-lg font-semibold mb-4">Regulatory Report Generator</h3>
        
        {/* Configuration du rapport */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value as any)}
              className="w-full p-2 border rounded-lg"
            >
              {sector === 'banking' ? (
                <>
                  <option value="COREP">COREP</option>
                  <option value="FINREP">FINREP</option>
                  <option value="BASEL_III">Basel III</option>
                </>
              ) : (
                <option value="SOLVENCY_II">Solvency II</option>
              )}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Period</label>
            <input
              type="month"
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Entity Name</label>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              placeholder="Institution name"
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>
        
        {/* Bouton de génération */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerateReportEnhanced}
            disabled={isGenerating}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
              isGenerating 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
        
        {/* Résultats de validation */}
        {validationResults && (
          <div className={`p-4 rounded-lg ${validationResults.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              {validationResults.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`font-medium ${validationResults.isValid ? 'text-green-800' : 'text-red-800'}`}>
                Validation {validationResults.isValid ? 'Passed' : 'Failed'}
              </span>
            </div>
            
            {validationResults.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-red-700">Errors:</p>
                <ul className="list-disc list-inside text-sm text-red-600">
                  {validationResults.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validationResults.warnings.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-yellow-700">Warnings:</p>
                <ul className="list-disc list-inside text-sm text-yellow-600">
                  {validationResults.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Boutons d'export */}
        {generatedReport && (
          <div className="flex justify-center gap-4">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        )}
        
        {/* Aperçu du rapport généré */}
        {generatedReport && (
          <div className="mt-6 p-6 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-4">Report Preview: {generatedReport.type}</h4>
            <div className="space-y-4">
              {Object.entries(regulatoryTemplates[generatedReport.type]).map(([key, section]: [string, any]) => (
                <div key={key} className="bg-white p-4 rounded-lg shadow-sm">
                  <h5 className="font-medium text-gray-700 mb-2">{section.name}</h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {section.fields.map((field: string) => (
                      <div key={field} className="flex justify-between">
                        <span className="text-gray-600">{field}:</span>
                        <span className="font-medium">
                          {generatedReport.data[key]?.[field] || 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};