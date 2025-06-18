import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Card, CardContent,
  Button, Avatar, Chip, LinearProgress, Alert, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, Divider, IconButton, Tooltip
} from '@mui/material';
import {
  Business, People, Assessment, Notifications,
  TrendingUp, TrendingDown, Schedule, CheckCircle, Refresh,
  NetworkCheck, Security, Settings, Router, SignalWifi4Bar,
  Warning, Error as ErrorIcon, Wifi
} from '@mui/icons-material';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [networkStatus, setNetworkStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [networkLoading, setNetworkLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('manager'); // Sistema RACI

  const API_BASE = 'https://hotel-dashboard-api-188421734166.us-central1.run.app/api';
  const NETWORK_API = 'https://network-monitor-dot-hotel-terrazas-ai-system.uc.r.appspot.com/api/network/status';

  // Definizione ruoli RACI per Network Status
  const RACI_ROLES = {
    'admin': { 
      access: true, 
      label: 'Amministratore Sistema', 
      color: '#f44336',
      permissions: ['network', 'system', 'users', 'reports']
    },
    'it-manager': { 
      access: true, 
      label: 'IT Manager', 
      color: '#2196f3',
      permissions: ['network', 'system', 'reports']
    },
    'maintenance': { 
      access: true, 
      label: 'Manutenzione', 
      color: '#ff9800',
      permissions: ['network', 'reports']
    },
    'manager': { 
      access: false, 
      label: 'Gerencia', 
      color: '#4caf50',
      permissions: ['business', 'reports']
    },
    'reception': { 
      access: false, 
      label: 'Recepción', 
      color: '#9c27b0',
      permissions: ['business']
    },
    'viewer': { 
      access: false, 
      label: 'Vista General', 
      color: '#607d8b',
      permissions: []
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchNetworkStatus();
    
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchNetworkStatus();
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, activityResponse] = await Promise.all([
        axios.get(`${API_BASE}/dashboard/stats`),
        axios.get(`${API_BASE}/whatsapp/recent?hours=24`)
      ]);

      setStats(statsResponse.data);
      setRecentActivity(activityResponse.data.messages || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNetworkStatus = async () => {
    try {
      setNetworkLoading(true);
      const response = await axios.get(NETWORK_API);
      setNetworkStatus(response.data);
    } catch (err) {
      console.error('Error fetching network status:', err);
      setNetworkStatus({ 
        current: { status: 'UNKNOWN', issues: { critical: 0, warning: 0 } },
        summary: { status: 'UNKNOWN', latency: 0, issues: { critical: 0, warning: 0 } }
      });
    } finally {
      setNetworkLoading(false);
    }
  };

  const departmentStats = [
    { name: 'Recepción', efficiency: 92, color: '#4CAF50' },
    { name: 'Housekeeping', efficiency: 88, color: '#2196F3' },
    { name: 'F&B', efficiency: 85, color: '#FF9800' },
    { name: 'Mantenimiento', efficiency: 79, color: '#9C27B0' },
    { name: 'Seguridad', efficiency: 95, color: '#4CAF50' },
    { name: 'Finanzas', efficiency: 91, color: '#2196F3' }
  ];

  const MetricCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}20, ${color}10)` }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>
            <Icon />
          </Avatar>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {trend > 0 ? (
              <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
            ) : (
              <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
            )}
            <Typography variant="body2" color="text.secondary">
              {Math.abs(trend)}% vs anterior
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Componente NetworkStatus integrato con Material-UI
  const NetworkStatusCard = () => {
    const hasAccess = RACI_ROLES[userRole]?.permissions.includes('network');
    
    if (!hasAccess) {
      return (
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Security sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Estado de Red - Acceso Restringido
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tu rol ({RACI_ROLES[userRole]?.label}) no tiene acceso a información de red.
            </Typography>
            <Chip 
              label={RACI_ROLES[userRole]?.label} 
              size="small" 
              sx={{ 
                mt: 2,
                bgcolor: RACI_ROLES[userRole]?.color,
                color: 'white'
              }} 
            />
          </CardContent>
        </Card>
      );
    }

    if (networkLoading) {
      return (
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">Cargando estado de red...</Typography>
          </CardContent>
        </Card>
      );
    }

    const getStatusColor = (status) => {
      switch(status) {
        case 'CRITICAL': return '#f44336';
        case 'WARNING': return '#ff9800';
        case 'HEALTHY': return '#4caf50';
        default: return '#9e9e9e';
      }
    };

    const getStatusIcon = (status) => {
      switch(status) {
        case 'CRITICAL': return <ErrorIcon />;
        case 'WARNING': return <Warning />;
        case 'HEALTHY': return <SignalWifi4Bar />;
        default: return <Wifi />;
      }
    };

    const currentStatus = networkStatus?.current || {};
    const summary = networkStatus?.summary || {};

    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <NetworkCheck sx={{ mr: 2, color: '#2196f3' }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Estado de Red del Hotel
            </Typography>
            <Chip 
              label={RACI_ROLES[userRole]?.label} 
              size="small" 
              sx={{ 
                bgcolor: RACI_ROLES[userRole]?.color,
                color: 'white'
              }} 
            />
            <Tooltip title="Actualizar">
              <IconButton onClick={fetchNetworkStatus} size="small" sx={{ ml: 1 }}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Estado Principal */}
          <Box sx={{ 
            bgcolor: getStatusColor(summary.status) + '20',
            border: `2px solid ${getStatusColor(summary.status)}`,
            borderRadius: 2,
            p: 2,
            mb: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: getStatusColor(summary.status), mr: 2 }}>
                  {getStatusIcon(summary.status)}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: getStatusColor(summary.status) }}>
                    {summary.status || 'UNKNOWN'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Último update: {summary.lastUpdate ? new Date(summary.lastUpdate).toLocaleTimeString() : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Métricas de Red */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary">
                  Latencia
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: summary.latency > 50 ? 'error.main' : 
                         summary.latency > 30 ? 'warning.main' : 'success.main'
                }}>
                  {summary.latency || 0} ms
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary">
                  Críticos
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: (summary.issues?.critical || 0) > 0 ? 'error.main' : 'success.main'
                }}>
                  {summary.issues?.critical || 0}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary">
                  Warnings
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: (summary.issues?.warning || 0) > 0 ? 'warning.main' : 'success.main'
                }}>
                  {summary.issues?.warning || 0}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Alertas */}
          {(summary.issues?.critical || 0) > 0 && (
            <Alert severity="error" sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {summary.issues.critical} problema{summary.issues.critical > 1 ? 's' : ''} crítico{summary.issues.critical > 1 ? 's' : ''} detectado{summary.issues.critical > 1 ? 's' : ''}
              </Typography>
              <Typography variant="caption">
                Revisar console UniFi para detalles
              </Typography>
            </Alert>
          )}

          {(summary.issues?.warning || 0) > 0 && (summary.issues?.critical || 0) === 0 && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              <Typography variant="body2">
                {summary.issues.warning} warning{summary.issues.warning > 1 ? 's' : ''} de red detectado{summary.issues.warning > 1 ? 's' : ''}
              </Typography>
            </Alert>
          )}

          {/* Enlaces rápidos */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button 
              size="small" 
              variant="outlined"
              startIcon={<Router />}
              href="https://unifi.ui.com" 
              target="_blank"
            >
              UniFi Console
            </Button>
            <Button 
              size="small" 
              variant="outlined"
              startIcon={<Assessment />}
              href="https://network-monitor-dot-hotel-terrazas-ai-system.uc.r.appspot.com" 
              target="_blank"
            >
              Monitor
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando datos del hotel...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ color: 'white', mb: 1 }}>
              🏨 Hotel Terrazas del Caribe - Dashboard RACI
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'white', opacity: 0.9 }}>
              Sistema de gestión integral con monitoreo de red
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Selector de Rol RACI */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel sx={{ color: 'white' }}>Rol de Usuario</InputLabel>
              <Select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                sx={{ 
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '& .MuiSvgIcon-root': { color: 'white' }
                }}
              >
                {Object.entries(RACI_ROLES).map(([role, config]) => (
                  <MenuItem key={role} value={role}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          bgcolor: config.color 
                        }} 
                      />
                      {config.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                fetchDashboardData();
                fetchNetworkStatus();
              }}
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Actualizar
            </Button>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error al cargar datos: {error}
        </Alert>
      )}

      {/* Métricas principales */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Departamentos"
              value={stats.totalDepartments}
              icon={Business}
              color="#2196F3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Procesos Activos"
              value={stats.activeProcesses}
              icon={Assessment}
              color="#4CAF50"
              trend={12}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Mensajes 24h"
              value={stats.totalMessages24h || 0}
              icon={CheckCircle}
              color="#FF9800"
              trend={8}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Sentimiento Equipo"
              value={`${Math.round((stats.sentimentScore || 0.5) * 100)}%`}
              icon={People}
              color="#9C27B0"
              trend={5}
            />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Estado de Red del Hotel - NUEVA SECCIÓN */}
        <Grid item xs={12} lg={4}>
          <NetworkStatusCard />
        </Grid>

        {/* Eficiencia por Departamento */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Eficiencia por Departamento
            </Typography>
            {departmentStats.map((dept) => (
              <Box key={dept.name} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{dept.name}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {dept.efficiency}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={dept.efficiency}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: dept.color,
                    },
                  }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Actividad Reciente */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Actividad Reciente WhatsApp (DATOS REALES)
            </Typography>
            <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      p: 2, 
                      mb: 1, 
                      bgcolor: 'grey.50', 
                      borderRadius: 1,
                      borderLeft: '4px solid #2196F3'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={activity.dept} 
                        size="small" 
                        color="primary" 
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        {activity.time}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {activity.message}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Por: {activity.user}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                  No hay actividad reciente disponible
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Estado de la conexión */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: stats ? 'success.light' : 'error.light' }}>
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          🔗 Estado Backend: {stats ? '✅ Conectado' : '❌ Desconectado'} | 
          📱 WhatsApp: {recentActivity.length > 0 ? '✅ Datos disponibles' : '⚠️ Sin datos'} |
          🌐 Red: {networkStatus?.summary?.status || 'Verificando...'} |
          🔐 Rol Activo: {RACI_ROLES[userRole]?.label}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;