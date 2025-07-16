// src/components/analytics/CohortAnalysis.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  People,
  CalendarToday,
  Assessment,
  Download,
  Refresh,
  Info,
  ArrowUpward,
  ArrowDownward,
  ShowChart,
  TableChart,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface CohortAnalysisProps {
  datasetId?: string;
  onComplete?: (results: any) => void;
}

interface CohortConfig {
  cohortType: 'time_based' | 'behavior_based' | 'acquisition_based';
  timePeriod: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  metrics: string[];
  userColumn: string;
  dateColumn: string;
  valueColumn?: string;
  eventColumn?: string;
}

function TabPanel({ children, value, index, ...other }: any) {
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CohortAnalysis: React.FC<CohortAnalysisProps> = ({ datasetId, onComplete }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  
  // Configuration
  const [config, setConfig] = useState<CohortConfig>({
    cohortType: 'time_based',
    timePeriod: 'monthly',
    metrics: ['retention', 'revenue'],
    userColumn: '',
    dateColumn: '',
    valueColumn: '',
    eventColumn: ''
  });

  // Colonnes disponibles (simulées)
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);

  useEffect(() => {
    // Charger les colonnes disponibles
    fetchAvailableColumns();
  }, [datasetId]);

  const fetchAvailableColumns = async () => {
    try {
      // Simulation d'appel API
      const response = await fetch(`/api/datasets/${datasetId}/columns`);
      const data = await response.json();
      setAvailableColumns(data.columns || []);
    } catch (err) {
      console.error('Erreur lors du chargement des colonnes:', err);
    }
  };

  const runCohortAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics/cohort-analysis/${datasetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });
      
      if (!response.ok) throw new Error('Erreur lors de l\'analyse');
      
      const data = await response.json();
      setResults(data);
      if (onComplete) onComplete(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRetentionColor = (value: number) => {
    if (value >= 80) return theme.palette.success.main;
    if (value >= 60) return theme.palette.info.main;
    if (value >= 40) return theme.palette.warning.main;
    if (value >= 20) return theme.palette.warning.light;
    return theme.palette.error.main;
  };

  const renderRetentionMatrix = () => {
    if (!results?.metrics?.retention?.retention_matrix) return null;
    
    const matrix = results.metrics.retention.retention_matrix;
    const cohorts = Object.keys(matrix);
    const periods = cohorts.length > 0 ? Object.keys(matrix[cohorts[0]]) : [];

    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              <TableChart sx={{ verticalAlign: 'middle', mr: 1 }} />
              Matrice de Rétention
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="table">
                <TableChart />
              </ToggleButton>
              <ToggleButton value="chart">
                <BarChartIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {viewMode === 'table' ? (
            <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cohorte</TableCell>
                    {periods.map(period => (
                      <TableCell key={period} align="center">
                        Période {period}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cohorts.map(cohort => (
                    <TableRow key={cohort}>
                      <TableCell>{new Date(cohort).toLocaleDateString()}</TableCell>
                      {periods.map(period => {
                        const value = matrix[cohort][period];
                        return (
                          <TableCell 
                            key={period} 
                            align="center"
                            sx={{
                              backgroundColor: value ? getRetentionColor(value) : 'transparent',
                              color: value > 60 ? 'white' : 'inherit',
                              fontWeight: value > 80 ? 'bold' : 'normal'
                            }}
                          >
                            {value ? `${value.toFixed(1)}%` : '-'}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ height: 400 }}>
              {/* Ici, intégrer un graphique de type heatmap */}
              <Typography color="text.secondary" align="center" sx={{ pt: 10 }}>
                Visualisation en cours de développement
              </Typography>
            </Box>
          )}

          {/* Courbe de rétention moyenne */}
          {results.metrics.retention.average_retention_curve && (
            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                Courbe de Rétention Moyenne
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(results.metrics.retention.average_retention_curve).slice(0, 12).map(([period, value]: [string, any]) => (
                  <Chip
                    key={period}
                    label={`P${period}: ${value.toFixed(1)}%`}
                    size="small"
                    color={value > 50 ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderRevenueMetrics = () => {
    if (!results?.metrics?.revenue) return null;
    
    const revenue = results.metrics.revenue;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <AttachMoney sx={{ verticalAlign: 'middle', mr: 1 }} />
            Métriques de Revenu
          </Typography>

          <Grid container spacing={3}>
            {/* ARPU Evolution */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Évolution ARPU Moyenne
                </Typography>
                {revenue.average_arpu_curve && (
                  <Box>
                    {Object.entries(revenue.average_arpu_curve).slice(0, 6).map(([period, value]: [string, any]) => (
                      <Box key={period} display="flex" alignItems="center" mb={1}>
                        <Typography variant="body2" sx={{ minWidth: 80 }}>
                          Période {period}:
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(value / Math.max(...Object.values(revenue.average_arpu_curve)) * 100, 100)}
                          sx={{ flex: 1, mx: 2 }}
                        />
                        <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'right' }}>
                          ${value.toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Revenue Retention */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Revenue Retention
                </Typography>
                {revenue.revenue_retention && (
                  <Box>
                    {Object.entries(revenue.revenue_growth_rates || {}).slice(0, 5).map(([cohort, growth]: [string, any]) => (
                      <Box key={cohort} display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">
                          {new Date(cohort).toLocaleDateString()}
                        </Typography>
                        <Chip
                          icon={growth > 0 ? <ArrowUpward /> : <ArrowDownward />}
                          label={`${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`}
                          color={growth > 0 ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderLTVAnalysis = () => {
    if (!results?.metrics?.ltv) return null;
    
    const ltv = results.metrics.ltv;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <ShowChart sx={{ verticalAlign: 'middle', mr: 1 }} />
            Analyse LTV (Lifetime Value)
          </Typography>

          <Grid container spacing={2}>
            {/* LTV actuelle par cohorte */}
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle2" gutterBottom>
                LTV Actuelle par Cohorte
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Cohorte</TableCell>
                      <TableCell align="right">LTV Actuelle</TableCell>
                      <TableCell align="right">LTV Projetée</TableCell>
                      <TableCell align="right">Vélocité</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(ltv.current_ltv || {}).map(([cohort, value]: [string, any]) => (
                      <TableRow key={cohort}>
                        <TableCell>{new Date(cohort).toLocaleDateString()}</TableCell>
                        <TableCell align="right">${value.toFixed(2)}</TableCell>
                        <TableCell align="right">
                          ${ltv.projected_ltv?.[cohort]?.toFixed(2) || '-'}
                        </TableCell>
                        <TableCell align="right">
                          {ltv.ltv_velocity?.[cohort] ? (
                            <Chip
                              label={ltv.ltv_velocity[cohort]}
                              size="small"
                              color={ltv.ltv_velocity[cohort] === 'high' ? 'success' : 'default'}
                            />
                          ) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Segments LTV */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Segments LTV
                </Typography>
                {ltv.ltv_segments && Object.entries(ltv.ltv_segments).map(([segment, count]: [string, any]) => (
                  <Box key={segment} mb={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">{segment}</Typography>
                      <Typography variant="body2" color="text.secondary">{count} cohortes</Typography>
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderInsights = () => {
    if (!results?.insights || results.insights.length === 0) return null;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Info sx={{ verticalAlign: 'middle', mr: 1 }} />
            Insights & Recommandations
          </Typography>

          <Grid container spacing={2}>
            {results.insights.map((insight: any, index: number) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    borderLeft: 4, 
                    borderColor: insight.priority > 7 ? 'error.main' : 
                               insight.priority > 4 ? 'warning.main' : 'info.main'
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {insight.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {insight.description}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="primary">
                    💡 {insight.recommendation}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderQualityScore = () => {
    if (!results?.advanced_analysis?.cohort_quality) return null;
    
    const quality = results.advanced_analysis.cohort_quality;

    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Score de Qualité des Cohortes
          </Typography>
          <Box textAlign="center">
            <Typography variant="h3" color={quality.overall_score > 70 ? 'success.main' : 'warning.main'}>
              {quality.overall_score?.toFixed(0) || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              / 100
            </Typography>
          </Box>
        </Box>
        
        <Box mt={2}>
          {quality.retention_score !== undefined && (
            <Box mb={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Rétention</Typography>
                <Typography variant="body2">{quality.retention_score.toFixed(0)}</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={quality.retention_score} 
                sx={{ mt: 0.5 }}
              />
            </Box>
          )}
          {quality.revenue_score !== undefined && (
            <Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Revenu</Typography>
                <Typography variant="body2">{quality.revenue_score.toFixed(0)}</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={quality.revenue_score} 
                sx={{ mt: 0.5 }}
                color="secondary"
              />
            </Box>
          )}
        </Box>
      </Paper>
    );
  };

  return (
    <Box>
      {/* Configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Configuration de l'Analyse
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type de Cohorte</InputLabel>
                <Select
                  value={config.cohortType}
                  label="Type de Cohorte"
                  onChange={(e) => setConfig({...config, cohortType: e.target.value as any})}
                >
                  <MenuItem value="time_based">Basé sur le temps</MenuItem>
                  <MenuItem value="behavior_based">Basé sur le comportement</MenuItem>
                  <MenuItem value="acquisition_based">Basé sur l'acquisition</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Période</InputLabel>
                <Select
                  value={config.timePeriod}
                  label="Période"
                  onChange={(e) => setConfig({...config, timePeriod: e.target.value as any})}
                >
                  <MenuItem value="daily">Quotidien</MenuItem>
                  <MenuItem value="weekly">Hebdomadaire</MenuItem>
                  <MenuItem value="monthly">Mensuel</MenuItem>
                  <MenuItem value="quarterly">Trimestriel</MenuItem>
                  <MenuItem value="yearly">Annuel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Colonne Utilisateur</InputLabel>
                <Select
                  value={config.userColumn}
                  label="Colonne Utilisateur"
                  onChange={(e) => setConfig({...config, userColumn: e.target.value})}
                >
                  {availableColumns.map(col => (
                    <MenuItem key={col} value={col}>{col}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Colonne Date</InputLabel>
                <Select
                  value={config.dateColumn}
                  label="Colonne Date"
                  onChange={(e) => setConfig({...config, dateColumn: e.target.value})}
                >
                  {availableColumns.map(col => (
                    <MenuItem key={col} value={col}>{col}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Timeline />}
              onClick={runCohortAnalysis}
              disabled={loading || !config.userColumn || !config.dateColumn}
            >
              {loading ? 'Analyse en cours...' : 'Lancer l\'analyse'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Erreurs */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Résultats */}
      {results && (
        <>
          {/* Score de qualité */}
          {renderQualityScore()}

          {/* Tabs */}
          <Paper sx={{ mb: 2 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Rétention" />
              <Tab label="Revenu" />
              <Tab label="LTV" />
              <Tab label="Insights" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {renderRetentionMatrix()}
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              {renderRevenueMetrics()}
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              {renderLTVAnalysis()}
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              {renderInsights()}
            </TabPanel>
          </Paper>
        </>
      )}

      {/* État initial */}
      {!results && !loading && (
        <Box textAlign="center" py={5}>
          <People sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" paragraph>
            Configurez et lancez l'analyse de cohortes pour comprendre le comportement de vos utilisateurs dans le temps
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CohortAnalysis;