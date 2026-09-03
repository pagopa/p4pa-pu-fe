import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '../__tests__/renderers';
import { useOrganizationSubmit } from './useOrganizationSubmit';
import {
  OrganizationDetailDTO,
  OrganizationStatus
} from '../../generated/core/data-contracts';
import { UnifiedFormData } from '../models/OrganizationEditTypes';
import { PageRoutes } from '../routes';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

const mockNavigate = vi.fn();
const mockGeneratePath = vi.fn(
  (path: string, params?: Record<string, string>) => ({
    path,
    params
  })
);

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    generatePath: (...args: Parameters<typeof mockGeneratePath>) =>
      mockGeneratePath(...args)
  };
});

const mockMutateAsync = vi.fn();
vi.mock('../api/organizations', () => ({
  updateOrganization: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false
  })
}));

vi.mock('../utils', async () => {
  const actual = await import('../utils');
  return {
    ...actual,
    default: {
      ...actual.default,
      notify: {
        emit: vi.fn()
      }
    }
  };
});

// Mock value for organization password field in test data
const MOCK_ORGANIZATION_PASSWORD = 'mock-org-value';

const createFormData = (
  overrides: Partial<UnifiedFormData> = {}
): UnifiedFormData => ({
  orgName: { value: 'Org name', readonly: false },
  orgFiscalCode: { value: '12345678901', readonly: false },
  orgEmail: { value: 'test@example.com', readonly: false },
  orgLogo: { value: 'logo-base64', readonly: false },
  logoRemoved: false,
  iban: { value: 'IT60X0542811101000000123456', readonly: false },
  ibanPostal: { value: '', readonly: false },
  cbill: { value: '', readonly: false },
  flagTreasury: { value: false, readonly: false },
  segregationCode: { value: 'SEG123', readonly: false },
  generateNoticeApiKey: { value: 'api-key', readonly: false },
  additionalLanguage: { value: false, readonly: false },
  selectedLanguage: { value: '', readonly: false },
  flagNotifyOutcomePush: { value: false, readonly: false },
  flagPaymentNotification: { value: false, readonly: false },
  flagNotifyIo: { value: false, readonly: false },
  ioApiKey: { value: '', readonly: false },
  pdndEnabled: { value: false, readonly: false },
  sendApiKey: { value: '', readonly: false },
  organizationStatus: 'DRAFT',
  ...overrides
});

const originalData: OrganizationDetailDTO = {
  organizationId: 1,
  flagTreasury: false,
  externalOrganizationId: 'EXT1',
  ipaCode: 'IPA1',
  orgFiscalCode: '12345678901',
  orgName: 'Org name',
  orgTypeCode: '01',
  orgEmail: 'test@example.com',
  postalIban: '',
  iban: 'IT60X0542811101000000123456',
  password: MOCK_ORGANIZATION_PASSWORD,
  segregationCode: 'SEG123',
  cbillInterBankCode: '',
  orgLogo: 'logo-base64',
  status: OrganizationStatus.DRAFT,
  additionalLanguage: undefined,
  startDate: '2024-01-01',
  brokerId: 1,
  ioApiKey: '',
  sendApiKey: '',
  generateNoticeApiKey: 'api-key',
  flagNotifyIo: false,
  flagNotifyOutcomePush: false,
  flagPaymentNotification: false,
  pdndEnabled: false
};

describe('useOrganizationSubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should expose submit function and isSubmitting flag', () => {
    const { result } = renderHook(() =>
      useOrganizationSubmit({
        organizationId: 1,
        originalData
      })
    );

    expect(typeof result.current.submit).toBe('function');
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should submit as draft and navigate to draft success page without toast', async () => {
    const { default: utils } = await import('../utils');
    const formData = createFormData();

    const { result } = renderHook(() =>
      useOrganizationSubmit({
        organizationId: 1,
        originalData
      })
    );

    await act(async () => {
      await result.current.submit(formData, false);
    });

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    const notifyMock = utils.notify.emit as unknown as ReturnType<typeof vi.fn>;

    expect(notifyMock).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_SUCCESS, {
      state: {
        category: 'organization-draft-saved',
        i18nParams: { orgName: 'Org name' },
        organizationId: 1
      }
    });
    expect(mockGeneratePath).not.toHaveBeenCalled();
  });

  it('should try to enable organization and show warning when mandatory fields are missing', async () => {
    const { default: utils } = await import('../utils');
    const formData = createFormData({
      iban: { value: '', readonly: false },
      orgLogo: { value: null, readonly: false },
      segregationCode: { value: '', readonly: false }
    });

    const { result } = renderHook(() =>
      useOrganizationSubmit({
        organizationId: 1,
        originalData
      })
    );

    await act(async () => {
      await result.current.submit(formData, true);
    });

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);

    const notifyMock = utils.notify.emit as unknown as ReturnType<typeof vi.fn>;

    expect(notifyMock).toHaveBeenCalledWith(
      'organizationEditWizard.successMessageNotEnable',
      'warning'
    );
  });

  it('should enable organization and navigate to enabled success page without toast when mandatory fields are present', async () => {
    const { default: utils } = await import('../utils');
    const formData = createFormData({
      iban: { value: 'IT60X0542811101000000123456', readonly: false },
      orgLogo: { value: 'logo-base64', readonly: false },
      segregationCode: { value: 'SEG123', readonly: false }
    });

    const { result } = renderHook(() =>
      useOrganizationSubmit({
        organizationId: 1,
        originalData
      })
    );

    await act(async () => {
      await result.current.submit(formData, true);
    });

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);

    const notifyMock = utils.notify.emit as unknown as ReturnType<typeof vi.fn>;

    expect(notifyMock).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_SUCCESS, {
      state: {
        category: 'organization-enabled',
        i18nParams: { orgName: 'Org name' },
        organizationId: 1
      }
    });
  });

  it('should navigate to updated success page without toast when saving changes for an active organization', async () => {
    const { default: utils } = await import('../utils');
    const formData = createFormData();

    const activeOriginalData: OrganizationDetailDTO = {
      ...originalData,
      status: OrganizationStatus.ACTIVE
    };

    const { result } = renderHook(() =>
      useOrganizationSubmit({
        organizationId: 1,
        originalData: activeOriginalData
      })
    );

    await act(async () => {
      await result.current.submit(formData, false);
    });

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);

    const notifyMock = utils.notify.emit as unknown as ReturnType<typeof vi.fn>;

    expect(notifyMock).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_SUCCESS, {
      state: {
        category: 'organization-updated',
        i18nParams: { orgName: 'Org name' },
        organizationId: 1
      }
    });
  });

  it('should handle error case by notifying and navigating to error page', async () => {
    const { default: utils } = await import('../utils');
    const formData = createFormData();
    const error = new Error('submit error');
    mockMutateAsync.mockRejectedValueOnce(error);

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      // Suppress console.error output during test execution
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .mockImplementation(() => {});

    const { result } = renderHook(() =>
      useOrganizationSubmit({
        organizationId: 1,
        originalData
      })
    );

    await act(async () => {
      await result.current.submit(formData, false);
    });

    const notifyMock = utils.notify.emit as unknown as ReturnType<typeof vi.fn>;

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(notifyMock).toHaveBeenCalledWith('errors.generic', 'error');
    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);

    consoleErrorSpy.mockRestore();
  });

  it('should call onSuccess callback after successful submission', async () => {
    const formData = createFormData();
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useOrganizationSubmit({
        organizationId: 1,
        originalData,
        onSuccess
      })
    );

    await act(async () => {
      await result.current.submit(formData, false);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
