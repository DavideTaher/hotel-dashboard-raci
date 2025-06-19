import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Box, Paper, Typography, Chip, Grid, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel,
  Alert, Snackbar
} from '@mui/material';
import { 
  Edit, Save, Download, DragIndicator
} from '@mui/icons-material';

const RACIMatrix = () => {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState([
    'Front Office', 'Housekeeping', 'F&B', 'Mantenimiento',
    'RRHH', 'Finanzas', 'Seguridad', 'IT',
    'Ventas', 'Revenue Mgmt', 'Marketing', 'Calidad'
  ]);

  const [processes, setProcesses] = useState([
    'Check-in/out Process', 'Room Cleaning', 'Guest Complaints',
    'Emergency Response', 'Staff Scheduling', 'Budget Planning',
    'Marketing Campaigns', 'Quality Audits', 'Maintenance Requests',
    'Security Incidents', 'Food Service', 'Revenue Management'
  ]);

  const [matrix, setMatrix] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [dragMode, setDragMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    initializeMatrix();
    loadFromLocalStorage();
  }, []);

  const initializeMatrix = () => {
    const initialMatrix = {};
    departments.forEach(dept => {
      initialMatrix[dept] = {};
      processes.forEach(process => {
        initialMatrix[dept][process] = '';
      });
    });

    const defaultAssignments = {
      'Front Office': {
        'Check-in/out Process': 'R',
        'Guest Complaints': 'R',
        'Emergency Response': 'C'
      },
      'Housekeeping': {
        'Room Cleaning': 'R',
        'Quality Audits': 'C',
        'Maintenance Requests': 'I'
      },
      'F&B': {
        'Food Service': 'R',
        'Quality Audits': 'C',
        'Guest Complaints': 'C'
      },
      'Mantenimiento': {
        'Maintenance Requests': 'R',
        'Emergency Response': 'R',
        'Quality Audits': 'I'
      },
      'Seguridad': {
        'Emergency Response': 'A',
        'Security Incidents': 'R',
        'Quality Audits': 'I'
      },
      'RRHH': {
        'Staff Scheduling': 'R',
        'Quality Audits': 'I',
        'Emergency Response': 'I'
      },
      'Finanzas': {
        'Budget Planning': 'R',
        'Revenue Management': 'C',
        'Quality Audits': 'I'
      },
      'IT': {
        'Quality Audits': 'I',
        'Emergency Response': 'C'
      },
      'Ventas': {
        'Marketing Campaigns': 'C',
        'Revenue Management': 'R'
      },
      'Revenue Mgmt': {
        'Revenue Management': 'A',
        'Budget Planning': 'C'
      },
      'Marketing': {
        'Marketing Campaigns': 'R',
        'Guest Complaints': 'I'
      },
      'Calidad': {
        'Quality Audits': 'A',
        'Guest Complaints': 'C',
        'Food Service': 'C'
      }
    };

    Object.keys(defaultAssignments).forEach(dept => {
      if (initialMatrix[dept]) {
        Object.keys(defaultAssignments[dept]).forEach(process => {
          if (initialMatrix[dept][process] !== undefined) {
            initialMatrix[dept][process] = defaultAssignments[dept][process];
          }
        });
      }
    });

    setMatrix(initialMatrix);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, type } = result;

    if (type === 'departments') {
      const newDepartments = Array.from(departments);
      const [reorderedItem] = newDepartments.splice(source.index, 1);
      newDepartments.splice(destination.index, 0, reorderedItem);
      setDepartments(newDepartments);
      showSnackbar('Departamento reordenado exitosamente', 'success');
    } else if (type === 'processes') {
      const newProcesses = Array.from(processes);
      const [reorderedItem] = newProcesses.splice(source.index, 1);
      newProcesses.splice(destination.index, 0, reorderedItem);
      setProcesses(newProcesses);
      showSnackbar('Proceso reordenado exitosamente', 'success');
    }
  };

  const handleCellClick = (dept, process) => {
    if (editMode) {
      setSelectedCell({ dept, process });
    }
  };

  const updateCell = (value) => {
    if (selectedCell) {
      setMatrix(prev => ({
        ...prev,
        [selectedCell.dept]: {
          ...prev[selectedCell.dept],
          [selectedCell.process]: value
        }
      }));
      setSelectedCell(null);
      showSnackbar('Celda actualizada', 'success');
      autoSave();
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const autoSave = () => {
    const data = {
      matrix,
      departments,
      processes,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem('raciMatrix', JSON.stringify(data));
    setLastSaved(new Date());
  };

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('raciMatrix');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.matrix) setMatrix(data.matrix);
        if (data.departments) setDepartments(data.departments);
        if (data.processes) setProcesses(data.processes);
        if (data.lastSaved) setLastSaved(new Date(data.lastSaved));
        showSnackbar('Datos cargados desde caché local', 'info');
      } catch (e) {
        console.error('Error loading from localStorage:', e);
      }
    }
  };

  const RACICell = ({ dept, process, value }) => {
    const getChipColor = (type) => {
      const colors = {
        'R': '#4CAF50',
        'A': '#2196F3',
        'C': '#FF9800',
        'I': '#9E9E9E'
      };
      return colors[type] || '#F5F5F5';
    };

    const getTextColor = (type) => {
      return ['R', 'A', 'C', 'I'].includes(type) ? 'white' : 'black';
    };

    return (
      <TableCell 
        sx={{ 
          p: 0.5, 
          cursor: editMode ? 'pointer' : 'default',
          '&:hover': editMode ? { bgcolor: 'action.hover' } : {},
          transition: 'all 0.2s ease'
        }}
        onClick={() => handleCellClick(dept, process)}
      >
        <Box
          sx={{
            bgcolor: getChipColor(value),
            borderRadius: 1,
            p: 1,
            textAlign: 'center',
            minHeight: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            '&:hover': editMode ? { transform: 'scale(1.05)' } : {}
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: getTextColor(value),
              fontWeight: 'bold'
            }}
          >
            {value || '-'}
          </Typography>
        </Box>
      </TableCell>
    );
  };

  const exportToCSV = () => {
    let csv = 'Departamento,';
    csv += processes.join(',') + '\n';

    departments.forEach(dept => {
      csv += dept + ',';
      csv += processes.map(process => matrix[dept]?.[process] || '').join(',');
      csv += '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matriz_raci_hotel_terrazas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showSnackbar('CSV exportado exitosamente', 'success');
  };

  const getMatrixStats = () => {
    let totalCells = 0;
    let filledCells = 0;
    let responsibleCount = 0;
    let accountableCount = 0;

    departments.forEach(dept => {
      processes.forEach(process => {
        totalCells++;
        const value = matrix[dept]?.[process];
        if (value) {
          filledCells++;
          if (value === 'R') responsibleCount++;
          if (value === 'A') accountableCount++;
        }
      });
    });

    return {
      completion: Math.round((filledCells / totalCells) * 100),
      totalCells,
      filledCells,
      responsibleCount,
      accountableCount
    };
  };

  const stats = getMatrixStats();

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
            {t("raci.title")}
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  startIcon={<Edit />}
                  onClick={() => setEditMode(!editMode)}
                  sx={{ bgcolor: 'white', color: 'primary.main' }}
                >
                  {editMode ? 'Salir Edición' : 'Editar Matriz'}
                </Button>
                
                <Button 
                  variant="contained" 
                  startIcon={<Download />}
                  onClick={exportToCSV}
                  sx={{ bgcolor: 'white', color: 'primary.main' }}
                >
                  Exportar CSV
                </Button>

                <Button 
                  variant="contained" 
                  startIcon={<Save />}
                  onClick={autoSave}
                  sx={{ bgcolor: 'white', color: 'primary.main' }}
                >
                  Guardar
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={dragMode} 
                      onChange={(e) => setDragMode(e.target.checked)}
                      sx={{ 
                        '& .MuiSwitch-switchBase.Mui-checked': { color: 'white' },
                        '& .MuiSwitch-track': { bgcolor: 'rgba(255,255,255,0.3)' }
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: 'white', fontSize: '0.9rem' }}>
                      🔄 Modo Reorganizar
                    </Typography>
                  }
                />
                
                {lastSaved && (
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
                    💾 Guardado: {lastSaved.toLocaleTimeString()}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">{stats.completion}%</Typography>
                <Typography variant="caption">Completado</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="h6" color="success.main">{stats.responsibleCount}</Typography>
                <Typography variant="caption">Responsables (R)</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="h6" color="info.main">{stats.accountableCount}</Typography>
                <Typography variant="caption">Aprobadores (A)</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="h6" color="text.primary">{stats.filledCells}/{stats.totalCells}</Typography>
                <Typography variant="caption">Celdas</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper} sx={{ mt: 2, maxHeight: '70vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
                  {dragMode ? '🔄 Departamento / Proceso' : 'Departamento / Proceso'}
                </TableCell>
                {processes.map(process => (
                  <TableCell 
                    key={process} 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white', 
                      fontWeight: 'bold',
                      minWidth: 120,
                      fontSize: '0.75rem'
                    }}
                  >
                    {process}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map(dept => (
                <TableRow key={dept}>
                  <TableCell 
                    sx={{ 
                      bgcolor: 'grey.100', 
                      fontWeight: 'bold',
                      position: 'sticky',
                      left: 0,
                      zIndex: 1
                    }}
                  >
                    {dept}
                  </TableCell>
                  {processes.map(process => (
                    <RACICell
                      key={`${dept}-${process}`}
                      dept={dept}
                      process={process}
                      value={matrix[dept]?.[process]}
                    />
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={selectedCell !== null} onClose={() => setSelectedCell(null)}>
          <DialogTitle>
            Editar: {selectedCell?.dept} - {selectedCell?.process}
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Responsabilidad RACI</InputLabel>
              <Select
                value={selectedCell ? matrix[selectedCell.dept]?.[selectedCell.process] || '' : ''}
                label="Responsabilidad RACI"
                onChange={(e) => updateCell(e.target.value)}
              >
                <MenuItem value="">Ninguna</MenuItem>
                <MenuItem value="R">R - Responsible (Responsable)</MenuItem>
                <MenuItem value="A">A - Accountable (Aprobador)</MenuItem>
                <MenuItem value="C">C - Consulted (Consultado)</MenuItem>
                <MenuItem value="I">I - Informed (Informado)</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedCell(null)}>Cancelar</Button>
            <Button onClick={() => setSelectedCell(null)} variant="contained">Guardar</Button>
          </DialogActions>
        </Dialog>

        <Paper sx={{ p: 2, mt: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Leyenda RACI:</Typography>
              <Grid container spacing={1}>
                <Grid item>
                  <Chip label="R - Responsible" sx={{ bgcolor: '#4CAF50', color: 'white' }} />
                </Grid>
                <Grid item>
                  <Chip label="A - Accountable" sx={{ bgcolor: '#2196F3', color: 'white' }} />
                </Grid>
                <Grid item>
                  <Chip label="C - Consulted" sx={{ bgcolor: '#FF9800', color: 'white' }} />
                </Grid>
                <Grid item>
                  <Chip label="I - Informed" sx={{ bgcolor: '#9E9E9E', color: 'white' }} />
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Alert severity="info" sx={{ mb: 1 }}>
                💡 <strong>Modo Reorganizar:</strong> Activa el switch para reordenar departamentos y procesos
              </Alert>
              <Alert severity="success">
                📊 <strong>Auto-guardado:</strong> Los cambios se guardan automáticamente en tu navegador
              </Alert>
            </Grid>
          </Grid>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </DragDropContext>
  );
};

export default RACIMatrix;
