import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types pour les données financières
interface MarketData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface QuarterlyData {
  quarter: string;
  revenu: number;
  couts: number;
  profit: number;
}

interface WaterfallData {
  name: string;
  value: number;
  type: 'initial' | 'increase' | 'decrease' | 'total';
}

interface KPIData {
  label: string;
  value: string;
  target: string;
  status: 'good' | 'warning' | 'danger';
  trend?: number;
}

interface CorrelationData {
  assets: string[];
  matrix: number[][];
}

interface DashboardMetric {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
}

// ✅ Types pour Credit Risk
interface CreditRiskData {
  eclByRating: Array<{
    segment: string;
    pd: number;
    exposure: number;
    lgd: number;
    ead: number;
    ecl: number;
    eclPercentage: number;
  }>;
  pdEvolution: Array<{
    month: string;
    pd_retail: number;
    pd_corporate: number;
    pd_mortgage: number;
  }>;
  stressScenarios: Array<{
    scenario: string;
    pd_increase: number;
    lgd_increase: number;
    ecl_impact: number;
  }>;
}

// Interface du store
interface FinanceStore {
  isDarkMode: boolean;
  activeTab: string;
  isLoading: boolean;
  lastUpdate: Date | null;

  apiConnected: boolean;
  setApiConnected: (connected: boolean) => void;
  loadDataFromAPI: () => Promise<void>;

  marketData: MarketData[];
  correlationData: CorrelationData;
  quarterlyData: QuarterlyData[];
  waterfallData: WaterfallData[];
  kpis: KPIData[];
  dashboardMetrics: DashboardMetric[];
  realtimeEnabled: boolean;
  streamingData: any[];

  setDarkMode: (isDark: boolean) => void;
  setActiveTab: (tab: string) => void;
  setLoading: (loading: boolean) => void;

  updateMarketData: (data: MarketData[]) => void;
  updateQuarterlyData: (data: QuarterlyData[]) => void;
  updateKPIs: (kpis: KPIData[]) => void;

  toggleRealtimeMode: () => void;
  addStreamingData: (data: any) => void;

  simulateBudget: (years: number) => Promise<any>;
  calculateRiskMetrics: () => Promise<any>;

  resetStore: () => void;
}

// Données initiales
const initialMarketData: MarketData[] = [];

const initialQuarterlyData: QuarterlyData[] = [
  { quarter: 'Q1', revenu: 120000, couts: 80000, profit: 40000 },
  { quarter: 'Q2', revenu: 150000, couts: 90000, profit: 60000 },
  { quarter: 'Q3', revenu: 180000, couts: 100000, profit: 80000 },
  { quarter: 'Q4', revenu: 200000, couts: 110000, profit: 90000 }
];

const initialWaterfallData: WaterfallData[] = [];

const initialKPIs: KPIData[] = [];

const initialDashboardMetrics: DashboardMetric[] = [];

export const useFinanceStore = create<FinanceStore>()(
  devtools(
    persist(
      (set, get) => ({
        isDarkMode: true,
        activeTab: 'dashboard',
        isLoading: false,
        lastUpdate: new Date(),

        apiConnected: false,
        setApiConnected: (connected: boolean) => set({ apiConnected: connected }),

        loadDataFromAPI: async () => {
          try {
            set({ isLoading: true, error: null });
            await new Promise(resolve => setTimeout(resolve, 1000));
            set({
              apiConnected: true,
              lastUpdate: new Date().toISOString(),
              isLoading: false
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Erreur de connexion API',
              isLoading: false,
              apiConnected: false
            });
          }
        },

        marketData: initialMarketData,
        correlationData: {
          assets: ['CAC 40', 'S&P 500', 'EUR/USD', 'Gold', 'Oil'],
          matrix: [
            [1.00, 0.85, -0.60, 0.45, 0.72],
            [0.85, 1.00, -0.45, 0.38, 0.68],
            [-0.60, -0.45, 1.00, -0.35, -0.52],
            [0.45, 0.38, -0.35, 1.00, 0.42],
            [0.72, 0.68, -0.52, 0.42, 1.00]
          ]
        },
        quarterlyData: initialQuarterlyData,
        waterfallData: initialWaterfallData,
        kpis: initialKPIs,
        dashboardMetrics: initialDashboardMetrics,
        realtimeEnabled: false,
        streamingData: [],

        setDarkMode: (isDark) => set({ isDarkMode: isDark }),
        setActiveTab: (tab) => set({ activeTab: tab }),
        setLoading: (loading) => set({ isLoading: loading }),

        updateMarketData: (data) => set({ marketData: data, lastUpdate: new Date() }),
        updateQuarterlyData: (data) => set({ quarterlyData: data, lastUpdate: new Date() }),
        updateKPIs: (kpis) => set({ kpis, lastUpdate: new Date() }),

        toggleRealtimeMode: () => set((state) => ({ realtimeEnabled: !state.realtimeEnabled })),
        addStreamingData: (data) =>
          set((state) => ({ streamingData: [...state.streamingData.slice(-99), data] })),

        simulateBudget: async (years) => {
          set({ isLoading: true });
          const currentRevenue = 3240000;
          const growthRate = 0.15;
          const projections = [];
          for (let i = 1; i <= years; i++) {
            projections.push({
              year: 2024 + i,
              revenue: currentRevenue * Math.pow(1 + growthRate, i),
              costs: currentRevenue * Math.pow(1 + growthRate, i) * 0.7,
              profit: currentRevenue * Math.pow(1 + growthRate, i) * 0.3
            });
          }
          set({ isLoading: false });
          return projections;
        },

        calculateRiskMetrics: async () => {
          set({ isLoading: true });
          const marketData = get().marketData;
          const returns = marketData.slice(1).map((d, i) =>
            (d.close - marketData[i].close) / marketData[i].close
          );
          const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
          const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
          const stdDev = Math.sqrt(variance);
          const VaR95 = avgReturn - 1.645 * stdDev;
          const CVaR95 = avgReturn - 2.063 * stdDev;

          set({ isLoading: false });

          return {
            VaR95: (VaR95 * 100).toFixed(2) + '%',
            CVaR95: (CVaR95 * 100).toFixed(2) + '%',
            volatility: (stdDev * 100).toFixed(2) + '%',
            sharpeRatio: (avgReturn / stdDev).toFixed(2)
          };
        },

        resetStore: () =>
          set({
            isDarkMode: true,
            activeTab: 'dashboard',
            isLoading: false,
            lastUpdate: new Date(),
            marketData: initialMarketData,
            quarterlyData: initialQuarterlyData,
            waterfallData: initialWaterfallData,
            kpis: initialKPIs,
            dashboardMetrics: initialDashboardMetrics,
            realtimeEnabled: false,
            streamingData: [],
            apiConnected: false
          })
      }),
      {
        name: 'fintech-analytics-storage',
        partialize: (state) => ({
          isDarkMode: state.isDarkMode,
          activeTab: state.activeTab
        })
      }
    )
  )
);

// Sélecteurs personnalisés
export const useMarketData = () => useFinanceStore((state) => state.marketData);
export const useKPIs = () => useFinanceStore((state) => state.kpis);
export const useDashboardMetrics = () => useFinanceStore((state) => state.dashboardMetrics);
export const useTheme = () => useFinanceStore((state) => ({
  isDarkMode: state.isDarkMode,
  setDarkMode: state.setDarkMode
}));
