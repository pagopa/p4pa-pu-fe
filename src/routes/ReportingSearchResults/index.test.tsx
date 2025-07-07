import { describe, it, vi } from 'vitest';
import ReportingSearchResults from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(() => ({ state: { filters: {} } })),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
  };
});

vi.mock('../../store/GlobalStore', () => ({
  useStore: vi.fn(() => ({
    state: { organizationId: 123 }
  })),
  StoreProvider: ({ children }: { children: React.ReactNode }) => children
}));

vi.mock('../../api/getPaymentsReporting', () => ({
  getPaymentsReporting: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    data: null,
    isLoading: false,
    error: null
  }))
}));

describe('Reporting Page', () => {
  it('renders Reporting without crashing', () => {
    render(<ReportingSearchResults />);
  });
});
