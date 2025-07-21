export type FileFormat = 'excel' | 'csv' | 'pdf' | 'json' | 'xml';
export type DataSector = 'banking' | 'insurance' | 'unknown';

export interface ImportFile {
  id: string;
  name: string;
  size: number;
  format: FileFormat;
  uploadDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
}

export interface DataSchema {
  columns: string[];
  rowCount: number;
  detectedSector: DataSector;
  confidence: number;
  suggestedKPIs: string[];
  dataQuality: {
    completeness: number;
    validity: number;
    consistency: number;
  };
}

export interface ImportAnalysis {
  file: ImportFile;
  schema: DataSchema;
  preview: any[];
  issues: DataIssue[];
  recommendations: string[];
}

export interface DataIssue {
  type: 'missing' | 'invalid' | 'inconsistent';
  severity: 'low' | 'medium' | 'high';
  column: string;
  row?: number;
  description: string;
  suggestion: string;
}