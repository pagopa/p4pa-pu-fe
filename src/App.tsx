import { RouterProvider } from 'react-router';
import { Overlay } from './components/Overlay';
import { useStore } from './store/GlobalStore';
import router from './routes';
import './translations/i18n';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import ErrorPage from './routes/UtilityPages/error';
import { HiddenDiv } from './components/HiddenDiv';

export const App = () => {
  const { state } = useStore();

  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Overlay visible={state.appState.loading} />
      <HiddenDiv message={state.appState.announcement} />
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};

export default App;
