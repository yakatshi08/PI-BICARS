import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, AlertTriangle, BarChart3, DollarSign, 
  Activity, Shield, ArrowUpRight, ArrowDownRight,
  Settings, Download, RefreshCw, Calculator
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, ReferenceLine, Brush
} from 'recharts';

const MarketRisk = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPortfolio, setSelectedPortfolio] = useState('trading-book');
  const [timeHorizon, setTimeHorizon] = useState('1d');
  const [confidenceLevel, setConfidenceLevel] = useState('99');
  const [stressScenario, setStressScenario] = useState('baseline');

  // VaR/CVaR données
  const varData = [
    { date: '2025-01-05', var95: 2.1, var99: 3.2, cvar99: 4.1 },
    { date: '2025-01-06', var95: 2.3, var99: 3.5, cvar99: 4.5 },
    { date: '2025-01-07', var95: 2.0, var99: 3.0, cvar99: 3.9 },
    { date: '2025-01-08', var95: 2.4, var99: 3.6, cvar99: 4.7 },
    { date: '2025-01-09', var95: 2.2, var99: 3.3, cvar99: 4.3 },
    { date: '2025-01-10', var95: 2.5, var99: 3.8, cvar99: 5.0 },
    { date: '2025-01-11', var95: 2.3, var99: 3.4, cvar99: 4.4 }
  ];

  // P&L Attribution
  const plAttributionData = [
    { factor: 'Interest Rate', pnl: 1.2, contribution: 35 },
    { factor: 'FX', pnl: -0.5, contribution: -15 },
    { factor: 'Equity', pnl: 0.8, contribution: 23 },
    { factor: 'Credit Spread', pnl: -0.3, contribution: -9 },
    { factor: 'Commodity', pnl: 0.4, contribution: 12 },
    { factor: 'Volatility', pnl: 0.6, contribution: 18 },
    { factor: 'Other', pnl: 0.3, contribution: 9 }
  ];

  // SA-CCR données
  const saccRData = {
    ead: 125.6,
    pfe: 45.3,
    multiplier: 1.4,
    addOn: {
      interestRate: 12.5,
      fx: 8.7,
      equity: 15.3,
      commodity: 6.2,
      credit: 2.6
    },
    netting: {
      gross: 180.5,
      net: 125.6,
      benefit: 30.4
    }
  };

  // Stress test scenarios
  const stressTestResults = [
    { scenario: 'Baseline', impact: 0, var: 3.4, capital: 100 },
    { scenario: 'Rate Shock +200bp', impact: -8.5, var: 5.2, capital: 91.5 },
    { scenario: 'Equity Crash -30%', impact: -12.3, var: 7.8, capital: 87.7 },
    { scenario: 'FX Crisis', impact: -6.7, var: 4.9, capital: 93.3 },
    { scenario: 'Credit Event', impact: -15.2, var: 9.1, capital: 84.8 },
    { scenario: 'Combined Severe', impact: -22.5, var: 12.3, capital: 77.5 }
  ];

  // Risk factors sensitivities
  const riskFactorsSensitivities = [
    { factor: 'EUR/USD', sensitivity: 'Delta', value: 2.5, limit: 5.0, utilization: 50 },
    { factor: 'US 10Y', sensitivity: 'DV01', value: 1.8, limit: 3.0, utilization: 60 },
    { factor: 'S&P 500', sensitivity: 'Delta', value: 3.2, limit: 4.0, utilization: 80 },
    { factor: 'Oil (Brent)', sensitivity: 'Delta', value: 0.9, limit: 2.0, utilization: 45 },
    { factor: 'IG Credit', sensitivity: 'CS01', value: 1.5, limit: 2.5, utilization: 60 },
    { factor: 'Implied Vol', sensitivity: 'Vega', value: 2.1, limit: 3.0, utilization: 70 }
  ];

  // Greeks exposition
  const greeksData = [
    { greek: 'Delta', equity: 15.2, fx: 8.5, rates: 12.3, commodity: 4.2 },
    { greek: 'Gamma', equity: 3.5, fx: 1.2, rates: 2.8, commodity: 0.8 },
    { greek: 'Vega', equity: 6.8, fx: 2.3, rates: 4.5, commodity: 1.5 },
    { greek: 'Theta', equity: -2.1, fx: -0.8, rates: -1.5, commodity: -0.4 },
    { greek: 'Rho', equity: 1.2, fx: 0.5, rates: 8.9, commodity: 0.3 }
  ];

  const formatTabName = (tab) => {
    return tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header avec navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Market Risk Analytics</h1>
            <p className="text-slate-400">VaR/CVaR • Stress Testing • P&L Attribution • SA-CCR</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedPortfolio}
              onChange={(e) => setSelectedPortfolio(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2"
            >
              <option value="trading-book">Trading Book</option>
              <option value="banking-book">Banking Book</option>
              <option value="derivatives">Derivatives</option>
              <option value="consolidated">Consolidated</option>
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
          {['overview', 'var-cvar', 'stress-testing', 'pl-attribution', 'sa-ccr'].map((tab) => (
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
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-red-500" />
                </div>
                <span className="text-red-500 text-sm">+12.5%</span>
              </div>
              <h3 className="text-2xl font-bold">€3.4M</h3>
              <p className="text-slate-400">VaR 99% (1-day)</p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
                <span className="text-orange-500 text-sm">+8.3%</span>
              </div>
              <h3 className="text-2xl font-bold">€4.4M</h3>
              <p className="text-slate-400">CVaR 99%</p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-emerald-500 text-sm">-5.2%</span>
              </div>
              <h3 className="text-2xl font-bold">€125.6M</h3>
              <p className="text-slate-400">SA-CCR EAD</p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="text-emerald-500 text-sm">+€2.5M</span>
              </div>
              <h3 className="text-2xl font-bold">€2.5M</h3>
              <p className="text-slate-400">Daily P&L</p>
            </div>
          </div>

          {/* Graphiques principaux */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">VaR Evolution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={varData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="var95" stroke="#3b82f6" name="VaR 95%" strokeWidth={2} />
                  <Line type="monotone" dataKey="var99" stroke="#ef4444" name="VaR 99%" strokeWidth={2} />
                  <Line type="monotone" dataKey="cvar99" stroke="#f59e0b" name="CVaR 99%" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">P&L Attribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={plAttributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="factor" stroke="#94a3b8" angle={-45} textAnchor="end" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="pnl" name="P&L (€M)">
                    {plAttributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* VaR/CVaR Tab */}
      {activeTab === 'var-cvar' && (
        <div className="space-y-6">
          {/* Contrôles */}
          <div className="bg-slate-800 rounded-lg p-4 flex items-center gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Time Horizon</label>
              <select
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-1"
              >
                <option value="1d">1 Day</option>
                <option value="10d">10 Days</option>
                <option value="1m">1 Month</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Confidence Level</label>
              <select
                value={confidenceLevel}
                onChange={(e) => setConfidenceLevel(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-1"
              >
                <option value="95">95%</option>
                <option value="99">99%</option>
                <option value="99.9">99.9%</option>
              </select>
            </div>
            <div className="ml-auto">
              <button className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Recalculate
              </button>
            </div>
          </div>

          {/* VaR Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">VaR/CVaR Trend</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={varData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="var95" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="var99" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="cvar99" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                  <Brush dataKey="date" height={30} stroke="#8b5cf6" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Risk Metrics</h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400">VaR 95%</span>
                    <span className="font-bold">€2.3M</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div className="p-4 bg-slate-700/50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400">VaR 99%</span>
                    <span className="font-bold">€3.4M</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="p-4 bg-slate-700/50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400">CVaR 99%</span>
                    <span className="font-bold">€4.4M</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div className="p-4 bg-slate-700/50 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400">Expected Shortfall</span>
                    <span className="font-bold">€5.1M</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Factors Sensitivities */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Risk Factors Sensitivities</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4">Risk Factor</th>
                    <th className="text-left py-3 px-4">Sensitivity</th>
                    <th className="text-right py-3 px-4">Value (€M)</th>
                    <th className="text-right py-3 px-4">Limit (€M)</th>
                    <th className="text-right py-3 px-4">Utilization</th>
                    <th className="text-center py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {riskFactorsSensitivities.map((factor, index) => (
                    <tr key={index} className="border-b border-slate-700/50">
                      <td className="py-3 px-4">{factor.factor}</td>
                      <td className="py-3 px-4 text-slate-400">{factor.sensitivity}</td>
                      <td className="py-3 px-4 text-right">{factor.value}</td>
                      <td className="py-3 px-4 text-right">{factor.limit}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={factor.utilization > 70 ? 'text-orange-500' : 'text-emerald-500'}>
                          {factor.utilization}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          factor.utilization > 80 
                            ? 'bg-red-500/20 text-red-500' 
                            : factor.utilization > 70
                            ? 'bg-orange-500/20 text-orange-500'
                            : 'bg-emerald-500/20 text-emerald-500'
                        }`}>
                          {factor.utilization > 80 ? 'Critical' : factor.utilization > 70 ? 'Warning' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                <h3 className="text-lg font-semibold">Stress Test Scenarios</h3>
              </div>
              <select
                value={stressScenario}
                onChange={(e) => setStressScenario(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded px-4 py-2"
              >
                <option value="baseline">Baseline</option>
                <option value="ecb-adverse">ECB Adverse</option>
                <option value="ecb-severely-adverse">ECB Severely Adverse</option>
                <option value="custom">Custom Scenario</option>
              </select>
            </div>
          </div>

          {/* Stress Test Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Scenario Impact</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stressTestResults} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="scenario" type="category" stroke="#94a3b8" width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="impact" name="Impact (%)">
                    {stressTestResults.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.impact < -10 ? '#ef4444' : entry.impact < -5 ? '#f59e0b' : '#3b82f6'} />
                    ))}
                  </Bar>
                  <ReferenceLine x={0} stroke="#666" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Capital Impact</h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={stressTestResults}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="scenario" stroke="#94a3b8" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
                  <Radar name="Capital %" dataKey="capital" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Radar name="VaR" dataKey="var" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mitigation Actions */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Recommended Mitigation Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Shield className="w-8 h-8 text-blue-500 mb-3" />
                <h4 className="font-semibold mb-2">Hedge Interest Rate Risk</h4>
                <p className="text-sm text-slate-400">Implement rate swaps to reduce DV01 exposure by 30%</p>
                <button className="mt-3 text-blue-500 text-sm hover:underline">Execute →</button>
              </div>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <Activity className="w-8 h-8 text-emerald-500 mb-3" />
                <h4 className="font-semibold mb-2">Reduce FX Exposure</h4>
                <p className="text-sm text-slate-400">Close EUR/USD positions above €10M notional</p>
                <button className="mt-3 text-emerald-500 text-sm hover:underline">Review →</button>
              </div>
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <BarChart3 className="w-8 h-8 text-purple-500 mb-3" />
                <h4 className="font-semibold mb-2">Diversify Portfolio</h4>
                <p className="text-sm text-slate-400">Rebalance to reduce concentration in tech sector</p>
                <button className="mt-3 text-purple-500 text-sm hover:underline">Simulate →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* P&L Attribution Tab */}
      {activeTab === 'pl-attribution' && (
        <div className="space-y-6">
          {/* Daily P&L Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Total P&L</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-emerald-500">+€2.5M</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Trading P&L</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold">+€3.1M</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Fees & Costs</span>
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-500">-€0.6M</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Unexplained</span>
                <Activity className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-orange-500">€0.1M</p>
            </div>
          </div>

          {/* P&L Breakdown Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">P&L by Risk Factor</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={plAttributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="factor" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend />
                  <Bar dataKey="pnl" name="P&L (€M)" radius={[8, 8, 0, 0]}>
                    {plAttributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                  <ReferenceLine y={0} stroke="#666" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Greeks Contribution</h3>
              <div className="space-y-3">
                {greeksData.map((greek) => {
                  const total = greek.equity + greek.fx + greek.rates + greek.commodity;
                  return (
                    <div key={greek.greek} className="p-3 bg-slate-700/50 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{greek.greek}</span>
                        <span className={`font-bold ${total >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          €{total.toFixed(1)}M
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <div 
                          className="bg-blue-500 h-2 rounded" 
                          style={{ width: Math.abs(greek.equity) * 5 + '%' }}
                          title={'Equity: €' + greek.equity + 'M'}
                        />
                        <div 
                          className="bg-purple-500 h-2 rounded" 
                          style={{ width: Math.abs(greek.fx) * 5 + '%' }}
                          title={'FX: €' + greek.fx + 'M'}
                        />
                        <div 
                          className="bg-orange-500 h-2 rounded" 
                          style={{ width: Math.abs(greek.rates) * 5 + '%' }}
                          title={'Rates: €' + greek.rates + 'M'}
                        />
                        <div 
                          className="bg-emerald-500 h-2 rounded" 
                          style={{ width: Math.abs(greek.commodity) * 5 + '%' }}
                          title={'Commodity: €' + greek.commodity + 'M'}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Attribution Table */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Detailed P&L Attribution</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4">Desk</th>
                    <th className="text-right py-3 px-4">Yesterday P&L</th>
                    <th className="text-right py-3 px-4">Today P&L</th>
                    <th className="text-right py-3 px-4">Change</th>
                    <th className="text-right py-3 px-4">MTD</th>
                    <th className="text-right py-3 px-4">YTD</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4">FX Trading</td>
                    <td className="py-3 px-4 text-right">€0.8M</td>
                    <td className="py-3 px-4 text-right text-emerald-500">€1.2M</td>
                    <td className="py-3 px-4 text-right text-emerald-500">+50%</td>
                    <td className="py-3 px-4 text-right">€5.3M</td>
                    <td className="py-3 px-4 text-right">€15.2M</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4">Rates Desk</td>
                    <td className="py-3 px-4 text-right">€1.5M</td>
                    <td className="py-3 px-4 text-right text-red-500">€0.9M</td>
                    <td className="py-3 px-4 text-right text-red-500">-40%</td>
                    <td className="py-3 px-4 text-right">€8.7M</td>
                    <td className="py-3 px-4 text-right">€22.4M</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4">Equity Derivatives</td>
                    <td className="py-3 px-4 text-right">€0.3M</td>
                    <td className="py-3 px-4 text-right text-emerald-500">€0.8M</td>
                    <td className="py-3 px-4 text-right text-emerald-500">+167%</td>
                    <td className="py-3 px-4 text-right">€3.2M</td>
                    <td className="py-3 px-4 text-right">€11.8M</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4">Credit Trading</td>
                    <td className="py-3 px-4 text-right">-€0.2M</td>
                    <td className="py-3 px-4 text-right text-red-500">-€0.3M</td>
                    <td className="py-3 px-4 text-right text-red-500">-50%</td>
                    <td className="py-3 px-4 text-right">€1.1M</td>
                    <td className="py-3 px-4 text-right">€8.5M</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SA-CCR Tab */}
      {activeTab === 'sa-ccr' && (
        <div className="space-y-6">
          {/* SA-CCR Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">EAD Calculation</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Replacement Cost</span>
                  <span className="font-bold">€45.3M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">PFE</span>
                  <span className="font-bold">€80.3M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Multiplier</span>
                  <span className="font-bold">1.4</span>
                </div>
                <div className="border-t border-slate-700 pt-3 flex justify-between">
                  <span className="text-slate-400">Total EAD</span>
                  <span className="text-2xl font-bold text-blue-500">€125.6M</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Add-On by Asset Class</h3>
              <div className="space-y-2">
                {Object.entries(saccRData.addOn).map(([key, value]) => {
                  const total = Object.values(saccRData.addOn).reduce((a, b) => a + b, 0);
                  const percentage = (value / total) * 100;
                  const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                  
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-sm text-slate-400 w-24">
                        {formattedKey}
                      </span>
                      <div className="flex-1 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: percentage + '%' }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">€{value}M</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Netting Benefit</h3>
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-emerald-500">{saccRData.netting.benefit}%</p>
                    <p className="text-sm text-slate-400">Reduction</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <RadarChart data={[
                    { subject: 'Gross', value: saccRData.netting.gross },
                    { subject: 'Net', value: saccRData.netting.net }
                  ]}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                    <PolarRadiusAxis angle={90} domain={[0, 200]} stroke="none" />
                    <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Regulatory Capital Impact */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Regulatory Capital Requirements</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm text-slate-400 mb-3">Capital Charge Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
                    <span>Credit Risk RWA</span>
                    <span className="font-bold">€100.5M</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
                    <span>CVA Risk Charge</span>
                    <span className="font-bold">€15.2M</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
                    <span>Default Fund Contribution</span>
                    <span className="font-bold">€8.3M</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                    <span className="font-semibold">Total Capital Requirement</span>
                    <span className="font-bold text-blue-500">€124.0M</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm text-slate-400 mb-3">Optimization Opportunities</h4>
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Compression Potential</span>
                      <span className="text-emerald-500">-€22.5M</span>
                    </div>
                    <p className="text-sm text-slate-400">Bilateral compression on FX forwards</p>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Netting Optimization</span>
                      <span className="text-blue-500">-€18.3M</span>
                    </div>
                    <p className="text-sm text-slate-400">Additional netting sets available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketRisk;