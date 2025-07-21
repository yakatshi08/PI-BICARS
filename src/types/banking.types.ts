// Interfaces pour les métriques bancaires
export interface BankingThreshold {
  min?: number;
  max?: number;
  warning: number;
  good: number;
}

export interface BankingMetric {
  id: string;
  name: string;
  value: string;
  numericValue: number;
  trend: string;
  status: 'healthy' | 'warning' | 'critical';
  icon: any;
  color: string;
  description: string;
  path: string;
  threshold: BankingThreshold;
}

export interface BankingMetrics {
  nii: number;
  lcr: number;
  nsfr: number;
  cet1: number;
  npl: number;
}