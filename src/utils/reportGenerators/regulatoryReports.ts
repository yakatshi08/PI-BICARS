// Générateurs de rapports réglementaires
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

export interface ReportData {
  type: 'COREP' | 'FINREP' | 'SOLVENCY_II' | 'BASEL_III';
  period: string;
  entity: string;
  data: any;
  metadata?: any;
}

// Templates réglementaires
export const regulatoryTemplates = {
  COREP: {
    C_01_00: { // Own funds
      name: 'Own funds',
      fields: ['CET1', 'AT1', 'T2', 'Total_Capital'],
      validations: {
        CET1_ratio: (data: any) => data.CET1 / data.RWA >= 0.045,
        T1_ratio: (data: any) => (data.CET1 + data.AT1) / data.RWA >= 0.06,
        Total_ratio: (data: any) => data.Total_Capital / data.RWA >= 0.08
      }
    },
    C_02_00: { // Own funds requirements
      name: 'Capital requirements',
      fields: ['Credit_Risk', 'Market_Risk', 'Operational_Risk', 'Total_RWA']
    },
    C_03_00: { // Capital ratios
      name: 'Capital ratios and buffers',
      fields: ['CET1_ratio', 'T1_ratio', 'Total_ratio', 'Conservation_buffer']
    }
  },
  FINREP: {
    F_01_01: { // Balance sheet assets
      name: 'Balance sheet - Assets',
      fields: ['Cash', 'Loans', 'Securities', 'Derivatives', 'Total_Assets']
    },
    F_01_02: { // Balance sheet liabilities
      name: 'Balance sheet - Liabilities',
      fields: ['Deposits', 'Debt', 'Derivatives', 'Equity', 'Total_Liabilities']
    },
    F_02_00: { // P&L
      name: 'Statement of profit or loss',
      fields: ['Interest_Income', 'Interest_Expense', 'NII', 'Fees', 'Trading', 'Total_Income']
    }
  },
  SOLVENCY_II: {
    S_02_01: { // Balance sheet
      name: 'Balance sheet',
      fields: ['Assets', 'Technical_Provisions', 'Other_Liabilities', 'Own_Funds']
    },
    S_23_01: { // Own funds
      name: 'Own funds',
      fields: ['Tier1', 'Tier2', 'Tier3', 'Total_EOF', 'SCR', 'MCR']
    },
    S_25_01: { // SCR standard formula
      name: 'Solvency Capital Requirement',
      fields: ['Market_Risk', 'Default_Risk', 'Life_Risk', 'Health_Risk', 'Non_Life_Risk', 'SCR']
    }
  },
  BASEL_III: {
    LCR: { // Liquidity Coverage Ratio
      name: 'Liquidity Coverage Ratio',
      fields: ['HQLA', 'Total_Outflows', 'Total_Inflows', 'LCR'],
      validations: {
        LCR_minimum: (data: any) => data.LCR >= 1.0
      }
    },
    NSFR: { // Net Stable Funding Ratio
      name: 'Net Stable Funding Ratio',
      fields: ['ASF', 'RSF', 'NSFR'],
      validations: {
        NSFR_minimum: (data: any) => data.NSFR >= 1.0
      }
    }
  }
};

// Générateur de rapport PDF
export const generatePDFReport = (reportData: ReportData): Blob => {
  const doc = new jsPDF();
  const { type, period, entity, data } = reportData;
  
  // En-tête
  doc.setFontSize(20);
  doc.text(`${type} Report`, 20, 20);
  doc.setFontSize(12);
  doc.text(`Entity: ${entity}`, 20, 30);
  doc.text(`Period: ${period}`, 20, 40);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);
  
  // Contenu selon le type
  let yPosition = 70;
  const template = regulatoryTemplates[type];
  
  Object.entries(template).forEach(([key, section]: [string, any]) => {
    doc.setFontSize(14);
    doc.text(section.name, 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    section.fields.forEach((field: string) => {
      const value = data[key]?.[field] || 'N/A';
      doc.text(`${field}: ${value}`, 30, yPosition);
      yPosition += 7;
    });
    
    yPosition += 10;
  });
  
  return doc.output('blob');
};

// Générateur de rapport Excel
export const generateExcelReport = (reportData: ReportData): Blob => {
  const { type, period, entity, data } = reportData;
  const wb = XLSX.utils.book_new();
  
  // Métadonnées
  const metadata = [
    ['Report Type', type],
    ['Entity', entity],
    ['Period', period],
    ['Generated', new Date().toLocaleDateString()],
    [], // ligne vide
  ];
  
  // Création des feuilles selon le template
  const template = regulatoryTemplates[type];
  
  Object.entries(template).forEach(([key, section]: [string, any]) => {
    const sheetData = [...metadata];
    sheetData.push([section.name]);
    sheetData.push(['Field', 'Value']);
    
    section.fields.forEach((field: string) => {
      const value = data[key]?.[field] || 'N/A';
      sheetData.push([field, value]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, key);
  });
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

// Validateur de données réglementaires
export const validateReportData = (reportData: ReportData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { type, data } = reportData;
  const template = regulatoryTemplates[type];
  
  // Vérification des champs requis
  Object.entries(template).forEach(([key, section]: [string, any]) => {
    section.fields.forEach((field: string) => {
      if (!data[key]?.[field]) {
        warnings.push(`Missing field: ${key}.${field}`);
      }
    });
    
    // Validation des ratios si applicable
    if (section.validations) {
      Object.entries(section.validations).forEach(([validationName, validationFn]: [string, any]) => {
        try {
          if (!validationFn(data[key])) {
            errors.push(`Validation failed: ${validationName}`);
          }
        } catch (e) {
          warnings.push(`Cannot validate ${validationName}: missing data`);
        }
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Générateur automatique basé sur les données sectorielles
export const autoGenerateReport = (
  sector: 'banking' | 'insurance',
  metrics: any,
  period: string,
  entity: string
): ReportData => {
  if (sector === 'banking') {
    // Génération COREP/FINREP pour banking
    return {
      type: 'COREP',
      period,
      entity,
      data: {
        C_01_00: {
          CET1: metrics.cet1Capital || 0,
          AT1: metrics.at1Capital || 0,
          T2: metrics.t2Capital || 0,
          Total_Capital: metrics.totalCapital || 0,
          RWA: metrics.rwa || 100
        },
        C_02_00: {
          Credit_Risk: metrics.creditRisk || 0,
          Market_Risk: metrics.marketRisk || 0,
          Operational_Risk: metrics.operationalRisk || 0,
          Total_RWA: metrics.rwa || 0
        },
        C_03_00: {
          CET1_ratio: metrics.cet1Ratio || 0,
          T1_ratio: metrics.tier1Ratio || 0,
          Total_ratio: metrics.totalCapitalRatio || 0,
          Conservation_buffer: 0.025
        }
      }
    };
  } else {
    // Génération Solvency II pour insurance
    return {
      type: 'SOLVENCY_II',
      period,
      entity,
      data: {
        S_02_01: {
          Assets: metrics.totalAssets || 0,
          Technical_Provisions: metrics.technicalProvisions || 0,
          Other_Liabilities: metrics.otherLiabilities || 0,
          Own_Funds: metrics.ownFunds || 0
        },
        S_23_01: {
          Tier1: metrics.tier1 || 0,
          Tier2: metrics.tier2 || 0,
          Tier3: metrics.tier3 || 0,
          Total_EOF: metrics.eligibleOwnFunds || 0,
          SCR: metrics.scr || 0,
          MCR: metrics.mcr || 0
        },
        S_25_01: {
          Market_Risk: metrics.marketRisk || 0,
          Default_Risk: metrics.defaultRisk || 0,
          Life_Risk: metrics.lifeRisk || 0,
          Health_Risk: metrics.healthRisk || 0,
          Non_Life_Risk: metrics.nonLifeRisk || 0,
          SCR: metrics.scr || 0
        }
      }
    };
  }
};