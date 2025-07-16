import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Select, DatePicker, Space, Tag, Alert } from 'antd';
import { 
  DollarOutlined, 
  BankOutlined, 
  LineChartOutlined, 
  SafetyOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined 
} from '@ant-design/icons';
import { Line, Column, Pie, Gauge } from '@ant-design/plots';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;

// Types pour les données bancaires
interface BankingMetrics {
  nii: number;
  lcr: number;
  nsfr: number;
  cet1: number;
  npl_ratio: number;
  roe: number;
  total_assets: number;
  total_loans: number;
}

interface TrendData {
  date: string;
  value: number;
  type: string;
}

const BankingDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [metrics, setMetrics] = useState<BankingMetrics>({
    nii: 3.24,
    lcr: 125.5,
    nsfr: 118.2,
    cet1: 14.8,
    npl_ratio: 2.3,
    roe: 12.5,
    total_assets: 125000000,
    total_loans: 87500000
  });

  // Configuration des graphiques avec les mêmes couleurs que le dashboard principal
  const primaryColor = '#1890ff';
  const successColor = '#52c41a';
  const warningColor = '#faad14';
  const dangerColor = '#ff4d4f';

  // Données pour le graphique de tendance
  const trendData: TrendData[] = [
    { date: 'Jan', value: 14.2, type: 'CET1' },
    { date: 'Feb', value: 14.3, type: 'CET1' },
    { date: 'Mar', value: 14.5, type: 'CET1' },
    { date: 'Apr', value: 14.6, type: 'CET1' },
    { date: 'May', value: 14.7, type: 'CET1' },
    { date: 'Jun', value: 14.8, type: 'CET1' },
    { date: 'Jan', value: 120.5, type: 'LCR' },
    { date: 'Feb', value: 122.3, type: 'LCR' },
    { date: 'Mar', value: 123.1, type: 'LCR' },
    { date: 'Apr', value: 124.2, type: 'LCR' },
    { date: 'May', value: 124.8, type: 'LCR' },
    { date: 'Jun', value: 125.5, type: 'LCR' },
  ];

  // Configuration du graphique en ligne
  const lineConfig = {
    data: trendData,
    xField: 'date',
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
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    color: [primaryColor, successColor],
  };

  // Données pour la répartition du portefeuille
  const portfolioData = [
    { type: 'Corporate', value: 35 },
    { type: 'Retail', value: 25 },
    { type: 'SME', value: 20 },
    { type: 'Real Estate', value: 15 },
    { type: 'Other', value: 5 },
  ];

  const pieConfig = {
    data: portfolioData,
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

  // Configuration du gauge pour le CET1
  const gaugeConfig = {
    percent: metrics.cet1 / 20, // Sur une échelle de 20%
    range: {
      ticks: [0, 0.225, 0.525, 0.75, 1], // 0%, 4.5%, 10.5%, 15%, 20%
      color: ['#FF4D4F', '#FAAD14', '#52C41A', '#1890FF'],
    },
    indicator: {
      pointer: {
        style: {
          stroke: '#D0D0D0',
        },
      },
      pin: {
        style: {
          stroke: '#D0D0D0',
        },
      },
    },
    statistic: {
      content: {
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
        },
        formatter: () => `${metrics.cet1}%`,
      },
    },
  };

  // Tableau des prêts à risque
  const riskLoansColumns: ColumnsType<any> = [
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
    },
    {
      title: 'Montant',
      dataIndex: 'amount',
      key: 'amount',
      render: (value) => `€${value.toLocaleString()}`,
    },
    {
      title: 'PD',
      dataIndex: 'pd',
      key: 'pd',
      render: (value) => `${value}%`,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => {
        const color = rating <= 'BBB' ? 'green' : rating <= 'BB' ? 'orange' : 'red';
        return <Tag color={color}>{rating}</Tag>;
      },
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'Performing' ? 'green' : 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const riskLoansData = [
    { key: '1', client: 'ABC Corp', amount: 2500000, pd: 2.3, rating: 'BBB', status: 'Performing' },
    { key: '2', client: 'XYZ Ltd', amount: 1800000, pd: 5.1, rating: 'BB', status: 'Watch' },
    { key: '3', client: 'DEF Industries', amount: 3200000, pd: 1.2, rating: 'A', status: 'Performing' },
    { key: '4', client: 'GHI Holdings', amount: 900000, pd: 8.7, rating: 'B', status: 'NPL' },
  ];

  // Fonction pour déterminer la couleur selon le seuil
  const getMetricColor = (value: number, threshold: number, isHigherBetter: boolean = true) => {
    if (isHigherBetter) {
      return value >= threshold ? successColor : dangerColor;
    }
    return value <= threshold ? successColor : dangerColor;
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          <BankOutlined /> Banking Core Dashboard
        </h1>
        <p style={{ color: '#666', marginTop: '8px' }}>
          Vue d'ensemble des métriques bancaires et de la conformité réglementaire
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
          <RangePicker />
        </Space>
      </Card>

      {/* KPIs principaux */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="CET1 Ratio"
              value={metrics.cet1}
              precision={1}
              valueStyle={{ color: getMetricColor(metrics.cet1, 10.5) }}
              prefix={<SafetyOutlined />}
              suffix="%"
            />
            <Progress 
              percent={metrics.cet1} 
              strokeColor={getMetricColor(metrics.cet1, 10.5)}
              showInfo={false}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Min. requis: 10.5%
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="LCR"
              value={metrics.lcr}
              precision={1}
              valueStyle={{ color: getMetricColor(metrics.lcr, 100) }}
              prefix={<DollarOutlined />}
              suffix="%"
            />
            <Progress 
              percent={metrics.lcr > 100 ? 100 : metrics.lcr} 
              strokeColor={getMetricColor(metrics.lcr, 100)}
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
              title="NPL Ratio"
              value={metrics.npl_ratio}
              precision={1}
              valueStyle={{ color: getMetricColor(metrics.npl_ratio, 3, false) }}
              prefix={<WarningOutlined />}
              suffix="%"
            />
            <Progress 
              percent={metrics.npl_ratio * 10} 
              strokeColor={getMetricColor(metrics.npl_ratio, 3, false)}
              showInfo={false}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Cible: &lt; 3%
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ROE"
              value={metrics.roe}
              precision={1}
              valueStyle={{ color: primaryColor }}
              prefix={<LineChartOutlined />}
              suffix="%"
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              <ArrowUpOutlined style={{ color: successColor }} /> +1.2% vs année dernière
            </div>
          </Card>
        </Col>
      </Row>

      {/* Graphiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Évolution des Ratios Prudentiels">
            <Line {...lineConfig} height={300} />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="CET1 Ratio - Gauge">
            <Gauge {...gaugeConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Portfolio et tableau */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Répartition du Portefeuille de Prêts">
            <Pie {...pieConfig} height={300} />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Prêts à Risque - Top Expositions">
            <Table 
              columns={riskLoansColumns} 
              dataSource={riskLoansData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Alertes */}
      <div style={{ marginTop: '24px' }}>
        <Alert
          message="Conformité Bâle III"
          description="Tous les ratios prudentiels respectent les exigences réglementaires. Le ratio CET1 dispose d'un coussin confortable de 4.3% au-dessus du minimum."
          type="success"
          showIcon
        />
      </div>
    </div>
  );
};

export default BankingDashboard;