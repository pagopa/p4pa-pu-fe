/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../__tests__/renderers';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { useOrgSilServiceForm } from './hooks/useOrgSilServiceForm';
import { OrgSilServiceEdit } from './OrgSilServiceEdit';
import { useQuery } from '@tanstack/react-query';

vi.mock('./components/OrgSilServiceForm', () => ({
  OrgSilServiceForm: ({
    config,
    initialData,
    isLoading,
    onSubmit,
    onCancel
  }: any) => (
    <div data-testid="org-sil-service-form">
      <h1>{config.title}</h1>
      <p>{config.description}</p>
      <div data-testid="initial-data">{JSON.stringify(initialData)}</div>
      <button
        data-testid="submit-button"
        disabled={isLoading}
        onClick={() =>
          onSubmit({
            applicationName: 'Updated API',
            serviceUrl: 'https://updated.com',
            serviceType: 'PAID_NOTIFICATION_OUTCOME',
            flagLegacy: true
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
  useNavigate: () => mockNavigate,
  useParams: () => ({ orgSilServiceId: '456' })
}));

vi.mock('../../store/GlobalStore', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../store/GlobalStore')>()),
  useStore: () => ({ state: { organizationId: '123' } })
}));

vi.mock('@tanstack/react-query', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-query')>()),
  useQuery: vi.fn()
}));

vi.mock('../../utils', () => ({
  default: {
    config: {
      deployPath: '/piattaformaunitaria'
    },
    apiClient: {
      bff: {
        getOrgSilServiceDetails: vi.fn()
      }
    }
  }
}));

vi.mock('../../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

const translations = {
  'orgSilServiceEdit.title': 'Edit Service',
  'orgSilServiceEdit.description': 'Modify the service details',
  'commons.save': 'Save',
  'commons.errorLoadingData': 'Error loading data',
  'commons.dataNotFound': 'Data not found'
};

const mockServiceData = {
  orgSilServiceId: 456,
  organizationId: 123,
  applicationName: 'Test Service',
  serviceUrl: 'https://test-service.com',
  serviceType: 'PAID_NOTIFICATION_OUTCOME',
  flagLegacy: true,
  legacyBasicAuthConfig: {
    user: 'testuser',
    psw: 'testpass',
    authUrl: 'https://auth.test.com',
    authConfig: 'legacyBasic'
  }
};

describe('OrgSilServiceEdit Component', () => {
  let user: ReturnType<typeof userEvent.setup>;
  const mockUpdateService = vi.fn();
  const mockCreateService = vi.fn();
  const mockUseQuery = vi.mocked(useQuery);
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
    i18nTestSetup(translations);
    mockRefetch.mockClear();

    vi.mocked(useOrgSilServiceForm).mockReturnValue({
      createService: mockCreateService,
      updateService: mockUpdateService,
      isLoading: false,
      error: null,
      clearError: vi.fn()
    });

    mockUseQuery.mockReturnValue({
      data: mockServiceData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
      isError: false,
      isSuccess: true,
      status: 'success'
    } as any);
  });

  describe('Data Loading States', () => {
    it('should show error state when data loading fails', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load'),
        refetch: mockRefetch,
        isFetching: false,
        isError: true,
        isSuccess: false,
        status: 'error'
      } as any);

      render(<OrgSilServiceEdit />);

      expect(screen.getByText('Error loading data')).toBeInTheDocument();
      expect(
        screen.queryByTestId('org-sil-service-form')
      ).not.toBeInTheDocument();
    });

    it('should show not found state when no data is returned', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isFetching: false,
        isError: false,
        isSuccess: true,
        status: 'success'
      } as any);

      render(<OrgSilServiceEdit />);

      expect(screen.getByText('Data not found')).toBeInTheDocument();
      expect(
        screen.queryByTestId('org-sil-service-form')
      ).not.toBeInTheDocument();
    });
  });

  describe('Successful Data Loading', () => {
    it('should render the form when data is loaded successfully', () => {
      render(<OrgSilServiceEdit />);

      expect(screen.getByTestId('org-sil-service-form')).toBeInTheDocument();
      expect(screen.getByText('Edit Service')).toBeInTheDocument();
      expect(
        screen.getByText('Modify the service details')
      ).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should pass correct config for edit mode', () => {
      render(<OrgSilServiceEdit />);

      expect(screen.getByTestId('service-type-disabled')).toHaveTextContent(
        'true'
      );
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Save');
    });

    it('should transform and pass initial data correctly', () => {
      render(<OrgSilServiceEdit />);

      const initialDataElement = screen.getByTestId('initial-data');
      const initialData = JSON.parse(initialDataElement.textContent || '{}');

      expect(initialData).toEqual({
        applicationName: 'Test Service',
        serviceUrl: 'https://test-service.com',
        serviceType: 'PAID_NOTIFICATION_OUTCOME',
        flagLegacy: true,
        authConfigType: 'basic',
        basicUser: 'testuser',
        basicPassword: 'testpass',
        basicAuthURL: 'https://auth.test.com'
      });
    });
  });

  describe('Data Transformation', () => {
    it('should transform JWT auth config correctly', () => {
      const serviceDataWithJWT = {
        ...mockServiceData,
        legacyBasicAuthConfig: undefined,
        legacyJwtAuthConfig: {
          kid: 'test-kid',
          issuer: 'test-issuer',
          subject: 'test-subject',
          algorithm: 'HS256',
          signingKey: 'test-key',
          authConfig: 'legacyJwt'
        }
      };

      mockUseQuery.mockReturnValue({
        data: serviceDataWithJWT,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isFetching: false,
        isError: false,
        isSuccess: true,
        status: 'success'
      } as any);

      render(<OrgSilServiceEdit />);

      const initialDataElement = screen.getByTestId('initial-data');
      const initialData = JSON.parse(initialDataElement.textContent || '{}');

      expect(initialData.authConfigType).toBe('jwt');
      expect(initialData.jwtKid).toBe('test-kid');
      expect(initialData.jwtIssuer).toBe('test-issuer');
      expect(initialData.jwtSubject).toBe('test-subject');
      expect(initialData.jwtAlgorithm).toBe('HS256');
      expect(initialData.jwtSigningKey).toBe('test-key');
    });

    it('should handle service without auth config', () => {
      const serviceDataWithoutAuth = {
        ...mockServiceData,
        flagLegacy: false,
        legacyBasicAuthConfig: undefined,
        legacyJwtAuthConfig: undefined
      };

      mockUseQuery.mockReturnValue({
        data: serviceDataWithoutAuth,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isFetching: false,
        isError: false,
        isSuccess: true,
        status: 'success'
      } as any);

      render(<OrgSilServiceEdit />);

      const initialDataElement = screen.getByTestId('initial-data');
      const initialData = JSON.parse(initialDataElement.textContent || '{}');

      expect(initialData.flagLegacy).toBe(false);
      expect(initialData.authConfigType).toBeUndefined();
    });
  });

  describe('Form Submission', () => {
    it('should call updateService when form is submitted', async () => {
      render(<OrgSilServiceEdit />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(mockUpdateService).toHaveBeenCalledTimes(1);
      expect(mockUpdateService).toHaveBeenCalledWith({
        applicationName: 'Updated API',
        serviceUrl: 'https://updated.com',
        serviceType: 'PAID_NOTIFICATION_OUTCOME',
        flagLegacy: true,
        orgSilServiceId: 456,
        organizationId: 123
      });
    });

    it('should not call createService', async () => {
      render(<OrgSilServiceEdit />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(mockCreateService).not.toHaveBeenCalled();
    });

    it('should not submit if serviceData is missing', async () => {
      mockUseQuery.mockReturnValue({
        data: { ...mockServiceData, orgSilServiceId: undefined },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isFetching: false,
        isError: false,
        isSuccess: true,
        status: 'success'
      } as any);

      render(<OrgSilServiceEdit />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      expect(mockUpdateService).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to services list when cancel is clicked', async () => {
      render(<OrgSilServiceEdit />);

      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(
        '/piattaformaunitaria/backoffice/org-sil-services/'
      );
    });
  });

  describe('Query Configuration', () => {
    it('should call useQuery with correct parameters', () => {
      render(<OrgSilServiceEdit />);

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['orgSilServiceDetail', 123, '456'],
        queryFn: expect.any(Function),
        enabled: true
      });
    });
  });

  describe('Refetch Behavior', () => {
    it('should call refetch when orgSilServiceId and organizationId are available', () => {
      render(<OrgSilServiceEdit />);

      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
