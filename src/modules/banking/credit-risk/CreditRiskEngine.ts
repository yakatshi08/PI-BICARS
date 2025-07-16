// Chemin: C:\PROJETS-DEVELOPPEMENT\Analyse_Donnees_CLEAN\project\src\modules\banking\credit-risk\CreditRiskEngine.ts

export interface LoanData {
  id: string;
  borrower: string;
  amount: number;
  interestRate: number;
  duration: number; // en mois
  startDate: Date;
  sector: string;
  rating: string;
  collateral: number;
  outstandingAmount: number;
  status: 'performing' | 'non-performing' | 'default';
  provisions?: number;
  lgd?: number; // Loss Given Default
  pd?: number; // Probability of Default
  ead?: number; // Exposure at Default
}

export interface CreditPortfolio {
  loans: LoanData[];
  totalExposure: number;
  totalProvisions: number;
  nplRatio: number;
  averagePD: number;
  expectedLoss: number;
  unexpectedLoss: number;
  economicCapital: number;
}

export interface StressTestScenario {
  name: string;
  pdMultiplier: number;
  lgdMultiplier: number;
  collateralHaircut: number;
  sectorImpacts: Record<string, number>;
}

export interface RiskMetrics {
  var95: number;
  var99: number;
  expectedShortfall: number;
  creditVaR: number;
  concentrationRisk: number;
  sectorConcentration: Record<string, number>;
  ratingDistribution: Record<string, number>;
  maturityProfile: {
    '0-1Y': number;
    '1-3Y': number;
    '3-5Y': number;
    '5Y+': number;
  };
}

export class CreditRiskEngine {
  // Paramètres de risque par rating (Basel III)
  private static readonly RISK_WEIGHTS = {
    'AAA': 0.20,
    'AA': 0.20,
    'A': 0.50,
    'BBB': 1.00,
    'BB': 1.00,
    'B': 1.50,
    'CCC': 1.50,
    'D': 1.50
  };

  // PD par rating (probabilités annuelles)
  private static readonly DEFAULT_PD = {
    'AAA': 0.0001,
    'AA': 0.0003,
    'A': 0.0008,
    'BBB': 0.0024,
    'BB': 0.0136,
    'B': 0.0608,
    'CCC': 0.2642,
    'D': 1.0000
  };

  // LGD par type de garantie
  private static readonly DEFAULT_LGD = {
    'secured': 0.35,
    'partially_secured': 0.45,
    'unsecured': 0.65,
    'sovereign': 0.45,
    'corporate': 0.40,
    'retail': 0.45
  };

  /**
   * Calcule les métriques de risque pour un prêt
   */
  static calculateLoanRisk(loan: LoanData): LoanData {
    // PD basée sur le rating
    const pd = loan.pd || this.DEFAULT_PD[loan.rating] || 0.05;
    
    // LGD basée sur le ratio de collatéral
    const collateralRatio = loan.collateral / loan.amount;
    let lgd = loan.lgd;
    if (!lgd) {
      if (collateralRatio >= 1.5) lgd = this.DEFAULT_LGD.secured;
      else if (collateralRatio >= 0.5) lgd = this.DEFAULT_LGD.partially_secured;
      else lgd = this.DEFAULT_LGD.unsecured;
    }
    
    // EAD (Exposure at Default)
    const ead = loan.ead || loan.outstandingAmount;
    
    // Expected Loss
    const expectedLoss = pd * lgd * ead;
    
    // Provisions IFRS 9
    const provisions = loan.provisions || expectedLoss;
    
    return {
      ...loan,
      pd,
      lgd,
      ead,
      provisions
    };
  }

  /**
   * Analyse un portefeuille de crédit
   */
  static analyzePortfolio(loans: LoanData[]): CreditPortfolio {
    // Enrichir les données de prêt avec les métriques de risque
    const enrichedLoans = loans.map(loan => this.calculateLoanRisk(loan));
    
    // Calculs agrégés
    const totalExposure = enrichedLoans.reduce((sum, loan) => sum + loan.outstandingAmount, 0);
    const totalProvisions = enrichedLoans.reduce((sum, loan) => sum + (loan.provisions || 0), 0);
    
    // NPL Ratio
    const nplAmount = enrichedLoans
      .filter(loan => loan.status === 'non-performing' || loan.status === 'default')
      .reduce((sum, loan) => sum + loan.outstandingAmount, 0);
    const nplRatio = totalExposure > 0 ? nplAmount / totalExposure : 0;
    
    // PD moyenne pondérée
    const averagePD = enrichedLoans.reduce((sum, loan) => 
      sum + (loan.pd || 0) * loan.outstandingAmount, 0
    ) / totalExposure;
    
    // Expected Loss total
    const expectedLoss = enrichedLoans.reduce((sum, loan) => 
      sum + (loan.pd || 0) * (loan.lgd || 0) * loan.outstandingAmount, 0
    );
    
    // Unexpected Loss (approximation simplifiée)
    const variance = enrichedLoans.reduce((sum, loan) => {
      const el = (loan.pd || 0) * (loan.lgd || 0) * loan.outstandingAmount;
      return sum + loan.outstandingAmount * (loan.pd || 0) * (1 - (loan.pd || 0)) * Math.pow(loan.lgd || 0, 2);
    }, 0);
    const unexpectedLoss = Math.sqrt(variance);
    
    // Capital économique (99.9% VaR)
    const economicCapital = unexpectedLoss * 2.33; // Approximation normale à 99.9%
    
    return {
      loans: enrichedLoans,
      totalExposure,
      totalProvisions,
      nplRatio,
      averagePD,
      expectedLoss,
      unexpectedLoss,
      economicCapital
    };
  }

  /**
   * Calcule les métriques de risque avancées
   */
  static calculateRiskMetrics(portfolio: CreditPortfolio): RiskMetrics {
    const { loans, totalExposure } = portfolio;
    
    // Distribution par secteur
    const sectorConcentration: Record<string, number> = {};
    loans.forEach(loan => {
      sectorConcentration[loan.sector] = (sectorConcentration[loan.sector] || 0) + loan.outstandingAmount;
    });
    Object.keys(sectorConcentration).forEach(sector => {
      sectorConcentration[sector] = sectorConcentration[sector] / totalExposure;
    });
    
    // Distribution par rating
    const ratingDistribution: Record<string, number> = {};
    loans.forEach(loan => {
      ratingDistribution[loan.rating] = (ratingDistribution[loan.rating] || 0) + loan.outstandingAmount;
    });
    Object.keys(ratingDistribution).forEach(rating => {
      ratingDistribution[rating] = ratingDistribution[rating] / totalExposure;
    });
    
    // Profil de maturité
    const maturityProfile = {
      '0-1Y': 0,
      '1-3Y': 0,
      '3-5Y': 0,
      '5Y+': 0
    };
    
    loans.forEach(loan => {
      const remainingMonths = loan.duration - 
        Math.floor((new Date().getTime() - new Date(loan.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
      
      if (remainingMonths <= 12) maturityProfile['0-1Y'] += loan.outstandingAmount;
      else if (remainingMonths <= 36) maturityProfile['1-3Y'] += loan.outstandingAmount;
      else if (remainingMonths <= 60) maturityProfile['3-5Y'] += loan.outstandingAmount;
      else maturityProfile['5Y+'] += loan.outstandingAmount;
    });
    
    Object.keys(maturityProfile).forEach(bucket => {
      maturityProfile[bucket] = maturityProfile[bucket] / totalExposure;
    });
    
    // Concentration Risk (Herfindahl-Hirschman Index)
    const hhi = Object.values(sectorConcentration).reduce((sum, share) => sum + Math.pow(share, 2), 0);
    const concentrationRisk = hhi;
    
    // VaR et CVaR simplifiés
    const var95 = portfolio.expectedLoss + 1.65 * portfolio.unexpectedLoss;
    const var99 = portfolio.expectedLoss + 2.33 * portfolio.unexpectedLoss;
    const expectedShortfall = var99 * 1.2; // Approximation
    const creditVaR = var99 - portfolio.expectedLoss;
    
    return {
      var95,
      var99,
      expectedShortfall,
      creditVaR,
      concentrationRisk,
      sectorConcentration,
      ratingDistribution,
      maturityProfile
    };
  }

  /**
   * Effectue un stress test sur le portefeuille
   */
  static performStressTest(
    portfolio: CreditPortfolio, 
    scenario: StressTestScenario
  ): {
    baseCase: CreditPortfolio;
    stressedCase: CreditPortfolio;
    impact: {
      expectedLossIncrease: number;
      capitalRequirementIncrease: number;
      nplRatioIncrease: number;
      provisioningGap: number;
    };
  } {
    // Copie du portefeuille pour le scénario stressé
    const stressedLoans = portfolio.loans.map(loan => {
      // Appliquer les multiplicateurs du scénario
      const stressedPD = Math.min(1, (loan.pd || 0) * scenario.pdMultiplier);
      const stressedLGD = Math.min(1, (loan.lgd || 0) * scenario.lgdMultiplier);
      
      // Impact sectoriel
      const sectorImpact = scenario.sectorImpacts[loan.sector] || 1;
      const adjustedPD = Math.min(1, stressedPD * sectorImpact);
      
      // Réduction de la valeur du collatéral
      const stressedCollateral = loan.collateral * (1 - scenario.collateralHaircut);
      
      // Recalculer les provisions
      const stressedEAD = loan.outstandingAmount;
      const stressedExpectedLoss = adjustedPD * stressedLGD * stressedEAD;
      
      return {
        ...loan,
        pd: adjustedPD,
        lgd: stressedLGD,
        collateral: stressedCollateral,
        provisions: stressedExpectedLoss
      };
    });
    
    // Analyser le portefeuille stressé
    const stressedPortfolio = this.analyzePortfolio(stressedLoans);
    
    // Calculer l'impact
    const impact = {
      expectedLossIncrease: stressedPortfolio.expectedLoss - portfolio.expectedLoss,
      capitalRequirementIncrease: stressedPortfolio.economicCapital - portfolio.economicCapital,
      nplRatioIncrease: stressedPortfolio.nplRatio - portfolio.nplRatio,
      provisioningGap: stressedPortfolio.expectedLoss - stressedPortfolio.totalProvisions
    };
    
    return {
      baseCase: portfolio,
      stressedCase: stressedPortfolio,
      impact
    };
  }

  /**
   * Génère des scénarios de stress test prédéfinis
   */
  static getStandardScenarios(): StressTestScenario[] {
    return [
      {
        name: 'Récession modérée',
        pdMultiplier: 1.5,
        lgdMultiplier: 1.2,
        collateralHaircut: 0.1,
        sectorImpacts: {
          'retail': 1.3,
          'construction': 1.5,
          'manufacturing': 1.2,
          'services': 1.1
        }
      },
      {
        name: 'Crise financière sévère',
        pdMultiplier: 3.0,
        lgdMultiplier: 1.5,
        collateralHaircut: 0.3,
        sectorImpacts: {
          'retail': 2.0,
          'construction': 3.0,
          'manufacturing': 2.5,
          'services': 1.8,
          'real_estate': 3.5
        }
      },
      {
        name: 'Choc sectoriel (Immobilier)',
        pdMultiplier: 1.2,
        lgdMultiplier: 1.1,
        collateralHaircut: 0.4,
        sectorImpacts: {
          'real_estate': 5.0,
          'construction': 3.0,
          'retail': 1.1,
          'manufacturing': 1.0,
          'services': 1.0
        }
      },
      {
        name: 'Stress test BCE 2023',
        pdMultiplier: 2.1,
        lgdMultiplier: 1.3,
        collateralHaircut: 0.25,
        sectorImpacts: {
          'retail': 1.8,
          'corporate': 2.2,
          'sme': 2.5,
          'real_estate': 2.8
        }
      }
    ];
  }

  /**
   * Calcule les ratios réglementaires
   */
  static calculateRegulatoryRatios(portfolio: CreditPortfolio): {
    rwa: number;
    tier1Capital: number;
    tier1Ratio: number;
    provisioningRatio: number;
    coverageRatio: number;
  } {
    // RWA (Risk Weighted Assets)
    const rwa = portfolio.loans.reduce((sum, loan) => {
      const riskWeight = this.RISK_WEIGHTS[loan.rating] || 1.0;
      return sum + loan.outstandingAmount * riskWeight;
    }, 0);
    
    // Capital Tier 1 requis (8% des RWA)
    const tier1Capital = rwa * 0.08;
    
    // Ratio Tier 1
    const tier1Ratio = portfolio.economicCapital / rwa;
    
    // Ratio de provisionnement
    const provisioningRatio = portfolio.totalProvisions / portfolio.totalExposure;
    
    // Ratio de couverture des NPL
    const nplAmount = portfolio.loans
      .filter(loan => loan.status === 'non-performing' || loan.status === 'default')
      .reduce((sum, loan) => sum + loan.outstandingAmount, 0);
    const coverageRatio = nplAmount > 0 ? portfolio.totalProvisions / nplAmount : 1;
    
    return {
      rwa,
      tier1Capital,
      tier1Ratio,
      provisioningRatio,
      coverageRatio
    };
  }

  /**
   * Génère des données de prêt aléatoires pour les tests
   */
  static generateSampleLoans(count: number = 100): LoanData[] {
    const sectors = ['retail', 'corporate', 'real_estate', 'manufacturing', 'services', 'construction'];
    const ratings = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC'];
    const statuses = ['performing', 'performing', 'performing', 'performing', 'non-performing', 'default'];
    
    return Array.from({ length: count }, (_, i) => {
      const amount = Math.floor(Math.random() * 5000000) + 100000;
      const rating = ratings[Math.floor(Math.random() * ratings.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        id: `LOAN-${i + 1}`,
        borrower: `Company ${i + 1}`,
        amount,
        interestRate: 3 + Math.random() * 5,
        duration: [12, 24, 36, 48, 60][Math.floor(Math.random() * 5)],
        startDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1),
        sector: sectors[Math.floor(Math.random() * sectors.length)],
        rating,
        collateral: amount * (0.2 + Math.random() * 1.3),
        outstandingAmount: amount * (0.3 + Math.random() * 0.7),
        status: status as 'performing' | 'non-performing' | 'default'
      };
    });
  }
}