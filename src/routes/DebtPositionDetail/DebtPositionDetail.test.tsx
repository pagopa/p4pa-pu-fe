/* eslint-disable @typescript-eslint/no-explicit-any */
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../__tests__/renderers';
import DebtPositionDetail from './DebtPositionDetail';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import {
  debtPositionDetailDTOSchema,
  personDTOSchema
} from '../../../generated/zod-schema';
import { createMock } from 'zodock';
import debtPositions from '../../api/debtPositions';
import { DebtPositionDetailDTO } from '../../../generated/apiClient';
import { UseQueryResult } from '@tanstack/react-query';
import {
  InstallmentStatus,
  PaymentOptionTypeEnum,
  PaymentOptionStatus,
  DebtPositionStatus
} from '../../../generated/data-contracts';
import * as utils from '../../utils/download';

const mockDebtPositionDetail = createMock(debtPositionDetailDTOSchema);

const mockDebtor = createMock(personDTOSchema);

mockDebtPositionDetail.paymentOptions = [
  {
    paymentOptionId: 101,
    debtPositionId: 10,
    totalAmountCents: 5400,
    status: PaymentOptionStatus.REPORTED,
    paymentOptionType: PaymentOptionTypeEnum.SINGLE_INSTALLMENT,
    paymentOptionIndex: 1,
    installments: [
      {
        installmentId: 1,
        status: InstallmentStatus.PAID,
        iuv: 'TEST_IUV_SINGLE',
        debtor: mockDebtor,
        amountCents: 5400,
        remittanceInformation: 'Pagamento singolo',
        transfers: []
      }
    ]
  },
  {
    paymentOptionId: 102,
    debtPositionId: 10,
    totalAmountCents: 5400,
    status: PaymentOptionStatus.REPORTED,
    paymentOptionType: PaymentOptionTypeEnum.INSTALLMENTS,
    paymentOptionIndex: 2,
    installments: [
      {
        installmentId: 2,
        status: InstallmentStatus.UNPAID,
        iuv: 'TEST_IUV_MULTI',
        debtor: mockDebtor,
        amountCents: 5400,
        remittanceInformation: 'Pagamento multiplo',
        transfers: []
      }
    ]
  },
  {
    paymentOptionId: 103,
    debtPositionId: 10,
    totalAmountCents: 5400,
    status: PaymentOptionStatus.REPORTED,
    paymentOptionType: PaymentOptionTypeEnum.DOWN_PAYMENT,
    paymentOptionIndex: 3,
    installments: [
      {
        installmentId: 3,
        status: InstallmentStatus.REPORTED,
        iuv: 'TEST_IUV_DOWN',
        debtor: mockDebtor,
        amountCents: 5400,
        remittanceInformation: 'Acconto',
        transfers: []
      }
    ]
  }
];

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '10' }),
    Navigate: vi.fn(({ to }) => <div>Navigate to {to}</div>),
    useNavigate: () => vi.fn(),
    createBrowserRouter: vi.fn()
  };
});

vi.mock('../../store/GlobalStore', () => ({
  useStore: () => ({
    state: {
      ORGANIZATION_ID: '3',
      APP_STATE: { loading: false, customBreadcrumbsItems: [] }
    }
  }),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

const mockResult = {
  data: new Blob(['test data'], { type: 'application/zip' }),
  fileName: 'test-file.zip'
};
const mockMutate = vi.fn().mockReturnValue(mockResult);
const deleteMockMutate = vi.fn();

vi.mock('../../api/debtPositions', () => ({
  default: {
    getDebtPositionDetail: vi.fn(),
    deleteDebtPosition: vi.fn().mockImplementation(() => ({
      mutate: deleteMockMutate
    })),
    getDebtPositionZipFile: vi.fn().mockImplementation(() => ({
      mutateAsync: mockMutate
    })),
    downloadDebtPositionZip: vi.fn(),
    getDebtPositionRegistriesMutation: vi.fn().mockReturnValue({
      mutate: vi.fn(),
      data: [],
      isLoading: false,
      isError: false,
      isSuccess: false
    })
  }
}));

vi.mock('../../utils/download', () => ({
  downloadBlob: vi.fn()
}));

vi.mock('../../utils', () => ({
  default: {
    notify: {
      emit: vi.fn()
    }
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
    'commons.status.PAID': 'Paid',
    'commons.status.UNPAID': 'Unpaid',
    'commons.status.REPORTED': 'Reported',
    'commons.status.TO_SYNC': 'To Sync',
    'commons.delete': 'Delete',
    'commons.close': 'Close',
    'debtPositionDetail.confirmDialog.title': 'Confirm Delete',
    'debtPositionDetail.confirmDialog.description':
      'Are you sure you want to delete this debt position?',
    'debtPositionDetail.errorDialog.title': 'Cannot Delete',
    'debtPositionDetail.errorDialog.description':
      'This debt position cannot be deleted',
    'debtPositionDetail.edit': 'Edit',
    'debtPositionDetail.downloadNotices': 'Download Notices',
    'debtPositionDetail.timeline.title': 'Timeline',
    'debtPositionDetail.timeline.message': 'Message',
    'debtPositionDetail.dialogDownload.title': 'Cannot Download Notices',
    'debtPositionDetail.dialogDownload.message':
      'Notices can only be downloaded for unpaid or partially paid debt positions',
    'commons.files.downloadFailed': 'Download failed',
    'commons.files.missingDebtPositionId': 'Missing debt position ID'
  });

  mockDebtPositionDetail.status = DebtPositionStatus.UNPAID;

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
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
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

  it('opens history drawer when history button is clicked', () => {
    render(<DebtPositionDetail />);

    const historyButton = screen.getByTestId('HistoryButton').closest('button');
    expect(historyButton).not.toBeNull();

    if (historyButton) {
      fireEvent.click(historyButton);
      const drawerTitle = screen.getByText('Timeline');
      expect(drawerTitle).toBeVisible();
    }
  });

  it('calls getDebtPositionZipFile mutation when download button is clicked and status is UNPAID', async () => {
    mockDebtPositionDetail.status = DebtPositionStatus.UNPAID;

    render(<DebtPositionDetail />);

    const downloadButton = screen
      .getByTestId('DownloadButton')
      .closest('button');
    expect(downloadButton).not.toBeNull();

    if (downloadButton) {
      fireEvent.click(downloadButton);

      await vi.waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(10);
        expect(utils.downloadBlob).toHaveBeenCalledWith(
          mockResult.data,
          mockResult.fileName
        );
      });
    }
  });

  it('calls getDebtPositionZipFile mutation function when download button is clicked and status is PARTIALLY_PAID', async () => {
    mockDebtPositionDetail.status = DebtPositionStatus.PARTIALLY_PAID;

    render(<DebtPositionDetail />);

    const downloadButton = screen
      .getByTestId('DownloadButton')
      .closest('button');
    expect(downloadButton).not.toBeNull();

    if (downloadButton) {
      fireEvent.click(downloadButton);

      await vi.waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(10);
        expect(utils.downloadBlob).toHaveBeenCalledWith(
          mockResult.data,
          mockResult.fileName
        );
      });
    }
  });

  it('shows dialog when download button is clicked and status is not UNPAID or PARTIALLY_PAID', async () => {
    mockDebtPositionDetail.status = DebtPositionStatus.PAID;

    render(<DebtPositionDetail />);

    const downloadButton = screen
      .getByTestId('DownloadButton')
      .closest('button');
    expect(downloadButton).not.toBeNull();

    if (downloadButton) {
      fireEvent.click(downloadButton);

      await vi.waitFor(() => {
        expect(screen.getByText('Cannot Download Notices')).toBeVisible();
        expect(
          screen.getByText(
            'Notices can only be downloaded for unpaid or partially paid debt positions'
          )
        ).toBeVisible();
        expect(mockMutate).not.toHaveBeenCalled();
      });
    }
  });

  it('handles error when downloadDebtPositionZip fails', async () => {
    mockDebtPositionDetail.status = DebtPositionStatus.UNPAID;

    vi.mocked(debtPositions.getDebtPositionZipFile).mockReturnValue({
      mutateAsync: mockMutate.mockRejectedValue(new Error('Download failed'))
    } as any);

    render(<DebtPositionDetail />);

    const downloadButton = screen
      .getByTestId('DownloadButton')
      .closest('button');
    expect(downloadButton).not.toBeNull();

    if (downloadButton) {
      fireEvent.click(downloadButton);

      await vi.waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(10);
        expect(utils.downloadBlob).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalled();
      });
    }
  });

  it('closes dialog when confirm button is clicked', async () => {
    mockDebtPositionDetail.status = DebtPositionStatus.PAID;

    render(<DebtPositionDetail />);

    const downloadButton = screen
      .getByTestId('DownloadButton')
      .closest('button');
    expect(downloadButton).not.toBeNull();

    if (downloadButton) {
      fireEvent.click(downloadButton);

      await vi.waitFor(() => {
        expect(screen.getByText('Cannot Download Notices')).toBeVisible();
      });

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      await vi.waitFor(() => {
        expect(
          screen.queryByText('Cannot Download Notices')
        ).not.toBeInTheDocument();
      });
    }
  });

  it('shows delete confirmation dialog when delete option is clicked', async () => {
    // Imposta lo stato della debt position per renderla eliminabile
    mockDebtPositionDetail.status = DebtPositionStatus.DRAFT;

    render(<DebtPositionDetail />);

    // Clicca sul pulsante del menu
    const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
    expect(menuButton).not.toBeNull();

    if (menuButton) {
      fireEvent.click(menuButton);

      // Attendi che il menu sia visibile
      await vi.waitFor(() => {
        const deleteOption = screen.getByTestId('DeleteIcon').closest('li');
        expect(deleteOption).toBeVisible();

        // Clicca sull'opzione di eliminazione
        if (deleteOption) {
          fireEvent.click(deleteOption);
        }
      });

      // Verifica che il dialog di conferma sia visualizzato
      await vi.waitFor(() => {
        const dialogTitle = screen.getByText('Confirm Delete');
        expect(dialogTitle).toBeVisible();

        // Verifica che ci siano i pulsanti di conferma e annullamento
        const deleteButton = screen.getByRole('button', { name: 'Delete' });
        expect(deleteButton).toBeVisible();

        const closeButton = screen.getByRole('button', { name: 'Close' });
        expect(closeButton).toBeVisible();
      });
    }
  });

  it('calls deleteDebtPosition when delete is confirmed', async () => {
    // Imposta lo stato della debt position per renderla eliminabile
    mockDebtPositionDetail.status = DebtPositionStatus.DRAFT;

    render(<DebtPositionDetail />);

    // Clicca sul pulsante del menu
    const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
    expect(menuButton).not.toBeNull();

    if (menuButton) {
      fireEvent.click(menuButton);

      // Attendi che il menu sia visibile e clicca su Delete
      await vi.waitFor(() => {
        const deleteOption = screen.getByTestId('DeleteIcon').closest('li');
        if (deleteOption) {
          fireEvent.click(deleteOption);
        }
      });

      // Verifica che il dialog di conferma sia visualizzato
      await vi.waitFor(() => {
        const dialogTitle = screen.getByText('Confirm Delete');
        expect(dialogTitle).toBeVisible();
      });

      // Trova direttamente il pulsante Delete nel dialogo
      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      expect(deleteButton).toBeVisible();

      // Clicca sul pulsante di conferma
      fireEvent.click(deleteButton);

      // Verifica che la funzione di eliminazione sia stata chiamata
      await vi.waitFor(() => {
        expect(deleteMockMutate).toHaveBeenCalled();
      });
    }
  });

  it('closes dialog without deleting when cancel is clicked', async () => {
    // Imposta lo stato della debt position per renderla eliminabile
    mockDebtPositionDetail.status = DebtPositionStatus.DRAFT;

    render(<DebtPositionDetail />);

    // Clicca sul pulsante del menu
    const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
    expect(menuButton).not.toBeNull();

    if (menuButton) {
      fireEvent.click(menuButton);

      // Attendi che il menu sia visibile e clicca su Delete
      await vi.waitFor(() => {
        const deleteOption = screen.getByTestId('DeleteIcon').closest('li');
        if (deleteOption) {
          fireEvent.click(deleteOption);
        }
      });

      // Verifica che il dialog di conferma sia visualizzato
      await vi.waitFor(() => {
        const dialogTitle = screen.getByText('Confirm Delete');
        expect(dialogTitle).toBeVisible();
      });

      // Trova direttamente il pulsante Close nel dialogo
      const closeButton = screen.getByRole('button', { name: 'Close' });
      expect(closeButton).toBeVisible();

      // Clicca sul pulsante Close
      fireEvent.click(closeButton);

      // Verifica che il dialog sia stato chiuso
      await vi.waitFor(() => {
        expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
      });

      // Verifica che la funzione di eliminazione NON sia stata chiamata
      expect(deleteMockMutate).not.toHaveBeenCalled();
    }
  });

  it('shows error dialog when trying to delete a debt position that cannot be deleted', async () => {
    // Imposta lo stato della debt position per renderla non eliminabile
    mockDebtPositionDetail.status = DebtPositionStatus.PAID;

    render(<DebtPositionDetail />);

    // Clicca sul pulsante del menu
    const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
    expect(menuButton).not.toBeNull();

    if (menuButton) {
      fireEvent.click(menuButton);

      // Attendi che il menu sia visibile e clicca su Delete
      await vi.waitFor(() => {
        const deleteOption = screen.getByTestId('DeleteIcon').closest('li');
        if (deleteOption) {
          fireEvent.click(deleteOption);
        }
      });

      // Verifica che il dialog di errore sia visualizzato
      await vi.waitFor(() => {
        const dialogTitle = screen.getByText('Cannot Delete');
        expect(dialogTitle).toBeVisible();

        const dialogMessage = screen.getByText(
          'This debt position cannot be deleted'
        );
        expect(dialogMessage).toBeVisible();
      });

      // Trova direttamente il pulsante Close nel dialogo
      const closeButton = screen.getByRole('button', { name: 'Close' });
      expect(closeButton).toBeVisible();

      // Clicca sul pulsante Close
      fireEvent.click(closeButton);

      // Verifica che il dialog sia stato chiuso
      await vi.waitFor(() => {
        expect(screen.queryByText('Cannot Delete')).not.toBeInTheDocument();
      });

      // Verifica che la funzione di eliminazione NON sia stata chiamata
      expect(deleteMockMutate).not.toHaveBeenCalled();
    }
  });
});
