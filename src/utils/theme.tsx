import { ThemeProvider } from '@mui/material';
import { PropsWithChildren } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import style from './style';

export const Theme = (props: PropsWithChildren) => (
  <>
    <CssBaseline />
    <ThemeProvider theme={style.theme}>{props.children}</ThemeProvider>
  </>
);