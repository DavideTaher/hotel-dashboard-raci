import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, 
  Typography, Button, Box, Container 
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, AccountTree, Analytics as AnalyticsIcon, 
  IntegrationInstructions 
} from '@mui/icons-material';

import Dashboard from './components/Dashboard';
import RACIMatrix from './components/RACIMatrix';
import Analytics from './components/Analytics';
import PMSIntegration from './components/PMSIntegration';
import NotificationCenter from './components/NotificationCenter';
import LanguageSelector from './components/LanguageSelector';

const theme = createTheme({
  palette: {
    primary: { main: '#667eea' },
    secondary: { main: '#764ba2' },
  },
});

function App() {
  const { t } = useTranslation();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="sticky">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {t('app.title')}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
              <Button 
                color="inherit" 
                component={Link} 
                to="/"
                startIcon={<DashboardIcon />}
              >
                {t('navigation.dashboard')}
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/raci"
                startIcon={<AccountTree />}
              >
                {t('navigation.raci')}
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/analytics"
                startIcon={<AnalyticsIcon />}
              >
                {t('navigation.analytics')}
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/pms"
                startIcon={<IntegrationInstructions />}
              >
                {t('navigation.pms')}
              </Button>
            </Box>

            <LanguageSelector variant="menu" />
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/raci" element={<RACIMatrix />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/pms" element={<PMSIntegration />} />
            <Route path="/notifications" element={<NotificationCenter />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
