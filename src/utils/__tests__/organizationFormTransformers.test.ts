import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  transformApiDataToFormData,
  transformFormDataToApiPayload,
  transformFormValuesToFieldData,
  handleLogoConversion,
  unifiedFormDataToFormValues,
  mapStep2ValuesToFieldData
} from '../organizationFormTransformers';
import {
  UnifiedFormData,
  UnifiedFormValues,
  LANGUAGE_OPTIONS
} from '../../models/OrganizationEditTypes';
import {
  OrganizationAdditionalLanguage,
  OrganizationDetailDTO,
  OrganizationStatus
} from '../../../generated/core/data-contracts';

vi.mock('../filevalidation', () => ({
  fileToBase64: vi.fn(async () => 'base64-logo-mocked')
}));

describe('organizationFormTransformers', () => {
  const baseOrganization: OrganizationDetailDTO = {
    organizationId: 1,
    flagTreasury: false,
    externalOrganizationId: 'EXT123',
    ipaCode: 'IPA_TEST',
    orgFiscalCode: '12345678901',
    orgName: 'Test Org',
    orgTypeCode: 'TYPE1',
    orgEmail: 'test@org.it',
    postalIban: 'IT60X0542811101000000123456',
    iban: 'IT60X0542811101000000123456',
    // eslint-disable-next-line sonarjs/no-hardcoded-passwords
    password: 'mock-org-value',
    segregationCode: '00',
    cbillInterBankCode: 'CBILL01',
    orgLogo: 'logo-base64',
    status: OrganizationStatus.DRAFT,
    additionalLanguage: undefined,
    startDate: '2024-01-01',
    brokerId: 10,
    ioApiKey: 'io-key',
    sendApiKey: 'send-key',
    generateNoticeApiKey: 'notice-key',
    flagNotifyIo: true,
    flagNotifyOutcomePush: true,
    flagPaymentNotification: false,
    pdndEnabled: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('unifiedFormDataToFormValues', () => {
    it('should map UnifiedFormData to UnifiedFormValues and use provided logoFile', () => {
      const formData = transformApiDataToFormData(baseOrganization);
      const logoFile = new File(['dummy-logo'], 'logo.png', {
        type: 'image/png'
      });

      const values = unifiedFormDataToFormValues(formData, { logoFile });

      // Step 1
      expect(values.orgName).toBe(formData.orgName.value);
      expect(values.orgFiscalCode).toBe(formData.orgFiscalCode.value);
      expect(values.orgEmail).toBe(formData.orgEmail.value);
      expect(values.orgLogo).toBe(logoFile);

      // Step 2 - accounting
      expect(values.iban).toBe(formData.iban.value);
      expect(values.ibanPostal).toBe(formData.ibanPostal.value);
      expect(values.cbill).toBe(formData.cbill.value);
      expect(values.flagTreasury).toBe(formData.flagTreasury.value);

      // Step 2 - payments
      expect(values.segregationCode).toBe(formData.segregationCode.value);
      expect(values.generateNoticeApiKey).toBe(
        formData.generateNoticeApiKey.value
      );
      expect(values.additionalLanguage).toBe(formData.additionalLanguage.value);
      expect(values.selectedLanguage).toBe(formData.selectedLanguage.value);
      expect(values.flagNotifyOutcomePush).toBe(
        formData.flagNotifyOutcomePush.value
      );
      expect(values.flagPaymentNotification).toBe(
        formData.flagPaymentNotification.value
      );

      // Step 2 - PagoPA integration
      expect(values.flagNotifyIo).toBe(formData.flagNotifyIo.value);
      expect(values.ioApiKey).toBe(formData.ioApiKey.value);
      expect(values.pdndEnabled).toBe(formData.pdndEnabled.value);
      expect(values.sendApiKey).toBe(formData.sendApiKey.value);
    });

    it('should default orgLogo to null when logoFile is not provided', () => {
      const formData = transformApiDataToFormData(baseOrganization);

      const values = unifiedFormDataToFormValues(formData);

      expect(values.orgLogo).toBeNull();
    });
  });

  describe('transformApiDataToFormData', () => {
    it('should transform API data to unified form data with readonly flags', () => {
      const formData = transformApiDataToFormData(baseOrganization);
      expect(formData.orgName.value).toBe(baseOrganization.orgName);
      expect(formData.orgName.readonly).toBe(true);
      expect(formData.orgFiscalCode.value).toBe(baseOrganization.orgFiscalCode);
      expect(formData.orgFiscalCode.readonly).toBe(true);
      expect(formData.orgEmail.value).toBe(baseOrganization.orgEmail);
      expect(formData.orgEmail.readonly).toBe(false);
      expect(formData.orgLogo.value).toBe(baseOrganization.orgLogo);
      expect(formData.logoRemoved).toBe(false);
      expect(formData.iban.value).toBe(baseOrganization.iban);
      expect(formData.ibanPostal.value).toBe(baseOrganization.postalIban);
      expect(formData.cbill.value).toBe(baseOrganization.cbillInterBankCode);
      expect(formData.flagTreasury.value).toBe(baseOrganization.flagTreasury);
      expect(formData.segregationCode.value).toBe(
        baseOrganization.segregationCode
      );
      expect(formData.generateNoticeApiKey.value).toBe(
        baseOrganization.generateNoticeApiKey
      );
      expect(formData.flagNotifyOutcomePush.value).toBe(
        baseOrganization.flagNotifyOutcomePush
      );
      expect(formData.flagPaymentNotification.value).toBe(
        baseOrganization.flagPaymentNotification
      );
      expect(formData.flagNotifyIo.value).toBe(baseOrganization.flagNotifyIo);
      expect(formData.ioApiKey.value).toBe(baseOrganization.ioApiKey);
      expect(formData.pdndEnabled.value).toBe(baseOrganization.pdndEnabled);
      expect(formData.sendApiKey.value).toBe(baseOrganization.sendApiKey);
      expect(formData.organizationStatus).toBe(baseOrganization.status);
    });

    it('should normalize and validate additionalLanguage from API', () => {
      const orgWithLang: OrganizationDetailDTO = {
        ...baseOrganization,
        additionalLanguage: OrganizationAdditionalLanguage.EN
      };

      const formData = transformApiDataToFormData(orgWithLang);

      expect(formData.additionalLanguage.value).toBe(true);
      expect(formData.selectedLanguage.value).toBe('en');
    });

    it('should set additionalLanguage as false when API provides invalid language', () => {
      const orgWithInvalidLang: OrganizationDetailDTO = {
        ...baseOrganization,
        additionalLanguage: 'xx' as OrganizationAdditionalLanguage
      };

      const formData = transformApiDataToFormData(orgWithInvalidLang);

      expect(formData.additionalLanguage.value).toBe(false);
      expect(formData.selectedLanguage.value).toBe('');
    });
  });

  describe('transformFormValuesToFieldData', () => {
    it('should preserve readonly flags while updating values', () => {
      const originalData = transformApiDataToFormData(baseOrganization);

      const values: UnifiedFormValues = {
        orgName: 'New Org Name',
        orgFiscalCode: '99999999999',
        orgEmail: 'new@org.it',
        orgLogo: null,
        iban: 'IT11X0542811101000000123456',
        ibanPostal: 'IT11X0542811101000000654321',
        cbill: 'CBILL02',
        flagTreasury: true,
        segregationCode: '01',
        generateNoticeApiKey: 'new-notice-key',
        additionalLanguage: true,
        selectedLanguage: LANGUAGE_OPTIONS.EN,
        flagNotifyOutcomePush: false,
        flagPaymentNotification: true,
        flagNotifyIo: false,
        ioApiKey: 'new-io-key',
        pdndEnabled: true,
        sendApiKey: 'new-send-key'
      };

      const updatedData = transformFormValuesToFieldData(values, originalData);

      expect(updatedData.orgName.value).toBe(values.orgName);
      expect(updatedData.orgFiscalCode.value).toBe(values.orgFiscalCode);
      expect(updatedData.orgEmail.value).toBe(values.orgEmail);
      expect(updatedData.iban.value).toBe(values.iban);
      expect(updatedData.ibanPostal.value).toBe(values.ibanPostal);
      expect(updatedData.cbill.value).toBe(values.cbill);
      expect(updatedData.flagTreasury.value).toBe(values.flagTreasury);

      expect(updatedData.segregationCode.value).toBe(values.segregationCode);
      expect(updatedData.generateNoticeApiKey.value).toBe(
        values.generateNoticeApiKey
      );
      expect(updatedData.additionalLanguage.value).toBe(
        values.additionalLanguage
      );
      expect(updatedData.selectedLanguage.value).toBe(values.selectedLanguage);
      expect(updatedData.flagNotifyOutcomePush.value).toBe(
        values.flagNotifyOutcomePush
      );
      expect(updatedData.flagPaymentNotification.value).toBe(
        values.flagPaymentNotification
      );
      expect(updatedData.flagNotifyIo.value).toBe(values.flagNotifyIo);
      expect(updatedData.ioApiKey.value).toBe(values.ioApiKey);
      expect(updatedData.pdndEnabled.value).toBe(values.pdndEnabled);
      expect(updatedData.sendApiKey.value).toBe(values.sendApiKey);

      expect(updatedData.orgName.readonly).toBe(originalData.orgName.readonly);
      expect(updatedData.orgFiscalCode.readonly).toBe(
        originalData.orgFiscalCode.readonly
      );
      expect(updatedData.orgEmail.readonly).toBe(
        originalData.orgEmail.readonly
      );
      expect(updatedData.orgLogo).toEqual(originalData.orgLogo);
      expect(updatedData.logoRemoved).toEqual(originalData.logoRemoved);
      expect(updatedData.organizationStatus).toBe(
        originalData.organizationStatus
      );
    });
  });

  describe('mapStep2ValuesToFieldData', () => {
    it('should update only Step 2 fields and preserve readonly flags', () => {
      const originalData = transformApiDataToFormData(baseOrganization);

      const values: UnifiedFormValues = {
        orgName: 'Ignored Org Name',
        orgFiscalCode: 'Ignored Fiscal Code',
        orgEmail: 'ignored@org.it',
        orgLogo: null,
        iban: 'IT11X0542811101000000123456',
        ibanPostal: 'IT11X0542811101000000654321',
        cbill: 'CBILL02',
        flagTreasury: true,
        segregationCode: '01',
        generateNoticeApiKey: 'new-notice-key',
        additionalLanguage: true,
        selectedLanguage: LANGUAGE_OPTIONS.EN,
        flagNotifyOutcomePush: false,
        flagPaymentNotification: true,
        flagNotifyIo: false,
        ioApiKey: 'new-io-key',
        pdndEnabled: true,
        sendApiKey: 'new-send-key'
      };

      const step2Data = mapStep2ValuesToFieldData(values, originalData);

      // Values updated
      expect(step2Data.iban.value).toBe(values.iban);
      expect(step2Data.ibanPostal.value).toBe(values.ibanPostal);
      expect(step2Data.cbill.value).toBe(values.cbill);
      expect(step2Data.flagTreasury.value).toBe(values.flagTreasury);

      expect(step2Data.segregationCode.value).toBe(values.segregationCode);
      expect(step2Data.generateNoticeApiKey.value).toBe(
        values.generateNoticeApiKey
      );
      expect(step2Data.additionalLanguage.value).toBe(
        values.additionalLanguage
      );
      expect(step2Data.selectedLanguage.value).toBe(values.selectedLanguage);
      expect(step2Data.flagNotifyOutcomePush.value).toBe(
        values.flagNotifyOutcomePush
      );
      expect(step2Data.flagPaymentNotification.value).toBe(
        values.flagPaymentNotification
      );
      expect(step2Data.flagNotifyIo.value).toBe(values.flagNotifyIo);
      expect(step2Data.ioApiKey.value).toBe(values.ioApiKey);
      expect(step2Data.pdndEnabled.value).toBe(values.pdndEnabled);
      expect(step2Data.sendApiKey.value).toBe(values.sendApiKey);

      // Readonly preserved
      expect(step2Data.iban.readonly).toBe(originalData.iban.readonly);
      expect(step2Data.ibanPostal.readonly).toBe(
        originalData.ibanPostal.readonly
      );
      expect(step2Data.cbill.readonly).toBe(originalData.cbill.readonly);
      expect(step2Data.flagTreasury.readonly).toBe(
        originalData.flagTreasury.readonly
      );
      expect(step2Data.segregationCode.readonly).toBe(
        originalData.segregationCode.readonly
      );
      expect(step2Data.generateNoticeApiKey.readonly).toBe(
        originalData.generateNoticeApiKey.readonly
      );
      expect(step2Data.additionalLanguage.readonly).toBe(
        originalData.additionalLanguage.readonly
      );
      expect(step2Data.selectedLanguage.readonly).toBe(
        originalData.selectedLanguage.readonly
      );
      expect(step2Data.flagNotifyOutcomePush.readonly).toBe(
        originalData.flagNotifyOutcomePush.readonly
      );
      expect(step2Data.flagPaymentNotification.readonly).toBe(
        originalData.flagPaymentNotification.readonly
      );
      expect(step2Data.flagNotifyIo.readonly).toBe(
        originalData.flagNotifyIo.readonly
      );
      expect(step2Data.ioApiKey.readonly).toBe(originalData.ioApiKey.readonly);
      expect(step2Data.pdndEnabled.readonly).toBe(
        originalData.pdndEnabled.readonly
      );
      expect(step2Data.sendApiKey.readonly).toBe(
        originalData.sendApiKey.readonly
      );
    });
  });

  describe('transformFormDataToApiPayload', () => {
    it('should map unified form data back to OrganizationDetailDTO', () => {
      const formData: UnifiedFormData =
        transformApiDataToFormData(baseOrganization);
      formData.orgName.value = 'Updated Org';
      formData.orgEmail.value = 'updated@org.it';
      formData.iban.value = 'IT22X0542811101000000123456';
      formData.flagTreasury.value = true;
      formData.additionalLanguage.value = true;
      formData.selectedLanguage.value = LANGUAGE_OPTIONS.EN;

      const payload = transformFormDataToApiPayload(formData, baseOrganization);

      expect(payload.organizationId).toBe(baseOrganization.organizationId);
      expect(payload.externalOrganizationId).toBe(
        baseOrganization.externalOrganizationId
      );
      expect(payload.ipaCode).toBe(baseOrganization.ipaCode);
      expect(payload.orgTypeCode).toBe(baseOrganization.orgTypeCode);
      expect(payload.status).toBe(baseOrganization.status);
      expect(payload.startDate).toBe(baseOrganization.startDate);
      expect(payload.brokerId).toBe(baseOrganization.brokerId);
      expect(payload.password).toBe(baseOrganization.password);

      expect(payload.orgName).toBe(formData.orgName.value);
      expect(payload.orgFiscalCode).toBe(formData.orgFiscalCode.value);
      expect(payload.orgEmail).toBe(formData.orgEmail.value);
      expect(payload.iban).toBe(formData.iban.value);
      expect(payload.postalIban).toBe(formData.ibanPostal.value);
      expect(payload.cbillInterBankCode).toBe(formData.cbill.value);
      expect(payload.segregationCode).toBe(formData.segregationCode.value);
      expect(payload.generateNoticeApiKey).toBe(
        formData.generateNoticeApiKey.value
      );

      expect(payload.additionalLanguage).toBe('EN');

      expect(payload.flagNotifyOutcomePush).toBe(
        formData.flagNotifyOutcomePush.value
      );
      expect(payload.flagPaymentNotification).toBe(
        formData.flagPaymentNotification.value
      );

      expect(payload.flagNotifyIo).toBe(formData.flagNotifyIo.value);
      expect(payload.ioApiKey).toBe(formData.ioApiKey.value);
      expect(payload.pdndEnabled).toBe(formData.pdndEnabled.value);
      expect(payload.sendApiKey).toBe(formData.sendApiKey.value);
    });

    it('should correctly handle logo removal and preservation', () => {
      const originalData = { ...baseOrganization, orgLogo: 'original-logo' };
      const formData = transformApiDataToFormData(originalData);

      // Case 1: logoRemoved = true -> orgLogo undefined in payload
      formData.logoRemoved = true;
      formData.orgLogo.value = null;
      let payload = transformFormDataToApiPayload(formData, originalData);
      expect(payload.orgLogo).toBeUndefined();

      // Case 2: new logo present in formData
      formData.logoRemoved = false;
      formData.orgLogo.value = 'new-logo';
      payload = transformFormDataToApiPayload(formData, originalData);
      expect(payload.orgLogo).toBe('new-logo');

      // Case 3: no change (no logo in formData, logoRemoved false) -> keep original
      formData.logoRemoved = false;
      formData.orgLogo.value = null;
      payload = transformFormDataToApiPayload(formData, originalData);
      expect(payload.orgLogo).toBe('original-logo');
    });
  });

  describe('handleLogoConversion', () => {
    it('should mark logo as removed when existingLogo is present and logoFile is null', async () => {
      const result = await handleLogoConversion(null, 'existing-logo');

      expect(result.logoValue).toBeNull();
      expect(result.logoRemoved).toBe(true);
    });

    it('should convert new logo file to base64 and not mark as removed', async () => {
      const file = new File(['dummy'], 'logo.png', { type: 'image/png' });
      const result = await handleLogoConversion(file, null);

      expect(result.logoValue).toBe('base64-logo-mocked');
      expect(result.logoRemoved).toBe(false);
    });

    it('should keep existing logo when conversion fails', async () => {
      const file = new File(['dummy'], 'logo.png', { type: 'image/png' });
      const { fileToBase64 } = await import('../filevalidation');
      vi.mocked(fileToBase64).mockRejectedValueOnce(
        new Error('conversion failed')
      );

      const result = await handleLogoConversion(file, 'existing-logo');

      expect(result.logoValue).toBe('existing-logo');
      expect(result.logoRemoved).toBe(false);
    });

    it('should keep null logo when no logo exists and no file is provided', async () => {
      const result = await handleLogoConversion(null, null);

      expect(result.logoValue).toBeNull();
      expect(result.logoRemoved).toBe(false);
    });
  });
});
