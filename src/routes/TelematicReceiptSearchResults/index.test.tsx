import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, vi } from 'vitest';
import TelematicReceiptSearchResults from '.';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('TelematicReceiptSearchResults Page', () => {
  const queryClient = new QueryClient();

  it('renders Telematic Receipt Search results view without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TelematicReceiptSearchResults />
      </QueryClientProvider>
    );
  });
});
