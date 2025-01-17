import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, vi } from 'vitest';
import TelematicReceiptExportFlowReservation from '.';
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

  

describe('TelematicReceiptExportFlowReservation Page', () => {
  const queryClient = new QueryClient();

  it('renders Telematic Receipt Flow Reservation without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TelematicReceiptExportFlowReservation />
      </QueryClientProvider>
    );
  });
});
