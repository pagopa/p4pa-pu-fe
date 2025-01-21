import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, vi } from 'vitest';
import TelematicReceiptFlowImportThankYouPage from '.';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('TelematicReceiptFlowImportThankYouPage Page', () => {
  const queryClient = new QueryClient();

  it('renders Telematic Receipt Import Thenk You Page without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TelematicReceiptFlowImportThankYouPage />
      </QueryClientProvider>
    );
  });
});
