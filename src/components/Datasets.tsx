import React, { useState, useEffect } from 'react';
import { Database, Upload, Download, Search, Filter, FileSpreadsheet, FileText, FileJson, Shield, CheckCircle, AlertCircle, Eye, Lock, TrendingUp, History, Trash2 } from 'lucide-react';

interface DatasetsProps {
  isDarkMode: boolean;
}

const Datasets: React.FC<DatasetsProps> = ({ isDarkMode }) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCreditRisk, setShowCreditRisk] = useState(false);
  const [importedData, setImportedData] = useState<any[]>([]);

  useEffect(() => {
    // Alternative : Utiliser localStorage pour passer les données
    const pendingData = localStorage.getItem('pendingCreditRiskData');
    if (pendingData) {
      try {
        const data = JSON.parse(pendingData);
        if (data.showCreditRisk) {
          console.log('📍 Données Credit Risk détectées');
          setShowCreditRisk(true);
          if (data.importedData) {
            setImportedData(data.importedData);
          }
        }
        // Nettoyer après utilisation
        localStorage.removeItem('pendingCreditRiskData');
      } catch (e) {
        console.error('Erreur parsing données:', e);
      }
    }
  }, []);

  const datasets = [
    {
      name: "Données Clients 2024",
      size: "2.3 MB",
      records: "15,420",
      lastUpdated: "Il y a 2 heures",
      status: "Actif"
    },
    {
      name: "Transactions E-commerce",
      size: "8.7 MB",
      records: "45,230",
      lastUpdated: "Il y a 1 jour",
      status: "Actif"
    },
    {
      name: "Données Marketing",
      size: "1.2 MB",
      records: "8,950",
      lastUpdated: "Il y a 3 jours",
      status: "Archivé"
    },
    {
      name: "Analytics Web",
      size: "5.4 MB",
      records: "32,100",
      lastUpdated: "Il y a 5 heures",
      status: "Actif"
    }
  ];

  const financialDatasets = [
    {
      name: "Portefeuille Crédit Q1 2024",
      type: "credit",
      size: "12.5 MB",
      records: "85,420",
      lastUpdated: "Il y a 1 heure",
      status: "Actif",
      quality: 98,
      gdprCompliant: true,
      metrics: ["PD", "LGD", "EAD", "NPL"],
      validation: "Validé IFRS 9"
    },
    {
      name: "Données Risque Marché",
      type: "market",
      size: "34.2 MB",
      records: "125,800",
      lastUpdated: "Il y a 30 min",
      status: "Actif",
      quality: 95,
      gdprCompliant: true,
      metrics: ["VaR", "CVaR", "Greeks"],
      validation: "Conforme Bâle III"
    },
    {
      name: "Ratios Prudentiels 2024",
      type: "regulatory",
      size: "5.8 MB",
      records: "12,340",
      lastUpdated: "Il y a 3 heures",
      status: "Actif",
      quality: 100,
      gdprCompliant: true,
      metrics: ["CET1", "LCR", "NSFR"],
      validation: "COREP/FINREP"
    },
    {
      name: "Données ALM Liquidité",
      type: "liquidity",
      size: "8.3 MB",
      records: "45,670",
      lastUpdated: "Il y a 1 jour",
      status: "Actif",
      quality: 92,
      gdprCompliant: true,
      metrics: ["Gap Analysis", "Duration"],
      validation: "Stress Test BCE"
    }
  ];

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'csv':
        return <FileText className="w-8 h-8 text-green-500" />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="w-8 h-8 text-blue-500" />;
      case 'json':
        return <FileJson className="w-8 h-8 text-purple-500" />;
      default:
        return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'credit':
        return 'bg-red-100 text-red-800';
      case 'market':
        return 'bg-blue-100 text-blue-800';
      case 'regulatory':
        return 'bg-purple-100 text-purple-800';
      case 'liquidity':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return null;
};

export default Datasets;
