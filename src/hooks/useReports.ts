// useReports.ts - Hook pour gérer les rapports
import { useState, useEffect, useCallback } from 'react';
import { reportService } from '../services/api';

interface Report {
  report_id: string;
  report_type: string;
  status: string;
  generation_time: number;
  validation_status: any;
  download_url: string;
  blockchain_hash?: string;
}

interface ComplianceMetrics {
  corep_status: any;
  finrep_status: any;
  basel3_metrics: any;
  ifrs9_compliance: any;
  regulatory_breaches: any[];
  upcoming_deadlines: any[];
  action_items: any[];
}

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  required_data: string[];
}

export const useReportGeneration = () => {
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async (config: {
    report_type: string;
    dataset_ids: string[];
    period_start: Date;
    period_end: Date;
    parameters?: any;
    blockchain_audit?: boolean;
  }) => {
    setGenerating(true);
    setError(null);
    
    try {
      const result = await reportService.generate(config);
      setReport(result);
      return result;
    } catch (err) {
      setError(err.message || 'Erreur génération rapport');
      throw err;
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async (reportId: string, format: string = 'pdf') => {
    try {
      await reportService.download(reportId, format);
    } catch (err) {
      setError(err.message || 'Erreur téléchargement');
      throw err;
    }
  };

  return { generateReport, downloadReport, generating, report, error };
};

export const useComplianceDashboard = () => {
  const [compliance, setCompliance] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompliance = useCallback(async (reportingDate?: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await reportService.getComplianceDashboard(reportingDate);
      setCompliance(data);
    } catch (err) {
      setError(err.message || 'Erreur chargement conformité');
      // Données de démo en cas d'erreur
      setCompliance({
        corep_status: { compliant: true, score: 98, lastCheck: new Date() },
        finrep_status: { compliant: true, score: 95, lastCheck: new Date() },
        basel3_metrics: {
          cet1: { value: 15.5, minimum: 10.5, status: 'compliant' },
          tier1: { value: 17.2, minimum: 12.0, status: 'compliant' },
          total_capital: { value: 19.8, minimum: 15.0, status: 'compliant' }
        },
        ifrs9_compliance: { compliant: true, provisions_adequate: true },
        regulatory_breaches: [],
        upcoming_deadlines: [
          { type: 'COREP', date: '2024-03-31', description: 'Rapport trimestriel' },
          { type: 'FINREP', date: '2024-03-31', description: 'États financiers' }
        ],
        action_items: []
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompliance();
  }, [fetchCompliance]);

  return { compliance, loading, error, refresh: fetchCompliance };
};

export const useReportTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await reportService.listTemplates();
        setTemplates(data);
      } catch (err) {
        setError(err.message || 'Erreur chargement templates');
        // Templates de démo
        setTemplates([
          {
            id: 'corep',
            name: 'COREP - Common Reporting',
            category: 'regulatory',
            description: 'Rapport réglementaire BCE',
            required_data: ['credit_portfolio', 'risk_metrics']
          },
          {
            id: 'finrep',
            name: 'FINREP - Financial Reporting',
            category: 'regulatory',
            description: 'États financiers IFRS',
            required_data: ['financial_statements', 'balance_sheet']
          },
          {
            id: 'basel3',
            name: 'Bâle III - Ratios prudentiels',
            category: 'regulatory',
            description: 'Calcul des ratios Bâle III',
            required_data: ['capital_data', 'risk_weighted_assets']
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return { templates, loading, error };
};

export const useAuditTrail = () => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditTrail = async (filters?: {
    start_date?: Date;
    end_date?: Date;
    report_type?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await reportService.getAuditTrail(filters);
      setAuditLogs(data);
      return data;
    } catch (err) {
      setError(err.message || 'Erreur chargement audit trail');
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return { auditLogs, loading, error, fetchAuditTrail };
};

export const useRegulatoryCalendar = () => {
  const [calendar, setCalendar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendar = useCallback(async (year?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await reportService.getRegulatoryCalendar(year);
      setCalendar(data);
    } catch (err) {
      setError(err.message || 'Erreur chargement calendrier');
      // Calendrier de démo
      setCalendar({
        year: year || new Date().getFullYear(),
        deadlines: [
          { date: '2024-01-31', type: 'LCR', description: 'Rapport mensuel liquidité' },
          { date: '2024-03-31', type: 'COREP', description: 'Rapport trimestriel Q1' },
          { date: '2024-03-31', type: 'FINREP', description: 'États financiers Q1' }
        ],
        upcoming_30_days: 2,
        overdue: 0,
        completed: 15
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  return { calendar, loading, error, fetchCalendar };
};