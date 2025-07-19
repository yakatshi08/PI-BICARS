import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Download, FileText, TrendingUp, Shield, AlertCircle, Calendar } from 'lucide-react';
import { useStore } from '../store';

const Reports = () => {
  const { darkMode } = useStore();
  const navigate = useNavigate();
  
  const reports = [
    {
      id: 1,
      title: 'Rapport Mensuel - Décembre 2024',
      type: 'Mensuel',
      date: '31/12/2024',
      size: '2.4 MB',
      status: 'Complété',
      icon: FileText,
      statusColor: 'green'
    },
    {
      id: 2,
      title: 'Analyse Trimestrielle Q4 2024',
      type: 'Trimestriel',
      date: '31/12/2024',
      size: '5.1 MB',
      status: 'En cours',
      icon: TrendingUp,
      statusColor: 'yellow'
    },
    {
      id: 3,
      title: 'Rapport Annuel 2024',
      type: 'Annuel',
      date: '15/01/2025',
      size: '12.3 MB',
      status: 'Brouillon',
      icon: FileText,
      statusColor: 'gray'
    },
    {
      id: 4,
      title: 'Synthèse Executive',
      type: 'Executive',
      date: '28/12/2024',
      size: '1.8 MB',
      status: 'Complété',
      icon: FileText,
      statusColor: 'green'
    },
    {
      id: 5,
      title: 'Rapport de Conformité',
      type: 'Conformité',
      date: '30/12/2024',
      size: '3.2 MB',
      status: 'Validé',
      icon: Shield,
      statusColor: 'blue'
    },
    {
      id: 6,
      title: 'Analyse des Risques',
      type: 'Risques',
      date: '29/12/2024',
      size: '4.7 MB',
      status: 'Complété',
      icon: AlertCircle,
      statusColor: 'green'
    }
  ];

  const getStatusStyle = (status: string, color: string) => {
    const styles = {
      green: darkMode 
        ? 'bg-green-900/50 text-green-300 border-green-700' 
        : 'bg-green-100 text-green-800 border-green-300',
      yellow: darkMode 
        ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700' 
        : 'bg-yellow-100 text-yellow-800 border-yellow-300',
      blue: darkMode 
        ? 'bg-blue-900/50 text-blue-300 border-blue-700' 
        : 'bg-blue-100 text-blue-800 border-blue-300',
      gray: darkMode 
        ? 'bg-gray-700 text-gray-300 border-gray-600' 
        : 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return styles[color] || styles.gray;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Bouton retour */}
        <button
          onClick={() => navigate('/dashboard')}
          className={`mb-6 inline-flex items-center text-sm transition-colors ${
            darkMode ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Rapports & Conformité
            </h1>
            <p className={`mt-2 text-lg ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Gérez et consultez vos rapports réglementaires
            </p>
          </div>
          
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors">
            <FileText className="h-5 w-5 mr-2" />
            Générer un rapport
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select className={`px-4 py-2 rounded-lg border transition-colors ${
            darkMode 
              ? 'bg-slate-800 border-slate-700 text-white hover:border-slate-600' 
              : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
          }`}>
            <option>Tous les types</option>
            <option>Mensuel</option>
            <option>Trimestriel</option>
            <option>Annuel</option>
          </select>
          
          <select className={`px-4 py-2 rounded-lg border transition-colors ${
            darkMode 
              ? 'bg-slate-800 border-slate-700 text-white hover:border-slate-600' 
              : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
          }`}>
            <option>Tous les statuts</option>
            <option>Complété</option>
            <option>En cours</option>
            <option>Brouillon</option>
          </select>
          
          <div className={`flex items-center px-4 py-2 rounded-lg border ${
            darkMode 
              ? 'bg-slate-800 border-slate-700 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}>
            <Calendar className="h-4 w-4 mr-2" />
            <input 
              type="text" 
              placeholder="jj/mm/aaaa" 
              className="bg-transparent outline-none"
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className={`rounded-xl p-6 transition-all hover:shadow-xl ${
                  darkMode ? 'bg-slate-800 hover:bg-slate-750' : 'bg-white shadow-lg'
                }`}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`h-12 w-12 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    getStatusStyle(report.status, report.statusColor)
                  }`}>
                    {report.status}
                  </span>
                </div>
                
                {/* Title */}
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {report.title}
                </h3>
                
                {/* Details */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Type:</span>
                    <span className={darkMode ? 'text-slate-300' : 'text-gray-800'}>{report.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Date:</span>
                    <span className={darkMode ? 'text-slate-300' : 'text-gray-800'}>{report.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-slate-400' : 'text-gray-600'}>Taille:</span>
                    <span className={darkMode ? 'text-slate-300' : 'text-gray-800'}>{report.size}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3">
                  <button className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-colors ${
                    darkMode 
                      ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Voir
                  </button>
                  <button className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-colors ${
                    darkMode 
                      ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Reports;