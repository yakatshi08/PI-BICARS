// useDatasets.ts - Version simplifiée sans appels API
import { useState } from 'react';

export const useDatasets = (autoRefresh: boolean = true) => {
  const [datasets, setDatasets] = useState([
    {
      id: 'demo-1',
      name: "Données Clients 2024",
      type: "credit_risk",
      created_at: "2024-01-15",
      rows: 10523,
      columns: 45,
      quality_score: 98,
      is_validated: true
    },
    {
      id: 'demo-2',
      name: "Portefeuille Crédit Q4",
      type: "liquidity",
      created_at: "2024-01-10",
      rows: 8654,
      columns: 38,
      quality_score: 95,
      is_validated: true
    }
  ]);

  return {
    datasets,
    loading: false,
    error: null,
    refreshing: false,
    refresh: () => {}
  };
};

export const useDatasetUpload = () => {
  return {
    uploadDataset: async () => {},
    uploading: false,
    uploadProgress: 0,
    uploadError: null
  };
};

export const useDatasetPreview = (datasetId: string | null) => {
  return { preview: null, loading: false, error: null };
};

export const useDatasetValidation = () => {
  return {
    validateDataset: async () => {},
    validating: false,
    validationResult: null,
    validationError: null
  };
};

export const useDatasetLineage = (datasetId: string | null) => {
  return { lineage: null, loading: false, error: null };
};