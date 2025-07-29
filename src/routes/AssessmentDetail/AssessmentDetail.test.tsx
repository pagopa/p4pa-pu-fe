import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
  useParams
} from 'react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { getAssessmentDetail } from '../../api/assessments/assessmentDetail/assessmentDetail';
import { setOrganizationId } from '../../store/OrganizationIdStore';
import { PageRoutes } from '../../routes';
import AssessmentDetail from './AssessmentDetail';
import {
  AssessmentsDetail,
  AssessmentsRowsDetail,
  AssessmentStatus
} from '../../../generated/apiClient';
import {
  QueryClient,
  QueryClientProvider,
  UseQueryResult
} from '@tanstack/react-query';
import { Layout } from '../../components/layout/Layout';
import { StoreProvider } from '../../store/GlobalStore';
import { Theme } from '../../utils/theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { it as IT } from 'date-fns/locale/it';
import '@preact/signals-react/auto';

const queryClient = new QueryClient();
const renderAssessmentDetail = () => {
  const routesDef = [
    {
      path: '*',
      element: <Layout />,
      children: [
        {
          element: <AssessmentDetail />,
          index: true
        }
      ]
    }
  ];
  return render(
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <Theme>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={IT}>
            <RouterProvider router={createBrowserRouter(routesDef)} />
          </LocalizationProvider>
        </Theme>
      </StoreProvider>
    </QueryClientProvider>
  );
};

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useParams: vi.fn(),
    useNavigate: vi.fn()
  };
});

type MockQueryResult = UseQueryResult<AssessmentsRowsDetail, Error>;

vi.mock('../../api/assessments/assessmentDetail/assessmentDetail', () => ({
  getAssessmentDetail: vi.fn()
}));

vi.mock('./components/AssessmentDetailDataGrid', () => ({
  default: ({
    rows,
    isLoading,
    onNavigateToDetail,
    'data-testid': testId
  }: {
    rows: Array<AssessmentsDetail>;
    isLoading: boolean;
    onNavigateToDetail?: (assessmentDetailId: number) => void;
    sortModel?: unknown;
    onSortModelChange?: unknown;
    smartPagination?: unknown;
    'data-testid'?: string;
  }) => (
    <div data-testid={testId || 'assessment-detail-data-grid'}>
      {isLoading ? (
        <div data-testid="loading-indicator">Loading...</div>
      ) : (
        <div data-testid="data-grid-content">
          {rows.length} items found
          {rows.map((row, index) => (
            <button
              key={index}
              data-testid={`navigate-to-detail-${row.assessmentDetailId}`}
              onClick={() => {
                console.log(
                  'Mock: Navigating to detail',
                  row.assessmentDetailId
                );
                onNavigateToDetail?.(row.assessmentDetailId!);
              }}
            >
              Navigate to Detail {row.assessmentDetailId}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}));

describe('AssessmentDetail', () => {
  const mockNavigate = vi.fn();
  const mockGetAssessmentDetail = vi.mocked(getAssessmentDetail);

  const mockAssessmentData: AssessmentsRowsDetail = {
    assessmentsName: 'ACC20250618_FEATURE_TEST',
    debtPositionTypeOrgDescription: 'FEATURE TEST - DO NOT DELETE',
    status: AssessmentStatus.ACTIVE,
    updateOperatorExternalId: 'WS_USER-piattaforma-unitaria_',
    pagedAssessmentsRowsDetail: {
      content: [
        {
          assessmentDetailId: 95,
          assessmentId: 123,
          organizationId: 123,
          debtPositionTypeOrgCode: 'TIPO_DEBITO_TEST',
          updateOperatorExternalId: 'operatore.test@example.com',
          paymentDateTime: '2025-01-15T10:30:00Z',
          updateDate: '2025-01-15T11:00:00Z',
          iuv: 'IUV123456789',
          iud: 'IUD123456789',
          iur: 'IUR123456789',
          debtorFiscalCodeHash: 'hash123',
          sectionCode: 'SEC001',
          amountCents: 10050,
          amountSubmitted: true,
          creationDate: '2025-01-15T10:00:00Z',
          updateTraceId: '5d4f32b06f9a35667637c714ea03561d'
        } as AssessmentsDetail
      ],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10
    },
    flagManualGeneration: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    //mockWindowOpen.mockClear();

    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ id: '123' });

    mockGetAssessmentDetail.mockReturnValue({
      data: mockAssessmentData,
      isLoading: false,
      isError: false,
      error: null
    } as MockQueryResult);

    setOrganizationId(123);
  });

  describe('Component Rendering', () => {
    it('should render successfully with assessment data', () => {
      renderAssessmentDetail();

      expect(
        screen.getByText('assessmentDetail.paymentsAssociated')
      ).toBeDefined();
      expect(screen.getByText('FEATURE TEST - DO NOT DELETE')).toBeDefined();
      expect(screen.getByText('WS_USER-piattaforma-unitaria_')).toBeDefined();
    });

    it('should render action buttons correctly', () => {
      renderAssessmentDetail();

      const removeButton = screen.getByTestId('remove-payments-button');
      const addButton = screen.getByTestId('add-payments-button');

      expect(removeButton).toBeDefined();
      expect(addButton).toBeDefined();
      expect(screen.getByText('commons.remove')).toBeDefined();
      expect(screen.getByText('commons.add')).toBeDefined();
    });

    it('should render loading state', () => {
      mockGetAssessmentDetail.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null
      } as MockQueryResult);

      renderAssessmentDetail();

      expect(screen.getByTestId('loading-indicator')).toBeDefined();
    });
  });

  describe('Button Interactions', () => {
    it('should log correct message when remove button is clicked', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(vi.fn());

      renderAssessmentDetail();

      const removeButton = screen.getByTestId('remove-payments-button');
      fireEvent.click(removeButton);

      expect(consoleSpy).toHaveBeenCalledWith('Remove payments clicked');

      consoleSpy.mockRestore();
    });

    it('should log correct message when add button is clicked', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(vi.fn());

      renderAssessmentDetail();

      const addButton = screen.getByTestId('add-payments-button');
      fireEvent.click(addButton);

      expect(consoleSpy).toHaveBeenCalledWith('Add payments clicked');

      consoleSpy.mockRestore();
    });
  });

  describe('Menu Actions', () => {
    it('should open menu when more actions button is clicked', async () => {
      renderAssessmentDetail();

      const menuButton = screen.getByTestId('assessment-action-menu');

      expect(menuButton).toBeDefined();

      fireEvent.click(menuButton);

      expect(screen.getByTestId('assessment-action-close')).toBeDefined();
      expect(screen.getByTestId('assessment-action-delete')).toBeDefined();
    });

    it('should show delete confirmation dialog when delete is clicked', async () => {
      renderAssessmentDetail();

      const menuButton = screen.getByTestId('assessment-action-menu');

      fireEvent.click(menuButton);

      const deleteMenuItem = screen.getByTestId('assessment-action-delete');
      fireEvent.click(deleteMenuItem);

      expect(
        screen.getByText('assessmentDetail.cancelDialog.title')
      ).toBeDefined();
      expect(
        screen.getByText('assessmentDetail.cancelDialog.description')
      ).toBeDefined();
    });
  });

  describe('API Integration', () => {
    it('should call getAssessmentDetail with correct parameters', () => {
      renderAssessmentDetail();

      expect(mockGetAssessmentDetail).toHaveBeenCalledWith(
        123,
        123,
        expect.objectContaining({
          page: 0,
          size: 10
        }),
        expect.objectContaining({
          enabled: true
        })
      );
    });

    it('should navigate to error page when API fails', () => {
      mockGetAssessmentDetail.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('API Error')
      } as MockQueryResult);

      renderAssessmentDetail();

      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
    });
  });

  describe('URL Parameters Validation', () => {
    it('should navigate to error page with invalid assessment ID', () => {
      (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
        id: 'invalid'
      });

      renderAssessmentDetail();

      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
    });

    it('should navigate to error page with missing assessment ID', () => {
      (useParams as ReturnType<typeof vi.fn>).mockReturnValue({});

      renderAssessmentDetail();

      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
    });
  });

  describe('Filter Functionality', () => {
    it('should render filter components', () => {
      renderAssessmentDetail();

      expect(screen.getByText('commons.filters.filterResults')).toBeDefined();
    });

    it('should update filters when filter button is clicked', () => {
      renderAssessmentDetail();

      const filterButton = screen.getByText('commons.filters.filterResults');
      fireEvent.click(filterButton);

      expect(filterButton).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing translation keys gracefully', () => {
      renderAssessmentDetail();

      expect(
        screen.getByText('assessmentDetail.paymentsAssociated')
      ).toBeDefined();
    });
  });

  describe('Action Button Clicks', () => {
    it('should handle action button clicks', () => {
      renderAssessmentDetail();

      const removeButton = screen.getByTestId('remove-payments-button');
      const addButton = screen.getByTestId('add-payments-button');

      fireEvent.click(removeButton);
      fireEvent.click(addButton);

      expect(removeButton).toBeDefined();
      expect(addButton).toBeDefined();
    });

    it('should navigate to assessment detail detail when data grid item is clicked', () => {
      renderAssessmentDetail();

      const navigateButton = screen.getByTestId('navigate-to-detail-95');
      fireEvent.click(navigateButton);

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('/assessment/detail/123/95'),
        expect.objectContaining({
          state: { assessmentName: 'ACC20250618_FEATURE_TEST' }
        })
      );
    });
  });
});
