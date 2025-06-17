import { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
  dialogTitle: {
    paddingBottom: 0
  },
  infoButton: {
    padding: 0
  },
  editButton: {
    padding: 0,
    alignSelf: 'flex-start',
    gap: 1
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  background: {
    height: 614.5,
    width: 536,
    alignItems: 'center',
    justifyContent: 'center'
  },
  border: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 2,
    height: '90%',
    padding: 1,
    width: '65%'
  },
  phone: {
    backgroundColor: 'white',
    borderRadius: 2,
    height: '100%',
    padding: 2,
    width: '100%',
    overflowX: 'hidden',
    overflowY: 'scroll',
    overflowWrap: 'anywhere'
  }
};
