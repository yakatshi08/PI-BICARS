import React, { useState } from 'react';
import { 
  Droplets, TrendingUp, AlertTriangle, BarChart3, 
  Activity, LineChart as LineChartIcon, Shield, 
  ArrowUpRight, ArrowDownRight, RefreshCw, Download,
  Target, DollarSign, Calendar, Clock
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, ComposedChart
} from 'recharts';

const LiquidityALM = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('1M');
  const [selectedScenario, setSelectedScenario] = useState('baseline');

  // Données LCR (Liquidity Coverage Ratio)
  const lcrData = [
    { date: '2025-01-05', lcr: 145, nsfr: 112, required: 100 },
    { date: '2025-01-06', lcr: 142, nsfr: 114, required: 100 },
    { date: '2025-01-07', lcr: 148, nsfr: 113, required: 100 },
    { date: '2025-01-08', lcr: 144, nsfr: 115, required: 100 },
    { date: '2025-01-09', lcr: 146, nsfr: 116, required: 100 },
    { date: '2025-01-10', lcr: 143, nsfr: 114, required: 100 },
    { date: '2025-01-11', lcr: 147, nsfr: 117, required: 100 }
  ];

  // Maturity Ladder
  const maturityLadder = [
    { bucket: 'Overnight', assets: 120, liabilities: -80, gap: 40, cumGap: 40 },
    { bucket: '1-7 days', assets: 85, liabilities: -65, gap: 20, cumGap: 60 },
    { bucket: '7-30 days', assets: 150, liabilities: -120, gap: 30, cumGap: 90 },
    { bucket: '1-3 months', assets: 200, liabilities: -180, gap: 20, cumGap: 110 },
    { bucket: '3-6 months', assets: 180, liabilities: -170, gap: 10, cumGap: 120 },
    { bucket: '6-12 months', assets: 160, liabilities: -155, gap: 5, cumGap: 125 },
    { bucket: '> 1 year', assets: 300, liabilities: -290, gap: 10, cumGap: 135 }
  ];

  // HQLA Composition
  const hqlaComposition = [
    { name: 'Cash & Central Bank', value: 45, percentage: 30 },
    { name: 'Level 1 Securities', value: 60, percentage: 40 },
    { name: 'Level 2A Securities', value: 30, percentage: 20 },
    { name: 'Level 2B Securities', value: 15, percentage: 10 }
  ];

  // Funding Sources
  const fundingSources = [
    { source: 'Retail Deposits', amount: 450, percentage: 35, stability: 95 },
    { source: 'Corporate Deposits', amount: 320, percentage: 25, stability: 80 },
    { source: 'Interbank', amount: 180, percentage: 14, stability: 60 },
    { source: 'Capital Markets', amount: 230, percentage: 18, stability: 50 },
    { source: 'Central Bank', amount: 100, percentage: 8, stability: 90 }
  ];

  // Stress Test Scenarios
  const stressScenarios = [
    { scenario: 'Baseline', lcr: 147, nsfr: 117, survivalDays: 90 },
    { scenario: 'Mild Stress', lcr: 125, nsfr: 108, survivalDays: 60 },
    { scenario: 'Moderate Stress', lcr: 105, nsfr: 95, survivalDays: 35 },
    { scenario: 'Severe Stress', lcr: 85, nsfr: 82, survivalDays: 20 },
    { scenario: 'Combined Crisis', lcr: 65, nsfr: 70, survivalDays: 12 }
  ];

  // ALM Gap Analysis
  const almGapData = [
    { maturity: '0-3M', assets: 355, liabilities: 265, gap: 90 },
    { maturity: '3-6M', assets: 180, liabilities: 170, gap: 10 },
    { maturity: '6-12M', assets: 160, liabilities: 155, gap: 5 },
    { maturity: '1-3Y', assets: 220, liabilities: 215, gap: 5 },
    { maturity: '3-5Y', assets: 150, liabilities: 160, gap: -10 },
    { maturity: '>5Y', assets: 130, liabilities: 145, gap: -15 }
  ];

  // Interest Rate Risk
  const durationGap = {
    assets: 3.2,
    liabilities: 2.8,
    gap: 0.4,
    convexity: 0.15
  };

  const formatTabName = (tab) => {
    return tab.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Liquidity & ALM Management</h1>
            <p className="text-slate-400">Real-time liquidity monitoring • Asset-Liability Management • Stress Testing</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedTimeFrame}
              onChange={(e) => setSelectedTimeFrame(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2"
            >
              <option value="1D">1 Day</option>
              <option value="1W">1 Week</option>
              <option value="1M">1 Month</option>
              <option value="3M">3 Months</option>
              <option value="1Y">1 Year</option>
            </select>
            <button className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
          {['overview', 'liquidity-dashboard', 'stress-testing', 'alm-analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {formatTabName(tab)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPIs principaux */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Droplets className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-emerald-500 text-sm">+3.2%</span>
              </div>
              <h3 className="text-2xl font-bold">147%</h3>
              <p className="text-slate-400">LCR Ratio</p>
              <div className="mt-2 text-xs text-emerald-500">Above 100% requirement</div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-500" />
                </div>
                <span className="text-emerald-500 text-sm">+2.1%</span>
              </div>
              <h3 className="text-2xl font-bold">117%</h3>
              <p className="text-slate-400">NSFR Ratio</p>
              <div className="mt-2 text-xs text-emerald-500">Stable funding secured</div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="text-orange-500 text-sm">90 days</span>
              </div>
              <h3 className="text-2xl font-bold">€150M</h3>
              <p className="text-slate-400">HQLA Buffer</p>
              <div className="mt-2 text-xs text-slate-500">Survival horizon: 90 days</div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <Activity className="w-6 h-6 text-orange-500" />
                </div>
                <span className="text-red-500 text-sm">+25bps</span>
              </div>
              <h3 className="text-2xl font-bold">3.8%</h3>
              <p className="text-slate-400">Funding Cost</p>
              <div className="mt-2 text-xs text-red-500">Rate pressure increasing</div>
            </div>
          </div>

          {/* Graphiques principaux */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Regulatory Ratios Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lcrData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="lcr" stroke="#3b82f6" name="LCR" strokeWidth={2} />
                  <Line type="monotone" dataKey="nsfr" stroke="#8b5cf6" name="NSFR" strokeWidth={2} />
                  <Line type="monotone" dataKey="required" stroke="#ef4444" name="Min Required" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">HQLA Composition</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={hqlaComposition}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {hqlaComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Funding Sources */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Funding Sources & Stability</h3>
            <div className="space-y-3">
              {fundingSources.map((source) => (
                <div key={source.source} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-slate-400">{source.source}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">€{source.amount}M ({source.percentage}%)</span>
                      <span className="text-xs text-slate-500">Stability: {source.stability}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: source.percentage + '%',
                          backgroundColor: source.stability > 80 ? '#10b981' : source.stability > 60 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Liquidity Dashboard Tab */}
      {activeTab === 'liquidity-dashboard' && (
        <div className="space-y-6">
          {/* Maturity Ladder */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Maturity Ladder</h3>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                As of today, 9:00 AM
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={maturityLadder}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="bucket" stroke="#94a3b8" angle={-45} textAnchor="end" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend />
                <Bar dataKey="assets" fill="#10b981" name="Assets" />
                <Bar dataKey="liabilities" fill="#ef4444" name="Liabilities" />
                <Line type="monotone" dataKey="cumGap" stroke="#f59e0b" name="Cumulative Gap" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Liquidity Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h4 className="text-sm font-medium text-slate-400 mb-4">Intraday Liquidity</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Opening Balance</span>
                  <span className="font-medium">€2.5B</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Current Position</span>
                  <span className="font-medium text-emerald-500">€2.8B</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Available Credit Lines</span>
                  <span className="font-medium">€1.2B</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Projected EOD</span>
                  <span className="font-medium">€2.6B</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h4 className="text-sm font-medium text-slate-400 mb-4">Concentration Risk</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Top 10 Depositors</span>
                  <span className="font-medium text-orange-500">28%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Top 20 Depositors</span>
                  <span className="font-medium">42%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Largest Single</span>
                  <span className="font-medium">5.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">HHI Index</span>
                  <span className="font-medium">0.082</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h4 className="text-sm font-medium text-slate-400 mb-4">Contingency Funding</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">ECB Eligible</span>
                  <span className="font-medium text-emerald-500">€4.2B</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Unencumbered</span>
                  <span className="font-medium">€2.8B</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Repo Eligible</span>
                  <span className="font-medium">€3.5B</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Available</span>
                  <span className="font-medium text-blue-500">€10.5B</span>
                </div>
              </div>
            </div>
          </div>

          {/* Early Warning Indicators */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Early Warning Indicators</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Deposit Outflow</span>
                  <ArrowDownRight className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-xl font-bold">-2.3%</p>
                <div className="mt-2 h-1 bg-slate-600 rounded">
                  <div className="h-1 bg-orange-500 rounded" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Market Access</span>
                  <Activity className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xl font-bold">Normal</p>
                <div className="mt-2 h-1 bg-slate-600 rounded">
                  <div className="h-1 bg-emerald-500 rounded" style={{ width: '90%' }}></div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Funding Spread</span>
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-xl font-bold">+15bps</p>
                <div className="mt-2 h-1 bg-slate-600 rounded">
                  <div className="h-1 bg-orange-500 rounded" style={{ width: '70%' }}></div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Counterparty Lines</span>
                  <Shield className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xl font-bold">98%</p>
                <div className="mt-2 h-1 bg-slate-600 rounded">
                  <div className="h-1 bg-emerald-500 rounded" style={{ width: '98%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stress Testing Tab */}
      {activeTab === 'stress-testing' && (
        <div className="space-y-6">
          {/* Scenario Selector */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold">Liquidity Stress Test Scenarios</h3>
              </div>
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded px-4 py-2"
              >
                <option value="baseline">Baseline</option>
                <option value="idiosyncratic">Idiosyncratic Crisis</option>
                <option value="market-wide">Market-wide Crisis</option>
                <option value="combined">Combined Crisis</option>
              </select>
            </div>
          </div>

          {/* Stress Test Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Scenario Impact on Ratios</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={stressScenarios}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="scenario" stroke="#94a3b8" />
                  <PolarRadiusAxis angle={90} domain={[0, 150]} stroke="#94a3b8" />
                  <Radar name="LCR" dataKey="lcr" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Radar name="NSFR" dataKey="nsfr" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Survival Period Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stressScenarios}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="scenario" stroke="#94a3b8" angle={-45} textAnchor="end" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="survivalDays" fill="#10b981" name="Survival Days">
                    {stressScenarios.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.survivalDays > 60 ? '#10b981' : 
                        entry.survivalDays > 30 ? '#f59e0b' : '#ef4444'
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mitigation Actions */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Contingency Funding Plan - Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-8 h-8 text-blue-500" />
                  <div>
                    <h4 className="font-semibold">Immediate Actions</h4>
                    <p className="text-sm text-slate-400">0-5 days</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Activate ECB eligible collateral (€4.2B)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Draw on committed credit lines (€1.2B)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Suspend dividend payments</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-8 h-8 text-orange-500" />
                  <div>
                    <h4 className="font-semibold">Secondary Actions</h4>
                    <p className="text-sm text-slate-400">5-30 days</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Asset sales program (€2.5B target)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Reduce loan origination by 50%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Negotiate term deposit extensions</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <div>
                    <h4 className="font-semibold">Crisis Actions</h4>
                    <p className="text-sm text-slate-400">30+ days</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Request emergency liquidity assistance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Portfolio divestiture (€5B+)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Consider M&A options</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cash Flow Projections */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">30-Day Cash Flow Projection (Stress Scenario)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={[
                { day: 'D+1', inflow: 100, outflow: -150, net: -50, cumulative: -50 },
                { day: 'D+5', inflow: 120, outflow: -180, net: -60, cumulative: -110 },
                { day: 'D+10', inflow: 150, outflow: -160, net: -10, cumulative: -120 },
                { day: 'D+15', inflow: 180, outflow: -170, net: 10, cumulative: -110 },
                { day: 'D+20', inflow: 200, outflow: -180, net: 20, cumulative: -90 },
                { day: 'D+25', inflow: 220, outflow: -190, net: 30, cumulative: -60 },
                { day: 'D+30', inflow: 240, outflow: -200, net: 40, cumulative: -20 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend />
                <Area type="monotone" dataKey="inflow" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="outflow" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                <Line type="monotone" dataKey="cumulative" stroke="#f59e0b" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ALM Analytics Tab */}
      {activeTab === 'alm-analytics' && (
        <div className="space-y-6">
          {/* Gap Analysis */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Interest Rate Gap Analysis</h3>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={almGapData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="maturity" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend />
                <Bar dataKey="assets" fill="#10b981" name="Rate Sensitive Assets" />
                <Bar dataKey="liabilities" fill="#ef4444" name="Rate Sensitive Liabilities" />
                <Line type="monotone" dataKey="gap" stroke="#f59e0b" name="Gap" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Duration & Sensitivity Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Duration Analysis</h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-slate-400">Asset Duration</span>
                    <span className="text-xl font-bold">{durationGap.assets} years</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                </div>
                <div className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-slate-400">Liability Duration</span>
                    <span className="text-xl font-bold">{durationGap.liabilities} years</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '56%' }}></div>
                  </div>
                </div>
                <div className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-slate-400">Duration Gap</span>
                    <span className="text-xl font-bold text-orange-500">{durationGap.gap} years</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                  </div>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm">
                    <span className="font-semibold">EVE Impact:</span> A 100bp rate increase would result in 
                    approximately €{(durationGap.gap * 1000 * 0.01).toFixed(1)}M loss in economic value
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">NII Sensitivity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { scenario: '-200bp', impact: -85 },
                  { scenario: '-100bp', impact: -42 },
                  { scenario: '-50bp', impact: -20 },
                  { scenario: 'Base', impact: 0 },
                  { scenario: '+50bp', impact: 18 },
                  { scenario: '+100bp', impact: 35 },
                  { scenario: '+200bp', impact: 65 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="scenario" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value) => `€${value}M`}
                  />
                  <Bar dataKey="impact" name="NII Impact (€M)">
                    {[
                      { scenario: '-200bp', impact: -85 },
                      { scenario: '-100bp', impact: -42 },
                      { scenario: '-50bp', impact: -20 },
                      { scenario: 'Base', impact: 0 },
                      { scenario: '+50bp', impact: 18 },
                      { scenario: '+100bp', impact: 35 },
                      { scenario: '+200bp', impact: 65 }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.impact >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hedging Strategy */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Current Hedges</h3>
              <div className="space-y-3">
                <div className="p-3 bg-slate-700/50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Interest Rate Swaps</span>
                    <span className="font-medium">€2.5B</span>
                  </div>
                  <p className="text-xs text-slate-400">Avg maturity: 3.2 years</p>
                </div>
                <div className="p-3 bg-slate-700/50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">FX Forwards</span>
                    <span className="font-medium">€850M</span>
                  </div>
                  <p className="text-xs text-slate-400">USD/EUR protection</p>
                </div>
                <div className="p-3 bg-slate-700/50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Options</span>
                    <span className="font-medium">€320M</span>
                  </div>
                  <p className="text-xs text-slate-400">Rate caps & floors</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Hedge Effectiveness</h3>
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-emerald-500">87%</div>
                  <p className="text-sm text-slate-400 mt-1">Overall Effectiveness</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Interest Rate Risk</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-600 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      <span className="text-xs">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>FX Risk</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-600 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-xs">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Basis Risk</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-600 rounded-full h-1.5">
                        <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                      <span className="text-xs">78%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Key Risk Indicators</h3>
              <div className="space-y-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">EVE Sensitivity</span>
                    <span className="text-emerald-500 font-medium">4.2%</span>
                  </div>
                  <p className="text-xs text-slate-400">Within 6% limit</p>
                </div>
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">NII at Risk</span>
                    <span className="text-orange-500 font-medium">€45M</span>
                  </div>
                  <p className="text-xs text-slate-400">12 months, 95% VaR</p>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Basis Risk</span>
                    <span className="text-blue-500 font-medium">€12M</span>
                  </div>
                  <p className="text-xs text-slate-400">Euribor vs Fixed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiquidityALM;