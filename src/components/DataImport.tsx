import React, { useState, useCallback } from 'react';
import { 
  Upload, FileSpreadsheet, FileText, FileJson, 
  Database, Cloud, Check, AlertCircle, Loader,
  Sparkles, FileCheck, TrendingUp, CreditCard, Shield,
  CheckCircle, Eye, Download, Trash2, ArrowLeft, BarChart3
} from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface PreviewData {
  headers: string[];
  rows: any[][];
  totalRows: number;
  fileName: string;
  fileType: 'csv' | 'excel';
}

interface ValidationError {
  row: number;
  column: string;
  message: string;
}

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

const detectDataType = async (file: File): Promise<'banking' | 'insurance' | 'generic'> => {
  const text = await file.text();
  const lowerContent = text.toLowerCase();

  if (lowerContent.includes('loan') || lowerContent.includes('interest') || lowerContent.includes('balance')) {
    return 'banking';
  } else if (lowerContent.includes('claim') || lowerContent.includes('policy') || lowerContent.includes('premium')) {
    return 'insurance';
  }
  return 'generic';
};

const getSuggestedKPIs = (dataType: string): string[] => {
  switch (dataType) {
    case 'banking':
      return ['Taux d\'intérêt', 'Montant total prêté', 'Durée moyenne', 'Ratio de défaut'];
    case 'insurance':
      return ['Montant total des primes', 'Ratio sinistralité', 'Nombre de réclamations'];
    default:
      return ['Valeur moyenne', 'Total général', 'Tendance principale'];
  }
};

export const DataImport: React.FC = () => {
  const store = useStore();
  const { darkMode, setSelectedSector, setActiveModule } = store;
  const setUserProfile = (store as any).setUserProfile;
  const { t } = useTranslation();

  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // États existants
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [showErrors, setShowErrors] = useState(true);
  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Nouveaux états pour l'analyse
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [dataValidated, setDataValidated] = useState(false);

  const [detectedSector, setDetectedSector] = useState<'banking' | 'insurance' | null>(null);
  const [recommendedKPIs, setRecommendedKPIs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importedRowCount, setImportedRowCount] = useState(0);
  const [creditDetected, setCreditDetected] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setIsLoading(true);
    setUploadProgress(0);
    setValidationErrors([]);
    setDataValidated(false);
    setAnalysisResults(null);
    setDetectedSector(null);
    setSelectedRows([]);
    setEditingCell(null);

    if (file.size > 50 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Taille maximum : 50MB');
      setIsLoading(false);
      return;
    }

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'csv') {
        await processCSV(file);
      } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
        await processExcel(file);
      } else {
        alert('Format de fichier non supporté');
      }
    } catch (error) {
      console.error('Erreur lors du traitement du fichier:', error);
      alert('Erreur lors du traitement du fichier');
    } finally {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const processCSV = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const headers = results.data[0] as string[];
            const rows = results.data.slice(1) as string[][];
            
            setPreviewData({
              headers,
              rows,
              totalRows: rows.length,
              fileName: file.name,
              fileType: 'csv'
            });
            resolve();
          } else {
            reject(new Error('Aucune donnée trouvée dans le fichier CSV'));
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  const processExcel = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          if (jsonData.length > 0) {
            const headers = jsonData[0].map(h => String(h || ''));
            const rows = jsonData.slice(1);
            
            setPreviewData({
              headers,
              rows,
              totalRows: rows.length,
              fileName: file.name,
              fileType: 'excel'
            });
            resolve();
          } else {
            reject(new Error('Aucune donnée trouvée dans le fichier Excel'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(previewData?.rows.map((_, index) => index) || []);
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (rowIndex: number) => {
    setSelectedRows(prev => {
      if (prev.includes(rowIndex)) {
        return prev.filter(i => i !== rowIndex);
      } else {
        return [...prev, rowIndex];
      }
    });
  };

  const handleCellClick = (row: number, col: number) => {
    setEditingCell({ row, col });
  };

  const handleCellEdit = (rowIndex: number, colIndex: number, value: string) => {
    if (!previewData) return;
    
    const newRows = [...previewData.rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][colIndex] = value;
    
    setPreviewData({
      ...previewData,
      rows: newRows
    });
    
    validateData(newRows);
  };

  const handleDeleteRows = () => {
    if (!previewData) return;
    
    const newRows = previewData.rows.filter((_, index) => !selectedRows.includes(index));
    
    setPreviewData({
      ...previewData,
      rows: newRows,
      totalRows: newRows.length
    });
    
    setSelectedRows([]);
    setShowDeleteConfirm(false);
    
    validateData(newRows);
  };

  const validateData = (rows: any[][]) => {
    if (!previewData) return;
    
    const errors: ValidationError[] = [];
    
    rows.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        if (!cell || cell === '') {
          if (cellIndex < 3) {
            errors.push({
              row: rowIndex + 2,
              column: previewData.headers[cellIndex] || '',
              message: 'Valeur manquante'
            });
          }
        }
      });
    });
    
    setValidationErrors(errors);
  };

  // NOUVELLE VERSION DE handleValidateData
  const handleValidateData = () => {
    if (!previewData) return;
    
    const errors: ValidationError[] = [];
    
    // Validation basique
    previewData.rows.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        if (!cell || cell === '') {
          if (cellIndex < 3) { // Les 3 premières colonnes sont obligatoires
            errors.push({
              row: rowIndex + 2,
              column: previewData.headers[cellIndex],
              message: 'Valeur manquante'
            });
          }
        }
      });
    });
    
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      // Données validées - lancer l'analyse
      setDataValidated(true);
      setIsAnalyzing(true);
      
      // Simuler l'analyse
      setTimeout(() => {
        setAnalysisResults({
          totalRows: previewData.totalRows,
          validRows: previewData.totalRows,
          columns: previewData.headers.length,
          kpis: {
            totalAmount: previewData.rows.reduce((sum, row) => {
              const amount = parseFloat(row[2]) || 0;
              return sum + amount;
            }, 0),
            averageRate: previewData.rows.reduce((sum, row) => {
              const rate = parseFloat(row[3]) || 0;
              return sum + rate;
            }, 0) / previewData.totalRows,
            dataQuality: '98%'
          }
        });
        setIsAnalyzing(false);
      }, 2000);
    }
  };

  const handleClearData = () => {
    setPreviewData(null);
    setSelectedFile(null);
    setValidationErrors([]);
    setDataValidated(false);
    setAnalysisResults(null);
    setDetectedSector(null);
    setRecommendedKPIs([]);
    setError(null);
    setImportedRowCount(0);
    setCreditDetected(false);
    setSelectedRows([]);
    setEditingCell(null);
    setShowDeleteConfirm(false);
  };

  const parseFile = async (file: File): Promise<any[]> => {
    const fileType = file.name.split('.').pop()?.toLowerCase();

    return new Promise((resolve, reject) => {
      if (fileType === 'csv') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const result = Papa.parse(text, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            delimitersToGuess: [',', '\t', '|', ';']
          });

          if (result.errors.length > 0) {
            console.error('Erreurs de parsing CSV:', result.errors);
          }
          resolve(result.data);
        };
        reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
        reader.readAsText(file);
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            resolve(jsonData);
          } catch (error) {
            reject(new Error('Erreur de parsing Excel'));
          }
        };
        reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
        reader.readAsArrayBuffer(file);
      } else if (fileType === 'json') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target?.result as string);
            resolve(Array.isArray(jsonData) ? jsonData : [jsonData]);
          } catch (error) {
            reject(new Error('Format JSON invalide'));
          }
        };
        reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
        reader.readAsText(file);
      } else {
        reject(new Error('Format de fichier non supporté'));
      }
    });
  };

  const navigateToDashboard = () => {
    setActiveModule('dashboard');
  };

  const resetImport = () => {
    handleClearData();
  };

  // NOUVELLE STRUCTURE DU RETURN
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Barre de navigation supérieure */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-30`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {/* Bouton Retour global */}
              <button
                onClick={() => {
                  if (dataValidated) {
                    setDataValidated(false);
                    setAnalysisResults(null);
                  } else if (previewData) {
                    setPreviewData(null);
                    setSelectedFile(null);
                    setValidationErrors([]);
                    setSelectedRows([]);
                  } else {
                    window.history.back();
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                  ${darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
              
              <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {dataValidated ? 'Analyse des données' : 'Import de données'}
              </h1>
            </div>
            
            {/* Indicateur d'état */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg
                ${previewData 
                  ? dataValidated
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                {previewData ? (
                  dataValidated ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Données validées</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4" />
                      <span className="text-sm font-medium">{previewData.fileName}</span>
                    </>
                  )
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span className="text-sm font-medium">En attente de fichier</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Zone de Drop */}
        {!previewData && !dataValidated && (
          <div
            className={`mb-8 border-2 border-dashed rounded-xl p-12 text-center transition-all
              ${isDragging 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : darkMode 
                  ? 'border-gray-700 bg-gray-800 hover:border-gray-600' 
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className={`mx-auto h-16 w-16 mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Glissez-déposez vos fichiers ici
            </h3>
            <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              ou
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                multiple={false}
              />
              <span className={`px-6 py-3 rounded-lg font-medium transition-all inline-block
                ${darkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                Parcourir les fichiers
              </span>
            </label>
            <p className={`mt-4 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Formats supportés : .xlsx, .xls, .csv (Max 50MB)
            </p>
          </div>
        )}

        {/* Barre de progression */}
        {isLoading && (
          <div className={`mb-8 p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Chargement en cours...
              </span>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {uploadProgress}%
              </span>
            </div>
            <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Preview des données */}
        {previewData && !dataValidated && (
          <div className={`mb-8 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {previewData.fileName}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {previewData.totalRows} lignes • {previewData.headers.length} colonnes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedRows.length > 0 && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                        ${darkMode 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer {selectedRows.length} ligne(s)
                    </button>
                  )}
                  <button
                    onClick={handleValidateData}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                      ${darkMode 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Valider
                  </button>
                  <button
                    onClick={handleClearData}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                      ${darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer tout
                  </button>
                </div>
              </div>
            </div>

            {/* Tableau de données */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-4 py-3 w-12">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === previewData.rows.length}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    {previewData.headers.map((header, index) => (
                      <th key={index} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider
                        ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {previewData.rows.slice(0, 10).map((row, rowIndex) => (
                    <tr 
                      key={rowIndex} 
                      className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${
                        selectedRows.includes(rowIndex) ? (darkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''
                      }`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(rowIndex)}
                          onChange={() => handleRowSelect(rowIndex)}
                          className="rounded"
                        />
                      </td>
                      {row.map((cell, cellIndex) => (
                        <td 
                          key={cellIndex} 
                          className={`px-6 py-4 whitespace-nowrap text-sm cursor-pointer
                            ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}
                          onClick={() => handleCellClick(rowIndex, cellIndex)}
                        >
                          {editingCell?.row === rowIndex && editingCell?.col === cellIndex ? (
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => handleCellEdit(rowIndex, cellIndex, e.target.value)}
                              onBlur={() => setEditingCell(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') setEditingCell(null);
                              }}
                              autoFocus
                              className={`w-full px-2 py-1 rounded border ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          ) : (
                            cell || '-'
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {previewData.totalRows > 10 && (
              <div className={`p-4 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Affichage des 10 premières lignes sur {previewData.totalRows}
              </div>
            )}
          </div>
        )}

        {/* Erreurs de validation */}
        {validationErrors.length > 0 && showErrors && (
          <div className={`rounded-xl ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border p-6 mb-8`}>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-red-400' : 'text-red-800'}`}>
                    Erreurs de validation détectées
                  </h4>
                  <button 
                    onClick={() => setShowErrors(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
                <ul className="space-y-1">
                  {validationErrors.slice(0, 5).map((error, index) => (
                    <li key={index} className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                      Ligne {error.row}, Colonne "{error.column}": {error.message}
                    </li>
                  ))}
                </ul>
                {validationErrors.length > 5 && (
                  <p className={`text-sm mt-2 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                    ... et {validationErrors.length - 5} autres erreurs
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE CONFIRMATION DE SUPPRESSION */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-xl p-6 max-w-md w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Confirmer la suppression
                  </h3>
                  <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Êtes-vous sûr de vouloir supprimer {selectedRows.length} ligne(s) sélectionnée(s) ?
                    Cette action est irréversible.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteRows}
                  className={`px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700`}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vue d'analyse après validation */}
        {dataValidated && analysisResults && (
          <div className="space-y-6">
            {/* En-tête d'analyse */}
            <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6`}>
              <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Analyse terminée avec succès
              </h2>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Les données ont été validées et analysées. Voici les résultats :
              </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total des lignes */}
              <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <Database className="h-8 w-8 text-blue-600" />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {analysisResults.totalRows}
                  </span>
                </div>
                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Lignes importées
                </h3>
              </div>

              {/* Montant total */}
              <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(analysisResults.kpis.totalAmount)}
                  </span>
                </div>
                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Montant total
                </h3>
              </div>

              {/* Taux moyen */}
              <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {analysisResults.kpis.averageRate.toFixed(2)}%
                  </span>
                </div>
                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Taux moyen
                </h3>
              </div>

              {/* Qualité des données */}
              <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {analysisResults.kpis.dataQuality}
                  </span>
                </div>
                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Qualité des données
                </h3>
              </div>
            </div>

            {/* Actions suivantes */}
            <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Actions disponibles
              </h3>
              <div className="flex flex-wrap gap-3">
                <button className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2
                  ${darkMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                  <BarChart3 className="h-5 w-5" />
                  Voir les graphiques
                </button>
                <button className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2
                  ${darkMode 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}>
                  <FileText className="h-5 w-5" />
                  Générer un rapport
                </button>
                <button className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2
                  ${darkMode 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                  }`}>
                  <Download className="h-5 w-5" />
                  Exporter les résultats
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading pendant l'analyse */}
        {isAnalyzing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-8 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <div className="flex flex-col items-center">
                <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Analyse en cours...
                </h3>
                <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Traitement des données, veuillez patienter
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};