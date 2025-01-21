import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it } from 'vitest';
import TelematicReceiptImportFlowOverview from '.';

describe('TelematicReceiptImportFlowOverview Page', () => {
  const queryClient = new QueryClient();

  it('renders Telematic Receipt Import Flow Overview results view without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TelematicReceiptImportFlowOverview />
      </QueryClientProvider>
    );
  });
});
