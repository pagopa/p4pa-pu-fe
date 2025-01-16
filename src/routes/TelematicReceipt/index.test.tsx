import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, vi } from 'vitest';
import TelematicReceipt from '.';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));


describe('TelematicReceipt Page', () => {
  const queryClient = new QueryClient();

  it('renders Telematic Receipt without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TelematicReceipt />
      </QueryClientProvider>
    );
  });
});
