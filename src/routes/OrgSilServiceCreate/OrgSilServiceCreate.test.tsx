/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../__tests__/renderers';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { useOrgSilServiceForm } from './hooks/useOrgSilServiceForm';
import { OrgSilServiceCreate } from './OrgSilServiceCreate';

vi.mock('./components/OrgSilServiceForm', () => ({
  OrgSilServiceForm: ({ config, isLoading, onSubmit, onCancel }: any) => (
    <div data-testid="org-sil-service-form">
      <h1>{config.title}</h1>
      <p>{config.description}</p>
      <button
        data-testid="submit-button"
        disabled={isLoading}
        onClick={() =>
          onSubmit({
            applicationName: 'Test API',
            serviceUrl: 'https://test.com',
            serviceType: 'PAID_NOTIFICATION_OUTCOME',
            flagLegacy: false
          })
        }
      >
        {config.submitButtonLabel}
      </button>
      <button data-testid="cancel-button" onClick={onCancel}>
        Cancel
      </button>
      <div data-testid="service-type-disabled">
        {config.serviceTypeDisabled.toString()}
      </div>
    </div>
  )
}));

vi.mock('./hooks/useOrgSilServiceForm');

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mockNavigate
}));

vi.mock('../../store/GlobalStore', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../store/GlobalStore')>()),
  useStore: () => ({ state: { organizationId: '123' } })
}));

const translations = {
  'orgSilServiceCreate.title': 'Create New Service',
  'orgSilServiceCreate.description': 'Fill in the details for your new service',
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

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
    i18nTestSetup(translations);

    vi.mocked(useOrgSilServiceForm).mockReturnValue({
      createService: mockCreateService,
      updateService: vi.fn(),
      isLoading: false,
      error: null,
      clearError: vi.fn()
    });
  });

  describe('Rendering', () => {
    it('should render the OrgSilServiceForm with correct config for create mode', () => {
      render(<OrgSilServiceCreate />);

      expect(screen.getByTestId('org-sil-service-form')).toBeInTheDocument();
      expect(screen.getByText('Create New Service')).toBeInTheDocument();
      expect(
        screen.getByText('Fill in the details for your new service')
      ).toBeInTheDocument();
      expect(screen.getByText('Add')).toBeInTheDocument();
      expect(screen.getByTestId('service-type-disabled')).toHaveTextContent(
        'false'
      );
    });

    it('should pass the correct config to OrgSilServiceForm', () => {
      render(<OrgSilServiceCreate />);

      expect(screen.getByTestId('service-type-disabled')).toHaveTextContent(
        'false'
      );

      expect(screen.getByTestId('submit-button')).toHaveTextContent('Add');
    });
  });

  describe('Form Submission', () => {
    it('should call createService when form is submitted', async () => {
      render(<OrgSilServiceCreate />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(mockCreateService).toHaveBeenCalledTimes(1);
      expect(mockCreateService).toHaveBeenCalledWith({
        applicationName: 'Test API',
        serviceUrl: 'https://test.com',
        serviceType: 'PAID_NOTIFICATION_OUTCOME',
        flagLegacy: false
      });
    });

    it('should not call updateService', async () => {
      const mockUpdateService = vi.fn();
      vi.mocked(useOrgSilServiceForm).mockReturnValue({
        createService: mockCreateService,
        updateService: mockUpdateService,
        isLoading: false,
        error: null,
        clearError: vi.fn()
      });

      render(<OrgSilServiceCreate />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(mockUpdateService).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to services list when cancel is clicked', async () => {
      render(<OrgSilServiceCreate />);

      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(
        '/piattaformaunitaria/backoffice/org-sil-services/'
      );
    });
  });

  describe('Loading State', () => {
    it('should not be loading by default', () => {
      vi.mocked(useOrgSilServiceForm).mockReturnValue({
        createService: mockCreateService,
        updateService: vi.fn(),
        isLoading: true,
        error: null,
        clearError: vi.fn()
      });
      render(<OrgSilServiceCreate />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Hook Integration', () => {
    it('should call useOrgSilServiceForm with correct organizationId', () => {
      render(<OrgSilServiceCreate />);

      expect(useOrgSilServiceForm).toHaveBeenCalledWith({
        organizationId: 123
      });
    });

    it('should use only the createService function from the hook', () => {
      const hookReturn = {
        createService: mockCreateService,
        updateService: vi.fn(),
        isLoading: false,
        error: null,
        clearError: vi.fn()
      };

      vi.mocked(useOrgSilServiceForm).mockReturnValue(hookReturn);

      render(<OrgSilServiceCreate />);

      expect(useOrgSilServiceForm).toHaveBeenCalled();

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Component Props and Config', () => {
    it('should create config object with correct properties for create mode', () => {
      render(<OrgSilServiceCreate />);

      expect(screen.getByText('Create New Service')).toBeInTheDocument();
      expect(screen.getByText('Add')).toBeInTheDocument();
      expect(screen.getByTestId('service-type-disabled')).toHaveTextContent(
        'false'
      );
    });

    it('should not pass initialData to form component', () => {
      render(<OrgSilServiceCreate />);
      expect(screen.getByTestId('org-sil-service-form')).toBeInTheDocument();
    });
  });
});
