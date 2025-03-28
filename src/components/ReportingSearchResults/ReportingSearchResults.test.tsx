import { describe, expect, it, Mock, vi } from 'vitest';
import { render } from '../../__tests__/renderers';
import { useLocation, useSearchParams } from 'react-router-dom';
import ReportingSearchResults from './ReportingSearchResults';
import FilterContainer from '../FilterContainer/FilterContainer';
import useReportingSearch from '../../hooks/useReportingSearch';
import TitleComponent from '../TitleComponent/TitleComponent';

// Mock delle dipendenze
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useLocation: vi.fn(),
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
  useNavigate: vi.fn()
}));

vi.mock('../../hooks/useReportingSearch', () => ({
  default: vi.fn(() => ({
    query: { data: { content: [], totalElements: 0 } },
    applyFilters: vi.fn(),
    handleFilterChange: vi.fn(),
    handlePageChange: vi.fn(),
    handlePageSizeChange: vi.fn(),
    setSort: vi.fn(),
    pagination: { page: 0, size: 10 },
    filterValues: {}
  }))
}));

vi.mock('../../hooks/useReportingFilters', () => ({
  default: vi.fn(() => ({
    filters: []
  }))
}));

vi.mock('../../components/TitleComponent/TitleComponent', () => ({
  default: vi.fn(({ title }) => <div>{title}</div>)
}));

vi.mock('../../components/FilterContainer/FilterContainer', () => ({
  default: vi.fn(() => <div>FilterContainer</div>)
}));

describe('ReportingSearchResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useLocation as Mock).mockReturnValue({ state: { filters: {} } });
    (useSearchParams as Mock).mockReturnValue([new URLSearchParams(), vi.fn()]);
  });

  it('dovrebbe renderizzare correttamente', () => {
    render(<ReportingSearchResults />);

    expect(TitleComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'commons.routes.REPORTING_SEARCH_RESULTS',
        description: 'reportingSearchResults.description'
      }),
      expect.anything()
    );
  });

  it('dovrebbe passare le props corrette a FilterContainer', () => {
    render(<ReportingSearchResults />);

    expect(FilterContainer).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.any(Array),
        values: expect.any(Object),
        onChange: expect.any(Function)
      }),
      expect.anything()
    );
  });

  it("dovrebbe gestire correttamente i parametri di paginazione dall'URL", () => {
    (useSearchParams as Mock).mockReturnValue([
      new URLSearchParams('?page=2&size=20'),
      vi.fn()
    ]);

    render(<ReportingSearchResults />);

    // Verifica che useReportingSearch sia stato chiamato con i parametri corretti
    expect(vi.mocked(useReportingSearch)).toHaveBeenCalledWith(
      expect.objectContaining({
        initialPage: 1, // page-1 perché è 0-based internamente
        initialSize: 20
      })
    );
  });
});
