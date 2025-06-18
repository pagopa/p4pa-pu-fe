import { CSSProperties } from 'react';

export const GRADIENT_PLACEHOLDER =
  'linear-gradient(#788ED5, #173465, #0736A2)';
export const GRADIENT_BACKGROUND = '/assets/gradient_bg.jpg';

export const styles: Record<string, CSSProperties> = {
  dialogTitle: {
    paddingBottom: 0
  },
  infoButton: {
    padding: 0
  },
  editButton: {
    padding: 1,
    margin: -1,
    height: 'auto',
    alignSelf: 'flex-start',
    gap: 1
  },
  dialogContent: {
    display: 'flex',
    marginTop: 2,
    flexDirection: 'column',
    gap: 2
  },
  background: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  border: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 6,
    padding: 1,
    margin: 4,
    height: '100%',
    width: '100%',
    aspectRatio: '0.5',
    maxWidth: '360px',
    maxHeight: '650px'
  },
  phone: {
    backgroundColor: 'white',
    height: '100%',
    width: '100%',
    borderRadius: 4,
    padding: 2,
    overflowX: 'hidden',
    overflowY: 'scroll',
    overflowWrap: 'anywhere'
  }
};
