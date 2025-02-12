import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import '@preact/signals-react/auto';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StoreProvider } from './store/GlobalStore.tsx';
import { it } from 'date-fns/locale/it';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container!);

const queryClient = new QueryClient();

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
          <App />
        </LocalizationProvider>
      </StoreProvider>
    </QueryClientProvider>
  </StrictMode>
);
