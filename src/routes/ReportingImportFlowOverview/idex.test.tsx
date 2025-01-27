import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, vi } from 'vitest';
import ReportingImportFlowOverview from '.';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));


describe('Reporting Import Overview Page Page', () => {
  const queryClient = new QueryClient();

  it('renders Reporting Import Overview Page without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ReportingImportFlowOverview />
      </QueryClientProvider>
    );
  });
});
