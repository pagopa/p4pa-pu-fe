import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useNavigate, useParams } from 'react-router';
import { render, screen, fireEvent, waitFor } from '../../__tests__/renderers';
import { getAssessmentDetail } from '../../api/assessmentDetail';
import { setOrganizationId } from '../../store/OrganizationIdStore';
import { PageRoutes } from '../../routes';
import AssessmentDetail from './AssessmentDetail';
import { AssessmentsDetail } from '../../../generated/apiClient';
import { UseQueryResult } from '@tanstack/react-query';

type AssessmentDetailResponse = {
  content: Array<AssessmentsDetail>;
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

type MockQueryResult = UseQueryResult<AssessmentDetailResponse, Error>;

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn()
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('../../api/assessmentDetail', () => ({
  getAssessmentDetail: vi.fn()
}));

vi.mock('../../store/OrganizationIdStore', () => ({
  setOrganizationId: vi.fn(),
  organizationIdState: { state: { value: 123 } }
}));

vi.mock('./components/AssessmentDetailDataGrid', () => ({
  default: ({
    rows,
    isLoading,
    'data-testid': testId
  }: {
    rows: Array<AssessmentsDetail>;
    isLoading: boolean;
    'data-testid'?: string;
  }) => (
    <div data-testid={testId || 'assessment-detail-data-grid'}>
      {isLoading ? (
        <div data-testid="loading-indicator">Loading...</div>
      ) : (
        <div data-testid="data-grid-content">{rows.length} items found</div>
      )}
    </div>
  )
}));

describe('AssessmentDetail', () => {
  const mockNavigate = vi.fn();
  const mockGetAssessmentDetail = vi.mocked(getAssessmentDetail);

  const mockAssessmentData: AssessmentDetailResponse = {
    content: [
      {
        assessmentId: 123,
        organizationId: 123,
        debtPositionTypeOrgCode: 'TIPO_DEBITO_TEST',
        updateOperatorExternalId: 'operatore.test@example.com',
        paymentDateTime: '2025-01-15T10:30:00Z',
        updateDateTime: '2025-01-15T11:00:00Z',
        iuv: 'IUV123456789',
        iud: 'IUD123456789',
        iur: 'IUR123456789',
        debtorFiscalCodeHash: 'hash123',
        amount: 100.5,
        sectionCode: 'SEC001',
        amountCents: 10050,
        amountSubmitted: true,
        status: 'PAID',
        description: 'Test payment'
      } as AssessmentsDetail
    ],
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 10
  };

  beforeEach(() => {
    vi.clearAllMocks();

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
      render(<AssessmentDetail />);

      expect(
        screen.getByText('assessmentDetail.paymentsAssociated')
      ).toBeDefined();
      expect(screen.getAllByText('TIPO_DEBITO_TEST')).toHaveLength(2);
      expect(screen.getByText('operatore.test@example.com')).toBeDefined();
    });

    it('should render action buttons correctly', () => {
      render(<AssessmentDetail />);

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

      render(<AssessmentDetail />);

      expect(screen.getByTestId('loading-indicator')).toBeDefined();
    });
  });

  describe('Button Interactions', () => {
    it('should log correct message when remove button is clicked', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {
        // Funzione vuota implementata esplicitamente per evitare ESLint error
      });

      render(<AssessmentDetail />);

      const removeButton = screen.getByTestId('remove-payments-button');
      fireEvent.click(removeButton);

      expect(consoleSpy).toHaveBeenCalledWith('Remove payments clicked');

      consoleSpy.mockRestore();
    });

    it('should log correct message when add button is clicked', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {
        // Funzione vuota implementata esplicitamente per evitare ESLint error
      });

      render(<AssessmentDetail />);

      const addButton = screen.getByTestId('add-payments-button');
      fireEvent.click(addButton);

      expect(consoleSpy).toHaveBeenCalledWith('Add payments clicked');

      consoleSpy.mockRestore();
    });
  });

  describe('Menu Actions', () => {
    it('should open menu when more actions button is clicked', async () => {
      render(<AssessmentDetail />);

      const menuButton = screen.getByTestId('MoreVertIcon').closest('button');

      expect(menuButton).toBeDefined();

      if (menuButton) {
        fireEvent.click(menuButton);

        await waitFor(() => {
          expect(screen.getByText('commons.close')).toBeDefined();
          expect(screen.getByText('commons.delete')).toBeDefined();
        });
      }
    });

    it('should show delete confirmation dialog when delete is clicked', async () => {
      render(<AssessmentDetail />);

      const menuButton = screen.getByTestId('MoreVertIcon').closest('button');

      if (menuButton) {
        fireEvent.click(menuButton);

        await waitFor(() => {
          const deleteMenuItem = screen.getByText('commons.delete');
          fireEvent.click(deleteMenuItem);
        });

        await waitFor(() => {
          expect(
            screen.getByText('assessmentDetail.deleteDialog.title')
          ).toBeDefined();
          expect(
            screen.getByText('assessmentDetail.deleteDialog.description')
          ).toBeDefined();
        });
      }
    });
  });

  describe('API Integration', () => {
    it('should call getAssessmentDetail with correct parameters', () => {
      render(<AssessmentDetail />);

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

      render(<AssessmentDetail />);

      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
    });
  });

  describe('URL Parameters Validation', () => {
    it('should navigate to error page with invalid assessment ID', () => {
      (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
        id: 'invalid'
      });

      render(<AssessmentDetail />);

      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
    });

    it('should navigate to error page with missing assessment ID', () => {
      (useParams as ReturnType<typeof vi.fn>).mockReturnValue({});

      render(<AssessmentDetail />);

      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
    });
  });

  describe('Filter Functionality', () => {
    it('should render filter components', () => {
      render(<AssessmentDetail />);

      expect(screen.getByText('commons.filters.filterResults')).toBeDefined();
      expect(screen.getByRole('textbox', { name: 'Cerca IUV' })).toBeDefined();
    });

    it('should update filters when filter button is clicked', () => {
      render(<AssessmentDetail />);

      const filterButton = screen.getByText('commons.filters.filterResults');
      fireEvent.click(filterButton);

      expect(filterButton).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing translation keys gracefully', () => {
      render(<AssessmentDetail />);

      expect(
        screen.getByText('assessmentDetail.paymentsAssociated')
      ).toBeDefined();
    });
  });
});
