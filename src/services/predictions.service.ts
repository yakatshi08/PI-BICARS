// Chemin: C:\PROJETS-DEVELOPPEMENT\Analyse_Donnees_CLEAN\project\src\services\predictions.service.ts

import apiClient from './api';

const predictionService = {
  async getPredictions() {
    try {
      const response = await apiClient.get('/predictions');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des prédictions:', error);
      throw error;
    }
  },

  async createPrediction(data: any) {
    try {
      const response = await apiClient.post('/predictions', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la prédiction:', error);
      throw error;
    }
  },

  async runAnalysis(params: any) {
    try {
      const response = await apiClient.post('/predictions/analyze', params);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      throw error;
    }
  }
};

export default predictionService;