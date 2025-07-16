// Chemin: C:\PROJETS-DEVELOPPEMENT\Analyse_Donnees_CLEAN\project\src\services\api.ts

import axios from 'axios';

// Création d'une instance d'axios
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // à adapter selon ton backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export par défaut pour que les autres services puissent faire "import apiClient from './api'"
export default apiClient;

// Interface pour les erreurs
export interface ApiError {
  error: boolean;
  status?: number;
  message: string;
}

// Fonction de gestion des erreurs exportée
export function handleApiError(error: any): ApiError {
  console.error('API Error:', error);
  if (error.response) {
    return {
      error: true,
      status: error.response.status,
      message: error.response.data?.message || 'Erreur serveur',
    };
  } else if (error.request) {
    return {
      error: true,
      message: 'Aucune réponse du serveur',
    };
  } else {
    return {
      error: true,
      message: error.message,
    };
  }
}

// Service de prédictions intégré
const predictionService = {
  async getPredictions() {
    try {
      const response = await apiClient.get('/predictions');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getPredictionById(id: string) {
    try {
      const response = await apiClient.get(`/predictions/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createPrediction(data: any) {
    try {
      const response = await apiClient.post('/predictions', data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updatePrediction(id: string, data: any) {
    try {
      const response = await apiClient.put(`/predictions/${id}`, data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deletePrediction(id: string) {
    try {
      const response = await apiClient.delete(`/predictions/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async runPredictiveAnalysis(params: any) {
    try {
      const response = await apiClient.post('/predictions/analyze', params);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Export des services
export { apiClient, predictionService };

// Import et export du reportService depuis le fichier séparé
export { default as reportService } from './reports.service';