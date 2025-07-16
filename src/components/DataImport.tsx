import React, { useState, useCallback } from 'react';
import { 
  Upload, FileSpreadsheet, FileText, FileJson, 
  Database, Cloud, Check, AlertCircle, Loader,
  Sparkles, FileCheck, TrendingUp, CreditCard, Shield
} from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Détection automatique du type de données (simplifiée)
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

// Suggestion de KPIs selon le type détecté
const getSuggestedKPIs = (dataType: string): string[] => {
  switch (dataType) {
    case 'banking':
      return ['Taux d’intérêt', 'Montant total prêté', 'Durée moyenne', 'Ratio de défaut'];
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
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [detectedSector, setDetectedSector] = useState<'banking' | 'insurance' | null>(null);
  const [recommendedKPIs, setRecommendedKPIs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importedRowCount, setImportedRowCount] = useState(0);
  const [creditDetected, setCreditDetected] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

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

  const analyzeFile = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await parseFile(file);
      setImportedRowCount(data.length);

      // Détection automatique
      const dataType = await detectDataType(file);
      const suggestedKPIs = getSuggestedKPIs(dataType);
      console.log('🧠 Type détecté:', dataType, '| KPIs suggérés:', suggestedKPIs);
      setRecommendedKPIs(suggestedKPIs);

      const headers = data.length > 0 ? Object.keys(data[0]) : [];

      let detectedSector: 'banking' | 'insurance' | null = null;
      const bankingKeywords = ['loan', 'credit', 'interest', 'rate', 'amount', 'balance'];
      const insuranceKeywords = ['premium', 'claim', 'policy', 'coverage', 'deductible'];

      const headerLower = headers.map(h => h.toLowerCase()).join(' ');
      if (bankingKeywords.some(keyword => headerLower.includes(keyword))) {
        detectedSector = 'banking';
      } else if (insuranceKeywords.some(keyword => headerLower.includes(keyword))) {
        detectedSector = 'insurance';
      }

      setDetectedSector(detectedSector);

      const creditColumns = ['loan_id', 'customer_id', 'amount', 'rate', 'maturity'];
      const foundColumns = creditColumns.filter(col => 
        headers.some(c => c.toLowerCase().includes(col))
      );

      if (foundColumns.length >= 3) {
        setCreditDetected(true);
        console.log('🎯 Portefeuille de crédit détecté!');
      }

      const importData = {
        fileName: file.name,
        rowCount: data.length,
        data: data,
        headers: headers,
        sector: detectedSector,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('importedData', JSON.stringify(importData));

      if (creditDetected || foundColumns.length >= 3) {
        localStorage.setItem('creditRiskData', JSON.stringify(importData));
        if (typeof setUserProfile === 'function') {
          setUserProfile({ id: 'banker', name: 'Banquier' });
        }
      }

      if (detectedSector) {
        setSelectedSector(detectedSector);
      }

      setAnalysisComplete(true);

    } catch (error) {
      console.error('Erreur analyse:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setAnalysisComplete(false);
      await analyzeFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysisComplete(false);
      await analyzeFile(selectedFile);
    }
  }, []);

  const navigateToDashboard = () => {
    console.log('🚀 Navigation vers Dashboard depuis DataImport');
    setActiveModule('dashboard');
  };

  const resetImport = () => {
    setFile(null);
    setUploadProgress(0);
    setAnalysisComplete(false);
    setDetectedSector(null);
    setRecommendedKPIs([]);
    setError(null);
    setImportedRowCount(0);
    setCreditDetected(false);
  };

  return <div>{/* UI JSX ici (inchangé pour simplifier l'exemple) */}</div>;
};
