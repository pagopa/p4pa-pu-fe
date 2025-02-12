import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, vi } from 'vitest';
import ReportingDetail from '.';
import { BrowserRouter } from 'react-router';
import React from 'react';

vi.mock('react-router-dom', (importOriginal) => {
  const actual = importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: () => ({ id: '123' }),
    Link: ({ to, children }: { to: string; children: React.ReactNode }) =>
      React.createElement('a', { href: to }, children)
  };
});



describe('Reporting Page', () => {
  const queryClient = new QueryClient();

  it('renders Reporting without crashing', () => {
    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ReportingDetail />
        </QueryClientProvider>
      </BrowserRouter>
    );
  });
});
