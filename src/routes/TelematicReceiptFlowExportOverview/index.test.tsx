import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, vi } from 'vitest';
import TelematicReceiptFlowExportOverview from '.';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('TelematicReceiptFlowExportOverview Page', () => {
  const queryClient = new QueryClient();

  it('renders Telematic Receipt Flow Export view without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TelematicReceiptFlowExportOverview />
      </QueryClientProvider>
    );
  });
});
