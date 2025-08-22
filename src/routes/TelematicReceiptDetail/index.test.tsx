/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TelematicReceiptDetail } from '.';
import { render, screen, fireEvent } from '../../__tests__/renderers';
import { useLoaderData, useParams } from 'react-router';
import { getReceiptDetail } from '../../api/receiptDetail';
import { getAssessmentDetail } from '../../api/assessments/assessmentDetail/assessmentDetail';
import { receiptDetailDTOSchema } from '../../../generated/zod-schema';
import { createMock } from 'zodock';
import * as receiptPdf from '../../api/receiptPdf';

const mockNavigate = vi.fn();

vi.mock('../../api/receiptDetail', () => ({
  getReceiptDetail: vi.fn()
}));

vi.mock('../../api/assessments/assessmentDetail/assessmentDetail', () => ({
  getAssessmentDetail: vi.fn()
}));

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useLoaderData: vi.fn(),
  useNavigate: () => mockNavigate,
  useParams: vi.fn()
}));

vi.mock('../../store/AppStateStore', () => ({
  setAppState: vi.fn()
}));

vi.mock('../../routes', () => ({
  PageRoutes: {
    RESPONSES_ERROR: 'RESPONSES_ERROR',
    ASSESSMENT_INDEX: '/assessment',
    ASSESSMENT_SEARCH_RESULTS: '/assessment/search-results',
    ASSESSMENT_DETAIL: '/assessment/:id',
    ASSESSMENT_DETAIL_DETAIL: '/assessment/:id/detail/:receiptId'
  }
}));

vi.mock('../../store/GlobalStore', () => ({
  useStore: () => ({ state: { organizationId: '123' } }),
  StoreProvider: ({ children }: { children: React.ReactNode }) => children
}));

describe('TelematicReceiptDetail Page', () => {
  const mockOrganizationId = 123;
  const mockData = createMock(receiptDetailDTOSchema);
  const mockUseLoaderData = vi.mocked(useLoaderData);
  const mockUseParams = vi.mocked(useParams);

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    mockUseLoaderData.mockReturnValue(mockData.receiptId);
    mockUseParams.mockReturnValue({});

    (getReceiptDetail as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData
    });

    (
      getAssessmentDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false
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
        }) as unknown as ReturnType<typeof receiptPdf.getReceiptPdf>
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
      receiptId: '60',
      id: '209',
      assessmentDetailId: '60'
    });

    (getReceiptDetail as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData,
      isError: false,
      error: null
    });

    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    expect(
      screen.getByText('assessmentDetail.paymentDetail.title')
    ).toBeInTheDocument();
  });

  it('shows default telematic receipt title when not in assessment context', () => {
    mockUseParams.mockReturnValue({});

    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    expect(
      screen.getByText('telematicReceiptDetail.title')
    ).toBeInTheDocument();
  });

  it('hides download button when in assessment context', () => {
    mockUseParams.mockReturnValue({
      receiptId: '60',
      id: '209',
      assessmentDetailId: '60'
    });

    (getReceiptDetail as any).mockReturnValue({
      data: mockData,
      isError: false,
      error: null
    });

    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

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

    expect(screen.getByLabelText('commons.files.download')).toBeInTheDocument();
  });

  it('uses organizationId from store', () => {
    mockUseParams.mockReturnValue({});

    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    expect(getReceiptDetail).toHaveBeenCalledWith(
      mockOrganizationId,
      mockData.receiptId
    );
  });

  it('uses assessment-specific translations when assessmentDetailId is present', () => {
    mockUseParams.mockReturnValue({
      receiptId: '60'
    });

    (getReceiptDetail as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData,
      isError: false,
      error: null
    });

    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    expect(
      screen.getByText('assessmentDetail.paymentDetail.title')
    ).toBeInTheDocument();
  });

  it('uses default translations when assessmentDetailId is not present', () => {
    mockUseParams.mockReturnValue({});

    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    expect(
      screen.getByText('telematicReceiptDetail.title')
    ).toBeInTheDocument();
  });

  it('fetches assessment name when in assessment context and no name in state', () => {
    mockUseParams.mockReturnValue({
      receiptId: '60',
      id: '209'
    });

    (getReceiptDetail as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData,
      isError: false,
      error: null
    });

    (
      getAssessmentDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: { assessmentsName: 'Test Assessment Name' },
      isLoading: false,
      isError: false
    });

    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    expect(getAssessmentDetail).toHaveBeenCalledWith(
      mockOrganizationId,
      209,
      { page: 0, size: 1 },
      { enabled: true }
    );
  });
});
