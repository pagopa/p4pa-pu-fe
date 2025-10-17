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
  DebtPositionStatus,
  DebtPositionOrigin
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

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
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
const publishMockMutate = vi.fn();
const deleteMockMutateAsync = vi.fn().mockResolvedValue(undefined);
const publishMockMutateAsync = vi.fn().mockResolvedValue(undefined);

vi.mock('../../api/debtPositions', () => ({
  default: {
    getDebtPositionDetail: vi.fn(),
    deleteDebtPosition: vi.fn().mockImplementation(() => ({
      mutate: deleteMockMutate,
      mutateAsync: deleteMockMutateAsync
    })),
    publishDebtPosition: vi.fn().mockImplementation(() => ({
      mutate: publishMockMutate,
      mutateAsync: publishMockMutateAsync
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
    },
    config: {
      deployPath: '/piattaformaunitaria'
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
    'commons.status.DRAFT': 'Draft',
    'commons.status.CANCELLED': 'Cancelled',
    'commons.status.EXPIRED': 'Expired',
    'commons.status.INVALID': 'Invalid',
    'commons.status.UNPAYABLE': 'Unpayable',
    'commons.status.PARTIALLY_PAID': 'Partially Paid',
    'commons.DP_STATUS.UNKNOWN': 'Unknown',
    'commons.delete': 'Delete',
    'commons.close': 'Close',
    'commons.NO_EVENTS': 'No events available',
    'debtPositionDetail.confirmDialog.title': 'Confirm Delete',
    'debtPositionDetail.confirmDialog.description':
      'Are you sure you want to delete this debt position?',
    'debtPositionDetail.confirmDialog.descriptionDraft':
      'This debt position is in draft state',
    'debtPositionDetail.errorDialog.title': 'Cannot Delete',
    'debtPositionDetail.errorDialog.description':
      'This debt position cannot be deleted',
    'debtPositionDetail.toSyncErrorDialog.description':
      'Le posizioni debitorie in stato "Da sincronizzare" non possono essere eliminate. Si prega di ricaricare la pagina o riprovare più tardi.',
    'debtPositionDetail.edit': 'Edit',
    'debtPositionDetail.editErrorDialog.title': 'Cannot Edit',
    'debtPositionDetail.editErrorDialog.description':
      'This debt position cannot be edited',
    'debtPositionDetail.toSyncEditErrorDialog.description':
      'Le posizioni debitorie in stato "Da sincronizzare" non possono essere modificate. Si prega di ricaricare la pagina o riprovare più tardi.',
    'debtPositionDetail.publishDialog.title': 'Activate Payment?',
    'debtPositionDetail.publishDialog.description':
      "The debt position will change to 'Unpaid' status and payment notices will be generated.",
    'debtPositionDetail.publishDialog.confirmLabel': 'Activate',
    'debtPositionDetail.publishError': 'Error publishing debt position',
    'debtPositionDetail.downloadNotices': 'Download Notices',
    'debtPositionDetail.activePayment': 'Active Payment',
    'debtPositionDetail.timeline.title': 'Timeline',
    'debtPositionDetail.timeline.message': 'Message',
    'debtPositionDetail.dialogDownload.title': 'Cannot Download Notices',
    'debtPositionDetail.dialogDownload.message':
      'Notices can only be downloaded for unpaid or partially paid debt positions',
    'debtPositionDetail.deleteError': 'Error deleting debt position',
    'commons.files.downloadFailed': 'Download failed',
    'commons.files.missingDebtPositionId': 'Missing debt position ID',
    'commons.DP_DESCRIPTION.DP_CREATED': 'Debt position created',
    'commons.DP_DESCRIPTION.DP_UPDATED': 'Debt position updated',
    'commons.DP_STATUS.DP_CREATED': 'Created',
    'commons.DP_STATUS.DP_UPDATED': 'Updated'
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
    mockDebtPositionDetail.status = DebtPositionStatus.DRAFT;

    render(<DebtPositionDetail />);

    const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
    expect(menuButton).not.toBeNull();

    if (menuButton) {
      fireEvent.click(menuButton);

      await vi.waitFor(() => {
        const deleteOption = screen.getByTestId('DeleteIcon').closest('li');
        expect(deleteOption).toBeVisible();

        if (deleteOption) {
          fireEvent.click(deleteOption);
        }
      });

      await vi.waitFor(() => {
        const dialogTitle = screen.getByText('Confirm Delete');
        expect(dialogTitle).toBeVisible();

        const deleteButton = screen.getByRole('button', { name: 'Delete' });
        expect(deleteButton).toBeVisible();

        const closeButton = screen.getByRole('button', { name: 'Close' });
        expect(closeButton).toBeVisible();
      });
    }
  });

  it('calls deleteDebtPosition when delete is confirmed', async () => {
    mockDebtPositionDetail.status = DebtPositionStatus.DRAFT;

    render(<DebtPositionDetail />);

    const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
    expect(menuButton).not.toBeNull();

    if (menuButton) {
      fireEvent.click(menuButton);

      await vi.waitFor(() => {
        const deleteOption = screen.getByTestId('DeleteIcon').closest('li');
        if (deleteOption) {
          fireEvent.click(deleteOption);
        }
      });

      await vi.waitFor(() => {
        const dialogTitle = screen.getByText('Confirm Delete');
        expect(dialogTitle).toBeVisible();
      });

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      expect(deleteButton).toBeVisible();

      fireEvent.click(deleteButton);

      await vi.waitFor(() => {
        expect(deleteMockMutateAsync).toHaveBeenCalled();
      });
    }
  });

  it('closes dialog without deleting when cancel is clicked', async () => {
    mockDebtPositionDetail.status = DebtPositionStatus.DRAFT;

    render(<DebtPositionDetail />);

    const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
    expect(menuButton).not.toBeNull();

    if (menuButton) {
      fireEvent.click(menuButton);

      await vi.waitFor(() => {
        const deleteOption = screen.getByTestId('DeleteIcon').closest('li');
        if (deleteOption) {
          fireEvent.click(deleteOption);
        }
      });

      await vi.waitFor(() => {
        const dialogTitle = screen.getByText('Confirm Delete');
        expect(dialogTitle).toBeVisible();
      });

      const closeButton = screen.getByRole('button', { name: 'Close' });
      expect(closeButton).toBeVisible();

      fireEvent.click(closeButton);

      await vi.waitFor(() => {
        expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
      });

      expect(deleteMockMutateAsync).not.toHaveBeenCalled();
    }
  });

  it('shows error dialog when trying to delete a debt position that cannot be deleted', async () => {
    mockDebtPositionDetail.status = DebtPositionStatus.PAID;

    render(<DebtPositionDetail />);

    const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
    expect(menuButton).not.toBeNull();

    if (menuButton) {
      fireEvent.click(menuButton);

      await vi.waitFor(() => {
        const deleteOption = screen.getByTestId('DeleteIcon').closest('li');
        if (deleteOption) {
          fireEvent.click(deleteOption);
        }
      });

      await vi.waitFor(() => {
        const dialogTitle = screen.getByText('Cannot Delete');
        expect(dialogTitle).toBeVisible();

        const dialogMessage = screen.getByText(
          'This debt position cannot be deleted'
        );
        expect(dialogMessage).toBeVisible();
      });

      const closeButton = screen.getByRole('button', { name: 'Close' });
      expect(closeButton).toBeVisible();

      fireEvent.click(closeButton);

      await vi.waitFor(() => {
        expect(screen.queryByText('Cannot Delete')).not.toBeInTheDocument();
      });

      expect(deleteMockMutateAsync).not.toHaveBeenCalled();
    }
  });

  it('handles debt position in DRAFT status when clicking action button', () => {
    mockDebtPositionDetail.status = DebtPositionStatus.DRAFT;

    render(<DebtPositionDetail />);

    const actionButton = screen.getByText('Active Payment').closest('button');
    expect(actionButton).not.toBeNull();
  });

  it('hides menu when debt position is CANCELLED', () => {
    mockDebtPositionDetail.status = DebtPositionStatus.CANCELLED;

    render(<DebtPositionDetail />);

    expect(screen.queryByTestId('MoreVertIcon')).not.toBeInTheDocument();
  });

  it('returns null when debtPositionDetail is not available', () => {
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

    const { container } = render(<DebtPositionDetail />);

    expect(container.firstChild).toBeNull();
  });

  it('handles unknown status', () => {
    const mockData = { ...mockDebtPositionDetail };
    mockData.status = 'UNKNOWN_STATUS' as DebtPositionStatus;

    vi.mocked(debtPositions.getDebtPositionDetail).mockReturnValue({
      data: mockData,
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

    expect(screen.getByText('Unknown')).toBeDefined();
  });

  it('uses debt position description as title when available', () => {
    const mockData = { ...mockDebtPositionDetail };
    mockData.description = 'Custom Description';

    vi.mocked(debtPositions.getDebtPositionDetail).mockReturnValue({
      data: mockData,
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

    expect(screen.getByText('Custom Description')).toBeDefined();
  });

  it('handles installment with undefined status creating undefined chip', () => {
    const mockData = { ...mockDebtPositionDetail };

    mockData.paymentOptions = [
      {
        paymentOptionId: 999,
        debtPositionId: 10,
        totalAmountCents: 1000,
        status: PaymentOptionStatus.REPORTED,
        paymentOptionType: PaymentOptionTypeEnum.SINGLE_INSTALLMENT,
        paymentOptionIndex: 1,
        installments: []
      }
    ];

    vi.mocked(debtPositions.getDebtPositionDetail).mockReturnValue({
      data: mockData,
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

    expect(() => render(<DebtPositionDetail />)).not.toThrow();
  });

  it('handles payment option with undefined status', () => {
    const mockData = { ...mockDebtPositionDetail };
    const paymentOptionWithoutStatus = {
      ...mockData.paymentOptions![0]
    };
    delete (
      paymentOptionWithoutStatus as Partial<typeof paymentOptionWithoutStatus>
    ).status;

    mockData.paymentOptions = [paymentOptionWithoutStatus];

    vi.mocked(debtPositions.getDebtPositionDetail).mockReturnValue({
      data: mockData,
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

    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
  });

  it('handles edit action for editable debt position', () => {
    const mockData = { ...mockDebtPositionDetail };
    mockData.status = DebtPositionStatus.DRAFT;
    mockData.debtPositionOrigin = DebtPositionOrigin.ORDINARY;
    mockData.paymentOptions = [mockData.paymentOptions![0]];

    vi.mocked(debtPositions.getDebtPositionDetail).mockReturnValue({
      data: mockData,
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

    const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
    expect(menuButton).not.toBeNull();

    if (menuButton) {
      fireEvent.click(menuButton);

      expect(screen.getByText('Edit')).toBeDefined();
    }
  });

  it('shows menu without edit option when showEditOption is false', () => {
    const mockData = { ...mockDebtPositionDetail };
    mockData.debtPositionOrigin = DebtPositionOrigin.RECEIPT_FILE;

    vi.mocked(debtPositions.getDebtPositionDetail).mockReturnValue({
      data: mockData,
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

    const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
    expect(menuButton).not.toBeNull();

    if (menuButton) {
      fireEvent.click(menuButton);

      expect(screen.queryByText('Edit')).not.toBeInTheDocument();

      expect(screen.getByText('Delete')).toBeDefined();
    }
  });

  it('shows timeline with no events message when registries are empty', () => {
    vi.mocked(debtPositions.getDebtPositionRegistriesMutation).mockReturnValue({
      mutate: vi.fn(),
      data: [],
      error: null,
      variables: undefined,
      isError: false,
      isIdle: false,
      isPending: false,
      isSuccess: true,
      status: 'success',
      reset: vi.fn(),
      mutateAsync: vi.fn(),
      isPaused: false,
      failureCount: 0,
      failureReason: null,
      submittedAt: 0
    } as any);

    render(<DebtPositionDetail />);

    const historyButton = screen.getByTestId('HistoryButton').closest('button');
    expect(historyButton).not.toBeNull();

    if (historyButton) {
      fireEvent.click(historyButton);

      expect(screen.getByText('No events available')).toBeDefined();
    }
  });

  it('shows active payment button for DRAFT status and opens publish dialog on click', () => {
    const mockData = { ...mockDebtPositionDetail };
    mockData.status = DebtPositionStatus.DRAFT;

    vi.mocked(debtPositions.getDebtPositionDetail).mockReturnValue({
      data: mockData,
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

    const activePaymentButton = screen.getByText('Active Payment');
    expect(activePaymentButton).toBeDefined();

    fireEvent.click(activePaymentButton);

    const publishDialog = screen.getByTestId('confirm-publish-dialog');
    expect(publishDialog).toBeDefined();
    expect(screen.getByText('Activate Payment?')).toBeDefined();
    expect(
      screen.getByText(
        "The debt position will change to 'Unpaid' status and payment notices will be generated."
      )
    ).toBeDefined();
    expect(screen.getByText('Activate')).toBeDefined();
  });

  it('calls publishDebtPosition mutation when confirm button is clicked in publish dialog', () => {
    const mockData = { ...mockDebtPositionDetail };
    mockData.status = DebtPositionStatus.DRAFT;

    vi.mocked(debtPositions.getDebtPositionDetail).mockReturnValue({
      data: mockData,
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

    const activePaymentButton = screen.getByText('Active Payment');
    fireEvent.click(activePaymentButton);

    const activateButton = screen.getByTestId(
      'confirm-publish-dialog-confirm-button'
    );
    fireEvent.click(activateButton);

    expect(publishMockMutateAsync).toHaveBeenCalled();
  });

  it('closes publish dialog when cancel button is clicked', () => {
    const mockData = { ...mockDebtPositionDetail };
    mockData.status = DebtPositionStatus.DRAFT;

    vi.mocked(debtPositions.getDebtPositionDetail).mockReturnValue({
      data: mockData,
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

    const activePaymentButton = screen.getByText('Active Payment');
    fireEvent.click(activePaymentButton);

    expect(screen.getByTestId('confirm-publish-dialog')).toBeDefined();

    const cancelButton = screen.getByTestId(
      'confirm-publish-dialog-cancel-button'
    );
    fireEvent.click(cancelButton);

    expect(
      screen.queryByTestId('confirm-publish-dialog')
    ).not.toBeInTheDocument();
  });

  it('shows download notices button for non-DRAFT status', () => {
    const mockData = { ...mockDebtPositionDetail };
    mockData.status = DebtPositionStatus.UNPAID;

    vi.mocked(debtPositions.getDebtPositionDetail).mockReturnValue({
      data: mockData,
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

    expect(screen.getByText('Download Notices')).toBeDefined();
    expect(screen.queryByText('Active Payment')).not.toBeInTheDocument();
  });

  it('shows specific error dialog when trying to delete a debt position with TO_SYNC status', async () => {
    mockDebtPositionDetail.status = DebtPositionStatus.TO_SYNC;

    render(<DebtPositionDetail />);

    const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
    expect(menuButton).not.toBeNull();

    if (menuButton) {
      fireEvent.click(menuButton);

      await vi.waitFor(() => {
        const deleteOption = screen.getByTestId('DeleteIcon').closest('li');
        if (deleteOption) {
          fireEvent.click(deleteOption);
        }
      });

      await vi.waitFor(() => {
        const dialogTitle = screen.getByText('Cannot Delete');
        expect(dialogTitle).toBeVisible();

        const dialogMessage = screen.getByText(
          'Le posizioni debitorie in stato "Da sincronizzare" non possono essere eliminate. Si prega di ricaricare la pagina o riprovare più tardi.'
        );
        expect(dialogMessage).toBeVisible();

        const closeButton = screen.getByRole('button', { name: 'Close' });
        expect(closeButton).toBeVisible();

        const deleteButton = screen.queryByRole('button', { name: 'Delete' });
        expect(deleteButton).not.toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: 'Close' });
      fireEvent.click(closeButton);

      await vi.waitFor(() => {
        expect(screen.queryByText('Cannot Delete')).not.toBeInTheDocument();
      });

      expect(deleteMockMutateAsync).not.toHaveBeenCalled();
    }
  });

  it('shows specific error dialog when trying to edit a debt position with TO_SYNC status', async () => {
    const mockData = { ...mockDebtPositionDetail };
    mockData.status = DebtPositionStatus.TO_SYNC;
    mockData.debtPositionOrigin = DebtPositionOrigin.ORDINARY;
    mockData.paymentOptions = [mockData.paymentOptions![0]];

    vi.mocked(debtPositions.getDebtPositionDetail).mockReturnValue({
      data: mockData,
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

    const menuButton = screen.getByTestId('MoreVertIcon').closest('button');
    expect(menuButton).not.toBeNull();

    if (menuButton) {
      fireEvent.click(menuButton);

      await vi.waitFor(() => {
        const editOption = screen.getByTestId('EditIcon').closest('li');
        expect(editOption).toBeVisible();

        if (editOption) {
          fireEvent.click(editOption);
        }
      });

      await vi.waitFor(() => {
        const dialogTitle = screen.getByText('Cannot Edit');
        expect(dialogTitle).toBeVisible();

        const dialogMessage = screen.getByText(
          'Le posizioni debitorie in stato "Da sincronizzare" non possono essere modificate. Si prega di ricaricare la pagina o riprovare più tardi.'
        );
        expect(dialogMessage).toBeVisible();

        const closeButton = screen.getByRole('button', { name: 'Close' });
        expect(closeButton).toBeVisible();
      });

      const closeButton = screen.getByRole('button', { name: 'Close' });
      fireEvent.click(closeButton);

      await vi.waitFor(() => {
        expect(screen.queryByText('Cannot Edit')).not.toBeInTheDocument();
      });
    }
  });
});
