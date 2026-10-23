/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router';
import type { Mock } from 'vitest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, waitFor } from '../../__tests__/renderers';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import DebtPositionsPage from './DebtPositionsPage';
import { PageRoutes } from '../../routes';
import { SearchType } from '../../models/DebtPositions';
import { FilterFieldIds } from '../../models/SearchCardFields';
import { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';

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

vi.mock('../../hooks/useDebtPositionsTypeOrg', () => ({
  useDebtPositionsTypeOrg: vi.fn()
}));

const VALID_FISCAL_CODE = 'RSSMRA80A01H501U';

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

  it('should render titles, action cards and filter buttons', () => {
    render(<DebtPositionsPage />);

    expect(screen.getByText('Debt Positions')).toBeInTheDocument();
    expect(screen.getByText('Search Debt Positions')).toBeInTheDocument();
    expect(screen.getByText('Import Debt Flow')).toBeInTheDocument();
    expect(screen.getByText('Search by IUV')).toBeInTheDocument();
    expect(screen.getByText('Search by Position')).toBeInTheDocument();
    expect(screen.getByText('Filter Results')).toBeInTheDocument();
  });

  describe('Tabs', () => {
    it('should start with the first tab active and useDateRange on index 0', () => {
      render(<DebtPositionsPage />);

      expect(
        screen.getByRole('tab', { name: 'Search by IUV' })
      ).toHaveAttribute('aria-selected', 'true');
      expect(mockUseDateRange).toHaveBeenCalledWith(0);
    });

    it('should switch to the second tab and pass its index to useDateRange', async () => {
      render(<DebtPositionsPage />);

      const secondTab = screen.getByRole('tab', { name: 'Search by Position' });
      fireEvent.click(secondTab);

      await waitFor(() => {
        expect(secondTab).toHaveAttribute('aria-selected', 'true');
      });
      expect(mockUseDateRange).toHaveBeenLastCalledWith(1);
    });
  });

  describe('Navigation', () => {
    it('should navigate to create wizard when create button is clicked', () => {
      render(<DebtPositionsPage />);

      fireEvent.click(screen.getByText('Create New'));

      expect(mockNavigate).toHaveBeenCalledWith(
        PageRoutes.DEBT_POSITION_CREATE_WIZARD
      );
    });

    it('should navigate to import flows when import button is clicked', () => {
      render(<DebtPositionsPage />);

      fireEvent.click(screen.getByText('Import Flow'));

      expect(mockGeneratePath).toHaveBeenCalledWith(PageRoutes.IMPORT_FLOWS, {
        category: 'debt-positions'
      });
    });

    it('should navigate to import overview when show all flows is clicked', () => {
      render(<DebtPositionsPage />);

      fireEvent.click(screen.getByText('Show All Flows'));

      expect(mockNavigate).toHaveBeenCalledWith(
        PageRoutes.DEBT_POSITIONS_IMPORT_OVERVIEW
      );
    });
  });

  describe('Filters', () => {
    it('should not navigate when no filter is set', () => {
      render(<DebtPositionsPage />);

      fireEvent.click(screen.getByText('Filter Results'));

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not navigate when the fiscal code is invalid', () => {
      render(<DebtPositionsPage />);

      fireEvent.change(screen.getByLabelText('Fiscal Code'), {
        target: { value: 'INVALID' }
      });
      fireEvent.click(screen.getByText('Filter Results'));

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should navigate to the IUV results with valid filters on the first tab', async () => {
      render(<DebtPositionsPage />);

      fireEvent.change(screen.getByLabelText('Fiscal Code'), {
        target: { value: VALID_FISCAL_CODE }
      });
      fireEvent.click(screen.getByText('Filter Results'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining(PageRoutes.DEBT_POSITION_SEARCH_RESULTS),
          { state: { searchType: SearchType.IUV } }
        );
      });
    });

    it('should navigate to the debt position results with valid filters on the second tab', async () => {
      render(<DebtPositionsPage />);

      const secondTab = screen.getByRole('tab', { name: 'Search by Position' });
      fireEvent.click(secondTab);
      await waitFor(() => {
        expect(secondTab).toHaveAttribute('aria-selected', 'true');
      });

      fireEvent.change(screen.getByLabelText('Fiscal Code'), {
        target: { value: VALID_FISCAL_CODE }
      });
      fireEvent.click(screen.getByText('Filter Results'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining(PageRoutes.DEBT_POSITIONS_RESULTS),
          { state: { searchType: SearchType.DEBT_POSITION } }
        );
      });
    });

    it('should reset the dates when the remove button is clicked', () => {
      render(<DebtPositionsPage />);

      fireEvent.click(screen.getByText('Remove'));

      expect(defaultDateRangeHook.resetDates).toHaveBeenCalled();
    });
  });
});
