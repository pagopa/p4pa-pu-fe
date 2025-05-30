import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ErrorFallback } from './components/ErrorFallback';
import { Theme } from './utils/theme';
import { RouterProvider } from 'react-router-dom';
import './translations/i18n';
import { Overlay } from './components/Overlay';
import { useStore } from './store/GlobalStore';
import { CircularProgress } from '@mui/material';
import router from './routes';

export const App = () => {
  const { state } = useStore();
  return (
    <ErrorBoundary
      fallback={<ErrorFallback onReset={() => window.location.replace('/')} />}
    >
      <Theme>
        <Overlay visible={state.appState.loading} />
        <RouterProvider router={router} fallback={<CircularProgress />} />
      </Theme>
    </ErrorBoundary>
  );
};

export default App;
