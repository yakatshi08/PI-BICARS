import apiClient from './api';

export interface ReportData {
  id: number;
  title: string;
  type: string;
  date: string;
  status: string;
  content: any;
}

class ReportService {
  async getReports(): Promise<ReportData[]> {
    try {
      const response = await apiClient.get('/reports/');
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Données de fallback
      return [
        {
          id: 1,
          title: "Rapport Mensuel Q1 2024",
          type: "monthly",
          date: new Date().toISOString(),
          status: "completed",
          content: { revenue: 3240000, growth: 29.6 }
        },
        {
          id: 2,
          title: "Analyse de Risque",
          type: "risk",
          date: new Date().toISOString(),
          status: "pending",
          content: { riskLevel: "moderate" }
        }
      ];
    }
  }

  async generateReport(type: string, params: any): Promise<ReportData> {
    try {
      const response = await apiClient.post('/reports/generate', { type, params });
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }
}

export default new ReportService();