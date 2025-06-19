import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Button,
  CircularProgress, LinearProgress, Chip, Avatar, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, FormControl, InputLabel, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
  TrendingUp, TrendingDown, ShowChart, BarChart, Timeline,
  CalendarToday, Schedule, Groups, Assessment, Star,
  Hotel, Restaurant, Security, Build, AccountBalance
} from '@mui/icons-material';

const Analytics = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData({
        overview: {
          occupancyRate: 87.5,
          revenueGrowth: 12.3,
          customerSatisfaction: 4.6,
          efficiency: 91.2
        },
        departments: [
          { name: 'Front Office', efficiency: 92, tasks: 45, alerts: 2 },
          { name: 'Housekeeping', efficiency: 88, tasks: 67, alerts: 1 },
          { name: 'F&B', efficiency: 85, tasks: 34, alerts: 0 },
          { name: 'Mantenimiento', efficiency: 79, tasks: 23, alerts: 3 },
          { name: 'Seguridad', efficiency: 95, tasks: 12, alerts: 0 }
        ],
        trends: {
          daily: [85, 88, 90, 87, 92, 89, 91],
          weekly: [82, 85, 88, 91, 87, 89, 90]
        }
      });
      setLoading(false);
    }, 1000);
  };

  const MetricCard = ({ title, value, icon: Icon, color, trend, suffix = '' }) => (
    <Card sx={{ height: '100%' }}>
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
          {value}{suffix}
        </Typography>
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {trend > 0 ? 
              <TrendingUp sx={{ color: 'success.main', mr: 1 }} /> : 
              <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
            }
            <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'}>
              {Math.abs(trend)}% vs período anterior
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const DepartmentRow = ({ dept }) => (
    <TableRow>
      <TableCell>{dept.name}</TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LinearProgress
            variant="determinate"
            value={dept.efficiency}
            sx={{ width: 100, mr: 2 }}
          />
          <Typography variant="body2">{dept.efficiency}%</Typography>
        </Box>
      </TableCell>
      <TableCell>{dept.tasks}</TableCell>
      <TableCell>
        {dept.alerts > 0 ? (
          <Chip label={dept.alerts} color="warning" size="small" />
        ) : (
          <Chip label="0" color="success" size="small" />
        )}
      </TableCell>
    </TableRow>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando analytics...
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
              {t("analytics.title")}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'white', opacity: 0.9 }}>
              Análisis de rendimiento y tendencias operacionales
            </Typography>
          </Box>
          <FormControl sx={{ minWidth: 120 }}>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              sx={{ bgcolor: 'white' }}
            >
              <MenuItem value="24h">24 Horas</MenuItem>
              <MenuItem value="7d">7 Días</MenuItem>
              <MenuItem value="30d">30 Días</MenuItem>
              <MenuItem value="90d">90 Días</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {analyticsData && (
        <>
          {/* KPIs Principales */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Ocupación"
                value={analyticsData.overview.occupancyRate}
                suffix="%"
                icon={Hotel}
                color="#2196F3"
                trend={5.2}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Crecimiento Ingresos"
                value={analyticsData.overview.revenueGrowth}
                suffix="%"
                icon={TrendingUp}
                color="#4CAF50"
                trend={12.3}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Satisfacción Cliente"
                value={analyticsData.overview.customerSatisfaction}
                suffix="/5"
                icon={Star}
                color="#FF9800"
                trend={3.1}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Eficiencia General"
                value={analyticsData.overview.efficiency}
                suffix="%"
                icon={Assessment}
                color="#9C27B0"
                trend={2.8}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Tabla de Departamentos */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Rendimiento por Departamento
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Departamento</TableCell>
                        <TableCell>Eficiencia</TableCell>
                        <TableCell>Tareas Activas</TableCell>
                        <TableCell>Alertas</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analyticsData.departments.map((dept) => (
                        <DepartmentRow key={dept.name} dept={dept} />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Gráfico de Tendencias */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" gutterBottom>
                  Tendencia Semanal
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {analyticsData.trends.weekly.map((value, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          Día {index + 1}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {value}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={value}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: value > 85 ? '#4CAF50' : value > 75 ? '#FF9800' : '#f44336'
                          }
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Analytics;
