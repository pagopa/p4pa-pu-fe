import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, vi } from 'vitest';
import TelematicReceiptDetail from '.';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));


describe('TelematicReceiptDetail Page', () => {
  const queryClient = new QueryClient();

  it('renders Telematic Receipt Detail without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TelematicReceiptDetail />
      </QueryClientProvider>
    );
  });
});
