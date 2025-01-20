import { CircularProgress, Grid, Portal } from '@mui/material';
import React, { useEffect } from 'react';

export const Overlay = ({ visible }: { visible: boolean }): React.ReactElement => {

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [visible]);

  return visible ? (
    <Portal>
      <Grid sx={style.overlay} data-testid="overlay-background" />
      <Grid sx={style.background} alignItems="center" justifyContent="center" container>
        <CircularProgress
          sx={{ position: 'absolute', top: '40%' }}
          color="primary"
          role="status"
          aria-live="assertive"
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
