import apiClient from './api';
import { AxiosResponse } from 'axios';

// Types correspondant aux schémas du backend
export interface MarketDataResponse {
  id: number;
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  created_at: string;
}

export interface BankingMetricResponse {
  id: number;
  metric_name: string;
  value: number;
  unit: string;
  category: string;
  date: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface RiskMetricResponse {
  id: number;
  risk_type: string;
  risk_level: number;
  exposure: number;
  var_95: number;
  cvar_95: number;
  date: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface KPIDataResponse {
  id: number;
  kpi_name: string;
  value: string;
  target: string;
  status: string;
  trend: number;
  date: string;
  created_at: string;
}

export interface DashboardData {
  market_data: MarketDataResponse[];
  banking_metrics: BankingMetricResponse[];
  risk_metrics: RiskMetricResponse[];
  kpis: KPIDataResponse[];
  last_update: string;
}

export interface MetricsSummary {
  revenue_total: string;
  new_clients: number;
  retention_rate: string;
  net_margin: string;
  quarterly_growth: string;
}

export interface WaterfallData {
  name: string;
  value: number;
  type: 'initial' | 'increase' | 'decrease' | 'total';
}

export interface CorrelationData {
  assets: string[];
  matrix: number[][];
}

// Service Dashboard
class DashboardService {
  // Récupérer toutes les données du dashboard
  async getDashboardData(): Promise<DashboardData> {
    const response: AxiosResponse<DashboardData> = await apiClient.get('/dashboard/');
    return response.data;
  }

  // Récupérer le résumé des métriques
  async getMetricsSummary(): Promise<MetricsSummary> {
    const response: AxiosResponse<MetricsSummary> = await apiClient.get('/dashboard/metrics/summary');
    return response.data;
  }

  // Récupérer les données waterfall
  async getWaterfallData(): Promise<WaterfallData[]> {
    const response: AxiosResponse<WaterfallData[]> = await apiClient.get('/dashboard/waterfall');
    return response.data;
  }

  // Récupérer les données de corrélation
  async getCorrelationData(): Promise<CorrelationData> {
    const response: AxiosResponse<CorrelationData> = await apiClient.get('/dashboard/correlation');
    return response.data;
  }

  // Transformation des données pour le store Zustand
  transformMarketDataForStore(data: MarketDataResponse[]) {
    return data.map(item => ({
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close
    }));
  }

  transformKPIsForStore(data: KPIDataResponse[]) {
    return data.map(item => ({
      label: item.kpi_name,
      value: item.value,
      target: item.target,
      status: item.status as 'good' | 'warning' | 'danger',
      trend: item.trend
    }));
  }

  transformWaterfallForStore(data: WaterfallData[]) {
    return data.map(item => ({
      name: item.name,
      value: item.value,
      type: item.type
    }));
  }
}

export default new DashboardService();