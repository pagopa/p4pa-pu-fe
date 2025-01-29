import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, vi } from 'vitest';
import ReportingFlowImportThankYouPage from '../../components/ReportingFlowImport/ReportingFlowImportThankYouPage';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));


describe('Reporting Page', () => {
  const queryClient = new QueryClient();

  it('renders Reporting without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ReportingFlowImportThankYouPage />
      </QueryClientProvider>
    );
  });
});
