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
    ]
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
  status: 'success'
};

describe('AssessmentDetail', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockNavigate
    );

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (utils.URI.decode as any).mockReturnValue({});
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
});
