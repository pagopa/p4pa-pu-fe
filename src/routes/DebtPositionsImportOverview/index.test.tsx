import { describe, it, vi } from 'vitest';
import DebtPositionsImportOverview from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
  };
});

vi.mock('../../store/GlobalStore', () => ({
  useStore: vi.fn(() => ({
    state: {
      organizationId: 12345
    }
  })),
  StoreProvider: ({ children }: { children: React.ReactNode }) => children
}));

vi.mock('../../api/ingestionFlowFiles', () => ({
  getIngestionFlowFiles: vi.fn(() => ({
    data: {
      content: [],
      totalElements: 0,
      totalPages: 1
    },
    isPending: false,
    mutate: vi.fn(),
    mutateAsync: vi.fn()
  })),
  getIngestionFlowFile: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn()
  })),
  getIngestionFlowFileError: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn()
  }))
}));

vi.mock('../../hooks/useSearch', () => ({
  useSearch: vi.fn(() => ({
    applyFilters: vi.fn()
  }))
}));

describe('Debt Positions Import Overview Page', () => {
  it('renders Debt Positions Import Overview Page without crashing', () => {
    render(<DebtPositionsImportOverview />);
  });
});
