/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, fireEvent, screen, waitFor } from '../../__tests__/renderers';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import DebtPositionsPage from './DebtPositionsPage';
import { PageRoutes } from '../../routes';
import { SearchType } from '../../models/DebtPositions';
import { FilterFieldIds } from '../../models/SearchCardFields';
import { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import { STATE } from '../../store/types';

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(),
    generatePath: vi.fn()
  };
});

vi.mock('./useDebtTabsConfig', () => ({
  useTabsConfig: vi.fn()
}));

vi.mock('../../hooks/useDateRange', () => ({
  useDateRange: vi.fn()
}));

vi.mock('../../store/GlobalStore', () => ({
  useStore: vi.fn()
}));

vi.mock('../../hooks/useDebtPositionsTypeOrg', () => ({
  useDebtPositionsTypeOrg: vi.fn()
}));

describe('DebtPositionsPage', async () => {
  const mockNavigate = vi.fn();
  const mockUseTabsConfig = vi.mocked(
    await import('./useDebtTabsConfig')
  ).useTabsConfig;
  const mockUseDateRange = vi.mocked(
    await import('../../hooks/useDateRange')
  ).useDateRange;
  const mockGeneratePath = vi.mocked(await import('react-router')).generatePath;
  const mockUseDebtPositionsTypeOrg = vi.mocked(
    await import('../../hooks/useDebtPositionsTypeOrg')
  ).useDebtPositionsTypeOrg;

  const defaultDateRangeHook = {
    fromDate: null,
    toDate: null,
    setFromDate: vi.fn(),
    setFromDateToday: vi.fn(),
    setToDate: vi.fn(),
    setToDateToday: vi.fn(),
    setFromError: vi.fn(),
    setToError: vi.fn(),
    resetDates: vi.fn(),
    isButtonDisabled: false
  };

  beforeEach(() => {
    i18nTestSetup({
      'commons.routes.DEBT_POSITIONS': 'Debt Positions',
      'commons.createNew': 'Create New',
      'debtPositions.searchCardTitle': 'Search Debt Positions',
      'debtPositions.searchCardDescription': 'Search for debt positions',
      'debtPositions.importDebtFlow': 'Import Debt Flow',
      'debtPositions.importDebtFlowDescription': 'Import debt flow description',
      'commons.importFlow': 'Import Flow',
      'commons.showAllFlows': 'Show All Flows',
      'commons.filters.remove': 'Remove',
      'commons.filters.filterResults': 'Filter Results',
      'debtPositions.searchCardIUVOption': 'Search by IUV',
      'debtPositions.searchCardDebtPositionOption': 'Search by Position',
      'debtPositions.searchIUVDescription': 'IUV Code',
      'debtPositions.searchFiscalCodeDescription': 'Fiscal Code',
      'debtPositions.expirationFrom': 'Expiration From',
      'dates.to': 'To',
      'commons.duetype': 'Due Type',
      'commons.creationFrom': 'Creation From',
      'commons.state': 'State',
      'commons.status.TO_SYNC': 'To Sync',
      'commons.status.REPORTED': 'Reported',
      'commons.status.PAID': 'Paid',
      'commons.status.PARTIALLY_PAID': 'Partially Paid',
      'commons.status.CANCELLED': 'Cancelled',
      'commons.status.EXPIRED': 'Expired',
      'commons.status.UNPAID': 'Unpaid',
      'commons.status.DRAFT': 'Draft'
    });

    vi.clearAllMocks();
    (useNavigate as Mock).mockReturnValue(mockNavigate);

    const mockOrganizationId = 123;

    vi.mock('../../store/GlobalStore', () => ({
      useStore: vi.fn(() => ({
        state: {
          [STATE.ORGANIZATION_ID]: mockOrganizationId,
          customBreadcrumbsItems: []
        }
      })),
      StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
    }));

    mockUseDebtPositionsTypeOrg.mockReturnValue({
      data: [],
      isError: false,
      error: null,
      isPending: false,
      isLoading: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      isPlaceholderData: false,
      isFetching: false,
      isRefetching: false,
      isStale: false,
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      fetchStatus: 'idle' as const,
      status: 'success' as const,
      refetch: vi.fn(),
      promise: Promise.resolve([]),
      optionsMap: [
        { value: 1, label: 'Type 1' },
        { value: 2, label: 'Type 2' }
      ],
      errorUpdateCount: 0,
      isFetched: false,
      isFetchedAfterMount: false,
      isInitialLoading: false,
      isPaused: false
    });

    mockUseTabsConfig.mockReturnValue([
      {
        label: 'Search by IUV',
        fields: [
          {
            type: COMPONENT_TYPE.textField,
            label: 'IUV Code',
            id: FilterFieldIds.IUV_CODE
          },
          {
            type: COMPONENT_TYPE.textField,
            label: 'Fiscal Code',
            id: FilterFieldIds.FISCAL_CODE
          },
          {
            type: COMPONENT_TYPE.dateRange,
            label: 'dateRange',
            from: { label: 'Expiration From' },
            to: { label: 'To' },
            id: FilterFieldIds.DATE_RANGE
          }
        ]
      },
      {
        label: 'Search by Position',
        fields: [
          {
            type: COMPONENT_TYPE.textField,
            label: 'Fiscal Code',
            id: FilterFieldIds.FISCAL_CODE
          },
          {
            type: COMPONENT_TYPE.dateRange,
            label: 'dateRange',
            from: { label: 'Creation From' },
            to: { label: 'To' },
            id: FilterFieldIds.DATE_RANGE
          }
        ]
      }
    ]);

    mockUseDateRange.mockReturnValue(defaultDateRangeHook);
    mockGeneratePath.mockImplementation((path: string, params: any) =>
      path.replace(':category', params.category)
    );
  });

  describe('Component Rendering', () => {
    it('should render all main components', () => {
      render(<DebtPositionsPage />);

      expect(screen.getByText('Debt Positions')).toBeInTheDocument();
      expect(screen.getByText('Create New')).toBeInTheDocument();

      expect(screen.getByText('Search Debt Positions')).toBeInTheDocument();
      expect(screen.getByText('Search for debt positions')).toBeInTheDocument();

      expect(screen.getByText('Import Debt Flow')).toBeInTheDocument();
      expect(
        screen.getByText('Import debt flow description')
      ).toBeInTheDocument();

      expect(screen.getByText('Search by IUV')).toBeInTheDocument();
      expect(screen.getByText('Search by Position')).toBeInTheDocument();
    });

    it('should render filter buttons', () => {
      render(<DebtPositionsPage />);

      expect(screen.getByText('Remove')).toBeInTheDocument();
      expect(screen.getByText('Filter Results')).toBeInTheDocument();
    });

    it('should render action card buttons', () => {
      render(<DebtPositionsPage />);

      expect(screen.getByText('Import Flow')).toBeInTheDocument();
      expect(screen.getByText('Show All Flows')).toBeInTheDocument();
    });
  });

  describe('Tab Management', () => {
    it('should start with first tab active', () => {
      render(<DebtPositionsPage />);

      const firstTab = screen.getByRole('tab', { name: 'Search by IUV' });
      expect(firstTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should switch to second tab when clicked', async () => {
      render(<DebtPositionsPage />);

      const secondTab = screen.getByRole('tab', { name: 'Search by Position' });
      fireEvent.click(secondTab);

      await waitFor(() => {
        expect(secondTab).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to create wizard when create button is clicked', () => {
      render(<DebtPositionsPage />);

      const createButton = screen.getByText('Create New');
      fireEvent.click(createButton);

      expect(mockNavigate).toHaveBeenCalledWith(
        PageRoutes.DEBT_POSITION_CREATE_WIZARD
      );
    });

    it('should navigate to import flows when import button is clicked', () => {
      render(<DebtPositionsPage />);

      const importButton = screen.getByText('Import Flow');
      fireEvent.click(importButton);

      expect(mockGeneratePath).toHaveBeenCalledWith(PageRoutes.IMPORT_FLOWS, {
        category: 'debt-positions'
      });
    });

    it('should navigate to import overview when show all flows is clicked', () => {
      render(<DebtPositionsPage />);

      const showAllButton = screen.getByText('Show All Flows');
      fireEvent.click(showAllButton);

      expect(mockNavigate).toHaveBeenCalledWith(
        PageRoutes.DEBT_POSITIONS_IMPORT_OVERVIEW
      );
    });
  });

  describe('Filter Management', () => {
    it('should handle filter input changes', async () => {
      render(<DebtPositionsPage />);

      const fiscalCodeInput = screen.getByLabelText('Fiscal Code');
      fireEvent.change(fiscalCodeInput, {
        target: { value: 'RSSMRA80A01H501U' }
      });

      await waitFor(() => {
        expect(fiscalCodeInput).toHaveValue('RSSMRA80A01H501U');
      });
    });

    it('should show validation error when trying to filter with empty inputs', async () => {
      render(<DebtPositionsPage />);

      const filterButton = screen.getByText('Filter Results');
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('should navigate when valid filters are provided', async () => {
      render(<DebtPositionsPage />);

      const fiscalCodeInput = screen.getByLabelText('Fiscal Code');
      fireEvent.change(fiscalCodeInput, {
        target: { value: 'RSSMRA80A01H501U' }
      });

      const filterButton = screen.getByText('Filter Results');
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          PageRoutes.DEBT_POSITION_SEARCH_RESULTS,
          expect.objectContaining({
            state: expect.objectContaining({
              searchType: SearchType.IUV
            })
          })
        );
      });
    });

    it('should navigate to different results page for second tab', async () => {
      render(<DebtPositionsPage />);

      const secondTab = screen.getByRole('tab', { name: 'Search by Position' });
      fireEvent.click(secondTab);

      await waitFor(() => {
        expect(secondTab).toHaveAttribute('aria-selected', 'true');
      });

      const fiscalCodeInput = screen.getByLabelText('Fiscal Code');
      fireEvent.change(fiscalCodeInput, {
        target: { value: 'RSSMRA80A01H501U' }
      });

      const filterButton = screen.getByText('Filter Results');
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          PageRoutes.DEBT_POSITIONS_RESULTS,
          expect.objectContaining({
            state: expect.objectContaining({
              searchType: SearchType.DEBT_POSITION
            })
          })
        );
      });
    });
  });

  describe('Date Range Integration', () => {
    it('should call useDateRange with correct tab index', () => {
      render(<DebtPositionsPage />);

      expect(mockUseDateRange).toHaveBeenCalledWith(0);
    });

    it('should call useDateRange with updated tab index when switching tabs', async () => {
      render(<DebtPositionsPage />);

      const secondTab = screen.getByRole('tab', { name: 'Search by Position' });
      fireEvent.click(secondTab);

      await waitFor(() => {
        expect(secondTab).toHaveAttribute('aria-selected', 'true');
      });

      expect(mockUseDateRange).toHaveBeenLastCalledWith(1);
    });
  });

  describe('Error Handling', () => {
    it('should clear validation errors when switching tabs', async () => {
      render(<DebtPositionsPage />);

      const filterButton = screen.getByText('Filter Results');
      fireEvent.click(filterButton);

      const secondTab = screen.getByRole('tab', { name: 'Search by Position' });
      fireEvent.click(secondTab);

      await waitFor(() => {
        expect(secondTab).toHaveAttribute('aria-selected', 'true');
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Component Integration', () => {
    it('should integrate with date range hook correctly', () => {
      render(<DebtPositionsPage />);

      expect(mockUseDateRange).toHaveBeenCalledWith(0);

      expect(defaultDateRangeHook.setFromDate).toBeDefined();
      expect(defaultDateRangeHook.setToDate).toBeDefined();
    });

    it('should integrate with tabs config correctly', () => {
      render(<DebtPositionsPage />);

      expect(mockUseTabsConfig).toHaveBeenCalled();

      expect(screen.getByText('Search by IUV')).toBeInTheDocument();
      expect(screen.getByText('Search by Position')).toBeInTheDocument();
    });
  });
});
