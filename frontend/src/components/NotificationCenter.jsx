import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Badge, IconButton, Drawer, List, ListItem,
  ListItemText, ListItemIcon, Chip, Avatar, Button, Divider,
  Alert, Snackbar, CircularProgress, Card, CardContent
} from '@mui/material';
import {
  Notifications, Close, Circle, CheckCircle, Warning, Error,
  Info, Wifi, WifiOff, Refresh, VolumeUp, VolumeOff
} from '@mui/icons-material';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastActivity, setLastActivity] = useState(null);

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: notification.id || `notif-${Date.now()}`,
      read: false,
      timestamp: notification.timestamp || new Date().toISOString()
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    setLastActivity(new Date());
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'warning': return <Warning sx={{ color: 'warning.main' }} />;
      case 'error': return <Error sx={{ color: 'error.main' }} />;
      default: return <Info sx={{ color: 'info.main' }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'success.light';
      case 'warning': return 'warning.light';
      case 'error': return 'error.light';
      default: return 'info.light';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const generateDemoNotification = () => {
    const demoNotifications = [
      {
        type: 'info',
        title: 'Nueva Reserva',
        message: 'Habitación 205 reservada para mañana',
        source: 'Front Office',
        department: 'Recepción'
      },
      {
        type: 'warning',
        title: 'Mantenimiento Requerido',
        message: 'Aire acondicionado habitación 302 necesita revisión',
        source: 'Housekeeping',
        department: 'Mantenimiento'
      },
      {
        type: 'success',
        title: 'Check-out Completado',
        message: 'Huésped habitación 150 realizó check-out exitoso',
        source: 'Front Office',
        department: 'Recepción'
      },
      {
        type: 'error',
        title: 'Sistema POS Desconectado',
        message: 'Terminal restaurante principal sin conexión',
        source: 'IT',
        department: 'Tecnología'
      }
    ];

    const randomNotif = demoNotifications[Math.floor(Math.random() * demoNotifications.length)];
    addNotification({
      ...randomNotif,
      id: `demo-${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  };

  // Simulate WebSocket connection for demo
  useEffect(() => {
    setWsConnected(true);
    addNotification({
      id: 'welcome',
      type: 'success',
      title: 'Sistema Iniciado',
      message: 'Notificaciones en tiempo real activadas',
      source: 'Sistema'
    });
  }, []);

  return (
    <>
      <IconButton
        onClick={() => setDrawerOpen(true)}
        sx={{ 
          position: 'relative',
          color: 'white',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
        }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <Notifications />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 400, maxWidth: '90vw' } }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              🔔 Notificaciones
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                onClick={() => setSoundEnabled(!soundEnabled)}
                size="small"
                color={soundEnabled ? 'primary' : 'default'}
              >
                {soundEnabled ? <VolumeUp /> : <VolumeOff />}
              </IconButton>
              <IconButton onClick={() => setDrawerOpen(false)} size="small">
                <Close />
              </IconButton>
            </Box>
          </Box>

          <Card sx={{ mb: 2, bgcolor: wsConnected ? 'success.light' : 'error.light' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {wsConnected ? <Wifi /> : <WifiOff />}
                <Typography variant="body2">
                  {wsConnected ? '✅ Conectado en tiempo real' : '❌ Desconectado'}
                </Typography>
              </Box>
              {lastActivity && (
                <Typography variant="caption" color="text.secondary">
                  Última actividad: {lastActivity.toLocaleTimeString()}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={generateDemoNotification}
            >
              🧪 Demo Notificación
            </Button>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              ✅ Marcar Leídas
            </Button>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={clearAll}
              disabled={notifications.length === 0}
            >
              🗑️ Limpiar
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No hay notificaciones
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    bgcolor: notification.read ? 'transparent' : getNotificationColor(notification.type),
                    borderRadius: 1,
                    mb: 1,
                    border: notification.read ? '1px solid rgba(0,0,0,0.1)' : 'none',
                    opacity: notification.read ? 0.7 : 1,
                    cursor: 'pointer'
                  }}
                  onClick={() => markAsRead(notification.id)}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Circle sx={{ fontSize: 8, color: 'primary.main' }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip 
                            label={notification.source} 
                            size="small" 
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </Typography>
                        </Box>
                        {notification.department && (
                          <Chip 
                            label={notification.department}
                            size="small"
                            color="primary"
                            sx={{ mt: 0.5, height: 18, fontSize: '0.65rem' }}
                          />
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default NotificationCenter;
