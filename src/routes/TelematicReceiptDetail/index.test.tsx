/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TelematicReceiptDetail } from '.';
import { render, screen, fireEvent, waitFor } from '../../__tests__/renderers';
import { useParams } from 'react-router';
import * as receiptPdf from '../../api/receiptPdf';
import { useReceiptDetail } from '../../hooks/useReceiptDetail';
import utils from '../../utils';
import { downloadBlob } from '../../utils/download';

const mockNavigate = vi.fn();

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
  useParams: vi.fn()
}));

vi.mock('../../hooks/useReceiptDetail', () => ({
  useReceiptDetail: vi.fn()
}));

vi.mock('../../store/GlobalStore', () => ({
  useStore: () => ({ state: { organizationId: 123 } }),
  StoreProvider: ({ children }: { children: React.ReactNode }) => children
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

vi.mock('../../routes', () => ({
  PageRoutes: {
    RESPONSES_ERROR: 'RESPONSES_ERROR'
  }
}));

vi.mock('../../components/ReceiptDetail', () => ({
  default: ({ pageTitle, callToAction, summaryData, paymentData }: any) => (
    <div data-testid="receipt-detail">
      <h1>{pageTitle}</h1>
      {callToAction && (
        <button
          data-testid="cta-button"
          onClick={callToAction.onActionClick}
          aria-label={callToAction.buttonText}
        >
          {callToAction.buttonText}
        </button>
      )}
      <div data-testid="summary-data">{JSON.stringify(summaryData)}</div>
      <div data-testid="payment-data">{JSON.stringify(paymentData)}</div>
    </div>
  )
}));

describe('TelematicReceiptDetail Component', () => {
  const mockOrganizationId = 123;
  const mockReceiptId = 456;
  const mockUseParams = vi.mocked(useParams);
  const mockUseReceiptDetail = vi.mocked(useReceiptDetail);

  const mockPaymentData = [
    { label: 'commons.paymentdate', value: '15/01/2025' }
  ];

  const mockSummaryData = [{ label: 'commons.iuv', value: 'IUV123456789' }];

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseParams.mockReturnValue({
      receiptId: String(mockReceiptId)
    });

    mockUseReceiptDetail.mockReturnValue({
      paymentData: mockPaymentData,
      summaryData: mockSummaryData,
      isLoading: false,
      isError: false
    });
  });

  it('navigates to error page when receiptId is invalid', () => {
    mockUseParams.mockReturnValue({
      receiptId: 'invalid-id'
    });

    render(<TelematicReceiptDetail />);

    expect(mockNavigate).toHaveBeenCalledWith('RESPONSES_ERROR');
  });

  it('navigates to error page when receiptId is NaN', () => {
    mockUseParams.mockReturnValue({
      receiptId: 'abc123'
    });

    render(<TelematicReceiptDetail />);

    expect(mockNavigate).toHaveBeenCalledWith('RESPONSES_ERROR');
  });

  it('calls useReceiptDetail with correct parameters', () => {
    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(
      () =>
        ({
          mutateAsync: vi.fn()
        }) as any
    );

    render(<TelematicReceiptDetail />);

    expect(mockUseReceiptDetail).toHaveBeenCalledWith(
      mockOrganizationId,
      mockReceiptId
    );
  });

  it('initializes getReceiptPdf with correct organizationId', () => {
    const getReceiptPdfSpy = vi
      .spyOn(receiptPdf, 'getReceiptPdf')
      .mockImplementation(
        () =>
          ({
            mutateAsync: vi.fn()
          }) as any
      );

    render(<TelematicReceiptDetail />);

    expect(getReceiptPdfSpy).toHaveBeenCalledWith(mockOrganizationId);
  });

  it('passes correct data to ReceiptDetail component', () => {
    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(
      () =>
        ({
          mutateAsync: vi.fn()
        }) as any
    );

    render(<TelematicReceiptDetail />);

    expect(screen.getByTestId('summary-data')).toHaveTextContent(
      JSON.stringify(mockSummaryData)
    );
    expect(screen.getByTestId('payment-data')).toHaveTextContent(
      JSON.stringify(mockPaymentData)
    );
  });

  it('downloads PDF successfully when button is clicked', async () => {
    const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
    const mockFileName = 'receipt.pdf';
    const mockMutateAsync = vi.fn().mockResolvedValue({
      data: mockBlob,
      fileName: mockFileName
    });

    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(
      () =>
        ({
          mutateAsync: mockMutateAsync
        }) as any
    );

    render(<TelematicReceiptDetail />);

    const button = screen.getByTestId('cta-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(mockReceiptId);
      expect(downloadBlob).toHaveBeenCalledWith(mockBlob, mockFileName);
    });
  });

  it('shows error notification when PDF download fails', async () => {
    const mockError = new Error('Download failed');
    const mockMutateAsync = vi.fn().mockRejectedValue(mockError);

    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(
      () =>
        ({
          mutateAsync: mockMutateAsync
        }) as any
    );

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(<TelematicReceiptDetail />);

    const button = screen.getByTestId('cta-button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);
      expect(utils.notify.emit).toHaveBeenCalledWith(
        'commons.files.downloadFailed',
        'error'
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('renders with correct page title', () => {
    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(
      () =>
        ({
          mutateAsync: vi.fn()
        }) as any
    );

    render(<TelematicReceiptDetail />);

    expect(
      screen.getByText('telematicReceiptDetail.title')
    ).toBeInTheDocument();
  });

  it('renders download button with correct text', () => {
    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(
      () =>
        ({
          mutateAsync: vi.fn()
        }) as any
    );

    render(<TelematicReceiptDetail />);

    const button = screen.getByLabelText('commons.files.download');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('commons.files.download');
  });
});
