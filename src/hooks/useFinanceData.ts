import { useState, useEffect } from 'react';

export const useFinanceMetrics = () => {
  const [metrics, setMetrics] = useState({
    npl_ratio: 0,
    cet1_ratio: 0,
    lcr: 0,
    roe: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/dashboard/metrics');
        const data = await response.json();
        setMetrics({
          ...data,
          loading: false,
          error: null
        });
      } catch (err) {
        // Utiliser des valeurs par défaut en cas d'erreur
        setMetrics({
          npl_ratio: 2.8,
          cet1_ratio: 15.5,
          lcr: 142,
          roe: 12.3,
          loading: false,
          error: 'Erreur de connexion au backend'
        });
      }
    };

    fetchMetrics();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  return metrics;
};

export const useRiskData = () => {
  const [riskData] = useState({
    portfolioData: [],
    riskIndicators: [],
    loading: false,
    error: null
  });

  return riskData;
};