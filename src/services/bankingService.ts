import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface BankingMetrics {
  nii: number;
  lcr: number;
  nsfr: number;
  cet1: number;
  npl_ratio: number;
  roe: number;
  total_assets: number;
  total_loans: number;
}

export interface RiskMetrics {
  total_exposure: number;
  average_pd: number;
  expected_loss: number;
  provisions: number;
  coverage_ratio: number;
}

class BankingService {
  // Récupérer les KPIs bancaires
  async getBankingKPIs(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/kpis`);
      return response.data.banking || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des KPIs bancaires:', error);
      throw error;
    }
  }

  // Récupérer les métriques détaillées
  async getBankingMetrics(): Promise<BankingMetrics> {
    try {
      // Pour le moment, retourne des données mockées
      // À remplacer par l'appel API réel quand l'endpoint sera prêt
      return {
        nii: 3.24,
        lcr: 125.5,
        nsfr: 118.2,
        cet1: 14.8,
        npl_ratio: 2.3,
        roe: 12.5,
        total_assets: 125000000,
        total_loans: 87500000
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques:', error);
      throw error;
    }
  }

  // Récupérer les données du dashboard Credit Risk
  async getCreditRiskDashboard(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/credit-risk/risk-dashboard`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du dashboard Credit Risk:', error);
      throw error;
    }
  }

  // Calculer l'ECL (Expected Credit Loss)
  async calculateECL(data: { pd: number; lgd: number; ead: number }): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/credit-risk/calculate-ecl`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du calcul ECL:', error);
      throw error;
    }
  }
}

export default new BankingService();