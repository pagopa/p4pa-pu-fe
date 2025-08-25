import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../__tests__/renderers';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { useOrgSilServiceForm } from './hooks/useOrgSilServiceForm';
import { useConditionalReset } from './hooks/useConditionalReset';
import { OrgSilServiceCreate } from './OrgSilServiceCreate';

vi.mock('./hooks/useOrgSilServiceForm');
vi.mock('./hooks/useConditionalReset');

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mockNavigate
}));

vi.mock('../../store/GlobalStore', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../store/GlobalStore')>()),
  useStore: () => ({ state: { organizationId: '123' } })
}));

vi.mock('./components/LegacyAuthConfiguration', () => ({
  LegacyAuthConfiguration: () => <div data-testid="legacy-auth-configuration" />
}));

const translations = {
  'orgSilServiceCreate.title': 'Create New Service',
  'orgSilServiceCreate.descriprion': 'Fill in the details for your new service',
  'orgSilServiceCreate.subTitle': 'Service Configuration',
  'orgSilServiceCreate.generalConfiguration': 'General Configuration',
  'orgSilServiceCreate.authMethod': 'Authentication Method',
  'orgSilServiceCreate.APIName': 'API Name',
  'orgSilServiceCreate.serviceURL': 'Service URL',
  'orgSilServiceCreate.serviceType': 'Service Type',
  'orgSilServiceCreate.flagLegacy': 'Legacy Authentication',
  'commons.requiredFieldDescription': '* Required fields',
  'commons.back': 'Back',
  'commons.add': 'Add',
  'serviceType.PAID_NOTIFICATION_OUTCOME': 'Payment Notification Outcome',
  'serviceType.ACTUALIZATION': 'Actualization',
  'legacy.true': 'Yes',
  'legacy.false': 'No',
  'validation.required': 'Required field',
  'validation.url': 'Invalid URL'
};

describe('OrgSilServiceCreate Component', () => {
  let user: ReturnType<typeof userEvent.setup>;
  const mockCreateService = vi.fn();

  const fillBasicFields = async (data: {
    apiName?: string;
    serviceUrl?: string;
  }) => {
    if (data.apiName) {
      const apiInput = screen.getByRole('textbox', { name: /API Name/i });
      await user.clear(apiInput);
      await user.type(apiInput, data.apiName);
    }
    if (data.serviceUrl) {
      const urlInput = screen.getByRole('textbox', { name: /Service URL/i });
      await user.clear(urlInput);
      await user.type(urlInput, data.serviceUrl);
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
    i18nTestSetup(translations);

    vi.mocked(useOrgSilServiceForm).mockReturnValue({
      createService: mockCreateService,
      isLoading: false,
      error: null,
      clearError: vi.fn()
    });

    vi.mocked(useConditionalReset).mockReturnValue({
      watchFlagLegacy: false,
      watchAuthConfigType: undefined
    });
  });

  describe('Rendering', () => {
    it('should render the form with all its fields', () => {
      render(<OrgSilServiceCreate />);

      expect(screen.getByText('Create New Service')).toBeInTheDocument();
      expect(
        screen.getByRole('textbox', { name: /API Name/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('textbox', { name: /Service URL/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('combobox', { name: /Service Type/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radiogroup', { name: /Legacy Authentication/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
    });

    it('should show required field indicator', () => {
      render(<OrgSilServiceCreate />);
      expect(screen.getByText('* Required fields')).toBeInTheDocument();
    });
  });

  describe('Form Submission and Validation', () => {
    it('should allow filling basic form fields', async () => {
      render(<OrgSilServiceCreate />);

      await fillBasicFields({
        apiName: 'Test API',
        serviceUrl: 'https://test.com/api'
      });

      expect(screen.getByDisplayValue('Test API')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('https://test.com/api')
      ).toBeInTheDocument();
    });

    it('should handle radio button selection', async () => {
      render(<OrgSilServiceCreate />);

      const noRadio = screen.getByRole('radio', { name: /No/i });
      const yesRadio = screen.getByRole('radio', { name: /Yes/i });

      expect(noRadio).toBeInTheDocument();
      expect(yesRadio).toBeInTheDocument();

      await user.click(yesRadio);
      expect(yesRadio).toBeChecked();

      await user.click(noRadio);
      expect(noRadio).toBeChecked();
      expect(yesRadio).not.toBeChecked();
    });

    it('should show form sections correctly', () => {
      render(<OrgSilServiceCreate />);

      expect(screen.getByText('General Configuration')).toBeInTheDocument();
      expect(screen.getByText('Authentication Method')).toBeInTheDocument();
    });

    it('should show error states when form is invalid', async () => {
      render(<OrgSilServiceCreate />);

      await user.click(screen.getByRole('button', { name: /Add/i }));

      await waitFor(() => {
        const apiNameInput = screen.getByRole('textbox', { name: /API Name/i });
        const urlInput = screen.getByRole('textbox', { name: /Service URL/i });

        expect(apiNameInput).toHaveAttribute('aria-invalid', 'true');
        expect(urlInput).toHaveAttribute('aria-invalid', 'true');
      });

      expect(mockCreateService).not.toHaveBeenCalled();
    });

    it('should submit form when all required data is provided', async () => {
      render(<OrgSilServiceCreate />);

      await fillBasicFields({
        apiName: 'Payment API',
        serviceUrl: 'https://payment.com/v1'
      });

      await user.click(screen.getByRole('radio', { name: /No/i }));

      const selectElement = screen.getByRole('combobox', {
        name: /Service Type/i
      });
      await user.click(selectElement);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /Add/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Conditional Logic', () => {
    it('should NOT render LegacyAuthConfiguration when flagLegacy is false', () => {
      render(<OrgSilServiceCreate />);
      expect(
        screen.queryByTestId('legacy-auth-configuration')
      ).not.toBeInTheDocument();
    });

    it('should render LegacyAuthConfiguration when flagLegacy is true', () => {
      vi.mocked(useConditionalReset).mockReturnValue({
        watchFlagLegacy: true,
        watchAuthConfigType: 'basic'
      });

      render(<OrgSilServiceCreate />);
      expect(
        screen.getByTestId('legacy-auth-configuration')
      ).toBeInTheDocument();
    });
  });

  describe('UI State and Navigation', () => {
    it('should disable the submit button when isLoading is true', () => {
      vi.mocked(useOrgSilServiceForm).mockReturnValue({
        createService: mockCreateService,
        isLoading: true,
        error: null,
        clearError: vi.fn()
      });

      render(<OrgSilServiceCreate />);
      expect(screen.getByRole('button', { name: /Add/i })).toBeDisabled();
    });

    it('should navigate to the services list page when back button is clicked', async () => {
      render(<OrgSilServiceCreate />);

      await user.click(screen.getByRole('button', { name: /Back/i }));

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(
        '/piattaformaunitaria/backoffice/org-sil-services/'
      );
    });

    it('should show loading state correctly', () => {
      vi.mocked(useOrgSilServiceForm).mockReturnValue({
        createService: mockCreateService,
        isLoading: true,
        error: null,
        clearError: vi.fn()
      });

      render(<OrgSilServiceCreate />);

      const submitButton = screen.getByRole('button', { name: /Add/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Structure and Accessibility', () => {
    it('should have proper form structure', () => {
      render(<OrgSilServiceCreate />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('noValidate');
    });

    it('should have proper labeling for form fields', () => {
      render(<OrgSilServiceCreate />);

      const apiNameInput = screen.getByRole('textbox', { name: /API Name/i });
      const urlInput = screen.getByRole('textbox', { name: /Service URL/i });
      const serviceTypeSelect = screen.getByRole('combobox', {
        name: /Service Type/i
      });
      const radioGroup = screen.getByRole('radiogroup', {
        name: /Legacy Authentication/i
      });

      expect(apiNameInput).toHaveAttribute('required');
      expect(urlInput).toHaveAttribute('required');
      expect(serviceTypeSelect).toBeInTheDocument();
      expect(radioGroup).toBeInTheDocument();
    });
  });
});
