import React, { useState } from 'react';
import { Card, Row, Col, Table, Button, Modal, Form, Input, Select, Statistic, Tag, Space, Progress, Alert, Tabs } from 'antd';
import { 
  CalculatorOutlined, 
  WarningOutlined, 
  SafetyOutlined,
  LineChartOutlined,
  FileSearchOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { Scatter, Line, Column, Heatmap } from '@ant-design/plots';
import type { ColumnsType } from 'antd/es/table';

const { TabPane } = Tabs;

// Types
interface LoanData {
  id: string;
  borrower: string;
  amount: number;
  pd: number;
  lgd: number;
  ead: number;
  ecl: number;
  stage: number;
  rating: string;
  sector: string;
}

interface ECLCalculation {
  pd: number;
  lgd: number;
  ead: number;
  stage: number;
}

const CreditRisk: React.FC = () => {
  const [isECLModalVisible, setIsECLModalVisible] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanData | null>(null);
  const [form] = Form.useForm();

  // Couleurs
  const primaryColor = '#1890ff';
  const successColor = '#52c41a';
  const warningColor = '#faad14';
  const dangerColor = '#ff4d4f';

  // Données mockées pour les prêts
  const loansData: LoanData[] = [
    { id: 'L001', borrower: 'ABC Corp', amount: 5000000, pd: 0.02, lgd: 0.45, ead: 5000000, ecl: 45000, stage: 1, rating: 'BBB', sector: 'Manufacturing' },
    { id: 'L002', borrower: 'XYZ Ltd', amount: 3000000, pd: 0.05, lgd: 0.40, ead: 3000000, ecl: 60000, stage: 2, rating: 'BB', sector: 'Retail' },
    { id: 'L003', borrower: 'DEF Industries', amount: 8000000, pd: 0.01, lgd: 0.35, ead: 8000000, ecl: 28000, stage: 1, rating: 'A', sector: 'Technology' },
    { id: 'L004', borrower: 'GHI Holdings', amount: 2000000, pd: 0.15, lgd: 0.50, ead: 2000000, ecl: 150000, stage: 2, rating: 'B', sector: 'Real Estate' },
    { id: 'L005', borrower: 'JKL Services', amount: 1500000, pd: 1.00, lgd: 0.60, ead: 1500000, ecl: 900000, stage: 3, rating: 'D', sector: 'Services' },
  ];

  // Colonnes pour le tableau des prêts
  const columns: ColumnsType<LoanData> = [
    {
      title: 'ID Prêt',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
    },
    {
      title: 'Emprunteur',
      dataIndex: 'borrower',
      key: 'borrower',
    },
    {
      title: 'Montant',
      dataIndex: 'amount',
      key: 'amount',
      render: (value) => `€${value.toLocaleString()}`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'PD (%)',
      dataIndex: 'pd',
      key: 'pd',
      render: (value) => `${(value * 100).toFixed(2)}%`,
      sorter: (a, b) => a.pd - b.pd,
    },
    {
      title: 'LGD (%)',
      dataIndex: 'lgd',
      key: 'lgd',
      render: (value) => `${(value * 100).toFixed(0)}%`,
    },
    {
      title: 'ECL',
      dataIndex: 'ecl',
      key: 'ecl',
      render: (value) => `€${value.toLocaleString()}`,
      sorter: (a, b) => a.ecl - b.ecl,
    },
    {
      title: 'Stage IFRS 9',
      dataIndex: 'stage',
      key: 'stage',
      render: (stage) => {
        const color = stage === 1 ? 'green' : stage === 2 ? 'orange' : 'red';
        return <Tag color={color}>Stage {stage}</Tag>;
      },
      filters: [
        { text: 'Stage 1', value: 1 },
        { text: 'Stage 2', value: 2 },
        { text: 'Stage 3', value: 3 },
      ],
      onFilter: (value, record) => record.stage === value,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => {
        const color = ['AAA', 'AA', 'A'].includes(rating) ? 'green' : 
                     ['BBB', 'BB'].includes(rating) ? 'orange' : 'red';
        return <Tag color={color}>{rating}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleCalculateECL(record)}>
            Recalculer ECL
          </Button>
        </Space>
      ),
    },
  ];

  // Données pour le graphique PD vs LGD
  const scatterData = loansData.map(loan => ({
    pd: loan.pd * 100,
    lgd: loan.lgd * 100,
    ecl: loan.ecl,
    borrower: loan.borrower,
    stage: `Stage ${loan.stage}`,
  }));

  const scatterConfig = {
    data: scatterData,
    xField: 'pd',
    yField: 'lgd',
    colorField: 'stage',
    size: 8,
    shape: 'circle',
    yAxis: {
      nice: true,
      line: {
        style: {
          stroke: '#aaa',
        },
      },
      title: {
        text: 'LGD (%)',
      },
    },
    xAxis: {
      grid: {
        line: {
          style: {
            stroke: '#eee',
          },
        },
      },
      line: {
        style: {
          stroke: '#aaa',
        },
      },
      title: {
        text: 'PD (%)',
      },
    },
    color: [successColor, warningColor, dangerColor],
  };

  // Données pour la matrice de migration
  const migrationData = [
    { from: 'AAA', to: 'AAA', value: 95 },
    { from: 'AAA', to: 'AA', value: 4 },
    { from: 'AAA', to: 'A', value: 1 },
    { from: 'AA', to: 'AA', value: 90 },
    { from: 'AA', to: 'A', value: 8 },
    { from: 'AA', to: 'BBB', value: 2 },
    { from: 'A', to: 'A', value: 85 },
    { from: 'A', to: 'BBB', value: 12 },
    { from: 'A', to: 'BB', value: 3 },
    { from: 'BBB', to: 'BBB', value: 80 },
    { from: 'BBB', to: 'BB', value: 15 },
    { from: 'BBB', to: 'B', value: 5 },
  ];

  const heatmapConfig = {
    data: migrationData,
    xField: 'to',
    yField: 'from',
    colorField: 'value',
    color: ['#f0f0f0', '#FFE4B5', '#FFA500', '#FF6347', '#FF0000'],
    label: {
      visible: true,
      style: {
        fill: '#000',
        shadowBlur: 2,
        shadowColor: 'rgba(255, 255, 255, .2)',
      },
    },
  };

  // Données pour l'évolution des provisions
  const provisionsData = [
    { month: 'Jan', stage1: 120000, stage2: 180000, stage3: 450000 },
    { month: 'Feb', stage1: 125000, stage2: 185000, stage3: 460000 },
    { month: 'Mar', stage1: 130000, stage2: 190000, stage3: 470000 },
    { month: 'Apr', stage1: 128000, stage2: 195000, stage3: 480000 },
    { month: 'May', stage1: 132000, stage2: 200000, stage3: 490000 },
    { month: 'Jun', stage1: 135000, stage2: 210000, stage3: 500000 },
  ];

  // Transformation des données pour le graphique empilé
  const stackedData: any[] = [];
  provisionsData.forEach(item => {
    stackedData.push({ month: item.month, value: item.stage1, type: 'Stage 1' });
    stackedData.push({ month: item.month, value: item.stage2, type: 'Stage 2' });
    stackedData.push({ month: item.month, value: item.stage3, type: 'Stage 3' });
  });

  const stackedConfig = {
    data: stackedData,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    isStack: true,
    color: [successColor, warningColor, dangerColor],
    label: {
      position: 'middle' as const,
      style: {
        fill: '#fff',
      },
    },
  };

  // Fonctions
  const handleCalculateECL = (loan?: LoanData) => {
    if (loan) {
      setSelectedLoan(loan);
      form.setFieldsValue({
        pd: loan.pd * 100,
        lgd: loan.lgd * 100,
        ead: loan.ead,
        stage: loan.stage,
      });
    }
    setIsECLModalVisible(true);
  };

  const handleECLCalculation = (values: any) => {
    const ecl = (values.pd / 100) * (values.lgd / 100) * values.ead;
    Modal.info({
      title: 'Résultat du calcul ECL',
      content: (
        <div>
          <p><strong>Expected Credit Loss (ECL):</strong> €{ecl.toLocaleString()}</p>
          <p><strong>Formule:</strong> PD × LGD × EAD</p>
          <p><strong>Détail:</strong> {values.pd}% × {values.lgd}% × €{values.ead.toLocaleString()}</p>
        </div>
      ),
    });
    setIsECLModalVisible(false);
    form.resetFields();
  };

  // Calcul des métriques globales
  const totalExposure = loansData.reduce((sum, loan) => sum + loan.ead, 0);
  const totalECL = loansData.reduce((sum, loan) => sum + loan.ecl, 0);
  const averagePD = loansData.reduce((sum, loan) => sum + loan.pd, 0) / loansData.length;
  const coverageRatio = (totalECL / totalExposure) * 100;

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          <WarningOutlined /> Credit Risk Management
        </h1>
        <p style={{ color: '#666', marginTop: '8px' }}>
          Gestion du risque de crédit, calculs IFRS 9 et stress testing
        </p>
      </div>

      {/* KPIs Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Exposition Totale"
              value={totalExposure}
              prefix="€"
              formatter={(value) => `${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ECL Total"
              value={totalECL}
              prefix="€"
              valueStyle={{ color: warningColor }}
              formatter={(value) => `${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="PD Moyen"
              value={averagePD * 100}
              precision={2}
              suffix="%"
              valueStyle={{ color: primaryColor }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Taux de Couverture"
              value={coverageRatio}
              precision={2}
              suffix="%"
              valueStyle={{ color: successColor }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs pour organiser le contenu */}
      <Tabs defaultActiveKey="1">
        <TabPane tab={<span><FileSearchOutlined /> Portefeuille de Prêts</span>} key="1">
          {/* Tableau des prêts */}
          <Card 
            title="Portefeuille de Prêts - Détail" 
            extra={
              <Button type="primary" onClick={() => handleCalculateECL()}>
                <CalculatorOutlined /> Calculer ECL
              </Button>
            }
          >
            <Table 
              columns={columns} 
              dataSource={loansData}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1200 }}
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}>
                      <strong>Total</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <strong>€{totalExposure.toLocaleString()}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} colSpan={2} />
                    <Table.Summary.Cell index={5}>
                      <strong>€{totalECL.toLocaleString()}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6} colSpan={3} />
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>

          {/* Graphique PD vs LGD */}
          <Card title="Analyse PD vs LGD par Stage" style={{ marginTop: '24px' }}>
            <Scatter {...scatterConfig} height={300} />
          </Card>
        </TabPane>

        <TabPane tab={<span><LineChartOutlined /> Évolution & Provisions</span>} key="2">
          {/* Évolution des provisions */}
          <Card title="Évolution des Provisions ECL par Stage">
            <Column {...stackedConfig} height={300} />
          </Card>

          {/* Alertes */}
          <Alert
            message="Analyse des Provisions"
            description="Les provisions Stage 3 représentent 58% du total des provisions. Une attention particulière doit être portée aux prêts en Stage 2 qui montrent une tendance à la hausse."
            type="warning"
            showIcon
            style={{ marginTop: '24px' }}
          />
        </TabPane>

        <TabPane tab={<span><ThunderboltOutlined /> Stress Testing</span>} key="3">
          {/* Matrice de migration */}
          <Card title="Matrice de Migration des Ratings">
            <Heatmap {...heatmapConfig} height={300} />
          </Card>

          {/* Scénarios de stress */}
          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            <Col xs={24} lg={12}>
              <Card title="Scénario de Base">
                <p><strong>Hypothèses:</strong></p>
                <ul>
                  <li>Croissance GDP: +2%</li>
                  <li>Taux de chômage: 7.5%</li>
                  <li>Prix immobilier: +3%</li>
                </ul>
                <p><strong>Impact ECL:</strong> +5% (€{(totalECL * 1.05).toLocaleString()})</p>
                <Progress percent={75} strokeColor={successColor} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Scénario Adverse">
                <p><strong>Hypothèses:</strong></p>
                <ul>
                  <li>Croissance GDP: -2%</li>
                  <li>Taux de chômage: 12%</li>
                  <li>Prix immobilier: -15%</li>
                </ul>
                <p><strong>Impact ECL:</strong> +45% (€{(totalECL * 1.45).toLocaleString()})</p>
                <Progress percent={45} strokeColor={dangerColor} />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Modal de calcul ECL */}
      <Modal
        title="Calculateur ECL (IFRS 9)"
        visible={isECLModalVisible}
        onCancel={() => {
          setIsECLModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleECLCalculation}
        >
          <Form.Item
            name="pd"
            label="Probabilité de Défaut (PD) %"
            rules={[{ required: true, message: 'Veuillez entrer la PD' }]}
          >
            <Input type="number" step="0.01" min="0" max="100" suffix="%" />
          </Form.Item>
          
          <Form.Item
            name="lgd"
            label="Loss Given Default (LGD) %"
            rules={[{ required: true, message: 'Veuillez entrer la LGD' }]}
          >
            <Input type="number" step="1" min="0" max="100" suffix="%" />
          </Form.Item>
          
          <Form.Item
            name="ead"
            label="Exposure At Default (EAD) €"
            rules={[{ required: true, message: 'Veuillez entrer l\'EAD' }]}
          >
            <Input type="number" min="0" prefix="€" />
          </Form.Item>
          
          <Form.Item
            name="stage"
            label="Stage IFRS 9"
            rules={[{ required: true, message: 'Veuillez sélectionner le stage' }]}
          >
            <Select>
              <Select.Option value={1}>Stage 1 - Performing</Select.Option>
              <Select.Option value={2}>Stage 2 - Under-performing</Select.Option>
              <Select.Option value={3}>Stage 3 - Non-performing</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Calculer ECL
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CreditRisk;