import type { PropsWithChildren } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import style from './style';
import { ThemeProvider } from '@mui/material/styles';

export const Theme = (props: PropsWithChildren) => (
  <>
    <CssBaseline />
    <ThemeProvider theme={style.theme}>{props.children}</ThemeProvider>
  </>
);
