import React, { useState, useCallback } from 'react';
import { 
  Upload, FileSpreadsheet, FileText, FileJson, 
  Database, Cloud, Check, AlertCircle, Loader,
  Sparkles, FileCheck, TrendingUp, CreditCard, Shield,
  CheckCircle, Eye, Download, Trash2, ArrowLeft, BarChart3,
  Brain, Info, Activity
} from 'lucide-react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

// Types enrichis pour l'analyse
interface FileAnalysis {
  dataQuality: {
    completeness: number;
    validity: number;
    consistency: number;
  };
  confidence: number;
  recommendations: string[];
  detectedColumns?: string[];
  rowCount?: number;
}

interface EnhancedFile {
  id: number;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'analyzing' | 'success' | 'error';
  detectedType: 'banking' | 'insurance' | 'generic';
  suggestedKPIs: string[];
  suggestedModule: string;
  analysis?: FileAnalysis;
}

export const DataImport: React.FC = () => {
  const { darkMode, selectedSector } = useStore();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<EnhancedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // États pour la barre de progression
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
  };

  // Détection améliorée du type de données
  const detectDataType = async (file: File): Promise<'banking' | 'insurance' | 'generic'> => {
    const text = await file.text();
    const lowerContent = text.toLowerCase();
    
    // Détection basée sur mots-clés étendus
    const bankingKeywords = [
      'cet1', 'lcr', 'nsfr', 'basel', 'corep', 'finrep', 'tier1', 'rwa',
      'capital ratio', 'liquidity', 'net interest', 'non performing', 'deposits'
    ];
    const insuranceKeywords = [
      'scr', 'mcr', 'solvency', 'combined ratio', 'loss ratio', 'premium', 'claims',
      'underwriting', 'reinsurance', 'actuarial', 'technical provisions'
    ];
    
    let bankingScore = 0;
    let insuranceScore = 0;
    
    bankingKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) bankingScore++;
    });
    
    insuranceKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) insuranceScore++;
    });
    
    if (bankingScore > insuranceScore * 1.5) return 'banking';
    if (insuranceScore > bankingScore * 1.5) return 'insurance';
    
    return 'generic';
  };

  // Analyse enrichie du fichier
  const analyzeFileContent = async (file: File): Promise<FileAnalysis> => {
    // Simulation d'analyse approfondie
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      dataQuality: {
        completeness: Math.floor(Math.random() * 20) + 80,
        validity: Math.floor(Math.random() * 15) + 85,
        consistency: Math.floor(Math.random() * 25) + 75
      },
      confidence: Math.floor(Math.random() * 20) + 80,
      recommendations: [
        'Format de données reconnu et compatible',
        'Colonnes principales identifiées correctement',
        'Prêt pour l\'analyse des ratios prudentiels'
      ],
      detectedColumns: ['date', 'cet1_ratio', 'lcr', 'npl_ratio', 'nsfr'],
      rowCount: Math.floor(Math.random() * 1000) + 100
    };
  };

  const getSuggestedKPIs = (dataType: string): string[] => {
    switch (dataType) {
      case 'banking':
        return ['CET1 Ratio', 'LCR', 'NSFR', 'NPL Ratio', 'ROE', 'NII'];
      case 'insurance':
        return ['SCR Coverage', 'Combined Ratio', 'Loss Ratio', 'Expense Ratio', 'Premium Growth', 'MCR'];
      default:
        return ['Revenue', 'Profit Margin', 'Growth Rate', 'Market Share'];
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      handleFiles(newFiles);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files);
      handleFiles(newFiles);
    }
  };

  // Fonction handleFiles améliorée avec analyse
  const handleFiles = async (newFiles: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploading(true);
    
    const totalSize = newFiles.reduce((sum, file) => sum + file.size, 0);
    let uploadedSize = 0;

    const processedFiles = await Promise.all(
      newFiles.map(async (file) => {
        const dataType = await detectDataType(file);
        
        return new Promise<EnhancedFile>((resolve) => {
          const fileId = Date.now() + Math.random();
          
          const simulateUpload = async () => {
            if (uploadedSize < totalSize) {
              uploadedSize += file.size / 10;
              const percent = Math.min(100, Math.round((uploadedSize / totalSize) * 100));
              setUploadProgress(percent);
              
              if (uploadedSize < totalSize) {
                setTimeout(simulateUpload, 100);
              } else {
                // Analyse du fichier après upload
                const analysis = await analyzeFileContent(file);
                
                resolve({
                  id: fileId,
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  status: 'success',
                  detectedType: dataType,
                  suggestedKPIs: getSuggestedKPIs(dataType),
                  suggestedModule: dataType === 'banking' ? 'Banking Core Module' : 
                                  dataType === 'insurance' ? 'Insurance Core Module' : 
                                  'Analytics Module',
                  analysis
                });
              }
            }
          };
          simulateUpload();
        });
      })
    );
    
    setFiles(prev => [...prev, ...processedFiles]);
    setUploading(false);
    setIsUploading(false);
    setUploadProgress(100);
    
    // Auto-sélectionner le premier fichier pour analyse
    if (processedFiles.length > 0) {
      setSelectedFile(processedFiles[0].id);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    } else if (fileName.endsWith('.csv')) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    } else if (fileName.endsWith('.json')) {
      return <FileJson className="h-5 w-5 text-orange-600" />;
    }
    return <FileText className="h-5 w-5 text-gray-600" />;
  };

  const selectedFileData = files.find(f => f.id === selectedFile);

  return (
    <div className={classNames(
      'min-h-screen',
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/modules-sectoriels')}
            className={classNames(
              'mr-4 p-2 rounded-lg transition-colors',
              darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
            )}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Upload className="h-8 w-8 text-indigo-600 mr-3" />
          <div>
            <h1 className={classNames(
              'text-3xl font-bold',
              darkMode ? 'text-white' : 'text-gray-900'
            )}>
              Import de Données Intelligent
            </h1>
            <p className={classNames(
              'text-sm mt-1',
              darkMode ? 'text-gray-400' : 'text-gray-600'
            )}>
              Détection automatique du secteur et configuration intelligente
            </p>
          </div>
        </div>

        {/* Smart Insights */}
        <div className={classNames(
          'mb-6 p-4 rounded-lg flex items-start space-x-3',
          darkMode ? 'bg-indigo-900/20 border border-indigo-700' : 'bg-indigo-50 border border-indigo-200'
        )}>
          <Sparkles className="h-5 w-5 text-indigo-600 mt-0.5" />
          <div>
            <p className={classNames(
              'text-sm font-medium',
              darkMode ? 'text-indigo-300' : 'text-indigo-900'
            )}>
              Intelligence PI BICARS activée
            </p>
            <p className={classNames(
              'text-sm mt-1',
              darkMode ? 'text-indigo-400' : 'text-indigo-700'
            )}>
              Notre IA détecte automatiquement si vos données sont Banking ou Insurance et configure les KPIs appropriés.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Zone d'upload (2/3 de l'espace) */}
          <div className="lg:col-span-2">
            {/* Upload Zone */}
            <div
              className={classNames(
                'relative border-2 border-dashed rounded-lg p-12 text-center transition-all',
                dragActive 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                  : darkMode 
                    ? 'border-gray-600 bg-gray-800' 
                    : 'border-gray-300 bg-white'
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                onChange={handleFileInput}
                accept=".xlsx,.xls,.csv,.json,.pdf"
              />
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  {uploading ? (
                    <Loader className="h-12 w-12 text-indigo-600 animate-spin" />
                  ) : (
                    <Cloud className="h-12 w-12 text-indigo-600" />
                  )}
                </div>
                
                <div>
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    Cliquez pour sélectionner
                  </label>
                  <span className={classNames(
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    {' '}ou glissez vos fichiers ici
                  </span>
                </div>
                
                <p className={classNames(
                  'text-sm',
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Excel, CSV, JSON, PDF jusqu'à 50MB
                </p>

                {/* Supported formats */}
                <div className="flex justify-center space-x-8 mt-6">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    <span className={classNames(
                      'text-xs',
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    )}>Excel</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className={classNames(
                      'text-xs',
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    )}>CSV</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileJson className="h-4 w-4 text-orange-600" />
                    <span className={classNames(
                      'text-xs',
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    )}>JSON</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Barre de progression */}
            {isUploading && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm mb-2">
                  <span className={classNames(
                    darkMode ? 'text-slate-400' : 'text-gray-600'
                  )}>
                    Téléchargement en cours...
                  </span>
                  <span className={classNames(
                    'font-medium',
                    darkMode ? 'text-white' : 'text-gray-900'
                  )}>
                    {uploadProgress}%
                  </span>
                </div>
                <div className={classNames(
                  'w-full h-2 rounded-full overflow-hidden',
                  darkMode ? 'bg-slate-700' : 'bg-gray-200'
                )}>
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Files List */}
            {files.length > 0 && (
              <div className="mt-8">
                <h2 className={classNames(
                  'text-xl font-semibold mb-4',
                  darkMode ? 'text-white' : 'text-gray-900'
                )}>
                  Fichiers analysés ({files.length})
                </h2>
                
                <div className="space-y-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => setSelectedFile(file.id)}
                      className={classNames(
                        'p-4 rounded-lg transition-all cursor-pointer',
                        selectedFile === file.id
                          ? darkMode ? 'bg-indigo-900/20 border-indigo-600' : 'bg-indigo-50 border-indigo-300'
                          : darkMode ? 'bg-gray-800' : 'bg-white',
                        'border',
                        selectedFile === file.id
                          ? 'border-2'
                          : darkMode ? 'border-gray-700' : 'border-gray-200'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={classNames(
                            'p-2 rounded-lg',
                            file.detectedType === 'banking' 
                              ? 'bg-blue-100 dark:bg-blue-900/50' 
                              : file.detectedType === 'insurance'
                              ? 'bg-purple-100 dark:bg-purple-900/50'
                              : 'bg-gray-100 dark:bg-gray-700'
                          )}>
                            {getFileIcon(file.name)}
                          </div>
                          
                          <div className="flex-1">
                            <p className={classNames(
                              'font-medium',
                              darkMode ? 'text-white' : 'text-gray-900'
                            )}>
                              {file.name}
                            </p>
                            <p className={classNames(
                              'text-sm',
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            )}>
                              {formatFileSize(file.size)} • {file.suggestedModule}
                            </p>
                            {file.analysis && (
                              <p className={classNames(
                                'text-xs mt-1',
                                darkMode ? 'text-gray-500' : 'text-gray-500'
                              )}>
                                {file.analysis.rowCount} lignes • {file.analysis.detectedColumns?.length} colonnes
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {file.detectedType === 'banking' && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-full flex items-center">
                              <CreditCard className="h-3 w-3 mr-1" />
                              Banking
                            </span>
                          )}
                          {file.detectedType === 'insurance' && (
                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 rounded-full flex items-center">
                              <Shield className="h-3 w-3 mr-1" />
                              Insurance
                            </span>
                          )}
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panneau d'analyse (1/3 de l'espace) */}
          <div className="lg:col-span-1">
            {selectedFileData && selectedFileData.analysis ? (
              <div className="space-y-6">
                {/* Analyse IA */}
                <div className={classNames(
                  'rounded-xl p-6',
                  darkMode ? 'bg-gray-800' : 'bg-white'
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={classNames(
                      'text-lg font-semibold',
                      darkMode ? 'text-white' : 'text-gray-900'
                    )}>
                      Analyse IA
                    </h3>
                    <Brain className="h-5 w-5 text-indigo-600" />
                  </div>
                  
                  <div className="space-y-4">
                    {/* Secteur détecté */}
                    <div>
                      <p className={classNames(
                        'text-sm mb-2',
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      )}>
                        Secteur détecté
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={classNames(
                          'font-semibold',
                          darkMode ? 'text-white' : 'text-gray-900'
                        )}>
                          {selectedFileData.detectedType === 'banking' ? 'Finance Bancaire' : 
                           selectedFileData.detectedType === 'insurance' ? 'Assurance' : 'Générique'}
                        </span>
                        <span className={classNames(
                          'text-sm',
                          selectedFileData.analysis.confidence > 80 ? 'text-green-600' : 'text-yellow-600'
                        )}>
                          {selectedFileData.analysis.confidence}% confiance
                        </span>
                      </div>
                    </div>

                    {/* Qualité des données */}
                    <div>
                      <p className={classNames(
                        'text-sm mb-2',
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      )}>
                        Qualité des données
                      </p>
                      <div className="space-y-2">
                        {Object.entries(selectedFileData.analysis.dataQuality).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className={classNames(
                              'text-sm capitalize',
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            )}>
                              {key === 'completeness' ? 'Complétude' :
                               key === 'validity' ? 'Validité' : 'Cohérence'}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div
                                  className={classNames(
                                    'h-1.5 rounded-full',
                                    value > 90 ? 'bg-green-500' :
                                    value > 70 ? 'bg-yellow-500' : 'bg-red-500'
                                  )}
                                  style={{ width: `${value}%` }}
                                />
                              </div>
                              <span className={classNames(
                                'text-xs',
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                              )}>
                                {value}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* KPIs suggérés */}
                    <div>
                      <p className={classNames(
                        'text-sm mb-2',
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      )}>
                        KPIs suggérés
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedFileData.suggestedKPIs.map(kpi => (
                          <span
                            key={kpi}
                            className={classNames(
                              'px-2 py-1 text-xs rounded-full',
                              darkMode ? 'bg-indigo-900/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
                            )}
                          >
                            {kpi}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommandations */}
                <div className={classNames(
                  'rounded-xl p-6',
                  darkMode ? 'bg-gray-800' : 'bg-white'
                )}>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    <h3 className={classNames(
                      'text-lg font-semibold',
                      darkMode ? 'text-white' : 'text-gray-900'
                    )}>
                      Recommandations
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {selectedFileData.analysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2" />
                        <p className={classNames(
                          'text-sm',
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        )}>
                          {rec}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className={classNames(
                'rounded-xl p-8 text-center',
                darkMode ? 'bg-gray-800' : 'bg-white'
              )}>
                <Info className={classNames(
                  'h-12 w-12 mx-auto mb-4',
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                )} />
                <h3 className={classNames(
                  'text-lg font-semibold mb-2',
                  darkMode ? 'text-white' : 'text-gray-900'
                )}>
                  Analyse détaillée
                </h3>
                <p className={classNames(
                  'text-sm',
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                )}>
                  Sélectionnez un fichier pour voir l'analyse IA détaillée
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions finales */}
        {files.length > 0 && (
          <div className="mt-6 flex justify-end space-x-3">
            <button
              className={classNames(
                'px-4 py-2 rounded-lg transition-colors',
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              )}
              onClick={() => {
                setFiles([]);
                setSelectedFile(null);
                setUploadProgress(0);
              }}
            >
              Effacer tout
            </button>
            <button
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              onClick={() => {
                const query = selectedFileData?.detectedType === 'banking' 
                  ? "J'ai importé des données bancaires. Aide-moi à analyser les ratios prudentiels."
                  : selectedFileData?.detectedType === 'insurance'
                  ? "J'ai importé des données d'assurance. Aide-moi à analyser la solvabilité."
                  : "J'ai importé des données. Aide-moi à les analyser.";
                navigate('/co-pilot', { state: { query } });
              }}
            >
              <Brain className="h-4 w-4" />
              <span>Analyser avec Co-Pilot IA</span>
            </button>
            <button
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              onClick={() => {
                if (selectedFileData?.detectedType === 'banking') {
                  navigate('/banking/dashboard');
                } else if (selectedFileData?.detectedType === 'insurance') {
                  navigate('/insurance');
                } else {
                  navigate('/data-analysis');
                }
              }}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Créer Dashboard</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};