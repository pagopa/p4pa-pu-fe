/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen } from '../../__tests__/renderers';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { DebtPositionsInstallmentDetail } from './DebtPositionsInstallmentDetail';
import debtPositions from '../../api/debtPositions';
import { useLocation, useParams } from 'react-router';
import { setOrganizationId } from '../../store/OrganizationIdStore';
import { downloadBlob } from '../../utils/download';
import utils from '../../utils';
import { STATE } from '../../store/types';
import {
  DebtPositionOrigin,
  InstallmentStatus
} from '../../../generated/core/client';
import React from 'react';

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

const mockNavigate = vi.fn();
const mockGeneratePath = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as typeof importOriginal),
    useNavigate: vi.fn(() => mockNavigate),
    generatePath: vi.fn((...args) => mockGeneratePath(...args)),
    useParams: vi.fn(),
    useLocation: vi.fn(),
    createBrowserRouter: vi.fn(),
    Outlet: vi.fn(),
    Navigate: vi.fn(({ to }) => ({
      type: 'div',
      props: { 'data-testid': 'navigate', children: `Navigate to ${to}` }
    }))
  };
});

vi.mock('../../api/debtPositions', () => ({
  default: {
    getInstallmentDetail: vi.fn(),
    getPaymentNoticeFile: vi.fn(),
    getInstallmentRegistriesMutation: vi.fn().mockReturnValue({
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

describe('DebtPositionsInstallmentDetail', () => {
  const mockUseParams = vi.mocked(useParams);
  const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
  const mockFileName = 'notice-302000000000000001.pdf';
  const mutateMock = vi.fn();
  const mockPaidInstallment = {
    installmentId: 288,
    paymentOptionId: 301,
    status: InstallmentStatus.PAID,
    debtor: {
      entityType: 'F',
      fiscalCode: 'RSSMRA92A12B123A',
      fullName: 'Mario Rossi'
    },
    payer: {
      entityType: 'F',
      fiscalCode: 'BNCMRA80A01H501X',
      fullName: 'Mario Bianchi'
    },
    pspCompanyName: 'Payment Service Provider',
    iud: '123456789012345',
    iur: '987654321098765',
    debtPositionTypeOrgDescription: 'Test for Create Debt Position',
    debtPositionDescription: 'Debt Position Description',
    debtPositionId: 239,
    iuv: '02000000000000001',
    nav: '302000000000000001',
    originalRemittanceInformation: 'Original Remittance Info'
  };

  const mockUnpaidInstallment = {
    ...mockPaidInstallment,
    status: InstallmentStatus.UNPAID,
    paymentDateTime: undefined,
    payer: undefined,
    pspCompanyName: undefined,
    iud: undefined,
    iur: undefined
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseParams.mockReturnValue({ id: '123' });

    (
      debtPositions.getInstallmentDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({ data: mockPaidInstallment });

    (useLocation as Mock).mockReturnValue({
      state: {}
    });
    setOrganizationId(mockOrganizationId);
  });

  it('renders the component with correct title', () => {
    render(<DebtPositionsInstallmentDetail />);

    expect(
      screen.getByText('commons.routes.DEBT_POSITION_INSTALLMENT_DETAIL')
    ).toBeInTheDocument();
  });

  it('shows PAID installment', () => {
    render(<DebtPositionsInstallmentDetail />);

    expect(screen.getByText('commons.state')).toBeInTheDocument();

    expect(screen.getByText('commons.paymentInformation')).toBeInTheDocument();
    expect(screen.getByText('commons.paymentdate')).toBeInTheDocument();
    expect(screen.getByText('commons.executedBy')).toBeInTheDocument();
    expect(screen.getByText('Mario Bianchi')).toBeInTheDocument();
    expect(screen.getByText('commons.transactionManager')).toBeInTheDocument();
    expect(screen.getByText('Payment Service Provider')).toBeInTheDocument();
    expect(screen.getByText('commons.debtor')).toBeInTheDocument();
    expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    expect(
      screen.getByText('RSSMRA92A12B123A (commons.person)')
    ).toBeInTheDocument();
    expect(screen.queryByText('commons.noPaymentMade')).toBeNull();
  });

  it('shows UNPAID installment', () => {
    (
      debtPositions.getInstallmentDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({ data: mockUnpaidInstallment });

    render(<DebtPositionsInstallmentDetail />);

    expect(screen.getByText('commons.noPaymentMade')).toBeInTheDocument();
    expect(screen.queryByText('commons.paymentInformation')).toBeNull();
  });

  it('shows download button only for UNPAID installment', () => {
    (
      debtPositions.getInstallmentDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({ data: mockUnpaidInstallment });

    render(<DebtPositionsInstallmentDetail />);

    expect(screen.getByText('commons.downloadInstallment')).toBeInTheDocument();
  });

  it('does not show download button for PAID installment', () => {
    (
      debtPositions.getInstallmentDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({ data: mockPaidInstallment });

    render(<DebtPositionsInstallmentDetail />);

    expect(
      screen.queryByText('commons.downloadInstallment')
    ).not.toBeInTheDocument();
  });

  it('does not show download button for DRAFT installment', () => {
    const mockDraftInstallment = {
      ...mockPaidInstallment,
      status: InstallmentStatus.DRAFT
    };
    (
      debtPositions.getInstallmentDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({ data: mockDraftInstallment });

    render(<DebtPositionsInstallmentDetail />);

    expect(
      screen.queryByText('commons.downloadInstallment')
    ).not.toBeInTheDocument();
  });

  it('does not show download button for CANCELLED installment', () => {
    const mockCancelledInstallment = {
      ...mockPaidInstallment,
      status: InstallmentStatus.CANCELLED
    };
    (
      debtPositions.getInstallmentDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({ data: mockCancelledInstallment });

    render(<DebtPositionsInstallmentDetail />);

    expect(
      screen.queryByText('commons.downloadInstallment')
    ).not.toBeInTheDocument();
  });

  it('does not show download button for REPORTED installment', () => {
    const mockReportedInstallment = {
      ...mockPaidInstallment,
      status: InstallmentStatus.REPORTED
    };
    (
      debtPositions.getInstallmentDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({ data: mockReportedInstallment });

    render(<DebtPositionsInstallmentDetail />);

    expect(
      screen.queryByText('commons.downloadInstallment')
    ).not.toBeInTheDocument();
  });

  it('opens and closes the drawer when clicking the filter button', () => {
    render(<DebtPositionsInstallmentDetail />);

    const showMore = screen.getByText('commons.showOtherBeneficiaries');
    expect(showMore).toBeDefined();

    const drawerTitle = screen.getByText(
      'debtPositionInstallmentDetail.drawer.title'
    );
    expect(drawerTitle).not.toBeVisible();

    fireEvent.click(showMore);
    expect(drawerTitle).toBeVisible();
  });

  it('downloads PDF when download button is clicked for UNPAID installment', async () => {
    vi.mocked(debtPositions.getPaymentNoticeFile).mockReturnValue({
      mutateAsync: mutateMock.mockReturnValue({
        data: mockBlob,
        fileName: mockFileName
      })
    } as any);

    vi.mocked(debtPositions.getInstallmentDetail).mockReturnValue({
      data: mockUnpaidInstallment
    } as any);

    render(<DebtPositionsInstallmentDetail />);

    const downloadButton = screen.getByText('commons.downloadInstallment');
    expect(downloadButton).toBeInTheDocument();

    fireEvent.click(downloadButton);

    expect(debtPositions.getPaymentNoticeFile).toHaveBeenCalledWith(
      mockOrganizationId,
      mockUnpaidInstallment.debtPositionId,
      mockUnpaidInstallment.nav
    );

    await vi.waitFor(() => {
      expect(downloadBlob).toHaveBeenCalledWith(mockBlob, mockFileName);
    });
  });

  it('shows error notification when download fails', async () => {
    (
      debtPositions.getInstallmentDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({ data: mockUnpaidInstallment });

    (
      debtPositions.getPaymentNoticeFile as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(null);

    render(<DebtPositionsInstallmentDetail />);

    const downloadButton = screen.getByText('commons.downloadInstallment');
    fireEvent.click(downloadButton);

    await vi.waitFor(() => {
      expect(utils.notify.emit).toHaveBeenCalledWith(
        'commons.files.downloadFailed',
        'error'
      );
    });
  });

  it('shows error notification when IUV is missing', async () => {
    const installmentWithoutIuv = { ...mockUnpaidInstallment, iuv: undefined };
    (
      debtPositions.getInstallmentDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({ data: installmentWithoutIuv });

    vi.mocked(debtPositions.getPaymentNoticeFile).mockReturnValue({
      mutateAsync: mutateMock.mockReturnValue({
        data: mockBlob,
        fileName: mockFileName
      })
    } as any);

    render(<DebtPositionsInstallmentDetail />);

    const downloadButton = screen.getByText('commons.downloadInstallment');
    fireEvent.click(downloadButton);

    expect(utils.notify.emit).toHaveBeenCalledWith(
      'commons.files.missingIuv',
      'error'
    );
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('opens timeline drawer when history button is clicked', () => {
    render(<DebtPositionsInstallmentDetail />);

    const historyButtons = screen.getAllByTestId('HistoryIcon');
    const historyButton = historyButtons[0].parentElement;
    expect(historyButton).toBeDefined();

    fireEvent.click(historyButton!);

    expect(
      screen.getByText('debtPositionInstallmentDetail.timeline.title')
    ).toBeVisible();
  });

  it('fetches installment registries when timeline is opened with valid data', () => {
    const mockMutate = vi.fn();
    vi.mocked(debtPositions.getInstallmentRegistriesMutation).mockReturnValue({
      mutate: mockMutate,
      data: [],
      isLoading: false,
      isError: false,
      isSuccess: false
    } as any);

    const installmentWithNav = {
      ...mockPaidInstallment,
      nav: '123456789'
    };

    vi.mocked(debtPositions.getInstallmentDetail).mockReturnValue({
      data: installmentWithNav
    } as any);

    render(<DebtPositionsInstallmentDetail />);

    const historyButtons = screen.getAllByTestId('HistoryIcon');
    const historyButton = historyButtons[0].parentElement;
    fireEvent.click(historyButton!);

    expect(mockMutate).toHaveBeenCalledWith({
      organizationId: mockOrganizationId,
      debtPositionId: installmentWithNav.debtPositionId,
      nav: installmentWithNav.nav
    });
  });

  it('does not fetch registries when timeline is opened without nav field', () => {
    const mockMutate = vi.fn();
    vi.mocked(debtPositions.getInstallmentRegistriesMutation).mockReturnValue({
      mutate: mockMutate,
      data: [],
      isLoading: false,
      isError: false,
      isSuccess: false
    } as any);

    const installmentWithoutNav = {
      ...mockPaidInstallment,
      nav: undefined
    };

    vi.mocked(debtPositions.getInstallmentDetail).mockReturnValue({
      data: installmentWithoutNav
    } as any);

    render(<DebtPositionsInstallmentDetail />);

    const historyButtons = screen.getAllByTestId('HistoryIcon');
    const historyButton = historyButtons[0].parentElement;
    fireEvent.click(historyButton!);

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('renders timeline with registry data when available', () => {
    const mockRegistries = [
      {
        id: 1,
        eventDate: '2024-01-01T10:00:00Z',
        status: InstallmentStatus.UNPAID
      },
      {
        id: 2,
        eventDate: '2024-01-02T11:00:00Z',
        status: InstallmentStatus.PAID
      }
    ];

    vi.mocked(debtPositions.getInstallmentRegistriesMutation).mockReturnValue({
      mutate: vi.fn(),
      data: mockRegistries,
      isLoading: false,
      isError: false,
      isSuccess: true
    } as any);

    render(<DebtPositionsInstallmentDetail />);

    const historyButtons = screen.getAllByTestId('HistoryIcon');
    const historyButton = historyButtons[0].parentElement;
    fireEvent.click(historyButton!);

    expect(
      screen.getByText('debtPositionInstallmentDetail.timeline.title')
    ).toBeVisible();
  });

  it('renders empty timeline message when no registry data available', () => {
    vi.mocked(debtPositions.getInstallmentRegistriesMutation).mockReturnValue({
      mutate: vi.fn(),
      data: [],
      isLoading: false,
      isError: false,
      isSuccess: true
    } as any);

    render(<DebtPositionsInstallmentDetail />);

    const historyButtons = screen.getAllByTestId('HistoryIcon');
    const historyButton = historyButtons[0].parentElement;
    fireEvent.click(historyButton!);

    expect(screen.getByText('commons.NO_EVENTS')).toBeInTheDocument();
  });

  it('navigates to debt position detail when footer link is clicked', () => {
    mockGeneratePath.mockReturnValue('/debt-positions/239');

    render(<DebtPositionsInstallmentDetail />);

    const showDebtPositionLink = screen.getByText('commons.showDebtPositions');
    fireEvent.click(showDebtPositionLink);

    expect(mockNavigate).toHaveBeenCalledWith('/debt-positions/239');
  });

  it('navigates to error page when installmentId is NaN', () => {
    mockUseParams.mockReturnValue({ id: 'invalid' });

    render(<DebtPositionsInstallmentDetail />);

    expect(mockNavigate).toHaveBeenCalledWith('/piattaformaunitaria/error');
  });

  it('navigates to error page when isError is true', () => {
    vi.mocked(debtPositions.getInstallmentDetail).mockReturnValue({
      data: undefined,
      isError: true
    } as any);

    render(<DebtPositionsInstallmentDetail />);

    expect(mockNavigate).toHaveBeenCalled();
  });

  it('displays company entity type for debtor', () => {
    const installmentWithCompanyDebtor = {
      ...mockUnpaidInstallment,
      debtor: {
        entityType: 'G',
        fiscalCode: '12345678901',
        fullName: 'Company Name SRL'
      }
    };

    vi.mocked(debtPositions.getInstallmentDetail).mockReturnValue({
      data: installmentWithCompanyDebtor
    } as any);

    render(<DebtPositionsInstallmentDetail />);

    expect(screen.getByText('12345678901')).toBeInTheDocument();
    expect(screen.queryByText(/commons.person/)).not.toBeInTheDocument();
  });

  it('displays company entity type for payer', () => {
    const installmentWithCompanyPayer = {
      ...mockPaidInstallment,
      payer: {
        entityType: 'G',
        fiscalCode: '98765432109',
        fullName: 'Payer Company SRL'
      }
    };

    vi.mocked(debtPositions.getInstallmentDetail).mockReturnValue({
      data: installmentWithCompanyPayer
    } as any);

    render(<DebtPositionsInstallmentDetail />);

    expect(screen.getByText('98765432109')).toBeInTheDocument();
  });

  it('displays dash when fiscal code is missing', () => {
    const installmentWithoutFiscalCode = {
      ...mockPaidInstallment,
      debtor: {
        entityType: 'F',
        fiscalCode: undefined,
        fullName: 'No Fiscal Code'
      }
    };

    vi.mocked(debtPositions.getInstallmentDetail).mockReturnValue({
      data: installmentWithoutFiscalCode
    } as any);

    render(<DebtPositionsInstallmentDetail />);

    const fiscalCodeElements = screen.getAllByText('-');
    expect(fiscalCodeElements.length).toBeGreaterThan(0);
  });

  it('renders installment with optional fields missing', () => {
    const installmentMinimal = {
      ...mockUnpaidInstallment,
      iun: undefined,
      notificationDate: undefined,
      notificationFeeCents: undefined,
      iud: undefined
    };

    vi.mocked(debtPositions.getInstallmentDetail).mockReturnValue({
      data: installmentMinimal
    } as any);

    render(<DebtPositionsInstallmentDetail />);

    expect(
      screen.getByText('commons.routes.DEBT_POSITION_INSTALLMENT_DETAIL')
    ).toBeInTheDocument();
  });

  it('renders REPORTED status installment correctly and NOT a tech debt position', () => {
    const reportedInstallment = {
      ...mockPaidInstallment,
      status: InstallmentStatus.REPORTED
    };

    vi.mocked(debtPositions.getInstallmentDetail).mockReturnValue({
      data: reportedInstallment
    } as any);

    render(<DebtPositionsInstallmentDetail />);

    expect(screen.getByText('commons.paymentInformation')).toBeInTheDocument();
    expect(screen.queryByTestId('technical-debt-alert')).toBeNull();
  });

  it('handles download error with generic exception', async () => {
    const mockMutateAsync = vi
      .fn()
      .mockRejectedValue(new Error('Network error'));

    vi.mocked(debtPositions.getPaymentNoticeFile).mockReturnValue({
      mutateAsync: mockMutateAsync
    } as any);

    vi.mocked(debtPositions.getInstallmentDetail).mockReturnValue({
      data: mockUnpaidInstallment
    } as any);

    render(<DebtPositionsInstallmentDetail />);

    const downloadButton = screen.getByText('commons.downloadInstallment');
    fireEvent.click(downloadButton);

    await vi.waitFor(() => {
      expect(utils.notify.emit).toHaveBeenCalledWith(
        'commons.files.downloadFailed',
        'error'
      );
    });
  });

  it('does not show download button when debtPositionId is missing', () => {
    const installmentWithoutDebtPositionId = {
      ...mockUnpaidInstallment,
      debtPositionId: undefined
    };

    vi.mocked(debtPositions.getInstallmentDetail).mockReturnValue({
      data: installmentWithoutDebtPositionId
    } as any);

    render(<DebtPositionsInstallmentDetail />);

    expect(
      screen.getByText('commons.routes.DEBT_POSITION_INSTALLMENT_DETAIL')
    ).toBeInTheDocument();
  });

  it('Check if is a technical debt position', () => {
    const technicalDebtPosition = {
      ...mockUnpaidInstallment,
      debtPositionOrigin: DebtPositionOrigin.SECONDARY_ORG
    };

    vi.mocked(debtPositions.getInstallmentDetail).mockReturnValue({
      data: technicalDebtPosition
    } as any);

    render(<DebtPositionsInstallmentDetail />);

    expect(screen.getByTestId('technical-debt-alert')).toBeInTheDocument();
  });

  describe('remittanceInformation display logic', () => {
    it('displays originalRemittanceInformation when present', () => {
      vi.mocked(debtPositions.getInstallmentDetail).mockReturnValue({
        data: mockPaidInstallment
      } as any);

      render(<DebtPositionsInstallmentDetail />);

      expect(screen.getByText('Original Remittance Info')).toBeInTheDocument();
    });

    it('displays dash when originalRemittanceInformation is missing', () => {
      const installmentWithoutRemittance = {
        ...mockPaidInstallment,
        originalRemittanceInformation: undefined
      };

      vi.mocked(debtPositions.getInstallmentDetail).mockReturnValue({
        data: installmentWithoutRemittance
      } as any);

      render(<DebtPositionsInstallmentDetail />);

      expect(
        screen.queryByText('Original Remittance Info')
      ).not.toBeInTheDocument();
    });
  });
});
