// Intégration entre Analytics ML et Reports & Compliance
import { ReportData } from './reportGenerators/regulatoryReports';

export interface MLPrediction {
  metric: string;
  current: number;
  predicted: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  risk: 'low' | 'medium' | 'high';
}

export interface AnomalyAlert {
  metric: string;
  value: number;
  expectedRange: { min: number; max: number };
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  recommendation: string;
}

// Convertir les prédictions ML en métriques pour les rapports réglementaires
export const mlToRegulatoryMetrics = (
  predictions: MLPrediction[],
  sector: 'banking' | 'insurance'
): any => {
  if (sector === 'banking') {
    const cet1Prediction = predictions.find(p => p.metric === 'CET1 Ratio');
    const lcrPrediction = predictions.find(p => p.metric === 'LCR');
    const nplPrediction = predictions.find(p => p.metric === 'NPL Ratio');
    
    return {
      cet1Capital: cet1Prediction ? cet1Prediction.predicted * 2000000000 * 0.01 : 150000000,
      cet1Ratio: cet1Prediction?.predicted || 0.075,
      lcr: lcrPrediction?.predicted || 1.42,
      nplRatio: nplPrediction?.predicted || 0.025,
      riskAssessment: determineRiskLevel(predictions),
      stressTestResult: calculateStressImpact(predictions)
    };
  } else {
    const scrPrediction = predictions.find(p => p.metric === 'Solvency Ratio');
    const combinedRatioPrediction = predictions.find(p => p.metric === 'Combined Ratio');
    
    return {
      scr: scrPrediction ? scrPrediction.predicted * 600000000 * 0.01 : 600000000,
      scrRatio: scrPrediction?.predicted || 1.78,
      combinedRatio: combinedRatioPrediction?.predicted || 0.95,
      riskAssessment: determineRiskLevel(predictions),
      stressTestResult: calculateStressImpact(predictions)
    };
  }
};

// Déterminer le niveau de risque global basé sur les prédictions
const determineRiskLevel = (predictions: MLPrediction[]): string => {
  const highRiskCount = predictions.filter(p => p.risk === 'high').length;
  const mediumRiskCount = predictions.filter(p => p.risk === 'medium').length;
  
  if (highRiskCount > 0) return 'HIGH';
  if (mediumRiskCount > 2) return 'MEDIUM-HIGH';
  if (mediumRiskCount > 0) return 'MEDIUM';
  return 'LOW';
};

// Calculer l'impact des stress tests basé sur les prédictions
const calculateStressImpact = (predictions: MLPrediction[]): number => {
  const avgConfidence = predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length;
  const worstCasePredictions = predictions.filter(p => p.trend === 'down');
  
  if (worstCasePredictions.length === 0) return 0;
  
  const avgDecline = worstCasePredictions.reduce((acc, p) => {
    return acc + Math.abs(p.predicted - p.current) / p.current;
  }, 0) / worstCasePredictions.length;
  
  return avgDecline * (1 - avgConfidence) * 100; // Impact en pourcentage
};

// Générer des recommandations basées sur les anomalies détectées
export const generateComplianceRecommendations = (
  anomalies: AnomalyAlert[],
  sector: 'banking' | 'insurance'
): string[] => {
  const recommendations: string[] = [];
  
  anomalies.forEach(anomaly => {
    if (anomaly.severity === 'high') {
      if (sector === 'banking') {
        if (anomaly.metric.includes('Capital') || anomaly.metric.includes('CET1')) {
          recommendations.push(`⚠️ URGENT: ${anomaly.metric} is below regulatory threshold. Consider immediate capital injection or RWA reduction.`);
        } else if (anomaly.metric.includes('LCR')) {
          recommendations.push(`⚠️ URGENT: Liquidity crisis detected. Increase HQLA holdings or reduce short-term outflows immediately.`);
        }
      } else {
        if (anomaly.metric.includes('SCR') || anomaly.metric.includes('Solvency')) {
          recommendations.push(`⚠️ URGENT: Solvency ratio critically low. Review reinsurance arrangements and capital allocation.`);
        } else if (anomaly.metric.includes('Combined Ratio')) {
          recommendations.push(`⚠️ URGENT: Combined ratio exceeds 100%. Review underwriting guidelines and claims management.`);
        }
      }
    } else if (anomaly.severity === 'medium') {
      recommendations.push(`⚠️ WARNING: ${anomaly.metric} showing concerning trend. ${anomaly.recommendation}`);
    }
  });
  
  return recommendations;
};

// Enrichir les rapports réglementaires avec les insights ML
export const enrichReportWithMLInsights = (
  report: ReportData,
  predictions: MLPrediction[],
  anomalies: AnomalyAlert[]
): ReportData => {
  const mlMetrics = mlToRegulatoryMetrics(predictions, report.type === 'SOLVENCY_II' ? 'insurance' : 'banking');
  const recommendations = generateComplianceRecommendations(anomalies, report.type === 'SOLVENCY_II' ? 'insurance' : 'banking');
  
  // Enrichir les données du rapport avec les prédictions ML
  const enrichedData = { ...report.data };
  
  // Ajouter une section ML Insights
  enrichedData.ML_INSIGHTS = {
    risk_assessment: mlMetrics.riskAssessment,
    stress_test_impact: `${mlMetrics.stressTestResult.toFixed(2)}%`,
    predictions_summary: predictions.map(p => ({
      metric: p.metric,
      current: p.current,
      predicted: p.predicted,
      trend: p.trend
    })),
    anomalies_detected: anomalies.length,
    critical_alerts: anomalies.filter(a => a.severity === 'high').length
  };
  
  return {
    ...report,
    data: enrichedData,
    metadata: {
      ...report.metadata,
      ml_enhanced: true,
      recommendations,
      generated_with_ai: true,
      confidence_score: predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length
    }
  };
};

// Générer des alertes automatiques pour la compliance
export const generateComplianceAlerts = (
  predictions: MLPrediction[],
  thresholds: { [key: string]: { min: number; max: number } }
): AnomalyAlert[] => {
  const alerts: AnomalyAlert[] = [];
  
  predictions.forEach(prediction => {
    const threshold = thresholds[prediction.metric];
    if (!threshold) return;
    
    if (prediction.predicted < threshold.min) {
      alerts.push({
        metric: prediction.metric,
        value: prediction.predicted,
        expectedRange: threshold,
        severity: prediction.predicted < threshold.min * 0.8 ? 'high' : 'medium',
        timestamp: new Date(),
        recommendation: `Increase ${prediction.metric} to meet minimum requirement of ${threshold.min}`
      });
    } else if (prediction.predicted > threshold.max) {
      alerts.push({
        metric: prediction.metric,
        value: prediction.predicted,
        expectedRange: threshold,
        severity: 'low',
        timestamp: new Date(),
        recommendation: `Monitor ${prediction.metric} - exceeds optimal range`
      });
    }
  });
  
  return alerts;
};

// Intégration avec le dashboard principal
export const createIntegratedDashboard = (
  mlAnalytics: any,
  complianceData: any,
  sector: 'banking' | 'insurance'
): any => {
  return {
    overview: {
      ml_score: mlAnalytics.modelPerformance?.score || 0,
      compliance_score: complianceData.complianceScore || 0,
      combined_health_score: (mlAnalytics.modelPerformance?.score + complianceData.complianceScore) / 2,
      risk_level: determineRiskLevel(mlAnalytics.predictions || [])
    },
    predictions: mlAnalytics.predictions || [],
    anomalies: mlAnalytics.anomalies || [],
    compliance_metrics: complianceData.metrics || [],
    integrated_recommendations: [
      ...generateComplianceRecommendations(mlAnalytics.anomalies || [], sector),
      ...mlAnalytics.recommendations || []
    ],
    next_report_due: calculateNextReportDate(sector),
    automation_status: {
      ml_enabled: true,
      auto_reporting: true,
      real_time_monitoring: true
    }
  };
};

// Calculer la prochaine date de rapport
const calculateNextReportDate = (sector: 'banking' | 'insurance'): string => {
  const today = new Date();
  if (sector === 'banking') {
    // Rapports trimestriels pour COREP/FINREP
    const quarter = Math.floor(today.getMonth() / 3);
    const nextQuarter = new Date(today.getFullYear(), (quarter + 1) * 3, 1);
    return nextQuarter.toISOString().slice(0, 10);
  } else {
    // Rapports annuels pour Solvency II
    const nextYear = new Date(today.getFullYear() + 1, 0, 1);
    return nextYear.toISOString().slice(0, 10);
  }
};