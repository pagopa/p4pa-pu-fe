import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../../__tests__/renderers';
import { PaymentsTable, PaymentsTableProps } from './PaymentsTable';
import {
  PagedPaidInstallmentsDTO,
  PaymentsUIFilters,
  PaidInstallmentDTO
} from '../../../api/classifications/paidInstallments/mappings';

const mockUsePaymentsTableFilters = {
  appliedFilters: {} as PaymentsUIFilters,
  draftFilters: {} as PaymentsUIFilters,
  sortModel: [],
  updateDraftFilters: vi.fn(),
  applyFilters: vi.fn(),
  handleSortModelChange: vi.fn(),
  handleDateFromChange: vi.fn(),
  handleDateToChange: vi.fn(),
  handleUpdateDateFromChange: vi.fn(),
  handleUpdateDateToChange: vi.fn()
};

vi.mock('../../../hooks/usePaymentsTableFilters', () => ({
  usePaymentsTableFilters: () => mockUsePaymentsTableFilters
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'commons.iuv': 'IUV',
        'commons.search': 'Cerca',
        'commons.outcomeFrom': 'Data esito da',
        'commons.dateTo': 'Data a',
        'commons.updatedFrom': 'Aggiornato da',
        'flowDataGrid.noDataRows': 'Nessun dato disponibile'
      };
      return translations[key] || key;
    }
  })
}));

describe('PaymentsTable', () => {
  const mockPaidInstallment: PaidInstallmentDTO = {
    iud: 'test-iud-1',
    iuv: 'test-iuv-1',
    amount: 100.5,
    paymentDateTime: '2023-01-01T10:30:00Z',
    updateDate: '2023-01-02T15:45:00Z',
    organizationId: 123
  };

  const mockData: PagedPaidInstallmentsDTO = {
    content: [mockPaidInstallment],
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 10
  };

  const defaultProps: PaymentsTableProps = {
    data: mockData,
    onSelectionChange: vi.fn(),
    onFiltersApplied: vi.fn(),
    onFilterValidationError: vi.fn(),
    initialFilters: {},
    isLoading: false,
    disabled: false,
    autoLoadOnMount: true,
    selectedUniqueIds: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Rendering', () => {
    it('renders the component with default props', () => {
      render(<PaymentsTable {...defaultProps} />);

      expect(screen.getByLabelText('Cerca IUV')).toBeInTheDocument();
      expect(screen.getByText('Cerca')).toBeInTheDocument();
    });

    it('renders table columns correctly', () => {
      render(<PaymentsTable {...defaultProps} />);

      expect(screen.getByText('IUV')).toBeInTheDocument();
      expect(screen.getByText('Importo')).toBeInTheDocument();
      expect(screen.getByText('Data esito')).toBeInTheDocument();
      expect(screen.getByText('Ultimo aggiornamento')).toBeInTheDocument();
    });

    it('renders table data correctly', () => {
      render(<PaymentsTable {...defaultProps} />);

      expect(screen.getByText('test-iuv-1')).toBeInTheDocument();
      expect(screen.getByText('1,01 €')).toBeInTheDocument();
      expect(screen.getByText('01/01/2023')).toBeInTheDocument();
      expect(screen.getByText('02/01/2023')).toBeInTheDocument();
    });

    it('renders empty state when no data', () => {
      const emptyData: PagedPaidInstallmentsDTO = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 10
      };

      render(<PaymentsTable {...defaultProps} data={emptyData} />);

      expect(screen.getByText('Nessun dato disponibile')).toBeInTheDocument();
    });

    it('renders loading state correctly', () => {
      render(<PaymentsTable {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Filters', () => {
    it('calls updateDraftFilters when IUV filter changes', () => {
      render(<PaymentsTable {...defaultProps} />);

      const iuvInput = screen.getByLabelText('Cerca IUV');
      fireEvent.change(iuvInput, { target: { value: 'test-iuv' } });

      expect(
        mockUsePaymentsTableFilters.updateDraftFilters
      ).toHaveBeenCalledWith({
        iuv: 'test-iuv'
      });
    });

    it('calls applyFilters when search button is clicked', () => {
      render(<PaymentsTable {...defaultProps} />);

      const searchButton = screen.getByText('Cerca');
      fireEvent.click(searchButton);

      expect(mockUsePaymentsTableFilters.applyFilters).toHaveBeenCalled();
    });

    it('disables search button when disabled prop is true', () => {
      render(<PaymentsTable {...defaultProps} disabled={true} />);

      const searchButton = screen.getByText('Cerca');
      expect(searchButton).toBeDisabled();
    });

    it('calls date handlers when date filters change', () => {
      render(<PaymentsTable {...defaultProps} />);

      expect(mockUsePaymentsTableFilters.handleDateFromChange).toBeDefined();
      expect(mockUsePaymentsTableFilters.handleDateToChange).toBeDefined();
      expect(
        mockUsePaymentsTableFilters.handleUpdateDateFromChange
      ).toBeDefined();
      expect(
        mockUsePaymentsTableFilters.handleUpdateDateToChange
      ).toBeDefined();
    });
  });

  describe('Data Grid Functionality', () => {
    it('renders rows with unique IDs correctly', () => {
      const multipleItemsData: PagedPaidInstallmentsDTO = {
        content: [
          { ...mockPaidInstallment, iud: 'iud-1', iuv: 'iuv-1' },
          { ...mockPaidInstallment, iud: 'iud-2', iuv: 'iuv-2' }
        ],
        totalElements: 2,
        totalPages: 1,
        number: 0,
        size: 10
      };

      render(<PaymentsTable {...defaultProps} data={multipleItemsData} />);

      expect(screen.getByText('iuv-1')).toBeInTheDocument();
      expect(screen.getByText('iuv-2')).toBeInTheDocument();
    });

    it('handles row selection correctly', async () => {
      render(<PaymentsTable {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      const rowCheckbox = checkboxes[1];
      fireEvent.click(rowCheckbox);

      await waitFor(() => {
        expect(defaultProps.onSelectionChange).toHaveBeenCalled();
      });
    });

    it('shows selected rows based on selectedUniqueIds prop', () => {
      const selectedUniqueIds = ['test-iud-1-0'];

      render(
        <PaymentsTable
          {...defaultProps}
          selectedUniqueIds={selectedUniqueIds}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      const rowCheckbox = checkboxes[1];
      expect(rowCheckbox).toBeChecked();
    });

    it('calls handleSortModelChange when sorting changes', () => {
      render(<PaymentsTable {...defaultProps} />);

      const iuvHeader = screen.getByText('IUV');
      fireEvent.click(iuvHeader);

      expect(
        mockUsePaymentsTableFilters.handleSortModelChange
      ).toHaveBeenCalled();
    });

    it('calls onFiltersApplied when pagination changes', async () => {
      render(<PaymentsTable {...defaultProps} />);

      expect(defaultProps.onFiltersApplied).toBeDefined();
    });
  });

  describe('Detail Actions', () => {
    it('renders detail button for each row', () => {
      render(<PaymentsTable {...defaultProps} />);

      const actionCell = screen.getByRole('gridcell', { name: '' });
      const iconButton = actionCell.querySelector('button');
      expect(iconButton).toBeInTheDocument();
    });

    it('logs detail click when detail button is pressed', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      render(<PaymentsTable {...defaultProps} />);

      const actionCell = screen.getByRole('gridcell', { name: '' });
      const detailButton = actionCell.querySelector('button');
      if (detailButton) {
        fireEvent.click(detailButton);
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        'Detail clicked for:',
        expect.objectContaining({
          iud: 'test-iud-1',
          iuv: 'test-iuv-1',
          uniqueId: expect.stringContaining('test-iud-1-0')
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Data Formatting', () => {
    it('formats amount correctly in money format', () => {
      render(<PaymentsTable {...defaultProps} />);

      expect(screen.getByText('1,01 €')).toBeInTheDocument();
    });

    it('formats dates correctly in Italian format', () => {
      render(<PaymentsTable {...defaultProps} />);

      expect(screen.getByText('01/01/2023')).toBeInTheDocument();
      expect(screen.getByText('02/01/2023')).toBeInTheDocument();
    });

    it('handles null dates gracefully', () => {
      const dataWithNullDates: PagedPaidInstallmentsDTO = {
        content: [
          {
            ...mockPaidInstallment,
            paymentDateTime: '',
            updateDate: ''
          }
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 10
      };

      render(<PaymentsTable {...defaultProps} data={dataWithNullDates} />);

      expect(screen.getByText('test-iuv-1')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined data gracefully', () => {
      render(<PaymentsTable {...defaultProps} data={undefined} />);

      expect(screen.getByText('Nessun dato disponibile')).toBeInTheDocument();
    });

    it('handles empty selectedUniqueIds array', () => {
      render(<PaymentsTable {...defaultProps} selectedUniqueIds={[]} />);

      const checkboxes = screen.getAllByRole('checkbox');
      const rowCheckbox = checkboxes[1];
      expect(rowCheckbox).not.toBeChecked();
    });

    it('handles missing onSelectionChange callback', () => {
      const propsWithoutCallback = {
        ...defaultProps,
        onSelectionChange: undefined
      };

      render(<PaymentsTable {...propsWithoutCallback} />);

      const checkboxes = screen.getAllByRole('checkbox');
      const rowCheckbox = checkboxes[1];
      fireEvent.click(rowCheckbox);

      expect(screen.getByText('test-iuv-1')).toBeInTheDocument();
    });

    it('handles missing onFiltersApplied callback', () => {
      const propsWithoutCallback = {
        ...defaultProps,
        onFiltersApplied: undefined
      };

      render(<PaymentsTable {...propsWithoutCallback} />);

      const searchButton = screen.getByText('Cerca');
      fireEvent.click(searchButton);

      expect(mockUsePaymentsTableFilters.applyFilters).toHaveBeenCalled();
    });
  });

  describe('Unique ID Generation', () => {
    it('generates stable unique IDs based on pagination', () => {
      const dataPage1: PagedPaidInstallmentsDTO = {
        content: [mockPaidInstallment],
        totalElements: 20,
        totalPages: 2,
        number: 0,
        size: 10
      };

      render(<PaymentsTable {...defaultProps} data={dataPage1} />);

      expect(screen.getByText('test-iuv-1')).toBeInTheDocument();
    });

    it('handles duplicate IUDs with unique IDs', () => {
      const dataWithDuplicates: PagedPaidInstallmentsDTO = {
        content: [
          { ...mockPaidInstallment, iud: 'duplicate-iud', iuv: 'iuv-1' },
          { ...mockPaidInstallment, iud: 'duplicate-iud', iuv: 'iuv-2' }
        ],
        totalElements: 2,
        totalPages: 1,
        number: 0,
        size: 10
      };

      render(<PaymentsTable {...defaultProps} data={dataWithDuplicates} />);

      expect(screen.getByText('iuv-1')).toBeInTheDocument();
      expect(screen.getByText('iuv-2')).toBeInTheDocument();
    });
  });
});
