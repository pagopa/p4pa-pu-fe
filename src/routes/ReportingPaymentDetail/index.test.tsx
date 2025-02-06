import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, vi } from 'vitest';
import ReportingPaymentDetail from '.';
import { BrowserRouter } from 'react-router';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));


describe('Reporting Payment Detail Page', () => {
  const queryClient = new QueryClient();

  it('renders Reporting Payment Detail without crashing', () => {
    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ReportingPaymentDetail />
        </QueryClientProvider>
      </BrowserRouter>
    );
  });
});
