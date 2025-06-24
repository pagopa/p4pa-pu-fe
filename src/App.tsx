import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ErrorFallback } from './components/ErrorFallback';
import { Theme } from './utils/theme';
import { RouterProvider } from 'react-router';
import { Overlay } from './components/Overlay';
import { useStore } from './store/GlobalStore';
import router from './routes';
import './translations/i18n';

export const App = () => {
  const { state } = useStore();
  return (
    <ErrorBoundary
      fallback={<ErrorFallback onReset={() => window.location.replace('/')} />}
    >
      <Theme>
        <Overlay visible={state.appState.loading} />
        <RouterProvider router={router} />
      </Theme>
    </ErrorBoundary>
  );
};

export default App;
