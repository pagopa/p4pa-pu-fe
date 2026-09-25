import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { render, screen } from '../../__tests__/renderers';
import { generatePath, useNavigate, useParams } from 'react-router';

import { getPagedOrgSubUnits } from '@core/api/subunits';
import { useSearch } from '@core/hooks/useSearch';
import { appState } from '@core/store/AppStateStore';
import { PageRoutes } from '..';
import { SubUnitsList } from '.';

vi.mock('@core/api/subunits', () => ({
  getPagedOrgSubUnits: vi.fn()
}));

vi.mock('@core/hooks/useSearch', () => ({
  useSearch: vi.fn()
}));

vi.mock('@core/hooks/useSubunitsListFilters', () => ({
  useSubUnitsFilters: () => ({ filters: [] })
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn()
  };
});

vi.mock('@core/components/TitleComponent/TitleComponent', () => ({
  default: ({ title }: { title: string }) => <h1>{title}</h1>
}));

vi.mock('@core/components/FilterContainer/FilterContainer', () => ({
  COMPONENT_TYPE: {
    textField: 'textField',
    select: 'select',
    button: 'button',
    dateRange: 'dateRange',
    amount: 'amount'
  },
  default: ({
    values,
    onChange,
    onSubmit
  }: {
    values: Record<string, unknown>;
    onChange: (id: string, value: unknown) => void;
    onSubmit: () => void;
  }) => (
    <div>
      <span data-testid="filter-values">{JSON.stringify(values)}</span>
      <button
        data-testid="change-filter"
        onClick={() => onChange('subUnitCode', 'XYZ')}
      >
        change
      </button>
      <button data-testid="submit-filters" onClick={onSubmit}>
        submit
      </button>
    </div>
  )
}));

vi.mock('./components/SubUnitsDataGrid', () => ({
  SubUnitsDataGrid: ({ data }: { data: unknown }) => (
    <div data-testid="data-grid">{JSON.stringify(data ?? null)}</div>
  )
}));

const mockNavigate = vi.fn();
const mockApplyFilters = vi.fn();

describe('SubUnitsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.hash = '';
    appState.value = {
      loading: false,
      customBreadcrumbsItems: [],
      ready: false
    };

    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useParams).mockReturnValue({ organizationId: '33' });
    vi.mocked(useSearch).mockReturnValue({
      applyFilters: mockApplyFilters
    } as unknown as ReturnType<typeof useSearch>);
    vi.mocked(getPagedOrgSubUnits).mockReturnValue({
      data: undefined
    } as unknown as ReturnType<typeof getPagedOrgSubUnits>);
  });

  it('redirects to the error page when organizationId is not a number', () => {
    vi.mocked(useParams).mockReturnValue({ organizationId: 'abc' });

    render(<SubUnitsList />);

    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
  });

  it('requests sub units using the numeric organizationId from the URL', () => {
    render(<SubUnitsList />);

    expect(getPagedOrgSubUnits).toHaveBeenCalledWith(33);
  });

  it('renders the data grid with the query data', () => {
    const pagedData = { content: [{ subUnitCode: 'A' }], totalPages: 1 };
    vi.mocked(getPagedOrgSubUnits).mockReturnValue({
      data: pagedData
    } as unknown as ReturnType<typeof getPagedOrgSubUnits>);

    render(<SubUnitsList />);

    expect(screen.getByTestId('data-grid')).toHaveTextContent(
      JSON.stringify(pagedData)
    );
  });

  it('sets breadcrumbs including the organization detail path', () => {
    render(<SubUnitsList />);

    expect(appState.value.customBreadcrumbsItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'ORGANIZATIONS' }),
        expect.objectContaining({
          id: 'ORGANIZATIONS_DETAIL',
          pathname: generatePath(PageRoutes.ORGANIZATIONS_DETAIL, {
            organizationId: 33
          }),
          label: '33'
        }),
        expect.objectContaining({ id: 'SUBUNITS_LIST' })
      ])
    );
  });

  it('seeds filter values from the URL hash and applies edited values on submit', () => {
    window.location.hash = '#subUnitCode=ABC';

    render(<SubUnitsList />);

    expect(screen.getByTestId('filter-values')).toHaveTextContent(
      JSON.stringify({ subUnitCode: 'ABC' })
    );

    fireEvent.click(screen.getByTestId('change-filter'));
    fireEvent.click(screen.getByTestId('submit-filters'));

    expect(mockApplyFilters).toHaveBeenCalledWith({ subUnitCode: 'XYZ' });
  });
});
