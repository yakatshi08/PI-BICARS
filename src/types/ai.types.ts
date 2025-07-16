// Chemin: C:\PROJETS-DEVELOPPEMENT\Analyse_Donnees_CLEAN\project\src\types\ai.types.ts

export interface UserProfile {
  id: 'banker' | 'actuary' | 'risk-manager' | 'cfo';
  title: string;
  icon: any;
  description: string;
  color: string;
  templates: string[];
}

export interface DetectedSector {
  type: 'banking' | 'insurance' | 'mixed' | 'unknown';
  confidence: number;
  patterns: string[];
}

export interface ImportedFileData {
  name: string;
  size: number;
  type: string;
  data: any[];
  schema?: DataSchema;
}

export interface DataSchema {
  columns: string[];
  dataTypes: Record<string, string>;
  sampleData: any[];
  rowCount: number;
}

export interface AIMessage {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: any;
  action?: string;
}

export interface SectorDetectionResult {
  sector: 'banking' | 'insurance' | 'mixed' | 'unknown';
  confidence: number;
  detectedPatterns: string[];
  suggestedKPIs: string[];
  recommendedDashboard: string;
}

export interface DashboardConfig {
  layout: {
    cols: number;
    rowHeight: number;
    widgets: any[];
  };
  widgets: Widget[];
  theme: ThemeConfig;
}

export interface Widget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'map';
  title: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}