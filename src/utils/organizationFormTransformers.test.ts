import { describe, it, expect } from 'vitest';
import {
  transformApiDataToFormData,
  transformFormDataToApiPayload
} from './organizationFormTransformers';
import {
  OrganizationAdditionalLanguage,
  OrganizationStatus
} from '../../generated/core/data-contracts';
import type { OrganizationDetail } from '../../generated/core/data-contracts';
import type { UnifiedFormData } from '../models/OrganizationEditTypes';

const baseOrganizationDetail: OrganizationDetail = {
  organizationId: 33,
  flagTreasury: false,
  externalOrganizationId: 'EXT123',
  ipaCode: 'IPA_TEST',
  orgTypeCode: '03',
  orgName: 'Ente Test',
  orgFiscalCode: '99999999990',
  orgEmail: 'ente@test.it',
  postalIban: 'IT60X0542811101000000123456',
  iban: 'IT111',
  // eslint-disable-next-line sonarjs/no-hardcoded-passwords
  password: 'password',
  segregationCode: '00',
  cbillInterBankCode: 'CBILL001',
  orgLogo: 'data:image/png;base64,logo',
  status: OrganizationStatus.ACTIVE,
  additionalLanguage: OrganizationAdditionalLanguage.EN,
  startDate: '2024-01-01',
  brokerId: 1,
  flagNotifyIo: false,
  flagNotifyOutcomePush: false,
  flagPaymentNotification: false,
  pdndEnabled: false
};

const baseOriginalData = {
  organizationId: 33,
  flagTreasury: false,
  externalOrganizationId: 'EXT123',
  ipaCode: 'IPA_TEST',
  orgTypeCode: '03',
  status: OrganizationStatus.ACTIVE,
  startDate: '2024-01-01',
  brokerId: 1,
  // eslint-disable-next-line sonarjs/no-hardcoded-passwords
  password: 'password',
  orgFiscalCode: '99999999990',
  orgName: 'Ente Test',
  orgEmail: 'ente@test.it',
  orgLogo: 'data:image/png;base64,logo',
  iban: 'IT111',
  postalIban: 'IT60X0542811101000000123456',
  cbillInterBankCode: 'CBILL001',
  segregationCode: '00',
  additionalLanguage: undefined as OrganizationAdditionalLanguage | undefined,
  flagNotifyOutcomePush: false,
  flagPaymentNotification: false,
  flagNotifyIo: false,
  pdndEnabled: false
};

describe('organizationFormTransformers', () => {
  describe('transformApiDataToFormData', () => {
    it('maps a valid additionalLanguage to the selected language', () => {
      const result = transformApiDataToFormData(baseOrganizationDetail);

      expect(result.additionalLanguage.value).toBe(true);
      expect(result.selectedLanguage.value).toBe('en');
    });

    it('handles an invalid additionalLanguage', () => {
      const data = { ...baseOrganizationDetail, additionalLanguage: 'XX' };
      const result = transformApiDataToFormData(data as OrganizationDetail);

      expect(result.additionalLanguage.value).toBe(false);
      expect(result.selectedLanguage.value).toBe('');
    });

    it('handles an undefined additionalLanguage', () => {
      const data = { ...baseOrganizationDetail, additionalLanguage: undefined };
      const result = transformApiDataToFormData(data);

      expect(result.additionalLanguage.value).toBe(false);
      expect(result.selectedLanguage.value).toBe('');
    });

    it('maps boolean flags preserving their values', () => {
      const result = transformApiDataToFormData(baseOrganizationDetail);

      expect(result.flagNotifyIo.value).toBe(false);
      expect(result.pdndEnabled.value).toBe(false);
    });
  });

  describe('transformFormDataToApiPayload', () => {
    const buildFormData = (
      overrides: Partial<UnifiedFormData> = {}
    ): UnifiedFormData => ({
      orgName: { value: 'Ente Test', readonly: true },
      orgFiscalCode: { value: '99999999990', readonly: true },
      orgEmail: { value: 'ente@test.it', readonly: false },
      orgLogo: { value: 'data:image/png;base64,logo', readonly: false },
      logoRemoved: false,
      iban: { value: 'IT111', readonly: false },
      ibanPostal: { value: 'IT60X0542811101000000123456', readonly: false },
      cbill: { value: 'CBILL001', readonly: false },
      flagTreasury: { value: false, readonly: false },
      segregationCode: { value: '00', readonly: false },
      additionalLanguage: { value: false, readonly: false },
      selectedLanguage: { value: '', readonly: false },
      flagNotifyOutcomePush: { value: false, readonly: false },
      flagPaymentNotification: { value: false, readonly: false },
      flagNotifyIo: { value: false, readonly: false },
      pdndEnabled: { value: false, readonly: false },
      organizationStatus: 'ACTIVE',
      ...overrides
    });

    it('leaves additionalLanguage undefined when the flag is off', () => {
      const formData = buildFormData({
        additionalLanguage: { value: false, readonly: false }
      });
      const payload = transformFormDataToApiPayload(formData, baseOriginalData);

      expect(payload.additionalLanguage).toBeUndefined();
    });

    it('maps additionalLanguage to the enum when the flag is on and language is valid', () => {
      const formData = buildFormData({
        additionalLanguage: { value: true, readonly: false },
        selectedLanguage: { value: 'EN', readonly: false }
      });
      const payload = transformFormDataToApiPayload(formData, baseOriginalData);

      expect(payload.additionalLanguage).toBe(
        OrganizationAdditionalLanguage.EN
      );
    });

    it('leaves additionalLanguage undefined when the selected language is not a valid enum', () => {
      const formData = buildFormData({
        additionalLanguage: { value: true, readonly: false },
        selectedLanguage: { value: 'XX', readonly: false }
      });
      const payload = transformFormDataToApiPayload(formData, baseOriginalData);

      expect(payload.additionalLanguage).toBeUndefined();
    });
  });
});
