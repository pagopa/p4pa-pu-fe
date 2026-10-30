import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RenderHookOptions, RenderOptions } from '@testing-library/react';
import { render, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { it } from 'date-fns/locale/it';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { StoreProvider } from '../store/GlobalStore';
import createTheme from '@mui/material/styles/createTheme';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import style from '@core/utils/style';

const theme = createTheme({
  ...style.theme,
  components: {
    MuiModal: {
      defaultProps: {
        disableAutoFocus: true,
        disableEnforceFocus: true
      }
    },
    MuiDialog: {
      defaultProps: {
        transitionDuration: 0
      }
    }
  }
});

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();
  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
          </LocalizationProvider>
        </StoreProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

const customRender = (ui: React.ReactNode, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Custom renderHook function
const customRenderHook = <TProps, TResult>(
  callback: (props: TProps) => TResult,
  options?: RenderHookOptions<TProps>
) => renderHook(callback, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
export { customRenderHook as renderHook };
