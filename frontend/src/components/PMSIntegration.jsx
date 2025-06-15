import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Button,
  Switch, FormControlLabel, Alert, Chip, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  LinearProgress, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Divider
} from '@mui/material';
import {
  Link, LinkOff, CheckCircle, Error, Warning, Refresh,
  Settings, Sync, Storage, CloudSync, Api
} from '@mui/icons-material';

const PMSIntegration = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: 'asksuite',
      name: 'AskSuite',
      description: 'Chatbot AI y automatización huéspedes',
      status: 'connected',
      url: 'https://api.asksuite.com',
      lastSync: new Date(),
      records: 250,
      uptime: 99.8
    },
    {
      id: 'myhotel',
      name: 'MyHotel PMS',
      description: 'Sistema gestión hotelera principal', 
      status: 'pending',
      url: 'https://api.myhotel.com',
      lastSync: null,
      records: 0,
      uptime: 0
    },
    {
      id: 'fideltour',
      name: 'Fideltour',
      description: 'Gestión tours y actividades',
      status: 'error',
      url: 'https://api.fideltour.com',
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
      records: 89,
      uptime: 87.2
    },
    {
      id: 'channelmanager',
      name: 'Channel Manager',
      description: 'Distribución multi-canales',
      status: 'connected',
      url: 'https://api.channelmanager.com',
      lastSync: new Date(Date.now() - 15 * 60 * 1000),
      records: 450,
      uptime: 96.5
    }
  ]);

  const [configDialog, setConfigDialog] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'success';
      case 'pending': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return <CheckCircle />;
      case 'pending': return <Warning />;
      case 'error': return <Error />;
      default: return <LinkOff />;
    }
  };

  const handleSync = async (integrationId) => {
    setSyncing(true);
    // Simulate API call
    setTimeout(() => {
      setIntegrations(prev =>
        prev.map(int =>
          int.id === integrationId
            ? { ...int, lastSync: new Date(), status: 'connected' }
            : int
        )
      );
      setSyncing(false);
    }, 2000);
  };

  const handleToggle = (integrationId, enabled) => {
    setIntegrations(prev =>
      prev.map(int =>
        int.id === integrationId
          ? { ...int, status: enabled ? 'connected' : 'pending' }
          : int
      )
    );
  };

  const IntegrationCard = ({ integration }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                bgcolor: getStatusColor(integration.status) + '.main',
                mr: 2 
              }}
            >
              {getStatusIcon(integration.status)}
            </Avatar>
            <Box>
              <Typography variant="h6">{integration.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {integration.description}
              </Typography>
            </Box>
          </Box>
          <Chip 
            label={integration.status} 
            color={getStatusColor(integration.status)}
            size="small"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Estado de conexión
          </Typography>
          <LinearProgress
            variant="determinate"
            value={integration.uptime}
            color={getStatusColor(integration.status)}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary">
            Uptime: {integration.uptime}%
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Registros
            </Typography>
            <Typography variant="h6">
              {integration.records.toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Última sincronización
            </Typography>
            <Typography variant="body2">
              {integration.lastSync 
                ? integration.lastSync.toLocaleTimeString()
                : 'Nunca'
              }
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Sync />}
            onClick={() => handleSync(integration.id)}
            disabled={syncing}
          >
            Sincronizar
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Settings />}
            onClick={() => setConfigDialog(integration)}
          >
            Configurar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const syncedData = [
    { source: 'AskSuite', type: 'Conversaciones', count: 1247, lastUpdate: '5 min' },
    { source: 'Channel Manager', type: 'Reservas', count: 89, lastUpdate: '15 min' },
    { source: 'MyHotel', type: 'Huéspedes', count: 0, lastUpdate: 'N/A' },
    { source: 'Fideltour', type: 'Tours', count: 23, lastUpdate: '2h' }
  ];

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
              🔗 Integraciones PMS - Hotel Terrazas
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'white', opacity: 0.9 }}>
              Gestión centralizada de sistemas hoteleros
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
            sx={{ bgcolor: 'white', color: 'primary.main' }}
          >
            Actualizar Todo
          </Button>
        </Box>
      </Paper>

      {/* Status Overview */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
            <Typography variant="h4" color="success.main">2</Typography>
            <Typography variant="body2">Conectados</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
            <Typography variant="h4" color="warning.main">1</Typography>
            <Typography variant="body2">Pendientes</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
            <Typography variant="h4" color="error.main">1</Typography>
            <Typography variant="body2">Con Errores</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}>
            <Typography variant="h4" color="info.main">789</Typography>
            <Typography variant="body2">Total Registros</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Integration Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {integrations.map((integration) => (
          <Grid item xs={12} sm={6} md={3} key={integration.id}>
            <IntegrationCard integration={integration} />
          </Grid>
        ))}
      </Grid>

      {/* Synced Data Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Datos Sincronizados en Tiempo Real
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sistema</TableCell>
                <TableCell>Tipo de Datos</TableCell>
                <TableCell>Registros</TableCell>
                <TableCell>Última Actualización</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {syncedData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.source}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.count.toLocaleString()} 
                      color={row.count > 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{row.lastUpdate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Configuration Dialog */}
      <Dialog 
        open={configDialog !== null} 
        onClose={() => setConfigDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Configurar {configDialog?.name}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="URL API"
            fullWidth
            variant="outlined"
            defaultValue={configDialog?.url}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="API Key"
            fullWidth
            variant="outlined"
            type="password"
            defaultValue="••••••••••••"
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch 
                checked={configDialog?.status === 'connected'}
                onChange={(e) => handleToggle(configDialog?.id, e.target.checked)}
              />
            }
            label="Habilitado"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialog(null)}>Cancelar</Button>
          <Button variant="contained" onClick={() => setConfigDialog(null)}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PMSIntegration;
