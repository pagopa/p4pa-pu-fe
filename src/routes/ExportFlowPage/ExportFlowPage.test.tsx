import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router';
import ExportFlowPage from './ExportFlowPage';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useParams: () => ({ category: 'treasury' }),
}));


describe('Import Flow Page', () => {
  const queryClient = new QueryClient();

  it('renders Import Flow without crashing', () => {
    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ExportFlowPage />
        </QueryClientProvider>
      </BrowserRouter>
    );
  });
});
