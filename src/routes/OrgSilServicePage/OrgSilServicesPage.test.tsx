/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '../../__tests__/renderers';
import { OrgSilServicesPage } from './OrgSilServicesPage';
import * as useSearchModule from '../../hooks/useSearch';
import * as useOrgSilServiceFiltersModule from '../../hooks/useOrgSilServiceFilters';
import { COMPONENT_TYPE } from '../../components/FilterContainer/FilterContainer';

const mockNotificationsData = {
  content: [
    {
      orgSilServiceId: 1,
      applicationName: 'Notification Service',
      organizationId: 123,
      serviceUrl: 'http://notify.com',
      serviceType: 0
    }
  ],
  totalElements: 1,
  totalPages: 1,
  size: 10,
  number: 0
};

const mockActualizationData = {
  content: [
    {
      orgSilServiceId: 2,
      applicationName: 'Actualization Service',
      organizationId: 123,
      serviceUrl: 'http://actualize.com',
      serviceType: 1
    }
  ],
  totalElements: 1,
  totalPages: 1,
  size: 10,
  number: 0
};

const mockApplyFilters = vi.fn();
const mockHandlePaginationChange = vi.fn();

vi.mock('../../components/FilterContainer/FilterContainer', () => ({
  default: ({ items, values, onChange }: any) => (
    <div>
      <input
        data-testid="filter-input"
        value={values.applicationName}
        onChange={(e) => onChange('applicationName', e.target.value)}
      />
      <button
        data-testid="search-button"
        onClick={items.find((i: any) => i.id === 'applyFilters').onClick}
      >
        Search
      </button>
    </div>
  ),
  COMPONENT_TYPE: {
    textField: 'textField',
    button: 'button',
    select: 'select',
    checkbox: 'checkbox'
  }
}));

vi.mock('./components/ServiceTab', () => ({
  ServiceTabs: ({ onTabChange }: any) => (
    <div>
      <button data-testid="tab-0" onClick={() => onTabChange(0)}>
        Tab 0
      </button>
      <button data-testid="tab-1" onClick={() => onTabChange(1)}>
        Tab 1
      </button>
    </div>
  )
}));

describe('OrgSilServicesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(useOrgSilServiceFiltersModule, 'default').mockReturnValue({
      filters: [
        {
          type: COMPONENT_TYPE.textField,
          id: 'applicationName',
          label: 'API Name'
        },
        {
          type: COMPONENT_TYPE.button,
          id: 'applyFilters',
          label: 'Search',
          onClick: mockApplyFilters
        }
      ]
    });

    vi.spyOn(useSearchModule, 'useSearch').mockReturnValue({
      applyFilters: mockApplyFilters,
      handlePaginationChange: mockHandlePaginationChange,
      // @ts-expect-error query mocking
      query: {
        data: mockNotificationsData,
        isPending: false
      }
    });
  });

  it('renders the page with initial data on first tab', () => {
    render(<OrgSilServicesPage />);
    expect(
      screen.getByText('commons.routes.ORG_SIL_SERVICE')
    ).toBeInTheDocument();
    expect(screen.getByText('Notification Service')).toBeInTheDocument();
  });

  it('switches tabs and triggers applyFilters when no data', () => {
    vi.spyOn(useSearchModule, 'useSearch')
      .mockReturnValueOnce({
        applyFilters: mockApplyFilters,
        handlePaginationChange: mockHandlePaginationChange,
        // @ts-expect-error query mocking
        query: { data: mockNotificationsData, isPending: false }
      })
      .mockReturnValueOnce({
        applyFilters: mockApplyFilters,
        handlePaginationChange: mockHandlePaginationChange,
        // @ts-expect-error query mocking
        query: { data: undefined, isPending: false }
      });

    render(<OrgSilServicesPage />);

    const tab1Button = screen.getByTestId('tab-1');
    fireEvent.click(tab1Button);

    expect(mockApplyFilters).toHaveBeenCalledTimes(1);
  });

  it('displays correct data when switching tabs', () => {
    let callCount = 0;
    // @ts-expect-error query mocking
    vi.spyOn(useSearchModule, 'useSearch').mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          applyFilters: mockApplyFilters,
          handlePaginationChange: mockHandlePaginationChange,
          query: { data: mockNotificationsData, isPending: false }
        };
      }
      return {
        applyFilters: mockApplyFilters,
        handlePaginationChange: mockHandlePaginationChange,
        query: { data: mockActualizationData, isPending: false }
      };
    });

    render(<OrgSilServicesPage />);
    expect(screen.getByText('Notification Service')).toBeInTheDocument();

    const tab1Button = screen.getByTestId('tab-1');
    fireEvent.click(tab1Button);

    expect(screen.getByText('Actualization Service')).toBeInTheDocument();
    expect(screen.queryByText('Notification Service')).not.toBeInTheDocument();
  });

  it('updates filter values on user input', () => {
    render(<OrgSilServicesPage />);
    const filterInput = screen.getByTestId('filter-input');

    fireEvent.change(filterInput, { target: { value: 'Test Filter' } });

    expect(filterInput).toHaveValue('Test Filter');
  });
});
