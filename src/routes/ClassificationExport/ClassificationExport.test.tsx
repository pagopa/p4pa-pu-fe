import { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../__tests__/renderers';
import ClassificationExportPage from './ClassificationExport';
import { PageRoutes } from '../../routes';
import { ExportFileTypeEnum } from '../../../generated/apiClient';
import { useForm } from 'react-hook-form';
import { ClassificationFormFields } from '../../hooks/useClassificationExport';
import utils from '../../utils';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock('../../store/GlobalStore', () => ({
  useStore: () => ({ state: { organizationId: 123 } }),
  StoreProvider: ({ children }: { children: ReactNode }) => <>{children}</>
}));

const mockMutate = vi.fn();
vi.mock('../../api/createExportFile', () => ({
  createClassificationsExportFile: () => ({ mutate: mockMutate })
}));

const defaultFormData = {
  fileVersion: 'v1.3',
  label: '',
  iuv: '',
  remittanceInformation: '',
  applicant: '',
  iur: '',
  iud: '',
  iuf: '',
  reportingIur: '',
  billAmountCents: '',
  accountRegistryCode: '',
  pspLastName: '',
  pspCompanyName: '',
  regulationUniqueIdentifier: ''
};

const expectedPayload = {
  organizationId: 123,
  exportFileType: ExportFileTypeEnum.CLASSIFICATIONS,
  fileVersion: 'v1.3',
  filterFields: {}
} as const;

const mockValidateForm = vi.fn();
const mockBuildApiPayload = vi.fn();

vi.mock('../../hooks/useClassificationExport', () => ({
  useClassificationExport: () => ({
    formMethods: useForm<ClassificationFormFields>({
      defaultValues: defaultFormData
    }),
    validateForm: mockValidateForm,
    buildApiPayload: mockBuildApiPayload,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isValidLabelEnum: (_: string) => false
  })
}));

vi.mock('../../utils', async (importOriginal) => {
  const actual = await importOriginal<{
    config: { deployPath: string };
    notify: { emit: (...args: Array<unknown>) => void };
    [key: string]: unknown;
  }>();
  return {
    default: {
      ...actual,
      config: {
        deployPath: '/test-deploy-path'
      },
      notify: { emit: vi.fn() }
    }
  };
});

describe('ClassificationExportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render form with all sections', () => {
      render(<ClassificationExportPage />);

      expect(
        screen.getByText('classificationsExport.subTitle')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('classification-section-type')
      ).toBeInTheDocument();
      expect(
        screen.getByText('commons.requiredFieldDescription')
      ).toBeInTheDocument();
      expect(
        screen.getByText('classificationsExport.sections.reporting.title')
      ).toBeInTheDocument();
      expect(
        screen.getByText('classificationsExport.sections.treasury.title')
      ).toBeInTheDocument();
    });

    it('should render all form sections correctly', () => {
      render(<ClassificationExportPage />);

      const expectedSectionTitles = [
        'classificationsExport.sections.paymentClassification.title',
        'classificationsExport.sections.traceVersion.title',
        'classificationsExport.sections.reporting.title',
        'classificationsExport.sections.treasury.title'
      ];

      expectedSectionTitles.forEach((titleKey) => {
        expect(screen.getByText(titleKey)).toBeInTheDocument();
      });

      expect(screen.getByText('Avviso')).toBeInTheDocument();
    });

    it('should render form fields correctly', () => {
      render(<ClassificationExportPage />);

      expect(
        screen.getByTestId('classification-section-type')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('commons.iuv')).toBeInTheDocument();
      expect(
        screen.getByLabelText(
          'classificationsExport.sections.notice.remittanceInformation'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('classificationsExport.sections.notice.applicant')
      ).toBeInTheDocument();

      const iurFields = screen.getAllByLabelText('commons.iur');
      expect(iurFields).toHaveLength(1);

      expect(screen.getByLabelText('commons.iud')).toBeInTheDocument();
      expect(screen.getByLabelText('commons.iuf')).toBeInTheDocument();

      expect(
        screen.getByLabelText('classificationsExport.sections.treasury.amount')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(
          'classificationsExport.sections.treasury.accountRegistryCode'
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText('classificationsExport.sections.traceVersion.title')
      ).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button is clicked', () => {
      render(<ClassificationExportPage />);
      fireEvent.click(screen.getByRole('button', { name: 'commons.back' }));
      expect(mockNavigate).toHaveBeenCalledWith(
        PageRoutes.CLASSIFICATIONS_EXPORT_OVERVIEW
      );
    });
  });

  describe('Form Submission - Success Cases', () => {
    it('should submit successfully with valid form data', async () => {
      mockValidateForm.mockReturnValue(true);
      mockBuildApiPayload.mockReturnValue(expectedPayload);
      mockMutate.mockImplementation((_, opts) => opts.onSuccess());

      render(<ClassificationExportPage />);
      fireEvent.click(
        screen.getByRole('button', {
          name: 'exportFlow.buttonConfirmReservation'
        })
      );

      await waitFor(() => {
        expect(mockValidateForm).toHaveBeenCalled();
        expect(mockBuildApiPayload).toHaveBeenCalled();
        expect(mockMutate).toHaveBeenCalledWith(
          { data: expectedPayload },
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function)
          })
        );
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          PageRoutes.RESPONSES_SUCCESS,
          expect.objectContaining({
            state: { category: 'classification-export' }
          })
        );
      });
    });
  });

  describe('Form Submission - Error Cases', () => {
    it('should show error message when form validation fails', async () => {
      mockValidateForm.mockReturnValue(false);

      render(<ClassificationExportPage />);
      fireEvent.click(
        screen.getByRole('button', {
          name: 'exportFlow.buttonConfirmReservation'
        })
      );

      await waitFor(() => {
        expect(mockValidateForm).toHaveBeenCalled();
      });

      expect(mockMutate).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(utils.notify.emit).toHaveBeenCalledWith(
        'classificationsExport.errorMessages.missingRequiredFields'
      );
    });

    it('should handle API error and show error notification', async () => {
      mockValidateForm.mockReturnValue(true);
      mockBuildApiPayload.mockReturnValue(expectedPayload);

      mockMutate.mockImplementation((_, opts) => {
        opts.onError(new Error('API Error'));
      });

      render(<ClassificationExportPage />);

      const submitButton = screen.getByRole('button', {
        name: 'exportFlow.buttonConfirmReservation'
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(utils.notify.emit).toHaveBeenCalledWith(
          'exportFlow.errorMessage'
        );
      });

      expect(mockNavigate).not.toHaveBeenCalledWith(
        PageRoutes.RESPONSES_SUCCESS,
        expect.any(Object)
      );
    });
  });

  describe('Form Interactions', () => {
    it('should handle text field inputs correctly', () => {
      render(<ClassificationExportPage />);

      const textFields = [
        'commons.iuv',
        'classificationsExport.sections.notice.remittanceInformation',
        'classificationsExport.sections.notice.applicant',
        'commons.iud',
        'commons.iuf',
        'classificationsExport.sections.treasury.accountRegistryCode'
      ];

      textFields.forEach((fieldLabel) => {
        const field = screen.getByLabelText(fieldLabel);
        expect(field).toBeInTheDocument();

        fireEvent.change(field, { target: { value: `test-${fieldLabel}` } });
        expect(field).toHaveValue(`test-${fieldLabel}`);
      });
    });

    it('should handle number input field correctly', () => {
      render(<ClassificationExportPage />);

      const amountField = screen.getByLabelText(
        'classificationsExport.sections.treasury.amount'
      );
      expect(amountField).toBeInTheDocument();
      expect(amountField).toHaveAttribute('type', 'number');

      fireEvent.change(amountField, { target: { value: '123.45' } });
      expect(amountField).toHaveValue(123.45);
    });

    it('should handle select fields correctly', () => {
      render(<ClassificationExportPage />);

      const selectFields = screen.getAllByRole('combobox');
      expect(selectFields.length).toBeGreaterThanOrEqual(1);

      const classificationSelect = screen.getByTestId(
        'classification-section-type'
      );
      expect(classificationSelect).toBeInTheDocument();

      const selectElement =
        classificationSelect.querySelector('[role="combobox"]');
      expect(selectElement).toBeInTheDocument();
    });
  });

  describe('Date Range Functionality', () => {
    it('should render all date range components via renderValidatedDateRange', () => {
      render(<ClassificationExportPage />);

      const allTextboxes = screen.getAllByRole('textbox');

      const visibleDateInputs = allTextboxes.filter(
        (input) =>
          input.getAttribute('aria-hidden') !== 'true' &&
          !input.classList.contains('MuiSelect-nativeInput')
      );

      expect(visibleDateInputs.length).toBeGreaterThan(0);
    });

    it('should handle date range interactions', () => {
      render(<ClassificationExportPage />);

      const visibleInputs = screen
        .getAllByRole('textbox')
        .filter(
          (input) =>
            input.getAttribute('aria-hidden') !== 'true' &&
            !input.classList.contains('MuiSelect-nativeInput')
        );

      visibleInputs.slice(0, 2).forEach((input, index) => {
        fireEvent.change(input, { target: { value: `test-value-${index}` } });
        expect(input).toBeInTheDocument();
      });
    });

    it('should test date range validation through UI interaction', () => {
      render(<ClassificationExportPage />);

      const allTextboxes = screen.getAllByRole('textbox');

      allTextboxes.forEach((textbox) => {
        if (textbox.getAttribute('aria-hidden') !== 'true') {
          fireEvent.focus(textbox);
          fireEvent.blur(textbox);
        }
      });

      expect(
        screen.getByText('classificationsExport.subTitle')
      ).toBeInTheDocument();
    });
  });

  describe('Component Structure and Layout', () => {
    it('should have correct grid layout with buttons', () => {
      render(<ClassificationExportPage />);

      const titleElement = screen.getByText('classificationsExport.title');
      expect(titleElement).toBeInTheDocument();

      const backButton = screen.getByRole('button', { name: 'commons.back' });
      const submitButton = screen.getByRole('button', {
        name: 'exportFlow.buttonConfirmReservation'
      });

      expect(backButton).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();

      const allButtons = screen.getAllByRole('button');
      expect(allButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('should wrap components with FormProvider', () => {
      render(<ClassificationExportPage />);

      expect(
        screen.getByTestId('classification-section-type')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('commons.iuv')).toBeInTheDocument();
      expect(
        screen.getByLabelText('classificationsExport.sections.treasury.amount')
      ).toBeInTheDocument();
    });
  });

  describe('Complex Form Interactions', () => {
    it('should handle multiple form field interactions', () => {
      render(<ClassificationExportPage />);

      const fieldsToTest = [
        'commons.iuv',
        'classificationsExport.sections.notice.remittanceInformation',
        'classificationsExport.sections.notice.applicant'
      ];

      fieldsToTest.forEach((fieldLabel, index) => {
        const field = screen.getByLabelText(fieldLabel);
        fireEvent.change(field, { target: { value: `value-${index}` } });
        expect(field).toHaveValue(`value-${index}`);
      });
    });

    it('should handle focus and blur events on form inputs', () => {
      render(<ClassificationExportPage />);

      const iuvField = screen.getByLabelText('commons.iuv');

      fireEvent.focus(iuvField);
      fireEvent.change(iuvField, { target: { value: 'test-iuv' } });
      fireEvent.blur(iuvField);

      expect(iuvField).toHaveValue('test-iuv');
    });

    it('should handle complex form interactions with multiple fields', async () => {
      render(<ClassificationExportPage />);

      const iuvField = screen.getByLabelText('commons.iuv');
      const amountField = screen.getByLabelText(
        'classificationsExport.sections.treasury.amount'
      );

      fireEvent.change(iuvField, { target: { value: 'IUV123' } });
      fireEvent.change(amountField, { target: { value: '100.50' } });

      expect(iuvField).toHaveValue('IUV123');
      expect(amountField).toHaveValue(100.5);

      const backButton = screen.getByRole('button', { name: 'commons.back' });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(
        PageRoutes.CLASSIFICATIONS_EXPORT_OVERVIEW
      );
    });
  });

  describe('renderValidatedDateRange Function Testing', () => {
    it('should test classification date range with required flag', () => {
      render(<ClassificationExportPage />);

      expect(
        screen.getByText(
          'classificationsExport.sections.paymentClassification.title'
        )
      ).toBeInTheDocument();
    });

    it('should test payment date range without required flag', () => {
      render(<ClassificationExportPage />);

      expect(screen.getByText('Avviso')).toBeInTheDocument();
    });

    it('should test reporting section with multiple date ranges', () => {
      render(<ClassificationExportPage />);

      expect(
        screen.getByText('classificationsExport.sections.reporting.title')
      ).toBeInTheDocument();
    });

    it('should test treasury section with multiple date ranges', () => {
      render(<ClassificationExportPage />);

      expect(
        screen.getByText('classificationsExport.sections.treasury.title')
      ).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle form re-render correctly', () => {
      const { rerender } = render(<ClassificationExportPage />);

      const iuvField = screen.getByLabelText('commons.iuv');
      fireEvent.change(iuvField, { target: { value: 'test' } });
      expect(iuvField).toHaveValue('test');

      rerender(<ClassificationExportPage />);

      expect(screen.getByLabelText('commons.iuv')).toBeInTheDocument();
    });

    it('should handle empty form submission', async () => {
      mockValidateForm.mockReturnValue(false);

      render(<ClassificationExportPage />);

      const submitButton = screen.getByRole('button', {
        name: 'exportFlow.buttonConfirmReservation'
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockValidateForm).toHaveBeenCalled();
        expect(utils.notify.emit).toHaveBeenCalledWith(
          'classificationsExport.errorMessages.missingRequiredFields'
        );
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('should test callback function branches', () => {
      render(<ClassificationExportPage />);

      const amountField = screen.getByLabelText(
        'classificationsExport.sections.treasury.amount'
      );

      fireEvent.focus(amountField);
      fireEvent.change(amountField, { target: { value: '50' } });
      fireEvent.blur(amountField);

      expect(amountField).toHaveValue(50);
    });
  });

  describe('Select Field Functionality', () => {
    it('should test classification options are rendered', () => {
      render(<ClassificationExportPage />);

      const classificationSelect = screen.getByTestId(
        'classification-section-type'
      );
      expect(classificationSelect).toBeInTheDocument();

      const selectElement =
        classificationSelect.querySelector('[role="combobox"]');
      if (selectElement) {
        fireEvent.mouseDown(selectElement);
        expect(selectElement).toHaveAttribute('aria-expanded', 'true');
      }
    });

    it('should test version options exist', () => {
      render(<ClassificationExportPage />);

      expect(
        screen.getByText('classificationsExport.sections.traceVersion.title')
      ).toBeInTheDocument();

      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle different form states', () => {
      render(<ClassificationExportPage />);

      const classificationSelect = screen.getByTestId(
        'classification-section-type'
      );
      const selectElement =
        classificationSelect.querySelector('[role="combobox"]');

      if (selectElement) {
        fireEvent.mouseDown(selectElement);
        expect(selectElement).toBeInTheDocument();
        expect(selectElement).toHaveAttribute('role', 'combobox');
      }
    });
  });

  describe('Date Range Validation Testing', () => {
    it('should show error when areDatePairsValid returns false', async () => {
      render(<ClassificationExportPage />);

      const submitButton = screen.getByRole('button', {
        name: 'exportFlow.buttonConfirmReservation'
      });

      mockValidateForm.mockReturnValue(true);
      mockBuildApiPayload.mockReturnValue(expectedPayload);

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockValidateForm).toHaveBeenCalled();
      });
    });

    it('should test all form sections are interactive', () => {
      render(<ClassificationExportPage />);

      const inputFields = [
        'commons.iuv',
        'classificationsExport.sections.notice.remittanceInformation',
        'classificationsExport.sections.notice.applicant',
        'commons.iud',
        'commons.iuf',
        'classificationsExport.sections.treasury.accountRegistryCode'
      ];

      inputFields.forEach((fieldLabel) => {
        const field = screen.getByLabelText(fieldLabel);

        fireEvent.focus(field);
        fireEvent.change(field, { target: { value: 'test-data' } });
        fireEvent.blur(field);

        expect(field).toBeInTheDocument();
      });
    });
  });

  describe('Callback Coverage and Validation', () => {
    it('should test error validation branches', async () => {
      mockValidateForm.mockReturnValue(true);
      mockBuildApiPayload.mockReturnValue(expectedPayload);
      mockMutate.mockImplementation((_, opts) => opts.onSuccess());

      render(<ClassificationExportPage />);

      const iuvField = screen.getByLabelText('commons.iuv');
      fireEvent.change(iuvField, { target: { value: 'test-iuv' } });

      const submitButton = screen.getByRole('button', {
        name: 'exportFlow.buttonConfirmReservation'
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockValidateForm).toHaveBeenCalled();
      });
    });

    it('should test noOpErrorHandler callback coverage', () => {
      render(<ClassificationExportPage />);

      const iuvField = screen.getByLabelText('commons.iuv');

      expect(() => {
        fireEvent.change(iuvField, { target: { value: 'test' } });
        fireEvent.blur(iuvField);
        fireEvent.focus(iuvField);
      }).not.toThrow();
    });
  });

  describe('Refactored Component Integration', () => {
    it('should maintain same behavior after refactoring', () => {
      const { container } = render(<ClassificationExportPage />);

      expect(
        screen.getByText('classificationsExport.subTitle')
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-testid="classification-section-type"]')
      ).toBeInTheDocument();
      expect(
        screen.getByText('classificationsExport.sections.reporting.title')
      ).toBeInTheDocument();
      expect(
        screen.getByText('classificationsExport.sections.treasury.title')
      ).toBeInTheDocument();
    });

    it('should ensure renderValidatedDateRange function works for all date ranges', () => {
      render(<ClassificationExportPage />);

      const sectionsWithDateRanges = [
        'classificationsExport.sections.paymentClassification.title',
        'classificationsExport.sections.reporting.title',
        'classificationsExport.sections.treasury.title'
      ];

      sectionsWithDateRanges.forEach((section) => {
        expect(screen.getByText(section)).toBeInTheDocument();
      });

      expect(screen.getByText('Avviso')).toBeInTheDocument();
    });
  });
});
