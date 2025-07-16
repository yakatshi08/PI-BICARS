import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, Database, Brain, TrendingUp, 
  Shield, Users, ChevronRight, Check, AlertCircle,
  Home, Sparkles, ArrowRight 
} from 'lucide-react';
import { useStore } from '../store';
import { useTranslation } from '../hooks/useTranslation';
import { ImportAssistant } from '../services/ai/ImportAssistant';

const IntelligentHomepage = () => {
  const { t } = useTranslation();
  const {
    darkMode,
    selectedSector,
    setSelectedSector,
    userProfile,
    setUserProfile,
    setActiveModule,
    setOnboardingCompleted,
    setImportedFileData,
    setAnalysisResult: setGlobalAnalysisResult
  } = useStore();
  
  const [importedFile, setImportedFile] = useState(null);
  const [detectedSector, setDetectedSector] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Profils utilisateurs disponibles
  const userProfiles = [
    {
      id: 'banker',
      title: t('profiles.banker.title', 'Banquier'),
      icon: TrendingUp,
      description: t('profiles.banker.description', 'Analyses bancaires, ratios prudentiels, risque crédit'),
      color: 'from-blue-600 to-blue-700',
      templates: ['Banking Dashboard', 'Credit Risk Analysis', 'Liquidity Monitor']
    },
    {
      id: 'actuary',
      title: t('profiles.actuary.title', 'Actuaire'),
      icon: Brain,
      description: t('profiles.actuary.description', 'Modèles actuariels, réserves techniques, Solvency II'),
      color: 'from-purple-600 to-purple-700',
      templates: ['Insurance KPIs', 'Claims Analytics', 'Solvency II Reports']
    },
    {
      id: 'risk-manager',
      title: t('profiles.riskManager.title', 'Risk Manager'),
      icon: Shield,
      description: t('profiles.riskManager.description', 'Gestion des risques, stress tests, conformité'),
      color: 'from-red-600 to-red-700',
      templates: ['Risk Dashboard', 'Stress Test Scenarios', 'Regulatory Compliance']
    },
    {
      id: 'cfo',
      title: t('profiles.cfo.title', 'CFO'),
      icon: Users,
      description: t('profiles.cfo.description', 'Vue exécutive, KPIs financiers, reporting stratégique'),
      color: 'from-green-600 to-green-700',
      templates: ['Executive Dashboard', 'Financial Overview', 'P&L Analysis']
    }
  ];

  // Gestion du drag & drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // AJOUT: Fonction pour naviguer vers le Dashboard
  const navigateToDashboard = () => {
    console.log('🚀 Navigation vers le Dashboard - DÉBUT');
    console.log('📊 setActiveModule existe ?', typeof setActiveModule);
    
    try {
      // Si on a détecté des données de crédit, s'assurer qu'elles sont sauvegardées
      if (analysisResult?.creditDetection?.isCreditData) {
        console.log('💾 Sauvegarde des données crédit avant navigation');
        const creditData = {
          importedData: analysisResult.schema?.sampleData || [],
          showCreditRisk: true,
          analysisResult: analysisResult
        };
        localStorage.setItem('pendingCreditRiskData', JSON.stringify(creditData));
      }
      
      // Marquer l'onboarding comme complété
      console.log('📝 Appel setOnboardingCompleted');
      setOnboardingCompleted(true);
      
      // Naviguer vers le dashboard
      console.log('🎯 Appel setActiveModule("dashboard")');
      setActiveModule('dashboard');
      
      // Vérification supplémentaire
      setTimeout(() => {
        console.log('✅ Module actif après navigation:', useStore.getState?.().activeModule);
      }, 100);
      
    } catch (error) {
      console.error('❌ Erreur dans navigateToDashboard:', error);
      
      // Fallback : essayer une navigation alternative
      console.log('🔄 Tentative de fallback...');
      window.location.hash = '#dashboard';
    }

    console.log('🚀 Navigation vers le Dashboard - FIN');
  };

  // Analyse locale avec ImportAssistant
  const analyzeFileLocally = async (file) => {
    // Lecture du fichier pour l'analyse locale
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        let data = [];
        
        // Parse selon le type de fichier
        if (file.name.endsWith('.csv')) {
          // Utiliser papaparse pour CSV
          const Papa = await import('papaparse');
          const parsed = Papa.parse(content, { 
            header: true, 
            dynamicTyping: true,
            skipEmptyLines: true 
          });
          data = parsed.data;
        } else if (file.name.endsWith('.json')) {
          data = JSON.parse(content);
        }
        
        // Analyse avec ImportAssistant
        const schema = ImportAssistant.analyzeDataSchema(data);
        
        // DEBUG: Logs d'analyse
        console.log('📊 Données parsées:', data);
        console.log('📋 Colonnes détectées:', schema.columns);
        
        const sectorResult = ImportAssistant.detectSector(schema);
        
        // DEBUG: Log de détection secteur
        console.log('🔍 Résultat détection secteur:', sectorResult);
        
        const qualityCheck = ImportAssistant.validateDataQuality(schema);
        const dashboardConfig = ImportAssistant.generateDashboardConfig(
          sectorResult, 
          userProfile?.id, 
          schema
        );
        
        // Détection du portefeuille de crédit
        const creditDetection = ImportAssistant.detectCreditPortfolio(schema);
        
        // DEBUG: Logs détaillés de détection crédit
        console.log('💳 Détection crédit:', creditDetection);
        console.log('💳 Credit columns trouvées:', creditDetection.creditColumns);
        console.log('💳 Nombre de colonnes crédit:', creditDetection.creditColumns.length);
        console.log('💳 Confiance crédit:', creditDetection.confidence);
        console.log('💳 Is Credit Data?:', creditDetection.isCreditData);
        console.log('💳 Action suggérée:', creditDetection.suggestedAction);
        console.log('📊 TOUTES les colonnes du fichier:', schema.columns);
        
        // AJOUT: Forcer la détection pour les fichiers contenant des données de prêt
        if (file.name.toLowerCase().includes('loan') || 
            schema.columns.some(col => col.toLowerCase().includes('loan') || 
                                      col.toLowerCase().includes('credit') ||
                                      col.toLowerCase().includes('outstanding'))) {
          console.log('⚡ Amélioration forcée de la détection crédit pour', file.name);
          
          const loanColumns = schema.columns.filter(col => 
            col.toLowerCase().includes('loan') || 
            col.toLowerCase().includes('amount') ||
            col.toLowerCase().includes('rate') ||
            col.toLowerCase().includes('outstanding') ||
            col.toLowerCase().includes('balance')
          );
          
          if (loanColumns.length >= 2) {
            creditDetection.isCreditData = true;
            creditDetection.confidence = 0.95;
            creditDetection.creditColumns = loanColumns;
            creditDetection.suggestedAction = `Portefeuille de crédit détecté avec ${loanColumns.length} colonnes. Voulez-vous lancer une analyse approfondie du risque de crédit ?`;
            
            console.log('✅ Détection crédit forcée:', {
              colonnes: loanColumns,
              confidence: creditDetection.confidence
            });
          }
        }
        
        // TEMPORAIRE : Forcer la détection pour tester si nécessaire
        if (schema.columns.some(col => col.toLowerCase().includes('loan')) && creditDetection.creditColumns.length > 0) {
          console.log('⚡ Amélioration de la détection crédit');
          creditDetection.isCreditData = true;
          creditDetection.confidence = Math.max(0.8, creditDetection.confidence);
        }
        
        setDetectedSector(sectorResult.sector);
        setSelectedSector(sectorResult.sector);
        setAnalysisResult({
          schema,
          sectorDetection: sectorResult,
          suggestedKPIs: sectorResult.suggestedKPIs,
          quality: qualityCheck,
          dashboardConfig,
          creditDetection
        });
        setGlobalAnalysisResult({
          schema,
          sectorDetection: sectorResult,
          quality: qualityCheck,
          dashboardConfig,
          creditDetection
        });
        
        // Auto-sélection du profil basé sur le secteur
        if (sectorResult.sector === 'banking') {
          handleProfileSelect('banker');
        } else if (sectorResult.sector === 'insurance') {
          handleProfileSelect('actuary');
        }
        
        // Détection automatique du portefeuille de crédit
        console.log('🔍 Test condition crédit: isCreditData=', creditDetection.isCreditData, 'confidence=', creditDetection.confidence);
        
        // Condition temporaire plus souple pour tester
        if (creditDetection.creditColumns.length >= 2 || (creditDetection.isCreditData && creditDetection.confidence > 0.5)) {
          console.log('✅ Condition crédit remplie ! Affichage de la notification...');
          
          setTimeout(() => {
            console.log('⏰ Timeout déclenché, affichage de la confirmation...');
            const confirmMessage = creditDetection.suggestedAction || 
              `Nous avons détecté ${creditDetection.creditColumns.length} colonnes de crédit. Voulez-vous lancer une analyse de risque de crédit ?`;
            
            if (window.confirm(confirmMessage)) {
              console.log('👍 Utilisateur a accepté, navigation vers Credit Risk...');
              
              // MODIFIÉ: Utiliser localStorage au lieu de navigate
              localStorage.setItem('pendingCreditRiskData', JSON.stringify({
                importedData: data,
                showCreditRisk: true,
                analysisResult: {
                  schema,
                  sectorDetection: sectorResult,
                  quality: qualityCheck,
                  dashboardConfig,
                  creditDetection
                }
              }));
              
              // Naviguer vers le dashboard
              setActiveModule('dashboard');
              
            } else {
              console.log('👎 Utilisateur a refusé l\'analyse de crédit');
            }
          }, 1500);
        } else {
          console.log('❌ Condition crédit non remplie:', {
            creditColumns: creditDetection.creditColumns.length,
            isCreditData: creditDetection.isCreditData,
            confidence: creditDetection.confidence
          });
        }
      } catch (error) {
        console.error('Erreur analyse locale:', error);
      }
    };
    
    reader.readAsText(file);
  };

  const handleFile = async (file) => {
    console.log('📁 handleFile appelé avec:', file.name);
    setImportedFile(file);
    setIsAnalyzing(true);

    // Sauvegarder dans le store global
    setImportedFileData({
      name: file.name,
      size: file.size,
      type: file.type
    });

    // MODIFICATION : Forcer l'analyse locale directement
    console.log('🔄 Utilisation de l\'analyse locale forcée');
    await analyzeFileLocally(file);
    setIsAnalyzing(false);
    return;
  };

  const updateCopilotSuggestions = async (analysisResult) => {
    try {
      await fetch('http://localhost:8000/api/copilot/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisResult,
          userProfile: userProfile?.id,
          detectedSector: analysisResult.detectedSector
        })
      });
    } catch (error) {
      console.error('Erreur mise à jour contexte Co-pilot:', error);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleProfileSelect = (profileId) => {
    const profile = userProfiles.find(p => p.id === profileId);
    setUserProfile(profile);
  };

  const handleTemplateClick = (template) => {
    // Marquer l'onboarding comme complété
    setOnboardingCompleted(true);
    // Navigation vers le dashboard
    setActiveModule('dashboard');
  };

  const handleStartAnalysis = () => {
    // Marquer l'onboarding comme complété
    setOnboardingCompleted(true);
    // Navigation vers le Co-pilot IA
    setActiveModule('co-pilot');
  };

  const handleExploreDashboard = () => {
    // Marquer l'onboarding comme complété
    setOnboardingCompleted(true);
    // Navigation vers le dashboard
    setActiveModule('dashboard');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="h-6 w-6 text-indigo-600 mr-3" />
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('app.title', 'FinTech Analytics Platform')}
              </h1>
              <span className={`ml-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>v4.1</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('homepage.welcome', 'Bienvenue dans votre espace d\'analyse')}
              </span>
              {/* AJOUT: Bouton d'accès rapide au Dashboard dans le header */}
              <button 
                onClick={navigateToDashboard}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center space-x-1"
              >
                <span>Accéder au Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Onboarding Section */}
        {showOnboarding && (
          <div className={`mb-8 rounded-lg p-6 ${
            darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
          } border`}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                  {t('homepage.onboarding.title', 'Bienvenue sur votre plateforme d\'analyse')}
                </h2>
                <p className={`mt-1 text-sm ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                  {t('homepage.onboarding.description', 'Notre IA détecte automatiquement votre profil et configure votre environnement de travail')}
                </p>
              </div>
              <button
                onClick={() => setShowOnboarding(false)}
                className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Profile Selection */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('homepage.selectProfile', 'Sélectionnez votre profil')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {userProfiles.map((profile) => {
              const Icon = profile.icon;
              return (
                <button
                  key={profile.id}
                  onClick={() => handleProfileSelect(profile.id)}
                  className={`relative p-6 rounded-lg border-2 transition-all ${
                    userProfile?.id === profile.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : darkMode 
                        ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {userProfile?.id === profile.id && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5 text-indigo-600" />
                    </div>
                  )}
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${profile.color} mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {profile.title}
                  </h3>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {profile.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Smart Import Section */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('homepage.importData', 'Import intelligent de données')}
          </h2>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                : darkMode
                  ? 'border-gray-700 bg-gray-800'
                  : 'border-gray-300 bg-white'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".csv,.xlsx,.xls,.json,.xml,.pdf"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('homepage.import.dragDrop', 'Glissez-déposez vos fichiers ou')} {' '}
                <span className="text-indigo-600 hover:text-indigo-700">
                  {t('homepage.import.browse', 'parcourir')}
                </span>
              </p>
              <p className={`mt-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {t('homepage.import.formats', 'Formats supportés: Excel, CSV, PDF, JSON, XML, APIs')}
              </p>
            </label>
          </div>

          {/* File Analysis Result */}
          {importedFile && (
            <div className={`mt-4 rounded-lg p-4 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <FileText className={`h-5 w-5 mr-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {importedFile.name}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {(importedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                {isAnalyzing ? (
                  <div className="flex items-center text-sm text-indigo-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                    {t('homepage.analyzing', 'Analyse en cours...')}
                  </div>
                ) : detectedSector && (
                  <div className="flex items-center bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                    <Check className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-xs text-green-700 dark:text-green-400">
                      {t('homepage.sectorDetected', 'Secteur détecté')}: {' '}
                      {detectedSector === 'banking' ? t('sectors.banking', 'Bancaire') : 
                       detectedSector === 'insurance' ? t('sectors.insurance', 'Assurance') :
                       detectedSector === 'mixed' ? t('sectors.mixed', 'Mixte') :
                       t('sectors.unknown', 'Non défini')}
                    </span>
                  </div>
                )}
              </div>

              {analysisResult && (
                <div className={`mt-4 rounded-lg p-3 ${
                  darkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                }`}>
                  <div className="flex items-start">
                    <Brain className="h-5 w-5 text-indigo-600 mr-2 mt-0.5" />
                    <div className="text-sm">
                      <p className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                        {t('homepage.aiAnalysis', 'Analyse IA')}
                      </p>
                      {analysisResult.sectorDetection?.detectedPatterns?.length > 0 && (
                        <p className={`mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                          {t('homepage.patternsDetected', 'Patterns détectés')}: {' '}
                          {analysisResult.sectorDetection.detectedPatterns.slice(0, 3).join(', ')}...
                        </p>
                      )}
                      {analysisResult.suggestedKPIs && analysisResult.suggestedKPIs.length > 0 && (
                        <p className={`mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                          {t('homepage.suggestedKPIs', 'KPIs suggérés')}: {' '}
                          {(analysisResult.suggestedKPIs || []).slice(0, 3).join(', ')}...
                        </p>
                      )}
                      {/* Affichage de la détection de crédit */}
                      {analysisResult.creditDetection?.creditColumns?.length > 0 && (
                        <p className={`mt-1 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                          💡 {t('homepage.creditPortfolioDetected', 'Portefeuille de crédit détecté')} 
                          ({analysisResult.creditDetection.creditColumns.length} colonnes, {Math.round(analysisResult.creditDetection.confidence * 100)}% confiance)
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* AJOUT: Bouton "Voir le Dashboard" après l'analyse */}
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={navigateToDashboard}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                    >
                      <span>{t('homepage.viewDashboard', 'Voir le Dashboard')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Start Templates */}
        {userProfile && userProfile.templates && userProfile.templates.length > 0 && (
          <div className="mb-8">
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('homepage.quickTemplates', 'Templates de démarrage rapide')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userProfile.templates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleTemplateClick(template)}
                  className={`p-4 rounded-lg transition-all text-left ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 hover:border-indigo-600 hover:bg-gray-700'
                      : 'bg-white border-gray-200 hover:border-indigo-500 hover:bg-indigo-50'
                  } border`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {template}
                      </h3>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('homepage.readyToUse', 'Prêt à l\'emploi')}
                      </p>
                    </div>
                    <ChevronRight className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Assistant Preview */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold flex items-center">
                <Sparkles className="h-6 w-6 mr-2" />
                {t('homepage.copilot.title', 'Co-pilot IA Financier')}
              </h3>
              <p className="mt-2 text-indigo-100">
                {t('homepage.copilot.description', 'Votre assistant intelligent est prêt à vous aider. Posez vos questions en langage naturel.')}
              </p>
              <div className="mt-4 flex space-x-4">
                <button 
                  onClick={handleStartAnalysis}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                >
                  {t('homepage.copilot.start', 'Démarrer l\'analyse')}
                </button>
                <button 
                  onClick={handleExploreDashboard}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-400 transition-colors"
                >
                  {t('homepage.copilot.explore', 'Explorer les fonctionnalités')}
                </button>
              </div>
            </div>
            <Brain className="h-16 w-16 text-indigo-200" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default IntelligentHomepage;