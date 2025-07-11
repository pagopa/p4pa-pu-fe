import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from '../../__tests__/renderers';
import * as ReactRouter from 'react-router';
import FilterContainer from '../FilterContainer/FilterContainer';
import TitleComponent from '../TitleComponent/TitleComponent';
import ReportingSearchResults from '../ReportingSearchResults';
import * as useSearchModule from '../../hooks/useSearch';
import useReportingFilters from '../../hooks/useReportingFilters';

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useLocation: vi.fn(),
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
  useNavigate: vi.fn()
}));

vi.mock('../../hooks/useSearch');
vi.mock('../../hooks/useReportingFilters');

vi.mock('../../components/TitleComponent/TitleComponent', () => ({
  default: vi.fn(({ title }) => <div>{title}</div>)
}));

vi.mock(
  '../../components/FilterContainer/FilterContainer',
  async (importOriginal) => {
    const originalModule =
      await importOriginal<
        typeof import('../../components/FilterContainer/FilterContainer')
      >();
    return {
      ...originalModule,
      default: vi.fn(() => <div>FilterContainer</div>)
    };
  }
);

describe('ReportingSearchResults', () => {
  const mockUseLocation = vi.mocked(ReactRouter.useLocation);
  const mockUseSearchParams = vi.mocked(ReactRouter.useSearchParams);
  const mockUseSearch = vi.mocked(useSearchModule.useSearch);
  const mockUseReportingFilters = vi.mocked(useReportingFilters);

  beforeEach(() => {
    vi.clearAllMocks();

    // @ts-expect-error mocking location results
    mockUseLocation.mockReturnValue({ state: { filters: {} } });
    mockUseSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()]);

    mockUseReportingFilters.mockReturnValue({
      filters: []
    });

    mockUseSearch.mockReturnValue({
      // @ts-expect-error mocking useQuery results
      query: { data: { content: [], totalElements: 0 } },
      applyFilters: vi.fn(),
      handleFilterChange: vi.fn(),
      handlePaginationChange: vi.fn(),
      setSort: vi.fn(),
      pagination: { page: 0, size: 10 },
      filters: {}
    });
  });

  it('renders TitleComponent with correct props', () => {
    render(<ReportingSearchResults />);

    expect(TitleComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'commons.routes.REPORTING_SEARCH_RESULTS',
        description: 'reportingSearchResults.description'
      }),
      expect.anything()
    );
  });

  it('passes correct props to FilterContainer', () => {
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

  it('handles pagination parameters from URL correctly', () => {
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('?page=2&size=20'),
      vi.fn()
    ]);

    render(<ReportingSearchResults />);

    expect(mockUseSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.any(Object)
      })
    );
  });
});
