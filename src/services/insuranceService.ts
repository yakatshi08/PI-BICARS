import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface InsuranceMetrics {
  combined_ratio: number;
  loss_ratio: number;
  expense_ratio: number;
  scr_ratio: number;
  mcr_ratio: number;
  roe_insurance: number;
  gross_premiums: number;
  claims_paid: number;
}

export interface ClaimsAnalysis {
  total_claims: number;
  average_claim: number;
  largest_claim: number;
  claims_frequency: number;
  severity_trend: string;
}

class InsuranceService {
  // Récupérer les KPIs d'assurance
  async getInsuranceKPIs(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/kpis`);
      return response.data.insurance || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des KPIs assurance:', error);
      throw error;
    }
  }

  // Récupérer les métriques détaillées
  async getInsuranceMetrics(): Promise<InsuranceMetrics> {
    try {
      // Pour le moment, retourne des données mockées
      // À remplacer par l'appel API réel quand l'endpoint sera prêt
      return {
        combined_ratio: 94.5,
        loss_ratio: 62.3,
        expense_ratio: 32.2,
        scr_ratio: 168,
        mcr_ratio: 420,
        roe_insurance: 14.2,
        gross_premiums: 45000000,
        claims_paid: 28035000
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques:', error);
      throw error;
    }
  }

  // Analyser les sinistres
  async analyzeClaimsData(productType?: string, period?: string): Promise<ClaimsAnalysis> {
    try {
      // Simulation d'appel API
      const params = {
        product: productType,
        period: period
      };
      
      // Pour le moment, retourne des données mockées
      return {
        total_claims: 1234,
        average_claim: 22750,
        largest_claim: 125000,
        claims_frequency: 0.045,
        severity_trend: 'stable'
      };
    } catch (error) {
      console.error('Erreur lors de l\'analyse des sinistres:', error);
      throw error;
    }
  }

  // Calculer les provisions techniques
  async calculateTechnicalProvisions(data: any): Promise<any> {
    try {
      // Appel API vers le module actuariel
      // Pour le moment, simulation
      return {
        best_estimate: data.claims_reserve * 1.1,
        risk_margin: data.claims_reserve * 0.06,
        total_provisions: data.claims_reserve * 1.16
      };
    } catch (error) {
      console.error('Erreur lors du calcul des provisions:', error);
      throw error;
    }
  }

  // Obtenir les ratios Solvency II
  async getSolvencyIIRatios(): Promise<any> {
    try {
      // Simulation d'appel API
      return {
        scr: {
          total: 45000000,
          market_risk: 15000000,
          underwriting_risk: 20000000,
          counterparty_risk: 5000000,
          operational_risk: 5000000
        },
        mcr: 11250000,
        eligible_own_funds: 75600000,
        scr_ratio: 168,
        mcr_ratio: 420
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des ratios Solvency II:', error);
      throw error;
    }
  }
}

export default new InsuranceService();