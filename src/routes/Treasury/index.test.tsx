import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, vi } from 'vitest';
import Treasury from '.';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('Treasury Page', () => {
  const queryClient = new QueryClient();

  it('renders Treasury Page without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Treasury />
      </QueryClientProvider>
    );
  });
});
