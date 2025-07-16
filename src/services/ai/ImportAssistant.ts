interface DataSchema {
  columns: string[];
  dataTypes: Record<string, string>;
  sampleData: any[];
  rowCount: number;
}

interface SectorDetectionResult {
  sector: 'banking' | 'insurance' | 'mixed' | 'unknown';
  confidence: number;
  detectedPatterns: string[];
  suggestedKPIs: string[];
  recommendedDashboard: string;
}

export class ImportAssistant {
  // Patterns de détection pour le secteur bancaire (ENRICHI)
  private static readonly BANKING_PATTERNS = {
    columns: [
      'assets', 'loans', 'deposits', 'interest_income', 'nii', 
      'tier1', 'tier1_capital', 'cet1', 'lcr', 'nsfr',
      'provisions', 'npls', 'non_performing_loans', 'rwa',
      'net_interest_margin', 'cost_income_ratio',
      // AJOUTS
      'leverage_ratio', 'capital_adequacy', 'credit_exposure', 
      'market_risk', 'operational_risk', 'basel', 'car',
      // AJOUTS POUR CREDIT DETECTION
      'loan_id', 'borrower', 'outstanding', 'maturity', 'collateral',
      'loan_amount', 'interest_rate', 'loan_status', 'credit_rating'
    ],
    values: [
      'mortgage', 'credit_card', 'commercial_loan', 'retail_banking',
      'corporate_banking', 'investment_banking', 'treasury',
      // AJOUTS
      'basel', 'tier', 'capital', 'liquidity', 'regulatory'
    ]
  };

  // Patterns de détection pour le secteur assurance (ENRICHI)
  private static readonly INSURANCE_PATTERNS = {
    columns: [
      'premiums', 'claims', 'reserves', 'technical_reserves',
      'scr', 'mcr', 'solvency_ratio', 'combined_ratio',
      'loss_ratio', 'expense_ratio', 'underwriting_result',
      'reinsurance', 'own_funds', 'risk_margin',
      // AJOUTS
      'written_premium', 'earned_premium', 'incurred_claims',
      'policy', 'coverage', 'deductible', 'retention'
    ],
    values: [
      'life_insurance', 'non_life', 'health_insurance', 'property',
      'casualty', 'liability', 'motor', 'marine', 'aviation',
      // AJOUTS
      'solvency', 'underwriting', 'actuarial', 'reinsurance', 'indemnity'
    ]
  };

  // KPIs suggérés par secteur et profil (ENRICHI)
  private static readonly PROFILE_KPIS = {
    banker: {
      banking: [
        'Net Interest Income (NII)',
        'Return on Assets (ROA)',
        'Common Equity Tier 1 (CET1) Ratio',
        'Liquidity Coverage Ratio (LCR)',
        'Non-Performing Loans (NPL) Ratio',
        'Cost-to-Income Ratio',
        // AJOUTS
        'Return on Equity (ROE)',
        'Net Stable Funding Ratio (NSFR)',
        'Loan-to-Deposit Ratio',
        'Net Interest Margin (NIM)'
      ],
      insurance: [
        'Premium to Loan Ratio',
        'Insurance Exposure Risk',
        'Coverage Ratios',
        // AJOUT
        'Bank-Insurance Synergies'
      ]
    },
    actuary: {
      insurance: [
        'Combined Ratio',
        'Loss Ratio',
        'Expense Ratio',
        'Solvency Capital Requirement (SCR) Coverage',
        'Technical Reserves Adequacy',
        'Claims Development Triangles',
        // AJOUTS
        'Minimum Capital Requirement (MCR) Coverage',
        'Premium Growth Rate',
        'Reserve Run-off Analysis',
        'Underwriting Profit Margin'
      ],
      banking: [
        'Credit Risk Modeling',
        'Loan Mortality Analysis',
        'IFRS 9 Provisions',
        // AJOUT
        'Expected Credit Loss (ECL)'
      ]
    },
    'risk-manager': {
      banking: [
        'Value at Risk (VaR)',
        'Stressed VaR',
        'Risk Concentration',
        'COREP Compliance Ratios',
        'Liquidity Stress Test Results',
        // AJOUTS
        'Credit Risk RWA',
        'Market Risk RWA',
        'Operational Risk Capital'
      ],
      insurance: [
        'SCR Coverage Ratio',
        'Underwriting Risk Metrics',
        'Risk Correlation Matrix',
        'ORSA Results',
        // AJOUTS
        'MCR Coverage Ratio',
        'Catastrophe Risk Exposure',
        'Risk Appetite Metrics'
      ]
    },
    cfo: {
      banking: [
        'Return on Equity (ROE)',
        'Net Interest Margin (NIM)',
        'Operating Efficiency Ratio',
        'Business Line Profitability',
        'Revenue Growth Metrics',
        // AJOUTS
        'Cost of Risk',
        'Economic Value Added (EVA)',
        'Earnings per Share (EPS)'
      ],
      insurance: [
        'Technical Profitability',
        'ROE by Business Line',
        'Solvency II Overview',
        'Premium Growth Rate',
        // AJOUTS
        'Investment Yield',
        'Operating Ratio',
        'Embedded Value',
        'New Business Margin'
      ]
    }
  };

  // NOUVEAU : Dashboards recommandés
  private static readonly RECOMMENDED_DASHBOARDS = {
    banking: {
      executive: 'Banking Executive Dashboard',
      risk: 'Credit Risk Analytics',
      liquidity: 'Liquidity Management Dashboard',
      regulatory: 'COREP/FINREP Reporting',
      profitability: 'Business Line P&L Analysis'
    },
    insurance: {
      executive: 'Insurance Executive Dashboard',
      underwriting: 'Underwriting Performance',
      claims: 'Claims Analytics Dashboard',
      regulatory: 'Solvency II Reporting',
      actuarial: 'Actuarial Analysis Suite'
    },
    mixed: {
      executive: 'Integrated Finance Dashboard',
      risk: 'Enterprise Risk Management',
      regulatory: 'Multi-Sector Compliance',
      performance: 'Cross-Sector Analytics'
    }
  };

  /**
   * Analyse le schéma des données importées (CONSERVÉ)
   */
  static analyzeDataSchema(data: any[]): DataSchema {
    if (!data || data.length === 0) {
      throw new Error('Aucune donnée à analyser');
    }

    const columns = Object.keys(data[0]);
    const dataTypes: Record<string, string> = {};
    
    // Détection des types de données
    columns.forEach(column => {
      const sampleValues = data.slice(0, 100).map(row => row[column]);
      dataTypes[column] = this.detectDataType(sampleValues);
    });

    return {
      columns,
      dataTypes,
      sampleData: data.slice(0, 5),
      rowCount: data.length
    };
  }

  /**
   * Détecte le type de données d'une colonne (AMÉLIORÉ)
   */
  private static detectDataType(values: any[]): string {
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    
    if (nonNullValues.length === 0) return 'unknown';
    
    // AMÉLIORATION : Détection plus robuste
    const isNumeric = nonNullValues.every(v => !isNaN(Number(v)) && typeof v !== 'boolean');
    const isDate = nonNullValues.every(v => {
      const date = new Date(v);
      return date instanceof Date && !isNaN(date.getTime());
    });
    const isBoolean = nonNullValues.every(v => 
      v === true || v === false || v === 'true' || v === 'false' || v === 0 || v === 1
    );
    
    // NOUVEAU : Détection des pourcentages
    const isPercentage = nonNullValues.every(v => {
      const str = String(v);
      return str.endsWith('%') || (isNumeric && Number(v) >= 0 && Number(v) <= 100);
    });
    
    if (isBoolean) return 'boolean';
    if (isDate) return 'date';
    if (isPercentage) return 'percentage';
    if (isNumeric) return 'number';
    return 'string';
  }

  /**
   * Détecte automatiquement le secteur basé sur les données (AMÉLIORÉ)
   */
  static detectSector(schema: DataSchema): SectorDetectionResult {
    const columnsLower = schema.columns.map(c => c.toLowerCase().replace(/[_\s-]/g, ''));
    const detectedPatterns: string[] = [];
    
    // Score pour chaque secteur
    let bankingScore = 0;
    let insuranceScore = 0;
    
    // Vérification des patterns bancaires (AMÉLIORÉ)
    this.BANKING_PATTERNS.columns.forEach(pattern => {
      const patternClean = pattern.replace(/[_\s-]/g, '');
      if (columnsLower.some(col => col.includes(patternClean))) {
        bankingScore += 2;
        detectedPatterns.push(`Banking: ${pattern}`);
      }
    });
    
    // Vérification des patterns assurance (AMÉLIORÉ)
    this.INSURANCE_PATTERNS.columns.forEach(pattern => {
      const patternClean = pattern.replace(/[_\s-]/g, '');
      if (columnsLower.some(col => col.includes(patternClean))) {
        insuranceScore += 2;
        detectedPatterns.push(`Insurance: ${pattern}`);
      }
    });
    
    // Analyse des valeurs pour affiner la détection
    if (schema.sampleData.length > 0) {
      const allValues = schema.sampleData.flatMap(row => 
        Object.values(row).filter(v => typeof v === 'string')
      ).map(v => String(v).toLowerCase());
      
      this.BANKING_PATTERNS.values.forEach(pattern => {
        if (allValues.some(val => val.includes(pattern))) {
          bankingScore += 1;
        }
      });
      
      this.INSURANCE_PATTERNS.values.forEach(pattern => {
        if (allValues.some(val => val.includes(pattern))) {
          insuranceScore += 1;
        }
      });
    }
    
    // Détermination du secteur (AMÉLIORÉ)
    let sector: 'banking' | 'insurance' | 'mixed' | 'unknown';
    let confidence: number;
    let suggestedKPIs: string[] = [];
    let recommendedDashboard: string;
    
    const totalScore = bankingScore + insuranceScore;
    
    if (totalScore === 0) {
      sector = 'unknown';
      confidence = 0;
      recommendedDashboard = 'Generic Analytics Dashboard';
      suggestedKPIs = ['Revenue', 'Costs', 'Profit Margin', 'Growth Rate', 'ROI'];
    } else if (bankingScore > insuranceScore * 1.5) {
      sector = 'banking';
      confidence = bankingScore / totalScore;
      suggestedKPIs = this.PROFILE_KPIS.banker.banking.slice(0, 8);
      recommendedDashboard = this.RECOMMENDED_DASHBOARDS.banking.executive;
    } else if (insuranceScore > bankingScore * 1.5) {
      sector = 'insurance';
      confidence = insuranceScore / totalScore;
      suggestedKPIs = this.PROFILE_KPIS.actuary.insurance.slice(0, 8);
      recommendedDashboard = this.RECOMMENDED_DASHBOARDS.insurance.executive;
    } else {
      sector = 'mixed';
      confidence = 0.5;
      suggestedKPIs = [
        ...this.PROFILE_KPIS.banker.banking.slice(0, 4),
        ...this.PROFILE_KPIS.actuary.insurance.slice(0, 4)
      ];
      recommendedDashboard = this.RECOMMENDED_DASHBOARDS.mixed.executive;
    }
    
    // AJOUT : Forcer la détection bancaire si des colonnes de crédit sont détectées
    const creditDetection = this.detectCreditPortfolio(schema);
    if (creditDetection.isCreditData && creditDetection.confidence > 0.6) {
      // Si on a des données de crédit, on favorise le secteur bancaire
      if (sector === 'unknown' || sector === 'mixed') {
        sector = 'banking';
        confidence = Math.max(confidence, creditDetection.confidence);
        detectedPatterns.push(...creditDetection.creditColumns.map(col => `Credit: ${col}`));
        
        // Ajouter des KPIs spécifiques au crédit
        if (!suggestedKPIs.includes('NPL Ratio')) {
          suggestedKPIs.unshift('NPL Ratio', 'Expected Loss', 'Credit Risk RWA');
        }
      }
    }
    
    return {
      sector,
      confidence: Math.round(confidence * 100) / 100,
      detectedPatterns: detectedPatterns.slice(0, 10),
      suggestedKPIs: suggestedKPIs,
      recommendedDashboard
    };
  }

  /**
   * Obtient les KPIs suggérés basés sur le profil et le secteur (CONSERVÉ)
   */
  static getSuggestedKPIs(profile: string, sector: string): string[] {
    if (this.PROFILE_KPIS[profile] && this.PROFILE_KPIS[profile][sector]) {
      return this.PROFILE_KPIS[profile][sector];
    }
    
    // Fallback vers les KPIs généraux du secteur
    if (sector === 'banking') {
      return this.PROFILE_KPIS.banker.banking;
    } else if (sector === 'insurance') {
      return this.PROFILE_KPIS.actuary.insurance;
    }
    
    return ['Revenue', 'Costs', 'Profit Margin', 'Growth Rate'];
  }

  /**
   * Valide la qualité des données et suggère des corrections (AMÉLIORÉ)
   */
  static validateDataQuality(schema: DataSchema): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
    quality?: {
      completeness: number;
      consistency: number;
      accuracy: number;
      overall: number;
    };
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // NOUVEAU : Scores de qualité
    let completenessScore = 100;
    let consistencyScore = 100;
    let accuracyScore = 100;
    
    // Vérification des colonnes vides
    schema.columns.forEach(column => {
      const values = schema.sampleData.map(row => row[column]);
      const nullCount = values.filter(v => v === null || v === undefined || v === '').length;
      const nullPercentage = (nullCount / values.length) * 100;
      
      if (nullCount === values.length) {
        issues.push(`Colonne '${column}' entièrement vide`);
        suggestions.push(`Supprimer la colonne '${column}' ou la remplir avec des valeurs appropriées`);
        completenessScore -= 10;
      } else if (nullPercentage > 50) {
        issues.push(`Colonne '${column}' contient ${nullPercentage.toFixed(0)}% de valeurs manquantes`);
        suggestions.push(`Vérifier la qualité des données pour '${column}'`);
        completenessScore -= 5;
      }
    });
    
    // Vérification du nombre de lignes
    if (schema.rowCount < 10) {
      issues.push('Moins de 10 lignes de données détectées');
      suggestions.push('Importer plus de données pour une analyse significative');
      accuracyScore -= 20;
    } else if (schema.rowCount < 100) {
      issues.push('Dataset limité (moins de 100 lignes)');
      suggestions.push('Un dataset plus large améliorerait la précision des analyses');
      accuracyScore -= 10;
    }
    
    // Vérification des types de données numériques
    const numericColumns = Object.entries(schema.dataTypes)
      .filter(([_, type]) => type === 'number' || type === 'percentage')
      .map(([col, _]) => col);
    
    if (numericColumns.length === 0) {
      issues.push('Aucune colonne numérique détectée');
      suggestions.push('Vérifier que les données numériques sont correctement formatées');
      consistencyScore -= 20;
    }
    
    // NOUVEAU : Vérification de la cohérence des types
    Object.entries(schema.dataTypes).forEach(([column, type]) => {
      if (type === 'unknown') {
        issues.push(`Type de données incohérent pour '${column}'`);
        suggestions.push(`Vérifier le format des données dans la colonne '${column}'`);
        consistencyScore -= 5;
      }
    });
    
    // Calcul des scores finaux
    completenessScore = Math.max(0, completenessScore);
    consistencyScore = Math.max(0, consistencyScore);
    accuracyScore = Math.max(0, accuracyScore);
    const overallScore = Math.round((completenessScore + consistencyScore + accuracyScore) / 3);
    
    return {
      isValid: issues.length === 0,
      issues,
      suggestions,
      quality: {
        completeness: completenessScore,
        consistency: consistencyScore,
        accuracy: accuracyScore,
        overall: overallScore
      }
    };
  }

  /**
   * Configure automatiquement le dashboard basé sur la détection (AMÉLIORÉ)
   */
  static generateDashboardConfig(
    detectionResult: SectorDetectionResult, 
    userProfile?: string,
    dataSchema?: DataSchema
  ): {
    layout: any;
    widgets: any[];
    theme: any;
    filters?: any[];
  } {
    const baseTheme = {
      primary: detectionResult.sector === 'banking' ? '#1e40af' : 
               detectionResult.sector === 'insurance' ? '#7c3aed' : '#4f46e5',
      secondary: detectionResult.sector === 'banking' ? '#3b82f6' : 
                 detectionResult.sector === 'insurance' ? '#8b5cf6' : '#6366f1',
      accent: detectionResult.sector === 'banking' ? '#60a5fa' : 
              detectionResult.sector === 'insurance' ? '#a78bfa' : '#818cf8',
      background: '#f9fafb',
      text: '#111827'
    };
    
    // Obtenir les KPIs appropriés pour le profil
    const kpis = userProfile 
      ? this.getSuggestedKPIs(userProfile, detectionResult.sector)
      : detectionResult.suggestedKPIs;
    
    // AMÉLIORATION : Widgets plus sophistiqués
    const widgets = kpis.slice(0, 8).map((kpi, index) => ({
      id: `widget-${index}`,
      type: index < 4 ? 'metric' : index < 6 ? 'chart' : 'table',
      title: kpi,
      dataKey: this.findMatchingColumn(kpi, dataSchema),
      position: { 
        x: (index % 4) * 3, 
        y: Math.floor(index / 4) * 4, 
        w: 3, 
        h: 4 
      },
      config: {
        showTrend: true,
        showThreshold: true,
        chartType: index === 4 ? 'line' : 'bar'
      }
    }));
    
    // NOUVEAU : Ajouter des filtres automatiques
    const filters = dataSchema ? this.generateFilters(dataSchema) : [];
    
    return {
      layout: {
        cols: 12,
        rowHeight: 60,
        widgets: widgets.map(w => w.position)
      },
      widgets,
      theme: baseTheme,
      filters
    };
  }

  /**
   * Appel API pour analyse côté serveur (CONSERVÉ)
   */
  static async analyzeFileOnServer(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:8000/api/import/analyze', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse du fichier');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

  // ========== NOUVELLES MÉTHODES ==========

  /**
   * Trouve la colonne correspondante pour un KPI
   */
  private static findMatchingColumn(kpi: string, schema?: DataSchema): string | null {
    if (!schema) return null;
    
    const kpiLower = kpi.toLowerCase().replace(/[^a-z0-9]/g, '');
    const column = schema.columns.find(col => {
      const colLower = col.toLowerCase().replace(/[^a-z0-9]/g, '');
      return colLower.includes(kpiLower) || kpiLower.includes(colLower);
    });
    
    return column || null;
  }

  /**
   * Génère des filtres automatiques basés sur le schéma
   */
  private static generateFilters(schema: DataSchema): any[] {
    const filters: any[] = [];
    
    Object.entries(schema.dataTypes).forEach(([column, type]) => {
      if (type === 'date') {
        filters.push({
          type: 'dateRange',
          column,
          label: this.formatColumnName(column),
          defaultValue: 'last30days'
        });
      } else if (type === 'string') {
        // Pour les colonnes catégorielles avec peu de valeurs uniques
        const uniqueValues = [...new Set(schema.sampleData.map(row => row[column]))];
        if (uniqueValues.length < 10) {
          filters.push({
            type: 'multiSelect',
            column,
            label: this.formatColumnName(column),
            options: uniqueValues.filter(v => v !== null && v !== '')
          });
        }
      }
    });
    
    return filters.slice(0, 4); // Limiter à 4 filtres
  }

  /**
   * Formate le nom d'une colonne pour l'affichage
   */
  private static formatColumnName(column: string): string {
    return column
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Génère des suggestions d'analyse basées sur les données
   */
  static generateAnalysisSuggestions(
    schema: DataSchema,
    sector: string
  ): string[] {
    const suggestions: string[] = [];
    
    // Suggestions basées sur le secteur
    if (sector === 'banking') {
      suggestions.push('Analyser l\'évolution des ratios prudentiels');
      suggestions.push('Créer un stress test sur le portefeuille de crédit');
      suggestions.push('Examiner la concentration des risques par secteur');
    } else if (sector === 'insurance') {
      suggestions.push('Analyser les triangles de développement des sinistres');
      suggestions.push('Calculer les réserves techniques par méthode actuarielle');
      suggestions.push('Évaluer l\'adéquation du capital Solvency II');
    }
    
    // Suggestions basées sur les types de données
    const hasTimeData = Object.values(schema.dataTypes).includes('date');
    const hasNumericData = Object.values(schema.dataTypes).some(
      type => type === 'number' || type === 'percentage'
    );
    
    if (hasTimeData && hasNumericData) {
      suggestions.push('Créer une analyse de tendance temporelle');
      suggestions.push('Identifier les patterns saisonniers');
    }
    
    if (hasNumericData) {
      suggestions.push('Détecter les anomalies dans les données');
      suggestions.push('Réaliser une analyse de corrélation');
    }
    
    return suggestions.slice(0, 5);
  }

  /**
   * MÉTHODE AMÉLIORÉE : Détecte si les données contiennent un portefeuille de crédit
   */
  static detectCreditPortfolio(schema: DataSchema): {
    isCreditData: boolean;
    confidence: number;
    creditColumns: string[];
    suggestedAction: string;
  } {
    // AMÉLIORATION : Liste étendue de mots-clés
    const creditKeywords = [
      // Mots-clés principaux
      'loan', 'credit', 'debt', 'lending', 'borrower', 'lender',
      // Identifiants
      'loan_id', 'loanid', 'credit_id', 'creditid', 'account_number',
      // Montants
      'loan_amount', 'loanamount', 'principal', 'amount', 'balance',
      'outstanding', 'outstanding_balance', 'outstandingbalance',
      // Taux et coûts
      'interest', 'interest_rate', 'interestrate', 'rate', 'apr', 'spread',
      // Statut et qualité
      'status', 'loan_status', 'credit_status', 'default', 'npls', 'npl',
      'performing', 'non_performing', 'nonperforming',
      // Risque
      'rating', 'credit_rating', 'creditrating', 'score', 'credit_score',
      'pd', 'lgd', 'ead', 'risk', 'provisions', 'provision',
      // Dates
      'maturity', 'maturity_date', 'due_date', 'origination', 'disbursement',
      // Garanties
      'collateral', 'guarantee', 'security',
      // Client
      'customer', 'customer_name', 'customername', 'client', 'borrower_name'
    ];
    
    // AMÉLIORATION : Normalisation plus robuste
    const normalizeString = (str: string): string => {
      return str.toLowerCase()
        .replace(/[_\s-]/g, '') // Supprime underscores, espaces, tirets
        .replace(/[^a-z0-9]/g, ''); // Garde uniquement alphanumérique
    };
    
    const columnsNormalized = schema.columns.map(c => ({
      original: c,
      normalized: normalizeString(c)
    }));
    
    const creditColumns: string[] = [];
    const matchedKeywords: string[] = [];
    
    // AMÉLIORATION : Détection plus flexible
    columnsNormalized.forEach(({ original, normalized }) => {
      let matched = false;
      
      // Vérification exacte d'abord
      if (creditKeywords.some(keyword => normalized === normalizeString(keyword))) {
        creditColumns.push(original);
        matched = true;
      }
      // Puis vérification partielle
      else if (creditKeywords.some(keyword => {
        const normalizedKeyword = normalizeString(keyword);
        return normalized.includes(normalizedKeyword) || normalizedKeyword.includes(normalized);
      })) {
        creditColumns.push(original);
        matched = true;
      }
      
      if (matched) {
        // Trouver quel mot-clé a matché pour le debug
        const matchedKeyword = creditKeywords.find(keyword => {
          const normalizedKeyword = normalizeString(keyword);
          return normalized === normalizedKeyword || 
                 normalized.includes(normalizedKeyword) || 
                 normalizedKeyword.includes(normalized);
        });
        if (matchedKeyword) matchedKeywords.push(matchedKeyword);
      }
    });
    
    // AMÉLIORATION : Détection des patterns de données de crédit
    let hasLoanIdentifier = creditColumns.some(col => 
      normalizeString(col).includes('loanid') || 
      normalizeString(col).includes('creditid') ||
      normalizeString(col).includes('id')
    );
    
    let hasAmountData = creditColumns.some(col => 
      normalizeString(col).includes('amount') || 
      normalizeString(col).includes('balance') ||
      normalizeString(col).includes('principal')
    );
    
    let hasRateData = creditColumns.some(col => 
      normalizeString(col).includes('rate') || 
      normalizeString(col).includes('interest')
    );
    
    // AMÉLIORATION : Calcul de confiance plus nuancé
    let confidence = 0;
    
    // Points de base selon le nombre de colonnes
    if (creditColumns.length >= 5) confidence = 0.9;
    else if (creditColumns.length >= 4) confidence = 0.8;
    else if (creditColumns.length >= 3) confidence = 0.6;
    else if (creditColumns.length >= 2) confidence = 0.4;
    else if (creditColumns.length >= 1) confidence = 0.2;
    
    // Bonus pour patterns spécifiques
    if (hasLoanIdentifier) confidence += 0.1;
    if (hasAmountData) confidence += 0.1;
    if (hasRateData) confidence += 0.1;
    
    // Ajustement final
    confidence = Math.min(1, confidence);
    
    // AMÉLIORATION : Seuil plus bas pour la détection
    const isCreditData = creditColumns.length >= 2 && confidence >= 0.4;
    
    // AMÉLIORATION : Message plus détaillé
    let suggestedAction = '';
    if (isCreditData) {
      if (creditColumns.length >= 4) {
        suggestedAction = `Portefeuille de crédit détecté avec ${creditColumns.length} colonnes (${creditColumns.join(', ')}). Voulez-vous lancer une analyse approfondie du risque de crédit ?`;
      } else {
        suggestedAction = `Données de crédit potentielles détectées (${creditColumns.length} colonnes). Voulez-vous explorer l'analyse de risque de crédit ?`;
      }
    }
    
    // DEBUG : Logs détaillés
    console.log('🔍 Détection crédit - Colonnes analysées:', schema.columns);
    console.log('🔍 Détection crédit - Colonnes normalisées:', columnsNormalized);
    console.log('🔍 Détection crédit - Mots-clés matchés:', matchedKeywords);
    console.log('🔍 Détection crédit - Colonnes crédit trouvées:', creditColumns);
    console.log('🔍 Détection crédit - Patterns:', { hasLoanIdentifier, hasAmountData, hasRateData });
    console.log('🔍 Détection crédit - Résultat final:', { isCreditData, confidence, creditColumns: creditColumns.length });
    
    return {
      isCreditData,
      confidence: Math.round(confidence * 100) / 100,
      creditColumns,
      suggestedAction
    };
  }
}