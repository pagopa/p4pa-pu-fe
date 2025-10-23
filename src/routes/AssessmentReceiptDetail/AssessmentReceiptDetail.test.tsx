/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssessmentReceiptDetail } from '.';
import { render, screen, waitFor } from '../../__tests__/renderers';
import { useParams, useLocation } from 'react-router';
import { useReceiptDetail } from '../../hooks/useReceiptDetail';
import { getAssessmentDetail } from '../../api/assessments/assessmentDetail/assessmentDetail';
import * as AppStateStore from '../../store/AppStateStore';

const mockNavigate = vi.fn();

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
  useParams: vi.fn(),
  useLocation: vi.fn(),
  generatePath: (path: string, params: any) => {
    return path
      .replace(':assessmentId', params.assessmentId)
      .replace(':receiptId', params.receiptId)
      .replace(':id', params.id);
  }
}));

vi.mock('../../hooks/useReceiptDetail', () => ({
  useReceiptDetail: vi.fn()
}));

vi.mock('../../api/assessments/assessmentDetail/assessmentDetail', () => ({
  getAssessmentDetail: vi.fn()
}));

vi.mock('../../store/GlobalStore', () => ({
  useStore: () => ({ state: { organizationId: 123 } }),
  StoreProvider: ({ children }: { children: React.ReactNode }) => children
}));

vi.mock('../../store/AppStateStore', () => ({
  setCustomBreadcrumbsItems: vi.fn()
}));

vi.mock('../../routes', () => ({
  PageRoutes: {
    RESPONSES_ERROR: 'RESPONSES_ERROR',
    ASSESSMENT_INDEX: '/assessment',
    ASSESSMENT_SEARCH_RESULTS: '/assessment/search-results',
    ASSESSMENT_DETAIL: '/assessment/:id',
    ASSESSMENT_RECEIPT_DETAIL: '/assessment/:assessmentId/receipt/:receiptId'
  }
}));

vi.mock('../../components/ReceiptDetail', () => ({
  default: ({ pageTitle, summaryData, paymentData }: any) => (
    <div data-testid="receipt-detail">
      <h1>{pageTitle}</h1>
      <div data-testid="summary-data">{JSON.stringify(summaryData)}</div>
      <div data-testid="payment-data">{JSON.stringify(paymentData)}</div>
    </div>
  )
}));

describe('AssessmentReceiptDetail Component', () => {
  const mockOrganizationId = 123;
  const mockReceiptId = 456;
  const mockAssessmentId = 789;
  const mockUseParams = vi.mocked(useParams);
  const mockUseLocation = vi.mocked(useLocation);
  const mockUseReceiptDetail = vi.mocked(useReceiptDetail);
  const mockGetAssessmentDetail = vi.mocked(getAssessmentDetail);

  const mockPaymentData = [
    { label: 'commons.paymentdate', value: '15/01/2025' }
  ];

  const mockSummaryData = [{ label: 'commons.iuv', value: 'IUV123456789' }];

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseParams.mockReturnValue({
      receiptId: String(mockReceiptId),
      assessmentId: String(mockAssessmentId)
    });

    mockUseLocation.mockReturnValue({
      state: null,
      pathname: '',
      search: '',
      hash: '',
      key: ''
    } as any);

    mockUseReceiptDetail.mockReturnValue({
      paymentData: mockPaymentData,
      summaryData: mockSummaryData,
      isLoading: false,
      isError: false
    });
  });

  it('navigates to error page when receiptId is invalid', () => {
    mockUseParams.mockReturnValue({
      receiptId: 'invalid-id',
      assessmentId: String(mockAssessmentId)
    });

    render(<AssessmentReceiptDetail />);

    expect(mockNavigate).toHaveBeenCalledWith('RESPONSES_ERROR');
  });

  it('navigates to error page when assessmentId is invalid', () => {
    mockUseParams.mockReturnValue({
      receiptId: String(mockReceiptId),
      assessmentId: 'invalid-id'
    });

    render(<AssessmentReceiptDetail />);

    expect(mockNavigate).toHaveBeenCalledWith('RESPONSES_ERROR');
  });

  it('navigates to error page when both IDs are invalid', () => {
    mockUseParams.mockReturnValue({
      receiptId: 'invalid',
      assessmentId: 'invalid'
    });

    render(<AssessmentReceiptDetail />);

    expect(mockNavigate).toHaveBeenCalledWith('RESPONSES_ERROR');
  });

  it('calls useReceiptDetail with correct parameters', () => {
    const mockMutateAsync = vi.fn();
    mockGetAssessmentDetail.mockReturnValue({
      mutateAsync: mockMutateAsync
    } as any);

    render(<AssessmentReceiptDetail />);

    expect(mockUseReceiptDetail).toHaveBeenCalledWith(
      mockOrganizationId,
      mockReceiptId
    );
  });

  it('initializes getAssessmentDetail with correct parameters', () => {
    const mockMutateAsync = vi.fn();
    mockGetAssessmentDetail.mockReturnValue({
      mutateAsync: mockMutateAsync
    } as any);

    render(<AssessmentReceiptDetail />);

    expect(mockGetAssessmentDetail).toHaveBeenCalledWith(
      mockOrganizationId,
      mockAssessmentId,
      { page: 0, size: 1 }
    );
  });

  it('uses assessment name from location state when available', () => {
    const mockAssessmentName = 'Test Assessment Name';
    mockUseLocation.mockReturnValue({
      state: { assessmentName: mockAssessmentName },
      pathname: '',
      search: '',
      hash: '',
      key: ''
    } as any);

    const mockMutateAsync = vi.fn();
    mockGetAssessmentDetail.mockReturnValue({
      mutateAsync: mockMutateAsync
    } as any);

    render(<AssessmentReceiptDetail />);

    // Should not call mutateAsync if assessment name is in state
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('fetches assessment name when not in location state', async () => {
    const mockAssessmentName = 'Fetched Assessment Name';
    const mockMutateAsync = vi.fn().mockResolvedValue({
      assessmentsName: mockAssessmentName
    });

    mockGetAssessmentDetail.mockReturnValue({
      mutateAsync: mockMutateAsync
    } as any);

    render(<AssessmentReceiptDetail />);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        filters: {},
        pagination: { page: 0, size: 1 },
        sort: []
      });
    });
  });

  it('sets fallback assessment name when fetch fails', async () => {
    const mockMutateAsync = vi
      .fn()
      .mockRejectedValue(new Error('Fetch failed'));

    mockGetAssessmentDetail.mockReturnValue({
      mutateAsync: mockMutateAsync
    } as any);

    render(<AssessmentReceiptDetail />);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });

    // Breadcrumbs should be set even with fallback name
    await waitFor(() => {
      expect(AppStateStore.setCustomBreadcrumbsItems).toHaveBeenCalled();
    });
  });

  it('sets custom breadcrumbs with correct structure', async () => {
    const mockAssessmentName = 'Test Assessment';
    mockUseLocation.mockReturnValue({
      state: { assessmentName: mockAssessmentName },
      pathname: '',
      search: '',
      hash: '',
      key: ''
    } as any);

    const mockMutateAsync = vi.fn();
    mockGetAssessmentDetail.mockReturnValue({
      mutateAsync: mockMutateAsync
    } as any);

    render(<AssessmentReceiptDetail />);

    await waitFor(() => {
      expect(AppStateStore.setCustomBreadcrumbsItems).toHaveBeenCalledWith([
        {
          pathname: '/assessment',
          id: 'ASSESSMENT'
        },
        {
          pathname: '/assessment/search-results',
          id: 'ASSESSMENT_SEARCH_RESULTS'
        },
        {
          pathname: `/assessment/${mockAssessmentId}`,
          label: mockAssessmentName,
          id: 'ASSESSMENT_DETAIL'
        },
        {
          pathname: `/assessment/${mockAssessmentId}/receipt/${mockReceiptId}`,
          label: 'assessmentDetail.paymentDetail.title',
          id: 'ASSESSMENT_RECEIPT_DETAIL'
        }
      ]);
    });
  });

  it('updates breadcrumbs when assessment name changes', async () => {
    const mockAssessmentName = 'Fetched Assessment Name';
    const mockMutateAsync = vi.fn().mockResolvedValue({
      assessmentsName: mockAssessmentName
    });

    mockGetAssessmentDetail.mockReturnValue({
      mutateAsync: mockMutateAsync
    } as any);

    render(<AssessmentReceiptDetail />);

    await waitFor(() => {
      expect(AppStateStore.setCustomBreadcrumbsItems).toHaveBeenCalled();
    });

    // Should be called at least twice: once with empty name, once with fetched name
    expect(AppStateStore.setCustomBreadcrumbsItems).toHaveBeenCalledTimes(2);
  });

  it('renders ReceiptDetail with correct page title', () => {
    const mockMutateAsync = vi.fn();
    mockGetAssessmentDetail.mockReturnValue({
      mutateAsync: mockMutateAsync
    } as any);

    render(<AssessmentReceiptDetail />);

    expect(
      screen.getByText('assessmentDetail.paymentDetail.title')
    ).toBeInTheDocument();
  });

  it('passes correct data to ReceiptDetail component', () => {
    const mockMutateAsync = vi.fn();
    mockGetAssessmentDetail.mockReturnValue({
      mutateAsync: mockMutateAsync
    } as any);

    render(<AssessmentReceiptDetail />);

    expect(screen.getByTestId('summary-data')).toHaveTextContent(
      JSON.stringify(mockSummaryData)
    );
    expect(screen.getByTestId('payment-data')).toHaveTextContent(
      JSON.stringify(mockPaymentData)
    );
  });

  it('does not render call to action button', () => {
    const mockMutateAsync = vi.fn();
    mockGetAssessmentDetail.mockReturnValue({
      mutateAsync: mockMutateAsync
    } as any);

    render(<AssessmentReceiptDetail />);

    // ReceiptDetail should be called without callToAction prop
    expect(screen.queryByTestId('cta-button')).not.toBeInTheDocument();
  });
});
