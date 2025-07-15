import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TelematicReceiptDetail } from '.';
import { render, screen, fireEvent } from '@testing-library/react';
import { useLoaderData, useParams, useSearchParams } from 'react-router';
import { getReceiptDetail } from '../../api/receiptDetail';
import { receiptDetailDTOSchema } from '../../../generated/zod-schema';
import { createMock } from 'zodock';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import * as receiptPdf from '../../api/receiptPdf';

const mockNavigate = vi.fn();

vi.mock('../../api/receiptDetail', () => ({
  getReceiptDetail: vi.fn()
}));

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useLoaderData: vi.fn(),
  useNavigate: () => mockNavigate,
  useParams: vi.fn(),
  useSearchParams: vi.fn()
}));

vi.mock('../../store/GlobalStore', () => ({
  useStore: vi.fn()
}));

vi.mock('../../store/AppStateStore', () => ({
  setAppState: vi.fn()
}));

vi.mock('../../store/OrganizationIdStore', () => ({
  setOrganizationId: vi.fn()
}));

vi.mock('../../routes', () => ({
  PageRoutes: {
    RESPONSES_ERROR: 'RESPONSES_ERROR'
  }
}));

describe('TelematicReceiptDetail Page', () => {
  const mockOrganizationId = 123;
  const mockData = createMock(receiptDetailDTOSchema);
  const mockUseLoaderData = vi.mocked(useLoaderData);
  const mockUseParams = vi.mocked(useParams);
  const mockUseSearchParams = vi.mocked(useSearchParams);

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    mockUseLoaderData.mockReturnValue(mockData.receiptId);
    mockUseParams.mockReturnValue({});
    mockUseSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()]);
    (useStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { [STATE.ORGANIZATION_ID]: mockOrganizationId }
    });

    (getReceiptDetail as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData
    });
  });

  it('renders Telematic Receipt Detail without crashing', () => {
    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    expect(screen.getByText(mockData.iud)).toBeInTheDocument();
    expect(
      screen.getByText(mockData.remittanceInformation)
    ).toBeInTheDocument();
  });

  it('getReceiptPdf is initialized with the correct OrganizationId value', () => {
    const mutateSpy = vi
      .spyOn(receiptPdf, 'getReceiptPdf')
      .mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    expect(mutateSpy).toBeCalledWith(mockOrganizationId);
  });

  it('getReceiptPdf mutation receives the correct receiptId parameter', () => {
    const mutationMock = vi.fn();
    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(
      () =>
        ({
          mutateAsync: mutationMock
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any
    );
    render(<TelematicReceiptDetail />);
    const downloadButton = screen.getByLabelText('commons.files.download');
    fireEvent.click(downloadButton);
    expect(mutationMock).toBeCalledWith(mockData.receiptId);
  });

  it('handles invalid ID parameter', () => {
    mockUseLoaderData.mockReturnValue('invalid-id');

    render(<TelematicReceiptDetail />);

    expect(mockNavigate).toHaveBeenCalledWith('RESPONSES_ERROR');
  });

  it('handles API errors correctly', () => {
    (getReceiptDetail as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('API Error')
    });

    render(<TelematicReceiptDetail />);

    expect(mockNavigate).toHaveBeenCalledWith('RESPONSES_ERROR');
  });

  it('shows "Dettaglio Pagamento" title when in assessment context', () => {
    mockUseParams.mockReturnValue({
      assessmentDetailId: '60',
      id: '209'
    });

    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    expect(screen.getByText('Dettaglio Pagamento')).toBeInTheDocument();
  });

  it('shows default telematic receipt title when not in assessment context', () => {
    mockUseParams.mockReturnValue({});

    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    // Assumes there's a translation key for the default title
    expect(
      screen.getByText('telematicReceiptDetail.title')
    ).toBeInTheDocument();
  });

  it('hides download button when in assessment context', () => {
    mockUseParams.mockReturnValue({
      assessmentDetailId: '60',
      id: '209'
    });

    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    // Il pulsante di download non dovrebbe essere presente
    expect(
      screen.queryByLabelText('commons.files.download')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('commons.files.download')
    ).not.toBeInTheDocument();
  });

  it('shows download button when not in assessment context', () => {
    mockUseParams.mockReturnValue({});

    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    // Il pulsante di download dovrebbe essere presente
    expect(screen.getByLabelText('commons.files.download')).toBeInTheDocument();
  });

  it('uses organizationId from URL when available (assessment context)', () => {
    const urlOrganizationId = 456;
    const searchParams = new URLSearchParams();
    searchParams.set('organizationId', urlOrganizationId.toString());

    mockUseParams.mockReturnValue({
      assessmentDetailId: '60',
      id: '209'
    });
    mockUseSearchParams.mockReturnValue([searchParams, vi.fn()]);

    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    // Verifica che getReceiptDetail sia chiamato con l'organizationId dall'URL
    expect(getReceiptDetail).toHaveBeenCalledWith(
      urlOrganizationId,
      mockData.receiptId
    );
  });

  it('falls back to store organizationId when URL param is not present', () => {
    mockUseParams.mockReturnValue({});
    mockUseSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()]);

    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    // Verifica che getReceiptDetail sia chiamato con l'organizationId dallo store
    expect(getReceiptDetail).toHaveBeenCalledWith(
      mockOrganizationId,
      mockData.receiptId
    );
  });

  it('navigates to error page when organizationId is invalid', () => {
    const searchParams = new URLSearchParams();
    searchParams.set('organizationId', 'invalid');

    mockUseParams.mockReturnValue({
      assessmentDetailId: '60',
      id: '209'
    });
    mockUseSearchParams.mockReturnValue([searchParams, vi.fn()]);

    render(<TelematicReceiptDetail />);

    expect(mockNavigate).toHaveBeenCalledWith('RESPONSES_ERROR');
  });

  it('synchronizes organizationId from URL parameter with store when different', async () => {
    const { setOrganizationId } = await import(
      '../../store/OrganizationIdStore'
    );
    const urlOrganizationId = 999;
    const searchParams = new URLSearchParams();
    searchParams.set('organizationId', urlOrganizationId.toString());

    mockUseParams.mockReturnValue({
      assessmentDetailId: '60'
    });
    mockUseSearchParams.mockReturnValue([searchParams, vi.fn()]);

    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    // Verifica che setOrganizationId sia chiamato con il valore dall'URL
    expect(setOrganizationId).toHaveBeenCalledWith(urlOrganizationId);
  });

  it('does not call setOrganizationId when URL organizationId matches store value', async () => {
    const { setOrganizationId } = await import(
      '../../store/OrganizationIdStore'
    );
    const searchParams = new URLSearchParams();
    searchParams.set('organizationId', mockOrganizationId.toString());

    mockUseParams.mockReturnValue({
      assessmentDetailId: '60'
    });
    mockUseSearchParams.mockReturnValue([searchParams, vi.fn()]);

    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    // Verifica che setOrganizationId NON sia chiamato quando i valori coincidono
    expect(setOrganizationId).not.toHaveBeenCalled();
  });

  it('uses assessment-specific translations when assessmentDetailId is present', () => {
    mockUseParams.mockReturnValue({
      assessmentDetailId: '60'
    });
    mockUseSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()]);

    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    // Verifica che vengano utilizzate le traduzioni specifiche per assessment
    expect(
      screen.getByText('assessmentDetail.paymentDetail.title')
    ).toBeInTheDocument();
  });

  it('uses default translations when assessmentDetailId is not present', () => {
    mockUseParams.mockReturnValue({});
    mockUseSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()]);

    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    // Verifica che vengano utilizzate le traduzioni standard per ricevute telematiche
    expect(
      screen.getByText('telematicReceiptDetail.title')
    ).toBeInTheDocument();
  });
});
