import { fireEvent, render, screen } from '../../__tests__/renderers';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { DebtPositionsInstallmentDetail } from './DebtPositionsInstallmentDetail';
import debtPositions from '../../api/debtPositions';
import { useLocation, useParams } from 'react-router-dom';
import { setOrganizationId } from '../../store/OrganizationIdStore';
import { downloadBlob } from '../../utils/download';
import utils from '../../utils';
import { STATE } from '../../store/types';
import { InstallmentStatus } from '../../../generated/apiClient';
import React from 'react';

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  generatePath: vi.fn(),
  useParams: vi.fn(),
  useLocation: vi.fn(),
  createBrowserRouter: vi.fn(),
  Navigate: vi.fn(({ to }) => ({
    type: 'div',
    props: { 'data-testid': 'navigate', children: `Navigate to ${to}` }
  }))
}));

vi.mock('../../api/debtPositions', () => ({
  default: {
    getInstallmentDetail: vi.fn(),
    downloadPaymentNotice: vi.fn()
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
    iuv: '302000000000000001'
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
      state: {
        remittanceInformation: 'test remittanceInformation'
      }
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
    const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
    const mockFileName = 'notice-302000000000000001.pdf';

    (
      debtPositions.downloadPaymentNotice as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      data: mockBlob,
      fileName: mockFileName
    });

    (
      debtPositions.getInstallmentDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({ data: mockUnpaidInstallment });

    render(<DebtPositionsInstallmentDetail />);

    const downloadButton = screen.getByText('commons.downloadInstallment');
    expect(downloadButton).toBeInTheDocument();

    fireEvent.click(downloadButton);

    expect(debtPositions.downloadPaymentNotice).toHaveBeenCalledWith(
      mockOrganizationId,
      mockUnpaidInstallment.debtPositionId,
      mockUnpaidInstallment.iuv
    );

    await vi.waitFor(() => {
      expect(downloadBlob).toHaveBeenCalledWith(mockBlob, mockFileName);
    });
  });

  it('shows dialog when trying to download PAID installment', async () => {
    render(<DebtPositionsInstallmentDetail />);

    const downloadButton = screen.getByText('commons.downloadInstallment');
    expect(downloadButton).toBeInTheDocument();

    fireEvent.click(downloadButton);

    expect(
      screen.getByText('debtPositionInstallmentDetail.dialogDownload.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtPositionInstallmentDetail.dialogDownload.message')
    ).toBeInTheDocument();

    expect(debtPositions.downloadPaymentNotice).not.toHaveBeenCalled();
  });

  it('closes dialog when clicking cancel button', async () => {
    vi.mock('../GenericDialog/GenericDialog', () => ({
      default: ({
        onConfirm,
        open,
        title,
        message,
        confirmLabel
      }: {
        onConfirm?: () => void;
        open: boolean;
        title: string;
        message?: string;
        confirmLabel?: string;
      }) => {
        if (open) {
          return (
            <div role="dialog">
              <div>{title}</div>
              {message && <div>{message}</div>}
              <button onClick={onConfirm}>{confirmLabel}</button>
            </div>
          );
        }
        return null;
      }
    }));

    render(<DebtPositionsInstallmentDetail />);

    const downloadButton = screen.getByText('commons.downloadInstallment');
    fireEvent.click(downloadButton);

    expect(
      screen.getByText('debtPositionInstallmentDetail.dialogDownload.title')
    ).toBeInTheDocument();

    const closeButton = screen.getByText('commons.close');
    fireEvent.click(closeButton);
  });

  it('shows error notification when download fails', async () => {
    (
      debtPositions.getInstallmentDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({ data: mockUnpaidInstallment });

    (
      debtPositions.downloadPaymentNotice as unknown as ReturnType<typeof vi.fn>
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
    const installmentWithoutIuv = { ...mockPaidInstallment, iuv: undefined };
    (
      debtPositions.getInstallmentDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({ data: installmentWithoutIuv });

    render(<DebtPositionsInstallmentDetail />);

    const downloadButton = screen.getByText('commons.downloadInstallment');
    fireEvent.click(downloadButton);

    expect(utils.notify.emit).toHaveBeenCalledWith(
      'commons.files.missingIuv',
      'error'
    );
    expect(debtPositions.downloadPaymentNotice).not.toHaveBeenCalled();
  });
});
