import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { it } from 'date-fns/locale/it';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { Theme } from '../utils/theme';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();
  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
          <Theme>{children}</Theme>
        </LocalizationProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

const customRender = (ui: React.ReactNode, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
