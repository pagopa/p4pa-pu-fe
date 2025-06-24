/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../__tests__/renderers';
import ExportFlow from './ExportFlowPage';
import { useParams, useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../routes';
import * as useDateRange from '../../hooks/useDateRange';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
  useParams: vi.fn()
}));

vi.mock('./useDebtPositionsTypeOrg', () => ({
  useDebtPositionsTypeOrg: () => ({
    isSuccess: true,
    optionsMap: [
      { label: 'Type A', value: 1 },
      { label: 'Type B', value: 2 }
    ]
  })
}));

vi.mock('../../store/GlobalStore', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useStore: () => ({
      state: { organizationId: 'test-org-123' }
    })
  };
});

const mockPaidExportMutate = vi.fn();
const mockConservationExportMutate = vi.fn();

vi.mock('../../api/createExportFile', () => ({
  createPaidExportFile: () => ({
    mutate: mockPaidExportMutate
  }),
  createReceiptsArchivingExportFile: () => ({
    mutate: mockConservationExportMutate
  })
}));
vi.mock('../../hooks/useDateRange');

describe('ExportFlow', () => {
  const mockUseParams = vi.mocked(useParams);
  const mockUseNavigate = vi.mocked(useNavigate);
  const mockUseDateRange = vi.mocked(useDateRange.useDateRange);
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockPaidExportMutate.mockClear();
    mockConservationExportMutate.mockClear();

    mockUseDateRange.mockReturnValue({
      fromDate: null,
      toDate: null,
      setFromDate: vi.fn(),
      setFromDateToday: vi.fn(),
      setToDate: vi.fn(),
      setToDateToday: vi.fn(),
      setFromError: vi.fn(),
      setToError: vi.fn(),
      resetDates: vi.fn(),
      isButtonDisabled: true
    });
  });

  describe('ExportFlow receipt', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ category: 'receipt' });
    });

    it('renders all fields', () => {
      render(<ExportFlow />);

      expect(screen.getByText('exportFlow.title')).toBeDefined();
      expect(screen.getByText('commons.paymentDate')).toBeDefined();
      expect(screen.getAllByText('exportFlow.fileVersion')[0]).toBeDefined();
      expect(screen.getByText('exportFlow.dueType')).toBeDefined();
      expect(screen.getByTestId('exit-button')).toBeDefined();
      expect(screen.getByTestId('success-button')).toBeDefined();
    });

    it('keeps success button disabled initially', () => {
      render(<ExportFlow />);
      expect(screen.getByTestId('success-button')).toHaveProperty(
        'disabled',
        true
      );
    });

    it('initializes form data correctly', () => {
      render(<ExportFlow />);

      expect(screen.getByText('exportFlow.title')).toBeDefined();
      expect(screen.getByText('commons.paymentDate')).toBeDefined();
    });

    it('handles non-axios error with unknown structure', async () => {
      mockUseDateRange.mockReturnValue({
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-01-31'),
        setFromDate: vi.fn(),
        setFromDateToday: vi.fn(),
        setToDate: vi.fn(),
        setToDateToday: vi.fn(),
        setFromError: vi.fn(),
        setToError: vi.fn(),
        resetDates: vi.fn(),
        isButtonDisabled: false
      });

      const mockError = { message: 'Generic error' };

      mockPaidExportMutate.mockImplementation((_params, options) => {
        options.onError(mockError);
      });

      render(<ExportFlow />);

      const successButton = screen.getByTestId('success-button');
      fireEvent.click(successButton);

      await waitFor(() => {
        expect(mockPaidExportMutate).toHaveBeenCalled();
      });
    });

    it('handles unknown category in handleExitButton', () => {
      mockUseParams.mockReturnValue({ category: 'unknown' });

      render(<ExportFlow />);

      const exitButton = screen.getByTestId('exit-button');
      fireEvent.click(exitButton);

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('handles conservation export success', async () => {
      mockUseParams.mockReturnValue({ category: 'conservation' });

      mockUseDateRange.mockReturnValue({
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-01-31'),
        setFromDate: vi.fn(),
        setFromDateToday: vi.fn(),
        setToDate: vi.fn(),
        setToDateToday: vi.fn(),
        setFromError: vi.fn(),
        setToError: vi.fn(),
        resetDates: vi.fn(),
        isButtonDisabled: false
      });

      mockConservationExportMutate.mockImplementation((_params, options) => {
        options.onSuccess();
      });

      render(<ExportFlow />);

      const successButton = screen.getByTestId('success-button');
      fireEvent.click(successButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          PageRoutes.RESPONSES_SUCCESS,
          {
            state: {
              category: 'conservation-export'
            }
          }
        );
      });
    });

    it('handles conservation export 4xx error', async () => {
      mockUseParams.mockReturnValue({ category: 'conservation' });

      mockUseDateRange.mockReturnValue({
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-01-31'),
        setFromDate: vi.fn(),
        setFromDateToday: vi.fn(),
        setToDate: vi.fn(),
        setToDateToday: vi.fn(),
        setFromError: vi.fn(),
        setToError: vi.fn(),
        resetDates: vi.fn(),
        isButtonDisabled: false
      });

      const mockError = {
        response: {
          status: 403
        }
      };

      mockConservationExportMutate.mockImplementation((_params, options) => {
        options.onError(mockError);
      });

      render(<ExportFlow />);

      const successButton = screen.getByTestId('success-button');
      fireEvent.click(successButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR, {
          state: {
            category: 'conservation-export',
            errorType: '4xx',
            statusCode: 403
          }
        });
      });
    });

    it('handles non-axios errors', async () => {
      mockUseDateRange.mockReturnValue({
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-01-31'),
        setFromDate: vi.fn(),
        setFromDateToday: vi.fn(),
        setToDate: vi.fn(),
        setToDateToday: vi.fn(),
        setFromError: vi.fn(),
        setToError: vi.fn(),
        resetDates: vi.fn(),
        isButtonDisabled: false
      });

      const mockError = new Error('Network error');

      mockPaidExportMutate.mockImplementation((_params, options) => {
        options.onError(mockError);
      });

      render(<ExportFlow />);

      const successButton = screen.getByTestId('success-button');
      fireEvent.click(successButton);

      await waitFor(() => {
        expect(mockPaidExportMutate).toHaveBeenCalled();
      });
    });

    it('handles exit button click', () => {
      render(<ExportFlow />);

      const exitButton = screen.getByTestId('exit-button');
      fireEvent.click(exitButton);

      expect(mockNavigate).toHaveBeenCalledWith(
        PageRoutes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW
      );
    });
    mockUseDateRange.mockReturnValue({
      fromDate: new Date('2024-01-01'),
      toDate: new Date('2024-01-31'),
      setFromDate: vi.fn(),
      setFromDateToday: vi.fn(),
      setToDate: vi.fn(),
      setToDateToday: vi.fn(),
      setFromError: vi.fn(),
      setToError: vi.fn(),
      resetDates: vi.fn(),
      isButtonDisabled: false
    });

    it('handles 4xx error by navigating to error page', async () => {
      mockUseDateRange.mockReturnValue({
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-01-31'),
        setFromDate: vi.fn(),
        setFromDateToday: vi.fn(),
        setToDate: vi.fn(),
        setToDateToday: vi.fn(),
        setFromError: vi.fn(),
        setToError: vi.fn(),
        resetDates: vi.fn(),
        isButtonDisabled: false
      });

      const mockError = {
        response: {
          status: 400
        }
      };

      mockPaidExportMutate.mockImplementation((_params, options) => {
        options.onError(mockError);
      });

      render(<ExportFlow />);

      const successButton = screen.getByTestId('success-button');
      fireEvent.click(successButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR, {
          state: {
            category: 'telematic-receipt-export',
            errorType: '4xx',
            statusCode: 400
          }
        });
      });
    });
  });

  describe('ExportFlow conservation', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ category: 'conservation' });
    });

    it('renders without dueType and fileVersion select', () => {
      render(<ExportFlow />);

      expect(screen.queryByText('exportFlow.fileVersion')).toBeNull();
      expect(screen.queryByText('exportFlow.dueType')).toBeNull();
    });

    it('success button is initially disabled', () => {
      render(<ExportFlow />);
      expect(screen.getByTestId('success-button')).toHaveProperty(
        'disabled',
        true
      );
    });
  });
});
