import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Select, DatePicker, Space, Tag, Alert } from 'antd';
import { 
  SafetyOutlined, 
  FileProtectOutlined, 
  CalculatorOutlined, 
  FundOutlined,
  AlertOutlined,
  RiseOutlined,
  FallOutlined 
} from '@ant-design/icons';
import { Line, Column, Pie, Area } from '@ant-design/plots';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;

// Types pour les données d'assurance
interface InsuranceMetrics {
  combined_ratio: number;
  loss_ratio: number;
  expense_ratio: number;
  scr_ratio: number;
  mcr_ratio: number;
  roe_insurance: number;
  gross_premiums: number;
  claims_paid: number;
}

interface ClaimsData {
  month: string;
  claims: number;
  premiums: number;
  ratio: number;
}

const InsuranceDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [metrics, setMetrics] = useState<InsuranceMetrics>({
    combined_ratio: 94.5,
    loss_ratio: 62.3,
    expense_ratio: 32.2,
    scr_ratio: 168,
    mcr_ratio: 420,
    roe_insurance: 14.2,
    gross_premiums: 45000000,
    claims_paid: 28035000
  });

  // Configuration des couleurs (même palette que le dashboard principal)
  const primaryColor = '#1890ff';
  const successColor = '#52c41a';
  const warningColor = '#faad14';
  const dangerColor = '#ff4d4f';

  // Données pour l'évolution du Combined Ratio
  const combinedRatioTrend = [
    { month: 'Jan', value: 96.2, type: 'Combined Ratio' },
    { month: 'Feb', value: 95.8, type: 'Combined Ratio' },
    { month: 'Mar', value: 95.3, type: 'Combined Ratio' },
    { month: 'Apr', value: 94.9, type: 'Combined Ratio' },
    { month: 'May', value: 94.7, type: 'Combined Ratio' },
    { month: 'Jun', value: 94.5, type: 'Combined Ratio' },
    { month: 'Jan', value: 63.8, type: 'Loss Ratio' },
    { month: 'Feb', value: 63.5, type: 'Loss Ratio' },
    { month: 'Mar', value: 63.1, type: 'Loss Ratio' },
    { month: 'Apr', value: 62.8, type: 'Loss Ratio' },
    { month: 'May', value: 62.5, type: 'Loss Ratio' },
    { month: 'Jun', value: 62.3, type: 'Loss Ratio' },
  ];

  // Configuration du graphique en ligne
  const lineConfig = {
    data: combinedRatioTrend,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    yAxis: {
      label: {
        formatter: (v: string) => `${v}%`,
      },
    },
    legend: {
      position: 'top' as const,
    },
    smooth: true,
    color: [primaryColor, successColor],
  };

  // Données pour la répartition par ligne de produit
  const productMixData = [
    { type: 'Auto', value: 35, premiums: 15750000 },
    { type: 'Habitation', value: 25, premiums: 11250000 },
    { type: 'Santé', value: 20, premiums: 9000000 },
    { type: 'Vie', value: 15, premiums: 6750000 },
    { type: 'Autres', value: 5, premiums: 2250000 },
  ];

  const pieConfig = {
    data: productMixData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{name}\n{percentage}',
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
  };

  // Données pour l'évolution des sinistres
  const claimsEvolution = [
    { month: 'Jan', premiums: 7200000, claims: 4500000 },
    { month: 'Feb', premiums: 7350000, claims: 4600000 },
    { month: 'Mar', premiums: 7500000, claims: 4650000 },
    { month: 'Apr', premiums: 7450000, claims: 4580000 },
    { month: 'May', premiums: 7600000, claims: 4700000 },
    { month: 'Jun', premiums: 7650000, claims: 4720000 },
  ];

  const areaConfig = {
    data: claimsEvolution,
    xField: 'month',
    yField: ['premiums', 'claims'],
    geometryOptions: [
      {
        geometry: 'area',
        color: successColor,
      },
      {
        geometry: 'area',
        color: warningColor,
      },
    ],
    legend: {
      position: 'top' as const,
    },
  };

  // Tableau des sinistres majeurs
  const majorClaimsColumns: ColumnsType<any> = [
    {
      title: 'N° Sinistre',
      dataIndex: 'claimId',
      key: 'claimId',
    },
    {
      title: 'Produit',
      dataIndex: 'product',
      key: 'product',
      render: (product) => <Tag color="blue">{product}</Tag>,
    },
    {
      title: 'Montant',
      dataIndex: 'amount',
      key: 'amount',
      render: (value) => `€${value.toLocaleString()}`,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'Réglé' ? 'green' : status === 'En cours' ? 'orange' : 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const majorClaimsData = [
    { key: '1', claimId: 'CLM-2024-001', product: 'Auto', amount: 125000, date: '15/06/2024', status: 'Réglé' },
    { key: '2', claimId: 'CLM-2024-002', product: 'Habitation', amount: 85000, date: '10/06/2024', status: 'En cours' },
    { key: '3', claimId: 'CLM-2024-003', product: 'Santé', amount: 52000, date: '05/06/2024', status: 'Réglé' },
    { key: '4', claimId: 'CLM-2024-004', product: 'Auto', amount: 95000, date: '01/06/2024', status: 'Expertise' },
  ];

  // Fonction pour déterminer la couleur selon le seuil
  const getMetricColor = (value: number, threshold: number, isHigherBetter: boolean = true) => {
    if (isHigherBetter) {
      return value >= threshold ? successColor : dangerColor;
    }
    return value <= threshold ? successColor : dangerColor;
  };

  // Configuration du graphique en colonnes pour Solvency II
  const solvencyData = [
    { type: 'SCR', value: metrics.scr_ratio, requirement: 100 },
    { type: 'MCR', value: metrics.mcr_ratio, requirement: 100 },
  ];

  const columnConfig = {
    data: solvencyData,
    xField: 'type',
    yField: 'value',
    seriesField: 'type',
    color: ({ type }: any) => {
      return type === 'SCR' ? primaryColor : successColor;
    },
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.8,
      },
      formatter: (v: any) => `${v.value}%`,
    },
    annotations: [
      {
        type: 'line',
        start: ['min', 100],
        end: ['max', 100],
        style: {
          stroke: dangerColor,
          lineWidth: 2,
          lineDash: [2, 2],
        },
      },
    ],
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          <FileProtectOutlined /> Insurance Core Dashboard
        </h1>
        <p style={{ color: '#666', marginTop: '8px' }}>
          Vue d'ensemble des métriques d'assurance et de la conformité Solvency II
        </p>
      </div>

      {/* Filtres */}
      <Card style={{ marginBottom: '24px' }}>
        <Space size="large">
          <Select
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            style={{ width: 120 }}
            options={[
              { value: 'daily', label: 'Quotidien' },
              { value: 'monthly', label: 'Mensuel' },
              { value: 'quarterly', label: 'Trimestriel' },
              { value: 'yearly', label: 'Annuel' },
            ]}
          />
          <Select
            value={selectedProduct}
            onChange={setSelectedProduct}
            style={{ width: 150 }}
            options={[
              { value: 'all', label: 'Tous les produits' },
              { value: 'auto', label: 'Auto' },
              { value: 'habitation', label: 'Habitation' },
              { value: 'sante', label: 'Santé' },
              { value: 'vie', label: 'Vie' },
            ]}
          />
          <RangePicker />
        </Space>
      </Card>

      {/* KPIs principaux */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Combined Ratio"
              value={metrics.combined_ratio}
              precision={1}
              valueStyle={{ color: getMetricColor(metrics.combined_ratio, 100, false) }}
              prefix={<CalculatorOutlined />}
              suffix="%"
            />
            <Progress 
              percent={metrics.combined_ratio} 
              strokeColor={getMetricColor(metrics.combined_ratio, 100, false)}
              showInfo={false}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Cible: &lt; 100%
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="SCR Ratio"
              value={metrics.scr_ratio}
              precision={0}
              valueStyle={{ color: getMetricColor(metrics.scr_ratio, 100) }}
              prefix={<SafetyOutlined />}
              suffix="%"
            />
            <Progress 
              percent={metrics.scr_ratio > 200 ? 100 : metrics.scr_ratio / 2} 
              strokeColor={getMetricColor(metrics.scr_ratio, 100)}
              showInfo={false}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Min. requis: 100%
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Loss Ratio"
              value={metrics.loss_ratio}
              precision={1}
              valueStyle={{ color: getMetricColor(metrics.loss_ratio, 70, false) }}
              prefix={<AlertOutlined />}
              suffix="%"
            />
            <Progress 
              percent={metrics.loss_ratio} 
              strokeColor={getMetricColor(metrics.loss_ratio, 70, false)}
              showInfo={false}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Cible: &lt; 70%
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ROE Assurance"
              value={metrics.roe_insurance}
              precision={1}
              valueStyle={{ color: primaryColor }}
              prefix={<FundOutlined />}
              suffix="%"
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              <RiseOutlined style={{ color: successColor }} /> +2.1% vs année dernière
            </div>
          </Card>
        </Col>
      </Row>

      {/* Graphiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Évolution Combined & Loss Ratio">
            <Line {...lineConfig} height={300} />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Ratios Solvency II">
            <Column {...columnConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Mix produits et sinistres */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Mix Produits - Primes Brutes">
            <Pie {...pieConfig} height={300} />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Sinistres Majeurs du Mois">
            <Table 
              columns={majorClaimsColumns} 
              dataSource={majorClaimsData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Graphique primes vs sinistres */}
      <Card title="Évolution Primes vs Sinistres" style={{ marginTop: '24px' }}>
        <Area {...areaConfig} height={250} />
      </Card>

      {/* Alertes */}
      <div style={{ marginTop: '24px' }}>
        <Alert
          message="Conformité Solvency II"
          description="Excellente position de solvabilité avec un ratio SCR de 168% et MCR de 420%. Le Combined Ratio à 94.5% indique une rentabilité technique solide."
          type="success"
          showIcon
        />
      </div>
    </div>
  );
};

export default InsuranceDashboard;