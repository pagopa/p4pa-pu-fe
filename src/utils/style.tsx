
import { createTheme } from '@mui/material';
import { theme } from '@pagopa/mui-italia';

const customTheme = createTheme({
  ...theme,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536
    }
  },
  components: {
    ...theme?.components,
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottom: `solid 2px ${theme.palette.grey[300]}`
        })
      }
    },
    MuiChip: {
      ...theme?.components?.MuiChip,
      styleOverrides: {
        root: ({ ownerState, theme }) => ({
          ...(ownerState.color === 'success' && {
            backgroundColor: theme.palette.success.extraLight
          })
        })
      }
    },
    MuiButton: {
      ...theme?.components?.MuiButton,
      styleOverrides: {
        sizeLarge: ({ theme }) => ({
          minHeight: theme.spacing(6)
        })
      }
    }
  }
});

const style = {
  theme: customTheme
};

export default style;
