import { SxProps, Theme } from '@mui/material';

export const sidebarStyles = (theme: Theme, collapsed: boolean): Record<string, SxProps> => ({
  container: {
    zIndex: collapsed ? 1 : 100,
    top: 0,
    height: '100vh',
    transition: 'width 0.3s ease, height 0.3s ease', // Add transition for smooth resizing
    [theme.breakpoints.down('lg')]: { 
      height: collapsed ? 'fit-content' : '100%', 
      maxWidth: 'unset', 
      position: collapsed ? 'sticky' : 'fixed',
      width: '100%' }
  },
  nav: {
    minHeight: collapsed ? '1vh' : '50vh',
    height: '100%',
    width: '100%',
    bgcolor: 'background.paper',
    transition: 'width 0.3s ease', // Add transition for smooth width change
  },
  overlay: {
    bgcolor: 'rgba(23, 50, 77, 0.7)',
    zIndex: -1,
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%'
  },
  collapseIcon: {
    textAlign: 'right',
    pt: 1,
    pr: 2
  },
  list: {
    [theme.breakpoints.down('lg')]: {
      display: collapsed ? 'none' : 'inline-block',
    },
    [theme.breakpoints.up('lg')]: {
      py: 3
    }
  },
  hamburgerBox: {
    marginTop: 'auto',
    position: 'sticky',
    bottom: '0',
    transition: 'opacity 0.3s ease', // Add transition for smooth visibility change
    [theme.breakpoints.down('lg')]: {
      marginTop: collapsed ? 0 : 'auto',
      opacity: collapsed ? 1 : 0,
      visibility: collapsed ? 'visible' : 'hidden'
    }
  },
  hamburgerIcon: {
    p: 2
  },
  hamburgerTypography: {
    fontWeight: 600,
    pl: 1
  }
});
