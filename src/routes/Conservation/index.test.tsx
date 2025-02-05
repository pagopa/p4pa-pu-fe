import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router';
import Conservation from './Index';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));


describe('Conservation Page', () => {
  const queryClient = new QueryClient();

  it('renders Conservation without crashing', () => {
    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <Conservation />
        </QueryClientProvider>
      </BrowserRouter>
    );
  });
});
