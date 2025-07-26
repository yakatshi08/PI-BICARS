import React, { useState } from 'react';
import {
  ArrowLeft, Search, Filter, Plus, Download, Upload,
  FileText, AlertTriangle, Clock, CheckCircle, XCircle,
  MessageSquare, Camera, MapPin, TrendingUp, Brain,
  User, Calendar, DollarSign, Activity, Eye, Edit,
  Trash2, Send, AlertCircle, Shield, ChevronRight
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

interface Claim {
  id: string;
  reference: string;
  type: string;
  status: 'new' | 'investigating' | 'processing' | 'settled' | 'rejected';
  claimant: string;
  policyNumber: string;
  dateOfLoss: string;
  dateReported: string;
  amount: number;
  fraudScore: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  description: string;
  documents: number;
  messages: number;
  lastUpdate: string;
}

const ClaimsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode } = useStore();
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Données exemple
  const claims: Claim[] = [
    {
      id: '1',
      reference: 'CLM-2024-001847',
      type: 'Auto',
      status: 'investigating',
      claimant: 'Jean Dupont',
      policyNumber: 'POL-AUTO-78934',
      dateOfLoss: '2024-12-15',
      dateReported: '2024-12-16',
      amount: 15000,
      fraudScore: 78,
      priority: 'high',
      assignedTo: 'Marie Lambert',
      description: 'Collision frontale sur A6, véhicule tiers impliqué',
      documents: 12,
      messages: 5,
      lastUpdate: 'Il y a 2 heures'
    },
    {
      id: '2',
      reference: 'CLM-2024-001846',
      type: 'Habitation',
      status: 'processing',
      claimant: 'Sophie Martin',
      policyNumber: 'POL-HAB-45612',
      dateOfLoss: '2024-12-10',
      dateReported: '2024-12-11',
      amount: 8500,
      fraudScore: 12,
      priority: 'medium',
      assignedTo: 'Pierre Durand',
      description: 'Dégât des eaux - Fuite canalisation',
      documents: 8,
      messages: 3,
      lastUpdate: 'Il y a 5 heures'
    },
    {
      id: '3',
      reference: 'CLM-2024-001845',
      type: 'Santé',
      status: 'settled',
      claimant: 'Marc Leroy',
      policyNumber: 'POL-SAN-12789',
      dateOfLoss: '2024-12-01',
      dateReported: '2024-12-02',
      amount: 2400,
      fraudScore: 5,
      priority: 'low',
      assignedTo: 'Julie Chen',
      description: 'Hospitalisation - Intervention chirurgicale',
      documents: 15,
      messages: 8,
      lastUpdate: 'Il y a 1 jour'
    },
    {
      id: '4',
      reference: 'CLM-2024-001844',
      type: 'RC Pro',
      status: 'new',
      claimant: 'Entreprise Tech Solutions',
      policyNumber: 'POL-RCP-98765',
      dateOfLoss: '2024-12-18',
      dateReported: '2024-12-18',
      amount: 45000,
      fraudScore: 15,
      priority: 'critical',
      assignedTo: 'Non assigné',
      description: 'Erreur système causant perte de données client',
      documents: 3,
      messages: 1,
      lastUpdate: 'Il y a 30 min'
    }
  ];

  // Statistiques workflow
  const workflowStats = {
    new: 15,
    investigating: 42,
    processing: 38,
    settled: 286,
    rejected: 12
  };

  // Temps moyen par étape
  const avgTimeByStep = [
    { step: 'Déclaration', time: 0.5, target: 1 },
    { step: 'Vérification', time: 2, target: 2 },
    { step: 'Investigation', time: 5, target: 4 },
    { step: 'Évaluation', time: 3, target: 3 },
    { step: 'Règlement', time: 2, target: 2 }
  ];

  // Distribution des fraudes par type
  const fraudByType = [
    { type: 'Auto', count: 23, percentage: 45 },
    { type: 'Habitation', count: 12, percentage: 25 },
    { type: 'Santé', count: 8, percentage: 20 },
    { type: 'RC Pro', count: 5, percentage: 10 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'investigating': return 'bg-yellow-500';
      case 'processing': return 'bg-purple-500';
      case 'settled': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Plus className="h-4 w-4" />;
      case 'investigating': return <Search className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'settled': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.claimant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || claim.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/claims-underwriting')}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50'
              } transition-colors`}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Gestion des Sinistres
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Workflow complet de traitement des sinistres
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-5 w-5" />
              <span>Nouveau sinistre</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Download className="h-5 w-5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par référence, nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-800 text-gray-300 placeholder-gray-500 border-gray-700' 
                  : 'bg-white text-gray-700 placeholder-gray-400 border-gray-200'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg ${
              darkMode 
                ? 'bg-gray-800 text-gray-300 border-gray-700' 
                : 'bg-white text-gray-700 border-gray-200'
            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="all">Tous les statuts</option>
            <option value="new">Nouveau</option>
            <option value="investigating">Investigation</option>
            <option value="processing">En traitement</option>
            <option value="settled">Réglé</option>
            <option value="rejected">Rejeté</option>
          </select>
          <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
              } transition-colors`}
            >
              Liste
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 ${
                viewMode === 'kanban' 
                  ? 'bg-blue-600 text-white' 
                  : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
              } transition-colors`}
            >
              Kanban
            </button>
          </div>
        </div>
      </div>

      {/* Workflow Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {Object.entries(workflowStats).map(([status, count]) => (
          <div key={status} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`capitalize text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {status === 'new' ? 'Nouveaux' : 
                 status === 'investigating' ? 'Investigation' :
                 status === 'processing' ? 'En traitement' :
                 status === 'settled' ? 'Réglés' : 'Rejetés'}
              </span>
              <div className={`p-1 rounded ${getStatusColor(status)} bg-opacity-20`}>
                {getStatusIcon(status)}
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {count}
            </h3>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div 
                  className={`${getStatusColor(status)} h-1 rounded-full transition-all duration-500`}
                  style={{ width: `${(count / 393) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claims List/Kanban */}
        <div className="lg:col-span-2">
          {viewMode === 'list' ? (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Référence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Déclarant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fraude
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${darkMode ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
                    {filteredClaims.map((claim) => (
                      <tr 
                        key={claim.id}
                        className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} cursor-pointer transition-colors`}
                        onClick={() => setSelectedClaim(claim)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {claim.reference}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {claim.lastUpdate}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`h-8 w-8 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="ml-3">
                              <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {claim.claimant}
                              </div>
                              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {claim.policyNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {claim.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {claim.amount.toLocaleString()} €
                          </div>
                          <div className={`text-xs ${getPriorityColor(claim.priority)}`}>
                            {claim.priority.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(claim.status)} mr-2`} />
                            <span className={`text-sm capitalize ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {claim.status === 'new' ? 'Nouveau' : 
                               claim.status === 'investigating' ? 'Investigation' :
                               claim.status === 'processing' ? 'En traitement' :
                               claim.status === 'settled' ? 'Réglé' : 'Rejeté'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-full max-w-[60px] bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2`}>
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  claim.fraudScore > 60 ? 'bg-red-500' :
                                  claim.fraudScore > 30 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${claim.fraudScore}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${
                              claim.fraudScore > 60 ? 'text-red-500' :
                              claim.fraudScore > 30 ? 'text-yellow-500' :
                              'text-green-500'
                            }`}>
                              {claim.fraudScore}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Vue Kanban
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(workflowStats).map(([status, count]) => (
                <div key={status} className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-4`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-semibold capitalize ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {status === 'new' ? 'Nouveaux' : 
                       status === 'investigating' ? 'Investigation' :
                       status === 'processing' ? 'Traitement' :
                       status === 'settled' ? 'Réglés' : 'Rejetés'}
                    </h3>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {count}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {filteredClaims
                      .filter(claim => claim.status === status)
                      .slice(0, 3)
                      .map((claim) => (
                        <div
                          key={claim.id}
                          className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
                          onClick={() => setSelectedClaim(claim)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {claim.reference}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(claim.status)}`} />
                          </div>
                          <h4 className={`text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {claim.claimant}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {claim.amount.toLocaleString()} €
                            </span>
                            {claim.fraudScore > 60 && (
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-6">
          {/* Temps moyen par étape */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Temps Moyen par Étape (jours)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={avgTimeByStep} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                <XAxis type="number" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <YAxis dataKey="step" type="category" stroke={darkMode ? '#9CA3AF' : '#6B7280'} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="time" fill="#3B82F6" name="Temps actuel" />
                <Bar dataKey="target" fill="#10B981" name="Objectif" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Détection de fraude par type */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Détection Fraude par Type
            </h3>
            <div className="space-y-3">
              {fraudByType.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {item.type}
                    </span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.count} cas ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
              <div className="flex items-center space-x-2">
                <Brain className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                  ML détecte <span className="font-medium">87%</span> des fraudes automatiquement
                </p>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Actions Rapides
            </h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-between">
                <span className="flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  OCR Documents
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button className="w-full p-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-between">
                <span className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Géolocalisation
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button className="w-full p-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-between">
                <span className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Chatbot Assuré
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Détails du Sinistre {selectedClaim.reference}
              </h2>
              <button
                onClick={() => setSelectedClaim(null)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Informations Générales
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Déclarant:</span>
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedClaim.claimant}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Police:</span>
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedClaim.policyNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Type:</span>
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedClaim.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Montant:</span>
                    <span className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedClaim.amount.toLocaleString()} €</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Analyse de Risque
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Score de fraude:</span>
                      <span className={`font-medium ${
                        selectedClaim.fraudScore > 60 ? 'text-red-500' :
                        selectedClaim.fraudScore > 30 ? 'text-yellow-500' :
                        'text-green-500'
                      }`}>
                        {selectedClaim.fraudScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          selectedClaim.fraudScore > 60 ? 'bg-red-500' :
                          selectedClaim.fraudScore > 30 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${selectedClaim.fraudScore}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Priorité:</span>
                    <span className={`font-medium ${getPriorityColor(selectedClaim.priority)}`}>
                      {selectedClaim.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Valider le sinistre
              </button>
              <button className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                Demander investigation
              </button>
              <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Rejeter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimsManagement;