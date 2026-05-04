import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@preact/signals-react/auto';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StoreProvider } from './store/GlobalStore';
import { it } from 'date-fns/locale/it';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ErrorFallback } from './components/ErrorFallback';
import { Theme } from './utils/theme';

const container = document.getElementById('root') as HTMLElement;

if (container) {
  const root = createRoot(container);

  const queryClient = new QueryClient();

  root.render(
    <StrictMode>
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Theme>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
            <StoreProvider>
              <QueryClientProvider client={queryClient}>
                <App />
              </QueryClientProvider>
            </StoreProvider>
          </LocalizationProvider>
        </Theme>
      </ErrorBoundary>
    </StrictMode>
  );
}
