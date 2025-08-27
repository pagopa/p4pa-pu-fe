import { describe, it, vi } from 'vitest';
import TreasuryImportFlowOverview from '.';
import { render } from '../../__tests__/renderers';
import { STATE } from '../../store/types';

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
  };
});

vi.mock('../../store/GlobalStore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useStore: vi.fn(() => ({
      state: { [STATE.ORGANIZATION_ID]: 123 }
    }))
  };
});

vi.mock('../../api/ingestionFlowFiles', () => ({
  getIngestionFlowFiles: vi.fn(() => ({
    mutationFn: vi.fn(),
    query: {
      data: { content: [], totalElements: 0, totalPages: 1 },
      isError: false
    }
  })),
  getIngestionFlowFile: vi.fn(() => ({
    mutateAsync: vi.fn()
  })),
  getIngestionFlowFileError: vi.fn(() => ({
    mutateAsync: vi.fn()
  })),
  uploadIngestionFlowFile: vi.fn(() => ({
    mutateAsync: vi.fn()
  }))
}));

vi.mock('../../hooks/useSearch', () => ({
  useSearch: vi.fn(() => ({
    query: {
      data: { content: [], totalElements: 0, totalPages: 1 },
      isError: false
    },
    applyFilters: vi.fn()
  }))
}));

describe('Treasury Import Flow Overview Page', () => {
  it('renders Treasury Import Flow Overview Page without crashing', () => {
    render(<TreasuryImportFlowOverview />);
  });
});
