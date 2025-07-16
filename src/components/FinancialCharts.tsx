import React from 'react';
import Plot from 'react-plotly.js';
import { useFinanceStore } from '../store';

const FinancialCharts: React.FC = () => {
  const { isDarkMode, quarterlyData, kpis, waterfallData, correlationData } = useFinanceStore();

  const candlestickData = {
    x: quarterlyData.map(d => d.date),
    close: quarterlyData.map(d => d.close),
    high: quarterlyData.map(d => d.high),
    low: quarterlyData.map(d => d.low),
    open: quarterlyData.map(d => d.open)
  };

  const heatmapLabels = correlationData?.assets || ['CAC 40', 'S&P 500', 'EUR/USD', 'Gold', 'Oil'];

  const correlationMatrix = correlationData?.matrix || [
    [1.00, 0.85, -0.60, 0.45, 0.72],
    [0.85, 1.00, -0.45, 0.38, 0.68],
    [-0.60, -0.45, 1.00, -0.35, -0.52],
    [0.45, 0.38, -0.35, 1.00, 0.42],
    [0.72, 0.68, -0.52, 0.42, 1.00]
  ];

  const plotTheme = {
    paper_bgcolor: isDarkMode ? '#1f2937' : '#ffffff',
    plot_bgcolor: isDarkMode ? '#1f2937' : '#ffffff',
    font: { color: isDarkMode ? '#e5e7eb' : '#1f2937' }
  };

  const gridColor = isDarkMode ? '#374151' : '#e5e7eb';

  // ✅ 1. Nouveau graphique Credit Risk
  const renderCreditRiskEvolution = () => (
    <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Évolution du Risque de Crédit (6 derniers mois)
      </h3>
      <Plot
        data={[
          {
            x: ['Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil'],
            y: [2.5, 2.3, 2.0, 2.1, 2.2, 2.1],
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: '#f59e0b' },
            name: 'NPL (%)'
          }
        ]}
        layout={{
          ...plotTheme,
          height: 350,
          margin: { l: 60, r: 40, t: 40, b: 60 },
          xaxis: { title: 'Mois', gridcolor: gridColor },
          yaxis: { title: 'Ratio NPL (%)', gridcolor: gridColor },
        }}
        config={{ responsive: true }}
      />
    </div>
  );

  // ✅ 2. Nouveau graphique Solvabilité
  const renderSolvencyTrend = () => (
    <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Solvabilité – Tendance du SCR (6 derniers mois)
      </h3>
      <Plot
        data={[
          {
            x: ['Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil'],
            y: [172, 180, 185, 188, 190, 185],
            type: 'bar',
            marker: { color: '#10b981' },
            name: 'SCR Coverage (%)'
          }
        ]}
        layout={{
          ...plotTheme,
          height: 350,
          margin: { l: 60, r: 40, t: 40, b: 60 },
          xaxis: { title: 'Mois', gridcolor: gridColor },
          yaxis: { title: 'SCR (%)', gridcolor: gridColor, range: [150, 200] },
        }}
        config={{ responsive: true }}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Analyses Financières Avancées
      </h2>

      {/* Candlestick */}
      <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Évolution du Cours – CAC 40 ETF (Xtrackers)
        </h3>
        <Plot
          data={[
            {
              type: 'candlestick',
              x: candlestickData.x,
              close: candlestickData.close,
              high: candlestickData.high,
              low: candlestickData.low,
              open: candlestickData.open,
              increasing: { line: { color: '#10b981' } },
              decreasing: { line: { color: '#ef4444' } },
              hovertemplate: candlestickData.x.map((date, i) => {
                const trend = candlestickData.close[i] > candlestickData.open[i] ? '▲' : '▼';
                const trendColor = candlestickData.close[i] > candlestickData.open[i] ? 'green' : 'red';
                return `<b>%{x}</b><br>` +
                       `Open: €%{open}<br>` +
                       `High: €%{high}<br>` +
                       `Low: €%{low}<br>` +
                       `Close: €%{close} <span style="color:${trendColor}">${trend}</span>` +
                       `<extra></extra>`;
              })
            }
          ]}
          layout={{
            ...plotTheme,
            xaxis: {
              gridcolor: gridColor,
              rangeslider: { visible: false },
              tickformat: '%d %b'
            },
            yaxis: {
              gridcolor: gridColor,
              title: 'Prix (€)'
            },
            height: 400,
            margin: { l: 60, r: 40, t: 40, b: 60 }
          }}
          config={{ displayModeBar: false, responsive: true }}
          className="w-full"
        />
      </div>

      {/* Heatmap */}
      <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Matrice de Corrélation des Actifs
        </h3>
        <Plot
          data={[
            {
              type: 'heatmap',
              z: correlationMatrix,
              x: heatmapLabels,
              y: heatmapLabels,
              colorscale: 'RdBu',
              reversescale: true,
              text: correlationMatrix.map(row =>
                row.map(val => val.toFixed(2))
              ),
              texttemplate: '%{text}',
              textfont: { size: 12 },
              hoverongaps: false
            }
          ]}
          layout={{
            ...plotTheme,
            height: 400,
            margin: { l: 80, r: 40, t: 40, b: 80 }
          }}
          config={{ displayModeBar: false, responsive: true }}
          className="w-full"
        />
      </div>

      {/* Waterfall */}
      <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Analyse des Revenus – Q4 2023 à Q1 2024
        </h3>
        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Variation nette : +€740 000 (+29.6%)
        </p>
        <Plot
          data={[
            {
              type: 'waterfall',
              orientation: 'v',
              measure: waterfallData.map(d => d.type === 'total' ? 'total' : 'relative'),
              x: waterfallData.map(d => d.name),
              y: waterfallData.map(d => d.value),
              connector: { line: { color: gridColor } },
              increasing: { marker: { color: '#10b981' } },
              decreasing: { marker: { color: '#ef4444' } },
              totals: { marker: { color: '#3b82f6' } },
              textposition: 'none'
            }
          ]}
          layout={{
            ...plotTheme,
            xaxis: {
              tickangle: -45,
              gridcolor: gridColor
            },
            yaxis: {
              gridcolor: gridColor,
              title: 'Montant (€)',
              tickformat: ',.0f',
              range: [0, 3800000]
            },
            height: 450,
            margin: { l: 80, r: 40, t: 100, b: 120 },
            showlegend: false
          }}
          config={{ displayModeBar: false, responsive: true }}
          className="w-full"
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {kpi.label}
            </h4>
            <p className={`text-2xl font-bold mt-2 ${kpi.status === 'good' ? 'text-green-500' : 'text-yellow-500'}`}>
              {kpi.value}
            </p>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Cible: {kpi.target}
            </p>
          </div>
        ))}
      </div>

      {/* ✅ Intégration finale des nouveaux graphiques */}
      {renderCreditRiskEvolution()}
      {renderSolvencyTrend()}
    </div>
  );
};

export default FinancialCharts;
