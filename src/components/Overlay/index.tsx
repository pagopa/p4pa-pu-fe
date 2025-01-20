import { CircularProgress, Grid, Portal } from '@mui/material';
import React from 'react';

export const Overlay = ({ visible }: { visible: boolean }): React.ReactElement => {
  document.body.style.overflow = visible ? 'hidden' : 'auto';
  return visible ? (
    <Portal>
      <Grid sx={style.overlay} />
      <Grid sx={style.background} alignItems="center" justifyContent="center" container>
        <CircularProgress
          sx={{ position: 'absolute', top: '40%' }}
          color="primary"
          role="loadingSpinner"
          size="50px"
        />
      </Grid>
    </Portal>
  ) : (
    <React.Fragment />
  );
};

const style = {
  background: {
    backgroundColor: 'background.default'
  },
  overlay: {
    position: 'fixed',
    display: 'flex',
    WebkitBoxAlign: 'center',
    alignItems: 'center',
    WebkitBoxPack: 'center',
    justifyContent: 'center',
    inset: '0px',
    WebkitTapHighlightColor: 'transparent',
    backgroundColor: 'rgba(23, 50, 77, 0.7)',
    margin: 0,
    height: '100%',
    overflow: 'hidden',
    zIndex: 10
  }
};
