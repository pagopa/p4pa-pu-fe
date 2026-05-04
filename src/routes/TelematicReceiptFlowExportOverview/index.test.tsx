import { describe, it, vi } from 'vitest';
import TelematicReceiptImportFlowOverview from '.';
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

vi.mock('../../api/exportFiles', () => ({
  getExportFiles: vi.fn(() => ({
    mutationFn: vi.fn(),
    query: {
      data: { content: [], totalElements: 0, totalPages: 1 },
      isError: false
    }
  })),
  getExportFile: vi.fn(() => ({
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

describe('TelematicReceiptImportFlowOverview Page', () => {
  it('renders Telematic Receipt Import Flow Overview results view without crashing', () => {
    render(<TelematicReceiptImportFlowOverview />);
  });
});
