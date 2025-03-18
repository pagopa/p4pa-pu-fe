import { screen, fireEvent } from '@testing-library/react';
import DebtPositionDetail from './DebtPositionDetail';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { render } from '../../__tests__/renderers';
import { debtPositionDetailDTOSchema } from '../../../generated/zod-schema';
import { createMock } from 'zodock';
import debtPositions from '../../api/debtPositions';
import { DebtPositionDetailDTO } from '../../../generated/apiClient';
import { UseQueryResult } from '@tanstack/react-query';

const mockDebtPositionDetail = createMock(debtPositionDetailDTOSchema);

mockDebtPositionDetail.paymentOptions = [
  ...(mockDebtPositionDetail.paymentOptions ?? []),
  {
    paymentOptionId: 101,
    debtPositionId: 10,
    totalAmountCents: 5400,
    status: 'REPORTED',
    paymentOptionType: 'SINGLE_INSTALLMENT',
    paymentOptionIndex: 1,
    installments: [
      {
        installmentId: 1,
        status: 'PAID',
        iuv: 'TEST_IUV_SINGLE'
      }
    ]
  },
  {
    paymentOptionId: 102,
    debtPositionId: 10,
    totalAmountCents: 5400,
    status: 'REPORTED',
    paymentOptionType: 'INSTALLMENTS',
    paymentOptionIndex: 2,
    installments: [
      {
        installmentId: 2,
        status: 'UNPAID',
        iuv: 'TEST_IUV_MULTI'
      }
    ]
  },
  {
    paymentOptionId: 103,
    debtPositionId: 10,
    totalAmountCents: 5400,
    status: 'REPORTED',
    paymentOptionType: 'DOWN_PAYMENT',
    paymentOptionIndex: 3,
    installments: [
      {
        installmentId: 3,
        status: 'REPORTED',
        iuv: 'TEST_IUV_DOWN'
      }
    ]
  }
];

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useParams: () => ({ id: '10' }),
  Navigate: vi.fn(({ to }) => <div>Navigate to {to}</div>)
}));

vi.mock('../../store/GlobalStore', () => ({
  useStore: () => ({
    state: { ORGANIZATION_ID: 3 }
  }),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

vi.mock('../../api/debtPositions', () => ({
  default: {
    getDebtPositionDetail: vi.fn()
  }
}));

beforeEach(() => {
  i18nTestSetup({
    'commons.debtor': 'Debtor',
    'commons.fiscalCodeorVat': 'Fiscal Code/VAT',
    'commons.duetype': 'Due Type',
    'commons.internalCode': 'Internal Code',
    'commons.paymentOptions.SINGLE_INSTALLMENT': 'One-off Payment',
    'commons.paymentOptions.INSTALLMENTS': 'Multiple Payments',
    'commons.paymentOptions.DOWN_PAYMENT': 'Down Payment',
    'commons.description': 'Description',
    'commons.amount': 'Amount',
    'commons.paid': 'Paid',
    'commons.unpaid': 'Unpaid',
    'commons.person': 'Person',
    'commons.personLegal': 'Legal Entity',
    'debtPositionDetail.debtPositionInfo': 'Debt Position Info',
    'debtPositionDetail.paymentOptions': 'Payment Options',
    'debtPositionDetail.solutionDetail': 'Solution Detail',
    'DebtPositions.Results.status.PAID': 'Paid',
    'DebtPositions.Results.status.UNPAID': 'Unpaid',
    'DebtPositions.Results.status.REPORTED': 'Reported',
    'DebtPositions.Results.status.TO_SYNC': 'To Sync'
  });

  vi.mocked(debtPositions.getDebtPositionDetail).mockReturnValue({
    data: mockDebtPositionDetail,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isRefetching: false,
    isSuccess: true,
    status: 'success',
    isFetching: false,
    isPaused: false,
    isPending: false,
    fetchStatus: 'idle'
  } as unknown as UseQueryResult<DebtPositionDetailDTO, Error>);
});

describe('DebtPositionDetail Component', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with correct title and debt position status chip', () => {
    render(<DebtPositionDetail />);

    const titleElements = screen.getAllByText(
      mockDebtPositionDetail.debtPositionTypeOrgDescription
    );
    expect(titleElements.length).toBeGreaterThan(0);

    const statusChips = screen.getAllByText((content) =>
      ['Paid', 'Unpaid', 'Reported', 'To Sync'].includes(content)
    );
    expect(statusChips.length).toBeGreaterThan(0);

    const chipElement = statusChips[0].closest('.MuiChip-root');
    expect(chipElement).not.toBeNull();

    expect(
      chipElement?.classList.contains('MuiChip-colorSuccess') ||
        chipElement?.classList.contains('MuiChip-colorError') ||
        chipElement?.classList.contains('MuiChip-colorInfo') ||
        chipElement?.classList.contains('MuiChip-colorDefault')
    ).toBe(true);
  });

  it('expands debt position info accordion when clicked', async () => {
    render(<DebtPositionDetail />);

    const accordionSummary = screen.getByText('Debt Position Info');
    expect(accordionSummary).toBeDefined();

    const button = accordionSummary.closest('[role="button"]');
    expect(button).not.toBeNull();

    if (button) {
      fireEvent.click(button);

      await vi.waitFor(
        () => {
          expect(screen.getByText('Debtor')).toBeDefined();

          if (mockDebtPositionDetail.debtor.fullName) {
            expect(
              screen.queryByText(mockDebtPositionDetail.debtor.fullName)
            ).toBeTruthy();
          }

          expect(screen.getByText('Fiscal Code/VAT')).toBeDefined();

          if (mockDebtPositionDetail.debtor.fiscalCode) {
            const fiscalCodeRegExp = new RegExp(
              mockDebtPositionDetail.debtor.fiscalCode
            );
            expect(screen.queryByText(fiscalCodeRegExp)).toBeTruthy();
          }
        },
        { timeout: 2000 }
      );
    }
  });

  it('correctly maps installment data for display', async () => {
    render(<DebtPositionDetail />);

    expect(screen.getByText('TEST_IUV_SINGLE')).toBeDefined();
    expect(screen.getByText('TEST_IUV_MULTI')).toBeDefined();
    expect(screen.getByText('TEST_IUV_DOWN')).toBeDefined();

    expect(screen.getAllByText('Paid').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Unpaid').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Reported').length).toBeGreaterThan(0);
  });

  it('renders all payment option types correctly', () => {
    render(<DebtPositionDetail />);

    expect(screen.getByText('Payment Options')).toBeDefined();

    expect(screen.getByText('One-off Payment')).toBeDefined();

    expect(screen.getByText('Multiple Payments')).toBeDefined();

    expect(screen.getByText('Down Payment')).toBeDefined();

    const sectionTitles = screen.getAllByText('Solution Detail');
    expect(sectionTitles.length).toBeGreaterThanOrEqual(3);

    const tables = screen.getAllByRole('grid');
    expect(tables.length).toBeGreaterThan(0);
  });

  it('correctly maps installment data for display', async () => {
    render(<DebtPositionDetail />);

    expect(screen.getByText('TEST_IUV_SINGLE')).toBeDefined();
    expect(screen.getByText('TEST_IUV_MULTI')).toBeDefined();
    expect(screen.getByText('TEST_IUV_DOWN')).toBeDefined();

    expect(screen.getAllByText('Paid').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Unpaid').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Reported').length).toBeGreaterThan(0);
  });

  it('triggers the history button callback when clicked', () => {
    render(<DebtPositionDetail />);

    const historyButton = screen.getByTestId('HistoryIcon').closest('button');
    expect(historyButton).not.toBeNull();

    if (historyButton) {
      fireEvent.click(historyButton);
      expect(console.log).toHaveBeenCalledWith('History clicked');
    }
  });

  it('shows a loading spinner when data is loading', () => {
    vi.mocked(debtPositions.getDebtPositionDetail).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isRefetching: false,
      isSuccess: false,
      status: 'loading',
      isFetching: true,
      isPaused: false,
      isPending: true,
      fetchStatus: 'fetching'
    } as unknown as UseQueryResult<DebtPositionDetailDTO, Error>);

    render(<DebtPositionDetail />);

    expect(screen.getByRole('progressbar')).toBeDefined();
  });

  it('shows error message when data is not found', () => {
    vi.mocked(debtPositions.getDebtPositionDetail).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isRefetching: false,
      isSuccess: true,
      status: 'success',
      isFetching: false,
      isPaused: false,
      isPending: false,
      fetchStatus: 'idle'
    } as unknown as UseQueryResult<DebtPositionDetailDTO, Error>);

    render(<DebtPositionDetail />);

    expect(
      screen.getByText('Dati della posizione debitoria non trovati')
    ).toBeDefined();
  });
});
