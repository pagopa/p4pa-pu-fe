import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, vi } from 'vitest';
import ReportingFlowImport from '../../components/ReportingFlowImport/ReportingFlowImport';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));


describe('Reporting Page', () => {
  const queryClient = new QueryClient();

  it('renders Reporting without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ReportingFlowImport />
      </QueryClientProvider>
    );
  });
});
