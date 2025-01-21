import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, vi } from 'vitest';
import TelematicReceiptFlowImport from '.';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('TelematicReceiptFlowImport Page', () => {
  const queryClient = new QueryClient();

  it('renders Telematic Receipt Flow Import without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TelematicReceiptFlowImport />
      </QueryClientProvider>
    );
  });
});
