import { describe, expect, it, Mock, vi } from 'vitest';
import { render } from '../../__tests__/renderers';
import { useLocation, useSearchParams } from 'react-router';
import ReportingSearchResults from './ReportingSearchResults';
import FilterContainer from '../FilterContainer/FilterContainer';
import useReportingSearch from '../../hooks/useReportingSearch';
import TitleComponent from '../TitleComponent/TitleComponent';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('react-router', async (importOriginal) => ({
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

vi.mock(
  '../../components/FilterContainer/FilterContainer',
  async (importOriginal) => ({
    ...(await importOriginal()),
    default: vi.fn(() => <div>FilterContainer</div>)
  })
);

describe('ReportingSearchResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useLocation as Mock).mockReturnValue({ state: { filters: {} } });
    (useSearchParams as Mock).mockReturnValue([new URLSearchParams(), vi.fn()]);
  });

  it('should render correctly', () => {
    render(<ReportingSearchResults />);

    expect(TitleComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'commons.routes.REPORTING_SEARCH_RESULTS',
        description: 'reportingSearchResults.description'
      }),
      expect.anything()
    );
  });

  it('should pass the correct props to FilterContainer', () => {
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

  it('should handle pagination parameters from URL correctly', () => {
    (useSearchParams as Mock).mockReturnValue([
      new URLSearchParams('?page=2&size=20'),
      vi.fn()
    ]);

    render(<ReportingSearchResults />);

    expect(vi.mocked(useReportingSearch)).toHaveBeenCalledWith(
      expect.objectContaining({
        initialFilters: expect.any(Object)
      })
    );
  });
});
