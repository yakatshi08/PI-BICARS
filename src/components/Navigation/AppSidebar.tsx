import React, { useState } from 'react';
import { Layout, Menu, Avatar, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  CloudUploadOutlined,
  RobotOutlined,
  BrainOutlined,
  BankOutlined,
  FileProtectOutlined,
  CreditCardOutlined,
  LineChartOutlined,
  SafetyOutlined,
  CalculatorOutlined,
  WarningOutlined,
  FundProjectionScreenOutlined,
  UserOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  FileSearchOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  AreaChartOutlined,
  BarChartOutlined,
  PieChartOutlined
} from '@ant-design/icons';

const { Sider } = Layout;
const { Text } = Typography;

interface AppSidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ 
  collapsed: controlledCollapsed, 
  onCollapse 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  
  // Utilise l'état contrôlé si fourni, sinon l'état interne
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const handleCollapse = (value: boolean) => {
    if (onCollapse) {
      onCollapse(value);
    } else {
      setInternalCollapsed(value);
    }
  };

  // Items du menu principal
  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Accueil',
      onClick: () => navigate('/'),
    },
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard Principal',
      onClick: () => navigate('/dashboard'),
    },
    {
      type: 'divider',
    },
    {
      key: 'data-group',
      label: 'Données & Import',
      type: 'group',
      children: [
        {
          key: 'import',
          icon: <CloudUploadOutlined />,
          label: 'Import de Données',
          onClick: () => navigate('/import'),
        },
      ],
    },
    {
      key: 'ai-group',
      label: 'Intelligence Artificielle',
      type: 'group',
      children: [
        {
          key: 'copilot',
          icon: <RobotOutlined />,
          label: 'Copilot IA',
          onClick: () => navigate('/copilot'),
        },
        {
          key: 'analytics-ml',
          icon: <BrainOutlined />,
          label: 'Analytics ML',
          children: [
            {
              key: 'ml-detection',
              icon: <FileSearchOutlined />,
              label: 'Détection Secteur',
              onClick: () => navigate('/analytics-ml/detection'),
            },
            {
              key: 'ml-anomalies',
              icon: <WarningOutlined />,
              label: 'Détection Anomalies',
              onClick: () => navigate('/analytics-ml/anomalies'),
            },
            {
              key: 'ml-models',
              icon: <FundProjectionScreenOutlined />,
              label: 'Modèles ML',
              onClick: () => navigate('/analytics-ml/models'),
            },
          ],
        },
      ],
    },
    {
      key: 'banking-group',
      label: 'Banking',
      type: 'group',
      children: [
        {
          key: 'banking',
          icon: <BankOutlined />,
          label: 'Banking Core',
          children: [
            {
              key: 'banking-dashboard',
              icon: <DashboardOutlined />,
              label: 'Dashboard Banking',
              onClick: () => navigate('/banking'),
            },
            {
              key: 'credit-risk',
              icon: <CreditCardOutlined />,
              label: 'Credit Risk',
              onClick: () => navigate('/banking/credit-risk'),
            },
            {
              key: 'liquidity-alm',
              icon: <DollarOutlined />,
              label: 'Liquidity & ALM',
              onClick: () => navigate('/banking/liquidity-alm'),
            },
            {
              key: 'market-risk',
              icon: <LineChartOutlined />,
              label: 'Market Risk',
              onClick: () => navigate('/banking/market-risk'),
            },
          ],
        },
      ],
    },
    {
      key: 'insurance-group',
      label: 'Insurance',
      type: 'group',
      children: [
        {
          key: 'insurance',
          icon: <FileProtectOutlined />,
          label: 'Insurance Core',
          children: [
            {
              key: 'insurance-dashboard',
              icon: <DashboardOutlined />,
              label: 'Dashboard Insurance',
              onClick: () => navigate('/insurance'),
            },
            {
              key: 'actuarial',
              icon: <CalculatorOutlined />,
              label: 'Actuarial Analytics',
              onClick: () => navigate('/insurance/actuarial'),
            },
            {
              key: 'claims-underwriting',
              icon: <FileSearchOutlined />,
              label: 'Claims & Underwriting',
              onClick: () => navigate('/insurance/claims'),
            },
          ],
        },
      ],
    },
    {
      key: 'risk-compliance-group',
      label: 'Risk & Compliance',
      type: 'group',
      children: [
        {
          key: 'regulatory',
          icon: <SafetyOutlined />,
          label: 'Rapports Réglementaires',
          children: [
            {
              key: 'basel-iii',
              icon: <BarChartOutlined />,
              label: 'Bâle III / COREP',
              onClick: () => navigate('/regulatory/basel'),
            },
            {
              key: 'solvency-ii',
              icon: <PieChartOutlined />,
              label: 'Solvency II / QRT',
              onClick: () => navigate('/regulatory/solvency'),
            },
            {
              key: 'ifrs',
              icon: <AreaChartOutlined />,
              label: 'IFRS 9 / FINREP',
              onClick: () => navigate('/regulatory/ifrs'),
            },
          ],
        },
        {
          key: 'stress-testing',
          icon: <ThunderboltOutlined />,
          label: 'Stress Testing',
          onClick: () => navigate('/stress-testing'),
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: 'settings-group',
      label: 'Configuration',
      type: 'group',
      children: [
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'Mon Profil',
          onClick: () => navigate('/profile'),
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: 'Paramètres',
          onClick: () => navigate('/settings'),
        },
      ],
    },
  ];

  // Fonction pour obtenir la clé sélectionnée basée sur l'URL actuelle
  const getSelectedKey = () => {
    const path = location.pathname;
    
    // Correspondances exactes
    const exactMatches: { [key: string]: string } = {
      '/': 'home',
      '/dashboard': 'dashboard',
      '/import': 'import',
      '/copilot': 'copilot',
      '/banking': 'banking-dashboard',
      '/banking/credit-risk': 'credit-risk',
      '/banking/liquidity-alm': 'liquidity-alm',
      '/banking/market-risk': 'market-risk',
      '/insurance': 'insurance-dashboard',
      '/insurance/actuarial': 'actuarial',
      '/insurance/claims': 'claims-underwriting',
      '/analytics-ml/detection': 'ml-detection',
      '/analytics-ml/anomalies': 'ml-anomalies',
      '/analytics-ml/models': 'ml-models',
      '/regulatory/basel': 'basel-iii',
      '/regulatory/solvency': 'solvency-ii',
      '/regulatory/ifrs': 'ifrs',
      '/stress-testing': 'stress-testing',
      '/profile': 'profile',
      '/settings': 'settings',
    };

    return exactMatches[path] || 'home';
  };

  // Fonction pour obtenir les clés ouvertes basées sur l'URL actuelle
  const getOpenKeys = () => {
    const path = location.pathname;
    const openKeys: string[] = [];

    if (path.startsWith('/banking')) {
      openKeys.push('banking');
    }
    if (path.startsWith('/insurance')) {
      openKeys.push('insurance');
    }
    if (path.startsWith('/analytics-ml')) {
      openKeys.push('analytics-ml');
    }
    if (path.startsWith('/regulatory')) {
      openKeys.push('regulatory');
    }

    return openKeys;
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={handleCollapse}
      breakpoint="lg"
      width={260}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: '#001529',
      }}
    >
      {/* Logo et titre */}
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        {collapsed ? (
          <Avatar 
            size={32} 
            style={{ backgroundColor: '#1890ff' }}
          >
            PI
          </Avatar>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar 
              size={40} 
              style={{ backgroundColor: '#1890ff' }}
            >
              PI
            </Avatar>
            <div>
              <Text strong style={{ color: '#fff', fontSize: 16 }}>
                PI BICARS
              </Text>
              <br />
              <Text style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: 12 }}>
                Finance & Insurance Analytics
              </Text>
            </div>
          </div>
        )}
      </div>

      {/* Menu de navigation */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        style={{ borderRight: 0 }}
      />

      {/* Bouton toggle en bas */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div
          onClick={() => handleCollapse(!collapsed)}
          style={{
            cursor: 'pointer',
            color: 'rgba(255, 255, 255, 0.65)',
            fontSize: 18,
            transition: 'color 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#1890ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
          }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </div>
    </Sider>
  );
};

export default AppSidebar;