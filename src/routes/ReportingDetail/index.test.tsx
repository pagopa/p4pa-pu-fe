import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, vi } from 'vitest';
import ReportingDetail from '.';
import { BrowserRouter } from 'react-router';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useParams: () => ({ id: '123' }),
  Link: ({ to, children }: { to: string; children: React.ReactNode }) =>
    <a href={to}>{children}</a>,
}));


describe('Reporting Detail Page', () => {
  const queryClient = new QueryClient();

  it('renders Reporting Detail without crashing', () => {
    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ReportingDetail />
        </QueryClientProvider>
      </BrowserRouter>
    );
  });
});
