// Chemin: C:\PROJETS-DEVELOPPEMENT\Analyse_Donnees_CLEAN\project\src\services\ai\ImportAssistant.ts

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
  // Patterns de détection pour le secteur bancaire
  private static readonly BANKING_PATTERNS = {
    columns: [
      'assets', 'loans', 'deposits', 'interest_income', 'nii', 
      'tier1', 'tier1_capital', 'cet1', 'lcr', 'nsfr',
      'provisions', 'npls', 'non_performing_loans', 'rwa',
      'net_interest_margin', 'cost_income_ratio'
    ],
    values: [
      'mortgage', 'credit_card', 'commercial_loan', 'retail_banking',
      'corporate_banking', 'investment_banking', 'treasury'
    ]
  };

  // Patterns de détection pour le secteur assurance
  private static readonly INSURANCE_PATTERNS = {
    columns: [
      'premiums', 'claims', 'reserves', 'technical_reserves',
      'scr', 'mcr', 'solvency_ratio', 'combined_ratio',
      'loss_ratio', 'expense_ratio', 'underwriting_result',
      'reinsurance', 'own_funds', 'risk_margin'
    ],
    values: [
      'life_insurance', 'non_life', 'health_insurance', 'property',
      'casualty', 'liability', 'motor', 'marine', 'aviation'
    ]
  };

  // KPIs suggérés par secteur et profil
  private static readonly PROFILE_KPIS = {
    banker: {
      banking: [
        'Net Interest Income (NII)',
        'Return on Assets (ROA)',
        'Common Equity Tier 1 (CET1) Ratio',
        'Liquidity Coverage Ratio (LCR)',
        'Non-Performing Loans (NPL) Ratio',
        'Cost-to-Income Ratio'
      ],
      insurance: [
        'Premium to Loan Ratio',
        'Insurance Exposure Risk',
        'Coverage Ratios'
      ]
    },
    actuary: {
      insurance: [
        'Combined Ratio',
        'Loss Ratio',
        'Expense Ratio',
        'Solvency Capital Requirement (SCR) Coverage',
        'Technical Reserves Adequacy',
        'Claims Development Triangles'
      ],
      banking: [
        'Credit Risk Modeling',
        'Loan Mortality Analysis',
        'IFRS 9 Provisions'
      ]
    },
    'risk-manager': {
      banking: [
        'Value at Risk (VaR)',
        'Stressed VaR',
        'Risk Concentration',
        'COREP Compliance Ratios',
        'Liquidity Stress Test Results'
      ],
      insurance: [
        'SCR Coverage Ratio',
        'Underwriting Risk Metrics',
        'Risk Correlation Matrix',
        'ORSA Results'
      ]
    },
    cfo: {
      banking: [
        'Return on Equity (ROE)',
        'Net Interest Margin (NIM)',
        'Operating Efficiency Ratio',
        'Business Line Profitability',
        'Revenue Growth Metrics'
      ],
      insurance: [
        'Technical Profitability',
        'ROE by Business Line',
        'Solvency II Overview',
        'Premium Growth Rate'
      ]
    }
  };

  /**
   * Analyse le schéma des données importées
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
   * Détecte le type de données d'une colonne
   */
  private static detectDataType(values: any[]): string {
    const nonNullValues = values.filter(v => v !== null && v !== undefined);
    
    if (nonNullValues.length === 0) return 'unknown';
    
    const isNumeric = nonNullValues.every(v => !isNaN(Number(v)));
    const isDate = nonNullValues.every(v => !isNaN(Date.parse(v)));
    const isBoolean = nonNullValues.every(v => v === true || v === false || v === 'true' || v === 'false');
    
    if (isBoolean) return 'boolean';
    if (isNumeric) return 'number';
    if (isDate) return 'date';
    return 'string';
  }

  /**
   * Détecte automatiquement le secteur basé sur les données
   */
  static detectSector(schema: DataSchema): SectorDetectionResult {
    const columnsLower = schema.columns.map(c => c.toLowerCase());
    const detectedPatterns: string[] = [];
    
    // Score pour chaque secteur
    let bankingScore = 0;
    let insuranceScore = 0;
    
    // Vérification des patterns bancaires
    this.BANKING_PATTERNS.columns.forEach(pattern => {
      if (columnsLower.some(col => col.includes(pattern))) {
        bankingScore += 2;
        detectedPatterns.push(`Banking: ${pattern}`);
      }
    });
    
    // Vérification des patterns assurance
    this.INSURANCE_PATTERNS.columns.forEach(pattern => {
      if (columnsLower.some(col => col.includes(pattern))) {
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
    
    // Détermination du secteur
    let sector: 'banking' | 'insurance' | 'mixed' | 'unknown';
    let confidence: number;
    let suggestedKPIs: string[] = [];
    let recommendedDashboard: string;
    
    const totalScore = bankingScore + insuranceScore;
    
    if (totalScore === 0) {
      sector = 'unknown';
      confidence = 0;
      recommendedDashboard = 'Generic Analytics Dashboard';
      suggestedKPIs = ['Revenue', 'Costs', 'Profit Margin', 'Growth Rate'];
    } else if (bankingScore > insuranceScore * 1.5) {
      sector = 'banking';
      confidence = bankingScore / (bankingScore + insuranceScore);
      suggestedKPIs = this.PROFILE_KPIS.banker.banking;
      recommendedDashboard = 'Banking Executive Dashboard';
    } else if (insuranceScore > bankingScore * 1.5) {
      sector = 'insurance';
      confidence = insuranceScore / (bankingScore + insuranceScore);
      suggestedKPIs = this.PROFILE_KPIS.actuary.insurance;
      recommendedDashboard = 'Insurance Executive Dashboard';
    } else {
      sector = 'mixed';
      confidence = 0.5;
      suggestedKPIs = [
        ...this.PROFILE_KPIS.banker.banking.slice(0, 3),
        ...this.PROFILE_KPIS.actuary.insurance.slice(0, 3)
      ];
      recommendedDashboard = 'Hybrid Finance & Insurance Dashboard';
    }
    
    return {
      sector,
      confidence: Math.round(confidence * 100) / 100,
      detectedPatterns: detectedPatterns.slice(0, 10),
      suggestedKPIs: suggestedKPIs.slice(0, 10),
      recommendedDashboard
    };
  }

  /**
   * Obtient les KPIs suggérés basés sur le profil et le secteur
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
   * Valide la qualité des données et suggère des corrections
   */
  static validateDataQuality(schema: DataSchema): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Vérification des colonnes vides
    schema.columns.forEach(column => {
      const values = schema.sampleData.map(row => row[column]);
      const nullCount = values.filter(v => v === null || v === undefined || v === '').length;
      
      if (nullCount === values.length) {
        issues.push(`Colonne '${column}' entièrement vide`);
        suggestions.push(`Supprimer la colonne '${column}' ou la remplir avec des valeurs appropriées`);
      } else if (nullCount > values.length * 0.5) {
        issues.push(`Colonne '${column}' contient plus de 50% de valeurs manquantes`);
        suggestions.push(`Vérifier la qualité des données pour '${column}'`);
      }
    });
    
    // Vérification du nombre de lignes
    if (schema.rowCount < 10) {
      issues.push('Moins de 10 lignes de données détectées');
      suggestions.push('Importer plus de données pour une analyse significative');
    }
    
    // Vérification des types de données numériques
    const numericColumns = Object.entries(schema.dataTypes)
      .filter(([_, type]) => type === 'number')
      .map(([col, _]) => col);
    
    if (numericColumns.length === 0) {
      issues.push('Aucune colonne numérique détectée');
      suggestions.push('Vérifier que les données numériques sont correctement formatées');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }

  /**
   * Configure automatiquement le dashboard basé sur la détection
   */
  static generateDashboardConfig(detectionResult: SectorDetectionResult, userProfile?: string): {
    layout: any;
    widgets: any[];
    theme: any;
  } {
    const baseTheme = {
      primary: detectionResult.sector === 'banking' ? '#1e40af' : '#7c3aed',
      secondary: detectionResult.sector === 'banking' ? '#3b82f6' : '#8b5cf6',
      accent: detectionResult.sector === 'banking' ? '#60a5fa' : '#a78bfa',
      background: '#f9fafb',
      text: '#111827'
    };
    
    // Obtenir les KPIs appropriés pour le profil
    const kpis = userProfile 
      ? this.getSuggestedKPIs(userProfile, detectionResult.sector)
      : detectionResult.suggestedKPIs;
    
    const widgets = kpis.slice(0, 6).map((kpi, index) => ({
      id: `widget-${index}`,
      type: index < 3 ? 'metric' : 'chart',
      title: kpi,
      position: { x: (index % 3) * 4, y: Math.floor(index / 3) * 4, w: 4, h: 4 }
    }));
    
    return {
      layout: {
        cols: 12,
        rowHeight: 60,
        widgets: widgets.map(w => w.position)
      },
      widgets,
      theme: baseTheme
    };
  }

  /**
   * Appel API pour analyse côté serveur
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
}