/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from '../../../__tests__/renderers';
import * as ReactRouter from 'react-router';
import ReportingSearchResults from '../ReportingSearchResults';
import * as useSearchModule from '../../../hooks/useSearch';
import SearchResultsDataGrid from './ReportingDataGrid';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';

// Mock only what touches your logic but isn't provided globally
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useLocation: vi.fn(),
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
  useNavigate: vi.fn()
}));

vi.mock('../../../hooks/useSearch');
vi.mock('../../../api/getPaymentsReporting');
vi.mock(import('../../../utils/filtersValidation'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    noFilterSetted: vi.fn(() => false)
  };
});

vi.mock('./ReportingDataGrid', () => ({
  default: vi.fn(() => <div data-testid="data-grid" />)
}));

vi.mock('../../../components/TitleComponent/TitleComponent', () => ({
  default: vi.fn(({ title, description }) => (
    <div>
      <div data-testid="tc-title">{title}</div>
      <div data-testid="tc-description">{description}</div>
    </div>
  ))
}));

describe('ReportingSearchResults', () => {
  const mockUseLocation = vi.mocked(ReactRouter.useLocation);
  const mockUseSearchParams = vi.mocked(ReactRouter.useSearchParams);
  const mockUseSearch = vi.mocked(useSearchModule.useSearch);

  beforeEach(() => {
    vi.clearAllMocks();
    global.window.location.hash = ''; // reset for utils.URI.decode
    mockUseLocation.mockReturnValue({} as any);
    mockUseSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()]);
    mockUseSearch.mockReturnValue({
      query: {
        data: { content: [], totalElements: 0 },
        isLoading: false
      },
      applyFilters: vi.fn(),
      onSortChange: vi.fn(),
      handlePaginationChange: vi.fn(),
      filters: {}
    } as any);
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

  it('renders SearchResultsDataGrid with correct props', () => {
    render(<ReportingSearchResults />);
    expect(SearchResultsDataGrid).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { content: [], totalElements: 0 },
        onSortChange: expect.any(Function),
        onPaginationChange: expect.any(Function)
      }),
      expect.anything()
    );
  });

  it('applies filters from initial window.location.hash', async () => {
    global.window.location.hash = '#someFilter=value';
    render(<ReportingSearchResults />);
    expect(mockUseSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: { someFilter: 'value' }
      })
    );
  });
});
