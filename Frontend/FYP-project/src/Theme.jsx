// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  // --- PALETTE ---
  palette: {
    mode: 'light',
    primary: {
      main: '#f1f2f6ff', // A deep, calming blue
      light: '#757de8',
      dark: '#002984',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1f170aff', // A vibrant orange for accents/buttons
      light: '#ffc947',
      dark: '#c66900',
      contrastText: '#000000',
    },
    background: {
      default: '#f4f6f8', // Light gray background for contrast
      paper: '#ffffff',
    },
    text: {
      primary: '#333333', // Dark text for readability
      secondary: '#666666',
    },
  },

  // --- TYPOGRAPHY ---
  typography: {
    fontFamily: [
      'Inter', // Modern, clean sans-serif font
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    button: {
      textTransform: 'none', // A modern best practice: no ALL CAPS buttons
      fontWeight: 600,
    },
  },

  // --- COMPONENT STYLES (Global Overrides) ---
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12, // More pronounced rounding for buttons
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, // Smoother, larger card rounding
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)', // Subtle default shadow
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined', // Make all text fields outlined by default
      },
      styleOverrides: {
        root: {
          // Increase focus visibility
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3f51b5', // Focus border color
            borderWidth: '2px',
          },
        },
      },
    },
  },
});

export default theme;