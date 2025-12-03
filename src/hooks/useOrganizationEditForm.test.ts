import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '../__tests__/renderers';
import { useOrganizationEditForm } from './useOrganizationEditForm';
import { UnifiedFormData } from '../models/OrganizationEditTypes';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

// Mock base64ToFile utility
const mockBase64ToFile = vi.fn();
vi.mock('../utils/filevalidation', () => ({
  base64ToFile: (...args: Array<unknown>) => mockBase64ToFile(...args)
}));

// Mock handleLogoConversion utility
const mockHandleLogoConversion = vi.fn();
vi.mock('../utils/organizationFormTransformers', () => ({
  handleLogoConversion: (...args: Array<unknown>) =>
    mockHandleLogoConversion(...args)
}));

const createBaseInitialData = (
  overrides: Partial<UnifiedFormData & { organizationStatus?: string }> = {}
): UnifiedFormData => ({
  orgName: { value: 'Test Org', readonly: false },
  orgFiscalCode: { value: '12345678901', readonly: false },
  orgEmail: { value: 'test@example.com', readonly: false },
  orgLogo: { value: null, readonly: false },
  logoRemoved: false,
  iban: { value: 'IT60X0542811101000000123456', readonly: false },
  ibanPostal: { value: '', readonly: false },
  cbill: { value: '', readonly: false },
  flagTreasury: { value: false, readonly: false },
  segregationCode: { value: '', readonly: false },
  generateNoticeApiKey: { value: 'api-key', readonly: false },
  additionalLanguage: { value: false, readonly: false },
  selectedLanguage: { value: '', readonly: false },
  flagNotifyOutcomePush: { value: null, readonly: false },
  flagPaymentNotification: { value: null, readonly: false },
  flagNotifyIo: { value: false, readonly: false },
  ioApiKey: { value: '', readonly: false },
  pdndEnabled: { value: false, readonly: false },
  sendApiKey: { value: '', readonly: false },
  organizationStatus: overrides.organizationStatus,
  ...overrides
});

describe('useOrganizationEditForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should map UnifiedFormData to UnifiedFormValues via getInitialValues', () => {
      const mockFile = new File(['logo'], 'logo.png', { type: 'image/png' });
      mockBase64ToFile.mockReturnValueOnce(mockFile);

      const initialData = createBaseInitialData({
        orgLogo: { value: 'base64-logo', readonly: false },
        iban: { value: 'IT60X0542811101000000123456', readonly: false },
        ibanPostal: { value: 'IT60X0542811101000000123457', readonly: false },
        cbill: { value: 'CBILL123', readonly: false },
        flagTreasury: { value: true, readonly: false },
        segregationCode: { value: 'SEG123', readonly: false },
        generateNoticeApiKey: { value: 'api-key', readonly: false },
        additionalLanguage: { value: true, readonly: false },
        selectedLanguage: { value: 'en', readonly: false },
        flagNotifyOutcomePush: { value: true, readonly: false },
        flagPaymentNotification: { value: false, readonly: false },
        flagNotifyIo: { value: true, readonly: false },
        ioApiKey: { value: 'io-api-key', readonly: false },
        pdndEnabled: { value: true, readonly: false },
        sendApiKey: { value: 'send-api-key', readonly: false }
      });

      const { result } = renderHook(() =>
        useOrganizationEditForm({
          initialData
        })
      );

      const values = result.current.getInitialValues();

      expect(values).toEqual({
        orgName: 'Test Org',
        orgFiscalCode: '12345678901',
        orgEmail: 'test@example.com',
        orgLogo: mockFile,
        iban: 'IT60X0542811101000000123456',
        ibanPostal: 'IT60X0542811101000000123457',
        cbill: 'CBILL123',
        flagTreasury: true,
        segregationCode: 'SEG123',
        generateNoticeApiKey: 'api-key',
        additionalLanguage: true,
        selectedLanguage: 'en',
        flagNotifyOutcomePush: true,
        flagPaymentNotification: false,
        flagNotifyIo: true,
        ioApiKey: 'io-api-key',
        pdndEnabled: true,
        sendApiKey: 'send-api-key'
      });
    });
  });

  describe('Validation rules', () => {
    it('should require fields when organization is ACTIVE and flags are enabled', () => {
      const initialData = createBaseInitialData({
        organizationStatus: 'ACTIVE',
        additionalLanguage: { value: true, readonly: false },
        flagNotifyIo: { value: true, readonly: false }
      });

      const { result } = renderHook(() =>
        useOrganizationEditForm({
          initialData
        })
      );

      const { validationRules } = result.current;

      const ibanRules = validationRules.iban as Record<string, unknown>;
      expect(ibanRules.required).toBeDefined();

      expect(validationRules.segregationCode.required).toEqual({
        value: true,
        message: 'organizationEditWizard.step2.segregationCode.required'
      });

      expect(validationRules.selectedLanguage.required).toEqual({
        value: true,
        message: 'organizationEditWizard.step2.selectedLanguage.required'
      });

      expect(validationRules.ioApiKey.required).toEqual({
        value: true,
        message:
          'organizationEditWizard.step2.pagoPaIntegration.io.apiKeyRequired'
      });

      expect(validationRules.flagNotifyOutcomePush.validate(null)).toBe(
        'organizationEditWizard.step2.radioRequired'
      );
      expect(validationRules.flagPaymentNotification.validate(null)).toBe(
        'organizationEditWizard.step2.radioRequired'
      );
    });

    it('should not require optional fields when organization is not ACTIVE and flags are disabled', () => {
      const initialData = createBaseInitialData({
        organizationStatus: 'DRAFT',
        additionalLanguage: { value: false, readonly: false },
        flagNotifyIo: { value: false, readonly: false }
      });

      const { result } = renderHook(() =>
        useOrganizationEditForm({
          initialData
        })
      );

      const { validationRules } = result.current;

      expect(validationRules.segregationCode.required).toBeUndefined();
      expect(validationRules.selectedLanguage.required).toBeUndefined();
      expect(validationRules.ioApiKey.required).toBeUndefined();
    });
  });

  describe('handleLogoChange', () => {
    it('should set error and return invalid when logo is removed for ACTIVE organization', async () => {
      const initialData = createBaseInitialData({
        organizationStatus: 'ACTIVE',
        orgLogo: { value: 'existing-logo', readonly: false }
      });

      mockHandleLogoConversion.mockResolvedValueOnce({
        logoValue: null,
        logoRemoved: true
      });

      const { result } = renderHook(() =>
        useOrganizationEditForm({
          initialData
        })
      );

      let changeResult: Awaited<
        ReturnType<typeof result.current.handleLogoChange>
      >;

      await act(async () => {
        changeResult = await result.current.handleLogoChange(null);
      });

      expect(mockHandleLogoConversion).toHaveBeenCalledWith(
        null,
        'existing-logo'
      );

      await waitFor(() => {
        expect(result.current.errors.orgLogo?.message).toBe(
          'organizationEditWizard.step1.orgLogo.required'
        );
      });

      expect(changeResult!.isValid).toBe(false);
      expect(changeResult!.errorMessage).toBe(
        'organizationEditWizard.step1.orgLogo.required'
      );
    });

    it('should set error and return invalid when no logo exists for ACTIVE organization', async () => {
      const initialData = createBaseInitialData({
        organizationStatus: 'ACTIVE',
        orgLogo: { value: null, readonly: false }
      });

      mockHandleLogoConversion.mockResolvedValueOnce({
        logoValue: null,
        logoRemoved: false
      });

      const { result } = renderHook(() =>
        useOrganizationEditForm({
          initialData
        })
      );

      let changeResult: Awaited<
        ReturnType<typeof result.current.handleLogoChange>
      >;

      await act(async () => {
        changeResult = await result.current.handleLogoChange(null);
      });

      expect(mockHandleLogoConversion).toHaveBeenCalledWith(null, null);

      await waitFor(() => {
        expect(result.current.errors.orgLogo?.message).toBe(
          'organizationEditWizard.step1.orgLogo.required'
        );
      });

      expect(changeResult!.isValid).toBe(false);
      expect(changeResult!.errorMessage).toBe(
        'organizationEditWizard.step1.orgLogo.required'
      );
    });

    it('should return valid result when logo is present or optional', async () => {
      const initialData = createBaseInitialData({
        organizationStatus: 'DRAFT',
        orgLogo: { value: null, readonly: false }
      });

      mockHandleLogoConversion.mockResolvedValueOnce({
        logoValue: null,
        logoRemoved: false
      });

      const { result } = renderHook(() =>
        useOrganizationEditForm({
          initialData
        })
      );

      let changeResult: Awaited<
        ReturnType<typeof result.current.handleLogoChange>
      >;

      await act(async () => {
        changeResult = await result.current.handleLogoChange(null);
      });

      expect(mockHandleLogoConversion).toHaveBeenCalledWith(null, null);
      expect(changeResult!.isValid).toBe(true);
      expect(changeResult!.errorMessage).toBeUndefined();
      expect(result.current.errors.orgLogo).toBeUndefined();
    });
  });
});
