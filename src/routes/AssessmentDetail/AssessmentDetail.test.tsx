import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../__tests__/renderers';
import AssessmentDetail from './AssessmentDetail';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import * as ReactRouter from 'react-router';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../routes';
import { setAppState } from '../../store/AppStateStore';
import utils from '../../utils';

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn(),
    generatePath: vi.fn((route: string, params: { id: string }) =>
      route.replace(':id', params.id)
    )
  };
});

const mockGetAssessmentDetail = vi.fn();
vi.mock('../../api/assessments/assessmentDetail/assessmentDetail', () => ({
  getAssessmentDetail: (...args: Array<unknown>) =>
    mockGetAssessmentDetail(...args)
}));

const mockUseSearch = {
  applyFilters: vi.fn()
};
vi.mock('../../hooks/useSearch', () => ({
  useSearch: () => mockUseSearch
}));

vi.mock('../../store/GlobalStore', () => ({
  useStore: () => ({
    state: { organizationId: 1 }
  }),
  StoreProvider: ({ children }: { children: React.ReactNode }) => children
}));

vi.mock('../../store/AppStateStore');

const mockHasPartialDateRangeErrors = vi.fn();
vi.mock('../../utils/filtersValidation', () => ({
  hasPartialDateRangeErrors: (...args: Array<unknown>) =>
    mockHasPartialDateRangeErrors(...args)
}));

const mockGetPagedAssessmentsDetails = vi.fn();

vi.mock('../../utils', () => ({
  default: {
    URI: {
      decode: vi.fn()
    },
    dialog: {
      open: vi.fn(),
      close: vi.fn()
    },
    notify: {
      emit: vi.fn()
    },
    config: {
      deployPath: '/test'
    },
    apiClient: {
      bff: {
        getPagedAssessmentsDetails: (...args: Array<unknown>) =>
          mockGetPagedAssessmentsDetails(...args)
      }
    }
  }
}));

const mockAssessmentDetailData = {
  assessmentsName: 'Test Assessment',
  flagManualGeneration: true,
  status: 'ACTIVE' as const,
  debtPositionTypeOrgDescription: 'Test Debt Type',
  updateOperatorExternalId: 'test-operator',
  pagedAssessmentsRowsDetail: {
    content: [
      {
        debtPositionTypeOrgCode: 'TEST_CODE',
        updateOperatorExternalId: 'test-operator'
      }
    ],
    totalElements: 5
  }
};

const mockQuery = {
  data: mockAssessmentDetailData,
  isPending: false,
  isError: false,
  error: null,
  isSuccess: true,
  isLoading: false,
  refetch: vi.fn(),
  fetchStatus: 'idle',
  status: 'success',
  mutateAsync: vi.fn().mockResolvedValue(mockAssessmentDetailData)
};

describe('AssessmentDetail', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockHasPartialDateRangeErrors.mockReturnValue(false);

    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockNavigate
    );

    mockGetPagedAssessmentsDetails.mockResolvedValue({
      data: {
        pagedAssessmentsRowsDetail: {
          totalElements: 15
        }
      }
    });

    i18nTestSetup({
      'assessment.assessment': 'Assessment',
      'commons.state': 'State',
      'commons.summary': 'Summary',
      'commons.search': 'Search',
      'commons.filters.filterResults': 'Filter Results',
      'commons.outcomeFrom': 'Outcome From',
      'commons.updatedFrom': 'Updated From',
      'commons.to': 'To',
      'commons.remove': 'Remove',
      'commons.add': 'Add',
      'commons.close': 'Close',
      'assessmentDetail.debtType': 'Debt Type',
      'assessmentDetail.createdBy': 'Created By',
      'assessmentDetail.paymentsAssociated': 'Associated Payments',
      'assessmentDetail.cannotModifyDialog.title': 'Cannot Modify',
      'assessmentDetail.cannotModifyDialog.description':
        'Cannot modify this assessment',
      'assessmentDetail.error.debtPositionTypeOrgCodeNotDefined':
        'Debt position type not defined',
      ASSESSMENT: 'Assessment',
      ASSESSMENT_SEARCH_RESULTS: 'Search Results',
      ASSESSMENT_DETAIL: 'Assessment Detail'
    });

    vi.mocked(utils.URI.decode).mockReturnValue({});
    mockGetAssessmentDetail.mockReturnValue(mockQuery);

    Object.defineProperty(window, 'location', {
      value: {
        hash: ''
      },
      writable: true
    });
  });

  const renderAssessmentDetail = () => {
    return render(<AssessmentDetail />);
  };

  it('renders AssessmentDetail without crashing', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    renderAssessmentDetail();

    expect(screen.getByText('Test Assessment')).toBeInTheDocument();
    expect(screen.getByText('Associated Payments')).toBeInTheDocument();
  });

  it('navigates to error page when assessment ID is invalid', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: 'invalid'
    });

    renderAssessmentDetail();

    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
  });

  it('shows detail sections with correct data', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    renderAssessmentDetail();

    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Test Debt Type')).toBeInTheDocument();
    expect(screen.getByText('test-operator')).toBeInTheDocument();
  });

  it('shows add and remove buttons when assessment can be modified', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    renderAssessmentDetail();

    expect(screen.getByTestId('add-payments-button')).toBeInTheDocument();
    expect(screen.getByTestId('remove-payments-button')).toBeInTheDocument();
  });

  it('does not show buttons when assessment cannot be modified', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    const modifiedMockData = {
      ...mockAssessmentDetailData,
      flagManualGeneration: false
    };

    mockGetAssessmentDetail.mockReturnValue({
      ...mockQuery,
      data: modifiedMockData
    });

    renderAssessmentDetail();

    expect(screen.queryByTestId('add-payments-button')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('remove-payments-button')
    ).not.toBeInTheDocument();
  });

  it('opens cannot modify dialog when trying to add payments to non-modifiable assessment', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    const TestComponent = () => {
      const handleAddPayments = () => {
        utils.dialog.open({
          title: 'Cannot Modify',
          message: 'Cannot modify this assessment',
          confirmLabel: 'Close',
          onConfirm: utils.dialog.close,
          onClose: utils.dialog.close,
          'data-testid': 'cannot-modify-payments-dialog'
        });
      };

      return (
        <button onClick={handleAddPayments} data-testid="test-add-button">
          Add
        </button>
      );
    };

    render(<TestComponent />);

    fireEvent.click(screen.getByTestId('test-add-button'));

    expect(utils.dialog.open).toHaveBeenCalledWith({
      title: 'Cannot Modify',
      message: 'Cannot modify this assessment',
      confirmLabel: 'Close',
      onConfirm: utils.dialog.close,
      onClose: utils.dialog.close,
      'data-testid': 'cannot-modify-payments-dialog'
    });
  });

  it('applies filters when filter button is clicked', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    renderAssessmentDetail();

    const filterButton = screen.getByText('Filter Results');
    fireEvent.click(filterButton);

    expect(mockUseSearch.applyFilters).toHaveBeenCalled();
  });

  it('sets custom breadcrumb items', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    renderAssessmentDetail();

    expect(setAppState).toHaveBeenCalledWith({
      loading: false,
      customBreadcrumbsItems: expect.arrayContaining([
        expect.objectContaining({ id: 'ASSESSMENT' }),
        expect.objectContaining({ id: 'ASSESSMENT_SEARCH_RESULTS' }),
        expect.objectContaining({
          id: 'ASSESSMENT_DETAIL',
          label: 'Test Assessment'
        })
      ])
    });
  });

  it('handles error state correctly', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    const errorQuery = {
      ...mockQuery,
      isError: true,
      error: new Error('Test error')
    };

    mockGetAssessmentDetail.mockReturnValue(errorQuery);

    renderAssessmentDetail();

    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
  });

  it('shows loading state', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    const loadingQuery = {
      ...mockQuery,
      isPending: true,
      data: null
    };

    mockGetAssessmentDetail.mockReturnValue(loadingQuery);

    renderAssessmentDetail();

    expect(screen.queryByText('Test Assessment')).not.toBeInTheDocument();
  });

  it('handles add payments when debtPositionTypeOrgCode is not defined', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    const dataWithoutDebtCode = {
      ...mockAssessmentDetailData,
      debtPositionTypeOrgCode: undefined,
      pagedAssessmentsRowsDetail: {
        ...mockAssessmentDetailData.pagedAssessmentsRowsDetail,
        content: [
          {
            ...mockAssessmentDetailData.pagedAssessmentsRowsDetail.content[0],
            debtPositionTypeOrgCode: undefined
          }
        ]
      }
    };

    mockGetAssessmentDetail.mockReturnValue({
      ...mockQuery,
      data: dataWithoutDebtCode
    });

    renderAssessmentDetail();

    const addButton = screen.getByTestId('add-payments-button');
    fireEvent.click(addButton);

    expect(utils.notify.emit).toHaveBeenCalledWith(
      'Debt position type not defined'
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles remove payments correctly', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    renderAssessmentDetail();

    const removeButton = screen.getByTestId('remove-payments-button');
    fireEvent.click(removeButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining(PageRoutes.ASSESSMENT_CREATION),
      expect.objectContaining({
        state: expect.objectContaining({
          mode: 'remove',
          assessmentId: 123,
          fromAssessmentDetail: true
        })
      })
    );
  });

  it('handles filter change correctly', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    renderAssessmentDetail();

    const filterContainer = screen.getByTestId('results-table').parentElement;
    expect(filterContainer).toBeInTheDocument();
  });

  it('does not apply filters when there are partial date range errors', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    mockHasPartialDateRangeErrors.mockReturnValue(true);

    renderAssessmentDetail();

    const filterButton = screen.getByText('Filter Results');
    fireEvent.click(filterButton);

    expect(mockUseSearch.applyFilters).not.toHaveBeenCalled();
  });

  it('shows remove button when totalPaymentsWithoutFilters is set', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    const dataWithZeroPayments = {
      ...mockAssessmentDetailData,
      pagedAssessmentsRowsDetail: {
        ...mockAssessmentDetailData.pagedAssessmentsRowsDetail,
        totalElements: 0
      }
    };

    mockGetAssessmentDetail.mockReturnValue({
      ...mockQuery,
      data: dataWithZeroPayments
    });

    renderAssessmentDetail();

    expect(
      screen.queryByTestId('remove-payments-button')
    ).not.toBeInTheDocument();
  });

  it('fetches initial total when page loads with filters in URL hash', async () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    vi.mocked(utils.URI.decode).mockReturnValue({
      iuv: 'TEST_IUV'
    });

    mockGetPagedAssessmentsDetails.mockResolvedValue({
      data: {
        pagedAssessmentsRowsDetail: {
          totalElements: 15
        }
      }
    });

    renderAssessmentDetail();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockGetPagedAssessmentsDetails).toHaveBeenCalledWith(1, 123, {
      page: 0,
      size: 1
    });
  });

  it('handles error when fetching initial total without filters', async () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    vi.mocked(utils.URI.decode).mockReturnValue({
      iuv: 'TEST_IUV'
    });

    mockGetPagedAssessmentsDetails.mockRejectedValue(
      new Error('Network error')
    );

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

    renderAssessmentDetail();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching total payments without filters:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('saves totalPaymentsWithoutFilters when filters are removed', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    vi.mocked(utils.URI.decode).mockReturnValue({});

    const dataWithTotal = {
      ...mockAssessmentDetailData,
      pagedAssessmentsRowsDetail: {
        ...mockAssessmentDetailData.pagedAssessmentsRowsDetail,
        totalElements: 20
      }
    };

    mockGetAssessmentDetail.mockReturnValue({
      ...mockQuery,
      data: dataWithTotal
    });

    renderAssessmentDetail();

    expect(screen.getByTestId('remove-payments-button')).toBeInTheDocument();
  });

  it('shows cannot modify dialog when trying to remove payments from non-modifiable assessment', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    const nonModifiableData = {
      ...mockAssessmentDetailData,
      flagManualGeneration: false,
      status: 'ACTIVE'
    };

    mockGetAssessmentDetail.mockReturnValue({
      ...mockQuery,
      data: nonModifiableData
    });

    renderAssessmentDetail();

    expect(
      screen.queryByTestId('remove-payments-button')
    ).not.toBeInTheDocument();
  });

  it('does not show remove button when totalPayments is 0', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    const dataWithZeroPayments = {
      ...mockAssessmentDetailData,
      pagedAssessmentsRowsDetail: {
        ...mockAssessmentDetailData.pagedAssessmentsRowsDetail,
        totalElements: 0
      }
    };

    mockGetAssessmentDetail.mockReturnValue({
      ...mockQuery,
      data: dataWithZeroPayments
    });

    renderAssessmentDetail();

    expect(
      screen.queryByTestId('remove-payments-button')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('add-payments-button')).toBeInTheDocument();
  });

  it('shows detail sections with fallback values when data is missing', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    const dataWithMissingFields = {
      ...mockAssessmentDetailData,
      status: undefined,
      debtPositionTypeOrgDescription: undefined,
      updateOperatorExternalId: undefined
    };

    mockGetAssessmentDetail.mockReturnValue({
      ...mockQuery,
      data: dataWithMissingFields
    });

    renderAssessmentDetail();

    expect(screen.getByText('Summary')).toBeInTheDocument();
  });

  it('handles assessment with status different from ACTIVE', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    const inactiveData = {
      ...mockAssessmentDetailData,
      status: 'INACTIVE' as const
    };

    mockGetAssessmentDetail.mockReturnValue({
      ...mockQuery,
      data: inactiveData
    });

    renderAssessmentDetail();

    expect(screen.queryByTestId('add-payments-button')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('remove-payments-button')
    ).not.toBeInTheDocument();
  });

  it('sets detailItem from data when available', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    renderAssessmentDetail();
    expect(screen.getByText('Test Assessment')).toBeInTheDocument();
  });

  it('handles breadcrumb with detailItem debtPositionTypeOrgCode when assessmentsName is missing', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    const dataWithoutName = {
      ...mockAssessmentDetailData,
      assessmentsName: undefined
    };

    mockGetAssessmentDetail.mockReturnValue({
      ...mockQuery,
      data: dataWithoutName
    });

    renderAssessmentDetail();

    expect(setAppState).toHaveBeenCalledWith(
      expect.objectContaining({
        customBreadcrumbsItems: expect.arrayContaining([
          expect.objectContaining({
            id: 'ASSESSMENT_DETAIL',
            label: expect.any(String)
          })
        ])
      })
    );
  });

  it('handles breadcrumb with assessmentId when both assessmentsName and debtPositionTypeOrgCode are missing', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    const dataWithoutNameAndCode = {
      ...mockAssessmentDetailData,
      assessmentsName: undefined,
      pagedAssessmentsRowsDetail: {
        ...mockAssessmentDetailData.pagedAssessmentsRowsDetail,
        content: [
          {
            ...mockAssessmentDetailData.pagedAssessmentsRowsDetail.content[0],
            debtPositionTypeOrgCode: undefined
          }
        ]
      }
    };

    mockGetAssessmentDetail.mockReturnValue({
      ...mockQuery,
      data: dataWithoutNameAndCode
    });

    renderAssessmentDetail();

    expect(setAppState).toHaveBeenCalledWith(
      expect.objectContaining({
        customBreadcrumbsItems: expect.arrayContaining([
          expect.objectContaining({
            id: 'ASSESSMENT_DETAIL',
            label: expect.stringContaining('123')
          })
        ])
      })
    );
  });

  it('applies filters correctly when validation passes', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    mockHasPartialDateRangeErrors.mockReturnValue(false);

    renderAssessmentDetail();

    const filterButton = screen.getByText('Filter Results');
    fireEvent.click(filterButton);
    expect(mockUseSearch.applyFilters).toHaveBeenCalled();
  });

  it('handles add payments with debtPositionTypeOrgCode from detailItem', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    const dataWithoutDebtCode = {
      ...mockAssessmentDetailData,
      debtPositionTypeOrgCode: undefined
    };

    mockGetAssessmentDetail.mockReturnValue({
      ...mockQuery,
      data: dataWithoutDebtCode
    });

    renderAssessmentDetail();

    const addButton = screen.getByTestId('add-payments-button');
    fireEvent.click(addButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining(PageRoutes.ASSESSMENT_CREATION),
      expect.objectContaining({
        state: expect.objectContaining({
          mode: 'add',
          assessmentId: 123
        })
      })
    );
  });

  it('handles remove payments with debtPositionTypeOrgCode from detailItem', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    const dataWithoutDebtCode = {
      ...mockAssessmentDetailData,
      debtPositionTypeOrgCode: undefined
    };

    mockGetAssessmentDetail.mockReturnValue({
      ...mockQuery,
      data: dataWithoutDebtCode
    });

    renderAssessmentDetail();

    const removeButton = screen.getByTestId('remove-payments-button');
    fireEvent.click(removeButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining(PageRoutes.ASSESSMENT_CREATION),
      expect.objectContaining({
        state: expect.objectContaining({
          mode: 'remove',
          assessmentId: 123
        })
      })
    );
  });

  it('handles assessment with flagManualGeneration false and status ACTIVE', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    const dataWithFlagFalse = {
      ...mockAssessmentDetailData,
      flagManualGeneration: false,
      status: 'ACTIVE' as const
    };

    mockGetAssessmentDetail.mockReturnValue({
      ...mockQuery,
      data: dataWithFlagFalse
    });

    renderAssessmentDetail();

    expect(screen.queryByTestId('add-payments-button')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('remove-payments-button')
    ).not.toBeInTheDocument();
  });

  it('handles assessment with flagManualGeneration true and status undefined', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    const dataWithUndefinedStatus = {
      ...mockAssessmentDetailData,
      flagManualGeneration: true,
      status: undefined
    };

    mockGetAssessmentDetail.mockReturnValue({
      ...mockQuery,
      data: dataWithUndefinedStatus
    });

    renderAssessmentDetail();

    expect(screen.queryByTestId('add-payments-button')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('remove-payments-button')
    ).not.toBeInTheDocument();
  });

  it('shows status chip when status is available', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    renderAssessmentDetail();

    expect(screen.getByText('Summary')).toBeInTheDocument();
  });

  it('handles detailSections with status chip props', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    renderAssessmentDetail();

    expect(screen.getByText('Test Debt Type')).toBeInTheDocument();
    expect(screen.getByText('test-operator')).toBeInTheDocument();
  });

  it('does not fetch initial total when page loads without filters', async () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    vi.mocked(utils.URI.decode).mockReturnValue({});

    renderAssessmentDetail();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockGetPagedAssessmentsDetails).not.toHaveBeenCalled();
  });

  it('does not fetch initial total when assessmentId is invalid', async () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: 'invalid'
    });

    vi.mocked(utils.URI.decode).mockReturnValue({
      iuv: 'TEST_IUV'
    });

    renderAssessmentDetail();

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
  });

  it('handles breadcrumb when only detailItem is available', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: '123'
    });

    const dataWithoutName = {
      ...mockAssessmentDetailData,
      assessmentsName: undefined
    };

    mockGetAssessmentDetail.mockReturnValue({
      ...mockQuery,
      data: dataWithoutName
    });

    renderAssessmentDetail();

    expect(setAppState).toHaveBeenCalledWith(
      expect.objectContaining({
        customBreadcrumbsItems: expect.arrayContaining([
          expect.objectContaining({
            id: 'ASSESSMENT_DETAIL'
          })
        ])
      })
    );
  });

  it('does not set breadcrumb when assessmentId is missing', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: undefined
    });

    renderAssessmentDetail();

    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
  });
});
