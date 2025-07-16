// app/components/analytics/IntelligentEDA.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Tooltip,
  IconButton,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  Badge
} from '@mui/material';
import {
  ExpandMore,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
  Info,
  Lightbulb,
  Assessment,
  BugReport,
  Timeline,
  BarChart,
  PieChart,
  Refresh,
  Download,
  Speed
} from '@mui/icons-material';

interface IntelligentEDAProps {
  datasetId?: string;
  onComplete?: (results: any) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`eda-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const IntelligentEDA: React.FC<IntelligentEDAProps> = ({ datasetId, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | false>('quality');

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulation d'appel API
      const response = await fetch(`/api/analytics/intelligent-eda/${datasetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
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

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const renderDataQuality = () => {
    if (!results?.data_quality) return null;
    const quality = results.data_quality;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" display="flex" alignItems="center">
              <Speed sx={{ mr: 1 }} /> Score de Qualité
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="h4" color={getQualityColor(quality.overall_score)}>
                {quality.overall_score}/100
              </Typography>
            </Box>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={quality.overall_score} 
            color={getQualityColor(quality.overall_score)}
            sx={{ mb: 3, height: 10, borderRadius: 5 }}
          />

          <Grid container spacing={2}>
            {/* Valeurs manquantes */}
            {Object.keys(quality.missing_values).length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    <Warning fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Valeurs Manquantes
                  </Typography>
                  <List dense>
                    {Object.entries(quality.missing_values).slice(0, 5).map(([col, info]: [string, any]) => (
                      <ListItem key={col}>
                        <ListItemText 
                          primary={col}
                          secondary={`${info.count} (${info.percentage.toFixed(1)}%) - Pattern: ${info.pattern}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            )}

            {/* Doublons */}
            {quality.duplicates.total > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" color="warning" gutterBottom>
                    <BugReport fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Doublons Détectés
                  </Typography>
                  <Typography variant="body2">
                    {quality.duplicates.total} lignes dupliquées ({quality.duplicates.percentage.toFixed(1)}%)
                  </Typography>
                  {quality.duplicates.duplicate_groups && (
                    <Typography variant="caption" color="text.secondary">
                      {quality.duplicates.duplicate_groups} groupes de doublons
                    </Typography>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderPatterns = () => {
    if (!results?.patterns || results.patterns.length === 0) return null;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Timeline sx={{ verticalAlign: 'middle', mr: 1 }} />
            Patterns Détectés
          </Typography>
          
          {results.patterns.map((pattern: any, index: number) => (
            <Accordion 
              key={index}
              sx={{ mb: 1, bgcolor: 'background.default' }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" width="100%" mr={2}>
                  <Chip 
                    label={pattern.pattern_type}
                    size="small"
                    color="primary"
                    sx={{ mr: 2 }}
                  />
                  <Typography flex={1}>{pattern.description}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Confiance: {(pattern.confidence * 100).toFixed(0)}%
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Typography variant="body2" paragraph>
                    <strong>Colonnes affectées:</strong> {pattern.affected_columns.join(', ')}
                  </Typography>
                  {pattern.details && (
                    <Typography variant="body2" paragraph>
                      <strong>Détails:</strong> {JSON.stringify(pattern.details, null, 2)}
                    </Typography>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="primary">
                    <Lightbulb fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    {pattern.recommendations.join(', ')}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderInsights = () => {
    if (!results?.insights || results.insights.length === 0) return null;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Lightbulb sx={{ verticalAlign: 'middle', mr: 1 }} />
            Insights Automatiques
          </Typography>
          
          <List>
            {results.insights.map((insight: any, index: number) => (
              <ListItem key={index} sx={{ bgcolor: 'background.default', mb: 1, borderRadius: 1 }}>
                <ListItemIcon>
                  {insight.priority === 'high' ? <Error color="error" /> : 
                   insight.priority === 'medium' ? <Warning color="warning" /> : 
                   <Info color="info" />}
                </ListItemIcon>
                <ListItemText
                  primary={insight.message}
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" color="text.secondary">
                        {insight.action}
                      </Typography>
                      <Chip 
                        label={insight.type} 
                        size="small" 
                        sx={{ mt: 0.5 }}
                        color={getPriorityColor(insight.priority)}
                      />
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  };

  const renderCorrelations = () => {
    if (!results?.correlations) return null;
    const corr = results.correlations;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <BarChart sx={{ verticalAlign: 'middle', mr: 1 }} />
            Analyse des Corrélations
          </Typography>

          {corr.significant_correlations && corr.significant_correlations.length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Corrélations Significatives
              </Typography>
              {corr.significant_correlations.map((item: any, index: number) => (
                <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>{item.columns[0]}</strong> ↔ <strong>{item.columns[1]}</strong>
                  </Typography>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.abs(item.correlation) * 100}
                      sx={{ flex: 1, mr: 2 }}
                      color={item.correlation > 0 ? 'primary' : 'secondary'}
                    />
                    <Typography variant="caption">
                      {(item.correlation * 100).toFixed(1)}% ({item.strength})
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {corr.target_correlations && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Corrélations avec la Cible
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="primary">Positives</Typography>
                  {Object.entries(corr.target_correlations.top_positive || {}).map(([col, val]: [string, any]) => (
                    <Typography key={col} variant="body2">
                      {col}: {(val * 100).toFixed(1)}%
                    </Typography>
                  ))}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="secondary">Négatives</Typography>
                  {Object.entries(corr.target_correlations.top_negative || {}).map(([col, val]: [string, any]) => (
                    <Typography key={col} variant="body2">
                      {col}: {(val * 100).toFixed(1)}%
                    </Typography>
                  ))}
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderAnomalies = () => {
    if (!results?.anomalies) return null;
    const anomalies = results.anomalies;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <BugReport sx={{ verticalAlign: 'middle', mr: 1 }} />
            Détection d'Anomalies
          </Typography>

          <Grid container spacing={2}>
            {/* Outliers statistiques */}
            {Object.keys(anomalies.statistical_outliers).length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Outliers Statistiques (IQR)
                  </Typography>
                  {Object.entries(anomalies.statistical_outliers).map(([col, info]: [string, any]) => (
                    <Box key={col} mb={1}>
                      <Typography variant="body2">
                        <strong>{col}:</strong> {info.count} outliers ({info.percentage.toFixed(1)}%)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Limites: [{info.bounds.lower.toFixed(2)}, {info.bounds.upper.toFixed(2)}]
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            )}

            {/* Isolation Forest */}
            {anomalies.isolation_forest && anomalies.isolation_forest.count > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Anomalies Multivariées
                  </Typography>
                  <Typography variant="body2">
                    {anomalies.isolation_forest.count} anomalies détectées
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {anomalies.isolation_forest.percentage.toFixed(1)}% du dataset
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderRecommendations = () => {
    if (!results?.recommendations || results.recommendations.length === 0) return null;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <TrendingUp sx={{ verticalAlign: 'middle', mr: 1 }} />
            Recommandations
          </Typography>

          {results.recommendations.map((rec: any, index: number) => (
            <Accordion key={index} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" width="100%">
                  <Chip 
                    label={rec.category}
                    size="small"
                    sx={{ mr: 2 }}
                  />
                  <Typography flex={1}>{rec.recommendation}</Typography>
                  <Chip 
                    label={rec.priority}
                    size="small"
                    color={getPriorityColor(rec.priority)}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {rec.details}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          <Assessment sx={{ verticalAlign: 'middle', mr: 1 }} />
          Analyse EDA Intelligente
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
            onClick={runAnalysis}
            disabled={loading || !datasetId}
            sx={{ mr: 1 }}
          >
            {loading ? 'Analyse en cours...' : 'Lancer l\'analyse'}
          </Button>
          {results && (
            <Tooltip title="Exporter les résultats">
              <IconButton color="primary">
                <Download />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {results && (
        <>
          {/* Quality Overview */}
          {renderDataQuality()}

          {/* Tabs for different sections */}
          <Paper sx={{ mb: 2 }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                label={
                  <Badge badgeContent={results.patterns?.length || 0} color="primary">
                    Patterns
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={results.insights?.length || 0} color="secondary">
                    Insights
                  </Badge>
                } 
              />
              <Tab label="Corrélations" />
              <Tab label="Anomalies" />
              <Tab label="Distributions" />
              <Tab 
                label={
                  <Badge badgeContent={results.recommendations?.length || 0} color="success">
                    Recommandations
                  </Badge>
                } 
              />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {renderPatterns()}
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              {renderInsights()}
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              {renderCorrelations()}
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              {renderAnomalies()}
            </TabPanel>
            <TabPanel value={tabValue} index={4}>
              {/* Distributions - à implémenter */}
              <Typography>Visualisations des distributions à venir...</Typography>
            </TabPanel>
            <TabPanel value={tabValue} index={5}>
              {renderRecommendations()}
            </TabPanel>
          </Paper>
        </>
      )}

      {/* Initial state */}
      {!results && !loading && (
        <Box textAlign="center" py={5}>
          <Typography variant="body1" color="text.secondary" paragraph>
            Lancez l'analyse pour obtenir des insights automatiques sur vos données
          </Typography>
          <Typography variant="body2" color="text.secondary">
            L'analyse inclut : détection de patterns, qualité des données, corrélations, anomalies et recommandations personnalisées
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default IntelligentEDA;