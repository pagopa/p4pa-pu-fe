import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../../__tests__/renderers';
import { PaymentsTable, PaymentsTableProps } from './PaymentsTable';
import {
  PagedPaidInstallmentsDTO,
  PaidInstallmentDTO,
  PaymentsUIFilters
} from '../../../api/classifications/paidInstallments/mappings';

// Mock the usePaymentsTableFilters hook
const mockUsePaymentsTableFilters = {
  draftFilters: {} as PaymentsUIFilters,
  updateDraftFilters: vi.fn(),
  applyFilters: vi.fn(),
  handleDateFromChange: vi.fn(),
  handleDateToChange: vi.fn(),
  hasValidFilters: true
};

// Mock the useHashParamsListener hook
vi.mock('../../../hooks/useHashParamsListener', () => ({
  useHashParamsListener: vi.fn()
}));

// Mock react-i18next translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'commons.iuv': 'IUV',
        'commons.search': 'Cerca',
        'commons.amount': 'Importo',
        'commons.paymentdate': 'Data esito',
        'commons.lastUpdate': 'Ultimo aggiornamento',
        'flowDataGrid.noDataRows': 'Nessun dato disponibile'
      };
      return translations[key] || key;
    }
  })
}));

// Mock react-router's generatePath function
vi.mock('react-router', async (importOriginal) => ({
  ...((await importOriginal()) as typeof import('react-router')),
  generatePath: vi.fn((path, params) => path.replace(':id', params.id))
}));

// Mock paymentsTableFilters Hook module, returning your mock object
vi.mock('../../../hooks/usePaymentsTableFilters', () => ({
  usePaymentsTableFilters: () => mockUsePaymentsTableFilters
}));

import { useHashParamsListener } from '../../../hooks/useHashParamsListener';

describe('PaymentsTable', () => {
  const mockPaidInstallment: PaidInstallmentDTO = {
    iud: 'test-iud-1',
    iuv: 'test-iuv-1',
    amount: 100.5,
    paymentDateTime: '2023-01-01T10:30:00Z',
    receiptCreationDate: '2023-01-02T15:45:00Z',
    organizationId: 123
  };

  const mockData: PagedPaidInstallmentsDTO = {
    content: [mockPaidInstallment],
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 10
  };

  const baseProps: PaymentsTableProps = {
    data: mockData,
    onSelectionChange: vi.fn(),
    onFiltersApplied: vi.fn(),
    onFilterValidationError: vi.fn(),
    initialFilters: {},
    isLoading: false,
    disabled: false,
    autoLoadOnMount: true,
    selectedIuds: []
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock return value for useHashParamsListener
    (useHashParamsListener as Mock).mockReturnValue({
      page: '1',
      size: '10',
      sortField: 'paymentDateTime',
      sortDirection: 'desc'
    });

    // Reset mock filters
    mockUsePaymentsTableFilters.draftFilters = {};
    mockUsePaymentsTableFilters.updateDraftFilters.mockClear();
    mockUsePaymentsTableFilters.applyFilters.mockClear();
    mockUsePaymentsTableFilters.handleDateFromChange.mockClear();
    mockUsePaymentsTableFilters.handleDateToChange.mockClear();
  });

  it('renders filters and table columns', () => {
    render(<PaymentsTable {...baseProps} />);

    expect(screen.getByLabelText('Cerca IUV')).toBeInTheDocument();
    expect(screen.getByText('Cerca')).toBeInTheDocument();

    expect(screen.getByText('IUV')).toBeInTheDocument();
    expect(screen.getByText('Importo')).toBeInTheDocument();
    expect(screen.getByText('Data esito')).toBeInTheDocument();
    expect(screen.getByText('Ultimo aggiornamento')).toBeInTheDocument();
  });

  it('calls updateDraftFilters on IUV input change', () => {
    render(<PaymentsTable {...baseProps} />);

    const input = screen.getByLabelText('Cerca IUV');
    fireEvent.change(input, { target: { value: 'test-iuv' } });

    expect(mockUsePaymentsTableFilters.updateDraftFilters).toHaveBeenCalledWith(
      { iuv: 'test-iuv' }
    );
  });

  it('calls applyFilters on search button click', () => {
    render(<PaymentsTable {...baseProps} />);

    const button = screen.getByText('Cerca');
    fireEvent.click(button);

    expect(mockUsePaymentsTableFilters.applyFilters).toHaveBeenCalled();
  });

  it('disables search button when disabled prop is true', () => {
    render(<PaymentsTable {...baseProps} disabled={true} />);

    const button = screen.getByText('Cerca');
    expect(button).toBeDisabled();
  });

  it('calls date filter change handlers', () => {
    render(<PaymentsTable {...baseProps} />);

    expect(mockUsePaymentsTableFilters.handleDateFromChange).toBeDefined();
    expect(mockUsePaymentsTableFilters.handleDateToChange).toBeDefined();
  });

  it('renders table rows correctly', () => {
    render(<PaymentsTable {...baseProps} />);

    expect(screen.getByText('test-iuv-1')).toBeInTheDocument();
    expect(screen.getByText('1,01 €')).toBeInTheDocument();
    expect(screen.getByText('01/01/2023')).toBeInTheDocument();
    expect(screen.getByText('02/01/2023')).toBeInTheDocument();
  });

  it('handles row selection and calls onSelectionChange with iuds', async () => {
    render(<PaymentsTable {...baseProps} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);

    await waitFor(() => {
      expect(baseProps.onSelectionChange).toHaveBeenCalled();
      const calls = (baseProps.onSelectionChange as Mock).mock.calls;
      const selectedIds = calls[0][0];
      expect(Array.isArray(selectedIds)).toBe(true);
      expect(selectedIds[0]).toContain('test-iud-1');
    });
  });

  it('shows rows as selected based on selectedIuds prop', () => {
    render(<PaymentsTable {...baseProps} selectedIuds={['test-iud-1']} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[1]).toBeChecked();
  });

  it('opens detail page in new tab when action button clicked', () => {
    const mockWindowOpen = vi.fn();
    Object.defineProperty(window, 'open', {
      writable: true,
      value: mockWindowOpen
    });
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { origin: 'https://test-app.com' }
    });

    render(<PaymentsTable {...baseProps} />);

    const actionCell = screen.getByRole('gridcell', { name: '' });
    const button = actionCell.querySelector('button');
    if (button) {
      fireEvent.click(button);
    }

    expect(mockWindowOpen).toHaveBeenCalledTimes(1);
    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('/telematic-receipt'),
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('renders empty state text when no data', () => {
    const emptyData = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10
    };

    render(<PaymentsTable {...baseProps} data={emptyData} />);

    expect(screen.getByText('Nessun dato disponibile')).toBeInTheDocument();
  });

  it('renders loading spinner when isLoading is true', () => {
    render(<PaymentsTable {...baseProps} isLoading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
