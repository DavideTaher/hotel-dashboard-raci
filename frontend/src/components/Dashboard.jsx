import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Card, CardContent,
  Button, Avatar, Chip, LinearProgress, Alert, CircularProgress
} from '@mui/material';
import {
  Business, People, Assessment, Notifications,
  TrendingUp, TrendingDown, Schedule, CheckCircle, Refresh
} from '@mui/icons-material';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = 'https://hotel-dashboard-api-188421734166.us-central1.run.app/api';

  useEffect(() => {
    fetchDashboardData();
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener estadísticas y actividad reciente en paralelo
      const [statsResponse, activityResponse] = await Promise.all([
        axios.get(`${API_BASE}/dashboard/stats`),
        axios.get(`${API_BASE}/whatsapp/recent?hours=24`)
      ]);

      setStats(statsResponse.data);
      setRecentActivity(activityResponse.data.messages || []);
      
    } catch (err) {
      setError('Error conectando con el backend: ' + err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
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
          <Typography variant="h6" color="textSecondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color }}>
          {value}
        </Typography>
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {trend > 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
            <Typography variant="body2" sx={{ ml: 1 }}>
              {Math.abs(trend)}% desde ayer
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading && !stats) {
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
              Sistema de Gestión Operacional en Tiempo Real
            </Typography>
            {stats && (
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.7, mt: 1 }}>
                Última actualización: {new Date(stats.lastUpdate).toLocaleString()}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={fetchDashboardData}
            sx={{ bgcolor: 'white', color: 'primary.main' }}
            disabled={loading}
          >
            Actualizar
          </Button>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Alertas */}
      {stats && stats.pendingAlerts > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Tienes {stats.pendingAlerts} alertas pendientes que requieren atención
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
        {/* Eficiencia por Departamento */}
        <Grid item xs={12} md={6}>
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
                      backgroundColor: dept.color
                    }
                  }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Actividad Reciente REAL de WhatsApp */}
        <Grid item xs={12} md={6}>
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
                      borderLeft: 4,
                      borderLeftColor: 'primary.main'
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
                <Typography variant="body2" color="textSecondary">
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
          📱 WhatsApp: {recentActivity.length > 0 ? '✅ Datos disponibles' : '⚠️ Sin datos'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;
