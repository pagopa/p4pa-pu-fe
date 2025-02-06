import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, vi } from 'vitest';
import TreasuryImportFlowOverview from '.';
import { BrowserRouter } from 'react-router';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('Treasury Import Flow Overview Page', () => {
  const queryClient = new QueryClient();

  it('renders Treasury Import Flow Overview Page without crashing', () => {
    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <TreasuryImportFlowOverview />
        </QueryClientProvider>
      </BrowserRouter>
    );
  });
});
