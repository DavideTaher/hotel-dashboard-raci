import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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

const theme = createTheme({
  palette: {
    primary: { main: '#667eea' },
    secondary: { main: '#764ba2' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="sticky">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              🏨 Hotel Terrazas Dashboard
            </Typography>
            <Button color="inherit" component={Link} to="/" startIcon={<DashboardIcon />}>
              Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/raci" startIcon={<AccountTree />}>
              Matriz RACI
            </Button>
            <Button color="inherit" component={Link} to="/analytics" startIcon={<AnalyticsIcon />}>
              Analytics
            </Button>
            <Button color="inherit" component={Link} to="/pms" startIcon={<IntegrationInstructions />}>
              PMS
            </Button>
            <NotificationCenter />
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/raci" element={<RACIMatrix />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/pms" element={<PMSIntegration />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
