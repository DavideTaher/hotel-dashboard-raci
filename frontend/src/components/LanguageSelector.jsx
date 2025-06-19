import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Language as LanguageIcon
} from '@mui/icons-material';

const LanguageSelector = ({ variant = 'select' }) => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const languages = [
    {
      code: 'es',
      name: 'Español',
      flag: '🇨🇷',
      country: 'Costa Rica'
    },
    {
      code: 'en',
      name: 'English',
      flag: '🇺🇸',
      country: 'United States'
    },
    {
      code: 'it',
      name: 'Italiano',
      flag: '🇮🇹',
      country: 'Italia'
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (variant === 'menu') {
    return (
      <Box>
        <IconButton
          onClick={handleClick}
          sx={{ 
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '1.2em' }}>
              {currentLanguage.flag}
            </Typography>
            <LanguageIcon />
          </Box>
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{ sx: { minWidth: 200, mt: 1 } }}
        >
          {languages.map((language) => (
            <MenuItem
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              selected={i18n.language === language.code}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Typography sx={{ fontSize: '1.5em' }}>
                  {language.flag}
                </Typography>
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {language.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {language.country}
                </Typography>
              </ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </Box>
    );
  }

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        sx={{
          color: 'white',
          '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
          '.MuiSelect-icon': { color: 'white' }
        }}
        renderValue={(selected) => {
          const selectedLang = languages.find(lang => lang.code === selected);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '1.1em' }}>{selectedLang?.flag}</Typography>
              <Typography variant="body2">{selectedLang?.name}</Typography>
            </Box>
          );
        }}
      >
        {languages.map((language) => (
          <MenuItem key={language.code} value={language.code}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '1.2em' }}>{language.flag}</Typography>
              <Typography variant="body2">{language.name}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;
