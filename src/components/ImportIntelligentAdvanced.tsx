import React, { useState, useCallback, useRef } from 'react';
import {
  Upload, FileText, AlertCircle, CheckCircle, 
  Download, RefreshCw, Zap, Database, Cloud,
  FileSpreadsheet, FileImage, Link, Eye,
  X, ChevronRight, Settings, Loader, Wifi
} from 'lucide-react';
import { useStore } from '../store';
import { useDropzone } from 'react-dropzone';

interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  extractedData?: any;
  ocrText?: string;
  preview?: string;
}

interface APIConnection {
  id: string;
  name: string;
  type: 'bloomberg' | 'refinitiv' | 'ecb' | 'custom';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  dataPoints?: number;
}

export const ImportIntelligentAdvanced: React.FC = () => {
  const { darkMode } = useStore();
  const [files, setFiles] = useState<FileData[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'ocr' | 'api'>('upload');
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Connexions API simulées
  const [apiConnections] = useState<APIConnection[]>([
    {
      id: '1',
      name: 'Bloomberg Terminal',
      type: 'bloomberg',
      status: 'connected',
      lastSync: '2025-01-24T15:30:00',
      dataPoints: 1250
    },
    {
      id: '2',
      name: 'Refinitiv Eikon',
      type: 'refinitiv',
      status: 'connected',
      lastSync: '2025-01-24T15:45:00',
      dataPoints: 890
    },
    {
      id: '3',
      name: 'ECB Statistical Warehouse',
      type: 'ecb',
      status: 'disconnected',
      lastSync: '2025-01-24T10:00:00',
      dataPoints: 450
    }
  ]);

  // Simulation OCR pour PDF
  const performOCR = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulation de texte extrait selon le type de document
        const ocrTexts = {
          financial: `RAPPORT FINANCIER ANNUEL 2024
          
Chiffre d'affaires : 125.4M EUR (+12.3%)
EBITDA : 45.2M EUR (36% marge)
Résultat net : 28.7M EUR

BILAN CONSOLIDE AU 31/12/2024
Actifs totaux : 890.5M EUR
- Actifs courants : 234.6M EUR
- Actifs non courants : 655.9M EUR

Capitaux propres : 456.8M EUR
Dettes financières : 234.7M EUR
Ratio d'endettement : 51.4%

RATIOS FINANCIERS CLES
ROE : 15.8%
ROA : 8.2%
Current Ratio : 1.45
Quick Ratio : 1.12`,
          
          regulatory: `DOCUMENT REGLEMENTAIRE BCE
          
Template C 01.00 - Fonds propres
CET1 Capital : 142.5M EUR
Tier 1 Capital : 165.0M EUR
Total Capital : 189.5M EUR

Template C 03.00 - Ratios de solvabilité
CET1 Ratio : 14.8%
Tier 1 Ratio : 17.1%
Total Capital Ratio : 19.7%

Risk Weighted Assets : 963.2M EUR`,

          contract: `CONTRAT DE PRET BANCAIRE
          
Montant : 50,000,000 EUR
Durée : 7 ans
Taux : EURIBOR 3M + 2.25%
Commission d'arrangement : 0.50%

COVENANTS FINANCIERS
- Leverage Ratio < 3.5x
- Interest Coverage > 4.0x
- Minimum Liquidity : 25M EUR`
        };

        const randomType = ['financial', 'regulatory', 'contract'][Math.floor(Math.random() * 3)] as keyof typeof ocrTexts;
        resolve(ocrTexts[randomType]);
      }, 3000);
    });
  };

  // Upload avec drag & drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: FileData[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading' as const,
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulation du traitement
    for (const [index, file] of acceptedFiles.entries()) {
      const fileId = newFiles[index].id;
      
      // Upload progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress: i } : f
        ));
      }

      // Processing
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'processing' } : f
      ));

      // OCR pour les PDFs
      if (file.type === 'application/pdf') {
        const ocrText = await performOCR(file);
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { 
            ...f, 
            status: 'completed',
            ocrText,
            extractedData: parseOCRData(ocrText)
          } : f
        ));
      } else {
        // Autres types de fichiers
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { 
            ...f, 
            status: 'completed',
            extractedData: generateMockData(file.type)
          } : f
        ));
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'image/*': ['.png', '.jpg', '.jpeg']
    }
  });

  // Parser les données OCR
  const parseOCRData = (text: string): any => {
    const data: any = {};
    
    // Extraction des montants
    const amountRegex = /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(M|K)?\s*EUR/gi;
    const amounts = text.match(amountRegex) || [];
    data.amounts = amounts;

    // Extraction des pourcentages
    const percentRegex = /(\d{1,3}(?:[.,]\d{1,2})?)\s*%/g;
    const percentages = text.match(percentRegex) || [];
    data.percentages = percentages;

    // Extraction des ratios
    const ratioRegex = /(?:ratio|margin|roe|roa|coverage)\s*:?\s*(\d{1,3}(?:[.,]\d{1,2})?)/gi;
    const ratios = text.match(ratioRegex) || [];
    data.ratios = ratios;

    return data;
  };

  // Générer des données mock
  const generateMockData = (fileType: string): any => {
    if (fileType.includes('sheet') || fileType === 'text/csv') {
      return {
        rows: 1250,
        columns: 45,
        sheets: ['Balance Sheet', 'P&L', 'Cash Flow'],
        summary: {
          revenue: 125400000,
          profit: 28700000,
          assets: 890500000
        }
      };
    }
    return { message: 'File processed successfully' };
  };

  // Synchroniser avec API
  const syncWithAPI = async (apiId: string) => {
    const api = apiConnections.find(a => a.id === apiId);
    if (!api) return;

    // Simulation de synchronisation
    alert(`Synchronisation avec ${api.name} en cours...`);
    
    setTimeout(() => {
      alert(`✅ Synchronisation terminée !\n\nNouveaux points de données : ${Math.floor(Math.random() * 500) + 100}`);
    }, 2000);
  };

  // Interface OCR avancée
  const renderOCRInterface = () => (
    <div className="space-y-6">
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          OCR Avancé pour PDF
        </h3>
        
        {files.filter(f => f.type === 'application/pdf').length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <FileImage className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Aucun PDF importé. Veuillez d'abord importer un fichier PDF.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {files.filter(f => f.type === 'application/pdf').map(file => (
              <div 
                key={file.id}
                className={`p-4 rounded-lg border-2 ${
                  darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                } cursor-pointer transition-all`}
                onClick={() => {
                  setSelectedFile(file);
                  setShowPreview(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-red-500" />
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {file.name}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.ocrText && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        OCR terminé
                      </span>
                    )}
                    <Eye className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                </div>
                
                {file.extractedData && (
                  <div className={`mt-3 p-3 rounded ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Données extraites :
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Montants :</span>
                        <span className={`ml-1 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {file.extractedData.amounts?.length || 0}
                        </span>
                      </div>
                      <div>
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Ratios :</span>
                        <span className={`ml-1 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {file.extractedData.percentages?.length || 0}
                        </span>
                      </div>
                      <div>
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Indicateurs :</span>
                        <span className={`ml-1 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {file.extractedData.ratios?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Interface APIs temps réel
  const renderAPIInterface = () => (
    <div className="space-y-6">
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Connexions API Temps Réel
          </h3>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurer
          </button>
        </div>
        
        <div className="space-y-4">
          {apiConnections.map(api => (
            <div 
              key={api.id}
              className={`p-4 rounded-lg border-2 ${
                api.status === 'connected' 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : api.status === 'error'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    api.status === 'connected' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {api.type === 'bloomberg' ? (
                      <Database className="h-6 w-6 text-orange-600" />
                    ) : api.type === 'refinitiv' ? (
                      <Cloud className="h-6 w-6 text-blue-600" />
                    ) : (
                      <Wifi className="h-6 w-6 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {api.name}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {api.status === 'connected' 
                        ? `Dernière sync : ${new Date(api.lastSync!).toLocaleString('fr-FR')}`
                        : 'Non connecté'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {api.dataPoints && (
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {api.dataPoints.toLocaleString()}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        points de données
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => syncWithAPI(api.id)}
                    disabled={api.status !== 'connected'}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      api.status === 'connected'
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {api.status === 'connected' && (
                <div className={`mt-4 grid grid-cols-4 gap-4 pt-4 border-t ${
                  darkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Taux de change
                    </p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <span className="text-green-600">↑</span> EUR/USD 1.0845
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Indices
                    </p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <span className="text-red-600">↓</span> CAC40 -0.45%
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Obligations
                    </p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      OAT 10Y 3.12%
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Commodités
                    </p>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <span className="text-green-600">↑</span> Gold +1.2%
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border border-blue-500`}>
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Flux de données temps réel
              </p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Les APIs connectées fournissent des données de marché en temps réel avec une latence &lt; 100ms.
                Les données sont automatiquement intégrées dans vos dashboards et analyses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Import Intelligent Avancé
          </h1>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            OCR avancé pour PDF et connexions API temps réel
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          {(['upload', 'ocr', 'api'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium rounded-t-lg transition-all ${
                activeTab === tab
                  ? darkMode 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-white text-gray-900'
                  : darkMode
                    ? 'bg-gray-800/50 text-gray-400 hover:text-white'
                    : 'bg-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'upload' ? 'Import de fichiers' :
               tab === 'ocr' ? 'OCR PDF' : 'APIs Temps Réel'}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'upload' && (
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : darkMode
                    ? 'border-gray-700 hover:border-gray-600'
                    : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className={`h-12 w-12 mx-auto mb-4 ${
                isDragActive ? 'text-indigo-500' : darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <p className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {isDragActive ? 'Déposez les fichiers ici' : 'Glissez-déposez vos fichiers ici'}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                ou cliquez pour sélectionner (PDF, Excel, CSV, Images)
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-6 space-y-3">
                {files.map(file => (
                  <div 
                    key={file.id}
                    className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className={`h-8 w-8 ${
                          file.type === 'application/pdf' ? 'text-red-500' :
                          file.type.includes('sheet') ? 'text-green-500' :
                          'text-blue-500'
                        }`} />
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {file.name}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {file.status === 'uploading' && (
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-600 transition-all"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-500">{file.progress}%</span>
                          </div>
                        )}
                        {file.status === 'processing' && (
                          <div className="flex items-center gap-2 text-yellow-600">
                            <Loader className="h-5 w-5 animate-spin" />
                            <span className="text-sm">Traitement...</span>
                          </div>
                        )}
                        {file.status === 'completed' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ocr' && renderOCRInterface()}
        {activeTab === 'api' && renderAPIInterface()}

        {/* Modal de prévisualisation OCR */}
        {showPreview && selectedFile && selectedFile.ocrText && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div 
              className={`rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Résultat OCR - {selectedFile.name}
                </h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Texte extrait
                  </h3>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} font-mono text-sm whitespace-pre-wrap`}>
                    {selectedFile.ocrText}
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Données structurées
                  </h3>
                  <div className="space-y-4">
                    {selectedFile.extractedData && (
                      <>
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                          <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Montants détectés
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedFile.extractedData.amounts?.map((amount: string, idx: number) => (
                              <span 
                                key={idx}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                              >
                                {amount}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                          <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Pourcentages et ratios
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedFile.extractedData.percentages?.map((percent: string, idx: number) => (
                              <span 
                                key={idx}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                              >
                                {percent}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                          Exporter vers Dashboard
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};