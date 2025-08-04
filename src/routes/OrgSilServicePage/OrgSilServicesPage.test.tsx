/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrgSilServicesPage } from './OrgSilServicesPage';
import {
  OrgSilServiceType,
  PagedOrgSilServiceView
} from '../../../generated/apiClient';
import { COMPONENT_TYPE } from '../../components/FilterContainer/FilterContainer';

import * as useSearchModule from '../../hooks/useSearch';
import * as useOrgSilServiceFiltersModule from '../../hooks/useOrgSilServiceFilters';
import { render, screen, fireEvent } from '../../__tests__/renderers';

const mockNotificationsData: PagedOrgSilServiceView = {
  content: [
    {
      orgSilServiceId: 1,
      applicationName: 'Notification Service',
      organizationId: 123,
      serviceUrl: 'http://notify.com',
      serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME
    }
  ],
  totalElements: 1,
  totalPages: 1,
  size: 10,
  number: 0
};

const mockActualizationData: PagedOrgSilServiceView = {
  content: [
    {
      orgSilServiceId: 2,
      applicationName: 'Actualization Service',
      organizationId: 123,
      serviceUrl: 'http://actualize.com',
      serviceType: OrgSilServiceType.ACTUALIZATION
    }
  ],
  totalElements: 1,
  totalPages: 1,
  size: 10,
  number: 0
};

const mockApplyFilters = vi.fn();
const mockHandlePaginationChange = vi.fn();

vi.mock('../../api/orgSilService', () => ({
  default: {
    getOrgSilServices: vi.fn().mockReturnValue({
      queryKey: ['orgSilServices'],
      queryFn: vi.fn()
    })
  }
}));

vi.mock('../../hooks/useSearch');
vi.mock('../../hooks/useOrgSilServiceFilters');
vi.mock('../../components/TitleComponent/TitleComponent', () => ({
  default: ({ title }: { title: string }) => <h1>{title}</h1>
}));

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
vi.mock('./components/ServiceDataGrid', () => ({
  ServiceDataGrid: ({ data, loading }: any) => (
    <div data-testid="service-data-grid">
      {loading && <span>Loading...</span>}
      {data?.content?.map((row: any) => (
        <div key={row.orgSilServiceId}>{row.applicationName}</div>
      ))}
    </div>
  )
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));
vi.mock('../../store/GlobalStore', () => ({
  useStore: () => ({ state: { organizationId: '123' } }),
  StoreProvider: ({ children }: { children: React.ReactNode }) => children
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
      query: {
        data: mockNotificationsData,
        isPending: false
      }
    } as any);
  });

  it('should render correctly and load initial data for the first tab', () => {
    render(<OrgSilServicesPage />);

    expect(
      screen.getByText('commons.routes.ORG_SIL_SERVICE')
    ).toBeInTheDocument();

    expect(screen.getByText('Notification Service')).toBeInTheDocument();

    expect(mockApplyFilters).toHaveBeenCalledTimes(1);
  });

  it('should call applyFilters when switching to a tab without data', () => {
    vi.spyOn(useSearchModule, 'useSearch')
      .mockReturnValueOnce({
        applyFilters: mockApplyFilters,
        handlePaginationChange: mockHandlePaginationChange,
        query: { data: mockNotificationsData, isPending: false }
      } as any)
      .mockReturnValueOnce({
        applyFilters: mockApplyFilters,
        handlePaginationChange: mockHandlePaginationChange,
        query: { data: undefined, isPending: false }
      } as any);

    render(<OrgSilServicesPage />);

    mockApplyFilters.mockClear();

    const tab1Button = screen.getByTestId('tab-1');
    fireEvent.click(tab1Button);

    expect(mockApplyFilters).toHaveBeenCalledTimes(1);
  });

  it('should display data for the second tab after switching', () => {
    let callCount = 0;
    vi.spyOn(useSearchModule, 'useSearch').mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          applyFilters: mockApplyFilters,
          handlePaginationChange: mockHandlePaginationChange,
          query: { data: mockNotificationsData, isPending: false }
        } as any;
      } else {
        return {
          applyFilters: mockApplyFilters,
          handlePaginationChange: mockHandlePaginationChange,
          query: { data: mockActualizationData, isPending: false }
        } as any;
      }
    });

    render(<OrgSilServicesPage />);

    expect(screen.getByText('Notification Service')).toBeInTheDocument();

    const tab1Button = screen.getByTestId('tab-1');
    fireEvent.click(tab1Button);

    expect(screen.getByText('Actualization Service')).toBeInTheDocument();
    expect(screen.queryByText('Notification Service')).not.toBeInTheDocument();
  });

  it('should update filter values when typing in the filter input', () => {
    render(<OrgSilServicesPage />);

    const filterInput = screen.getByTestId('filter-input');

    fireEvent.change(filterInput, { target: { value: 'Test Filter' } });

    expect(filterInput).toHaveValue('Test Filter');
  });

  it('should show loading state when data is pending', () => {
    vi.spyOn(useSearchModule, 'useSearch').mockReturnValue({
      applyFilters: mockApplyFilters,
      handlePaginationChange: mockHandlePaginationChange,
      query: { data: undefined, isPending: true }
    } as any);

    render(<OrgSilServicesPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should maintain separate filter values for different tabs', () => {
    render(<OrgSilServicesPage />);

    const filterInput = screen.getByTestId('filter-input');
    fireEvent.change(filterInput, { target: { value: 'Notification Filter' } });

    const tab1Button = screen.getByTestId('tab-1');
    fireEvent.click(tab1Button);

    expect(filterInput).toHaveValue('');

    const tab0Button = screen.getByTestId('tab-0');
    fireEvent.click(tab0Button);

    expect(filterInput).toHaveValue('Notification Filter');
  });
});
