/**
 * Utility functions for transforming Organization data
 */

import {
  OrganizationAdditionalLanguage,
  OrganizationDetailDTO
} from '../../generated/core/data-contracts';
import {
  UnifiedFormData,
  UnifiedFormValues,
  FieldData,
  LANGUAGE_OPTIONS
} from '../models/OrganizationEditTypes';
import { fileToBase64 } from './filevalidation';

/**
 * Transforms API OrganizationDetailDTO to UnifiedFormData
 * Converts the API response format to the unified form data structure
 *
 * @param orgData - Organization data from API
 * @returns UnifiedFormData - Form data structure for the unified form
 */
export const transformApiDataToFormData = (
  orgData: OrganizationDetailDTO
): UnifiedFormData => {
  // Map additionalLanguage enum from API to boolean flag + selected language (lowercase)
  const additionalLangEnum = orgData.additionalLanguage;
  const isValidLanguage =
    additionalLangEnum !== undefined &&
    Object.prototype.hasOwnProperty.call(
      LANGUAGE_OPTIONS,
      additionalLangEnum as keyof typeof LANGUAGE_OPTIONS
    );

  const normalizedLanguage = isValidLanguage
    ? LANGUAGE_OPTIONS[additionalLangEnum as keyof typeof LANGUAGE_OPTIONS]
    : '';

  return {
    // Step 1 fields (Entity Profile)
    orgName: {
      value: orgData.orgName || '',
      readonly: true
    },
    orgFiscalCode: {
      value: orgData.orgFiscalCode || '',
      readonly: true
    },
    orgEmail: {
      value: orgData.orgEmail || '',
      readonly: false
    },
    orgLogo: {
      value: orgData.orgLogo || null,
      readonly: false
    },
    logoRemoved: false,
    // Step 2 fields (Accounting Information)
    iban: {
      value: orgData.iban || '',
      readonly: false
    },
    ibanPostal: {
      value: orgData?.postalIban,
      readonly: false
    },
    cbill: {
      value: orgData.cbillInterBankCode || '',
      readonly: false
    },
    flagTreasury: {
      value: orgData.flagTreasury ?? false,
      readonly: false
    },
    // Step 2 fields (Payments Information)
    segregationCode: {
      value: orgData.segregationCode || '',
      readonly: false
    },
    generateNoticeApiKey: {
      value: orgData.generateNoticeApiKey || '',
      readonly: false
    },
    additionalLanguage: {
      value: isValidLanguage,
      readonly: false
    },
    selectedLanguage: {
      value: isValidLanguage ? normalizedLanguage : '',
      readonly: false
    },
    flagNotifyOutcomePush: {
      value: orgData.flagNotifyOutcomePush ?? null,
      readonly: false
    },
    flagPaymentNotification: {
      value: orgData.flagPaymentNotification ?? null,
      readonly: false
    },
    // Step 2 fields (PagoPA Products Integration)
    flagNotifyIo: {
      value: orgData.flagNotifyIo ?? false,
      readonly: false
    },
    ioApiKey: {
      value: orgData.ioApiKey || '',
      readonly: false
    },
    pdndEnabled: {
      value: orgData.pdndEnabled ?? false,
      readonly: false
    },
    sendApiKey: {
      value: orgData.sendApiKey || '',
      readonly: false
    },
    // Common field
    organizationStatus: orgData.status
  };
};

/**
 * Transforms UnifiedFormData to UnifiedFormValues
 * Centralized mapping used to initialize react-hook-form values
 *
 * NOTE:
 * - All string fields use `|| ''` to avoid undefined values in the form
 * - Boolean and nullable fields preserve their original values
 * - Logo handling is delegated via the `logoFile` option to keep responsibilities separated
 *
 * @param formData - Unified form data from the domain model
 * @param options - Optional configuration (e.g. logo File instance)
 * @returns UnifiedFormValues - Values suitable for react-hook-form
 */
export const unifiedFormDataToFormValues = (
  formData: UnifiedFormData,
  options?: { logoFile?: File | null }
): UnifiedFormValues => {
  return {
    // Step 1 fields (Entity Profile)
    orgName: formData.orgName.value || '',
    orgFiscalCode: formData.orgFiscalCode.value || '',
    orgEmail: formData.orgEmail.value || '',
    orgLogo: options?.logoFile ?? null,
    // Step 2 fields (Accounting Information)
    iban: formData.iban.value || '',
    ibanPostal: formData.ibanPostal.value,
    cbill: formData.cbill.value || '',
    flagTreasury: formData.flagTreasury.value,
    // Step 2 fields (Payments Information)
    segregationCode: formData.segregationCode.value || '',
    generateNoticeApiKey: formData.generateNoticeApiKey.value || '',
    additionalLanguage: formData.additionalLanguage.value,
    selectedLanguage: formData.selectedLanguage.value || '',
    // Preserve null values for required radio groups
    flagNotifyOutcomePush: formData.flagNotifyOutcomePush.value,
    flagPaymentNotification: formData.flagPaymentNotification.value,
    // Step 2 fields (PagoPA Products Integration)
    flagNotifyIo: formData.flagNotifyIo.value,
    ioApiKey: formData.ioApiKey.value || '',
    pdndEnabled: formData.pdndEnabled.value,
    sendApiKey: formData.sendApiKey.value || ''
  };
};

/**
 * Transforms UnifiedFormData to API OrganizationDetailDTO payload
 * Converts the unified form data structure to the API request format
 *
 * @param formData - Unified form data from the form
 * @param originalData - Original organization data from API (for readonly fields)
 * @returns OrganizationDetailDTO - API payload for update request
 */
export const transformFormDataToApiPayload = (
  formData: UnifiedFormData,
  originalData: OrganizationDetailDTO
): OrganizationDetailDTO => {
  // Determine orgLogo value based on user actions
  let orgLogoValue: string | undefined;
  if (formData.logoRemoved) {
    // User explicitly removed the logo, send undefined to remove it
    orgLogoValue = undefined;
  } else if (formData.orgLogo.value) {
    // User uploaded a new logo or kept existing one
    orgLogoValue = formData.orgLogo.value;
  } else {
    // No logo action taken, keep original
    orgLogoValue = originalData.orgLogo;
  }

  // Map form additionalLanguage back to enum expected by the API
  let additionalLanguage: OrganizationAdditionalLanguage | undefined;
  if (formData.additionalLanguage.value) {
    const upperCode = formData.selectedLanguage.value.toUpperCase();
    if (
      Object.prototype.hasOwnProperty.call(
        OrganizationAdditionalLanguage,
        upperCode
      )
    ) {
      additionalLanguage = upperCode as OrganizationAdditionalLanguage;
    }
  }

  const payload: OrganizationDetailDTO = {
    // Fields from original API (readonly)
    organizationId: originalData.organizationId,
    flagTreasury: formData.flagTreasury.value,
    externalOrganizationId: originalData.externalOrganizationId,
    ipaCode: originalData.ipaCode,
    orgTypeCode: originalData.orgTypeCode,
    status: originalData.status,
    startDate: originalData.startDate,
    brokerId: originalData.brokerId,
    password: originalData.password,
    // Step 1 editable fields (Entity Profile)
    orgFiscalCode: formData.orgFiscalCode.value,
    orgName: formData.orgName.value,
    orgEmail: formData.orgEmail.value,
    orgLogo: orgLogoValue,
    // Step 2 accounting fields
    iban: formData.iban.value,
    postalIban: formData.ibanPostal.value,
    cbillInterBankCode: formData.cbill.value,
    // Step 2 payment fields
    segregationCode: formData.segregationCode.value,
    generateNoticeApiKey: formData.generateNoticeApiKey.value,
    additionalLanguage,
    flagNotifyOutcomePush: formData.flagNotifyOutcomePush.value ?? false,
    flagPaymentNotification: formData.flagPaymentNotification.value ?? false,
    // Step 2 PagoPA integration fields
    flagNotifyIo: formData.flagNotifyIo.value,
    ioApiKey: formData.ioApiKey.value,
    pdndEnabled: formData.pdndEnabled.value,
    sendApiKey: formData.sendApiKey.value
  };

  return payload;
};

/**
 * Utility function to create FieldData from form value and original field
 * Preserves the readonly flag from the original field
 *
 * @param formValue - Value from the form
 * @param originalField - Original FieldData to preserve readonly flag
 * @returns FieldData - New FieldData with form value and original readonly flag
 */
function createFieldData<T>(
  formValue: T,
  originalField: FieldData<T>
): FieldData<T> {
  return {
    value: formValue,
    readonly: originalField.readonly
  };
}

/**
 * Maps Step 2 fields (accounting, payments, PagoPA integration)
 * from UnifiedFormValues to UnifiedFormData, preserving readonly flags.
 *
 * This helper is reused by:
 * - Unified form transformer (`transformFormValuesToFieldData`)
 * - Wizard step transformers
 */
export const mapStep2ValuesToFieldData = (
  values: UnifiedFormValues,
  originalData: UnifiedFormData
): Pick<
  UnifiedFormData,
  | 'iban'
  | 'ibanPostal'
  | 'cbill'
  | 'flagTreasury'
  | 'segregationCode'
  | 'generateNoticeApiKey'
  | 'additionalLanguage'
  | 'selectedLanguage'
  | 'flagNotifyOutcomePush'
  | 'flagPaymentNotification'
  | 'flagNotifyIo'
  | 'ioApiKey'
  | 'pdndEnabled'
  | 'sendApiKey'
> => ({
  // Step 2 fields (Accounting Information)
  iban: createFieldData(values.iban, originalData.iban),
  ibanPostal: createFieldData(values.ibanPostal, originalData.ibanPostal),
  cbill: createFieldData(values.cbill, originalData.cbill),
  flagTreasury: createFieldData(values.flagTreasury, originalData.flagTreasury),
  // Step 2 fields (Payments Information)
  segregationCode: createFieldData(
    values.segregationCode,
    originalData.segregationCode
  ),
  generateNoticeApiKey: createFieldData(
    values.generateNoticeApiKey,
    originalData.generateNoticeApiKey
  ),
  additionalLanguage: createFieldData(
    values.additionalLanguage,
    originalData.additionalLanguage
  ),
  selectedLanguage: createFieldData(
    values.selectedLanguage,
    originalData.selectedLanguage
  ),
  flagNotifyOutcomePush: createFieldData(
    values.flagNotifyOutcomePush,
    originalData.flagNotifyOutcomePush
  ),
  flagPaymentNotification: createFieldData(
    values.flagPaymentNotification,
    originalData.flagPaymentNotification
  ),
  // Step 2 fields (PagoPA Products Integration)
  flagNotifyIo: createFieldData(values.flagNotifyIo, originalData.flagNotifyIo),
  ioApiKey: createFieldData(values.ioApiKey, originalData.ioApiKey),
  pdndEnabled: createFieldData(values.pdndEnabled, originalData.pdndEnabled),
  sendApiKey: createFieldData(values.sendApiKey, originalData.sendApiKey)
});

/**
 * Transforms UnifiedFormValues to UnifiedFormData
 * Converts react-hook-form values to the unified form data structure
 * Preserves readonly flags from original data
 *
 * Note: Logo handling is separate and should be done via handleLogoConversion
 * This function assumes orgLogo in formData is already converted to base64 string
 *
 * @param values - Form values from react-hook-form
 * @param originalData - Original UnifiedFormData to preserve readonly flags and logo
 * @returns UnifiedFormData - Form data structure with updated values
 */
export const transformFormValuesToFieldData = (
  values: UnifiedFormValues,
  originalData: UnifiedFormData
): UnifiedFormData => {
  const step2Data = mapStep2ValuesToFieldData(values, originalData);

  return {
    // Step 1 fields (Entity Profile)
    orgName: createFieldData(values.orgName, originalData.orgName),
    orgFiscalCode: createFieldData(
      values.orgFiscalCode,
      originalData.orgFiscalCode
    ),
    orgEmail: createFieldData(values.orgEmail, originalData.orgEmail),
    // Logo is handled separately - keep original value here
    // It will be updated via handleLogoConversion
    orgLogo: originalData.orgLogo,
    logoRemoved: originalData.logoRemoved,
    // Step 2 fields (Accounting, Payments, PagoPA Integration)
    ...step2Data,
    organizationStatus: originalData.organizationStatus
  };
};

/**
 * Result type for logo conversion
 */
type LogoConversionResult = {
  logoValue: string | null;
  logoRemoved: boolean;
};

/**
 * Handles logo conversion and removal logic
 * Converts File to base64, handles logo removal, and maintains existing logo
 *
 * @param logoFile - File object from form (null if removed or not changed)
 * @param existingLogo - Existing logo as base64 string (null if no logo exists)
 * @returns Promise<LogoConversionResult> - Object with logoValue and logoRemoved flag
 */
export const handleLogoConversion = async (
  logoFile: File | null,
  existingLogo: string | null
): Promise<LogoConversionResult> => {
  // Case 1: Logo was explicitly removed
  // User had a logo before and now it's null = logo was removed
  if (existingLogo && !logoFile) {
    return {
      logoValue: null,
      logoRemoved: true
    };
  }

  // Case 2: New logo file uploaded
  // Convert File to base64
  if (logoFile) {
    try {
      const base64Logo = await fileToBase64(logoFile);
      return {
        logoValue: base64Logo,
        logoRemoved: false
      };
    } catch (error) {
      console.error('Error converting logo to base64:', error);
      // On error, keep existing logo
      return {
        logoValue: existingLogo,
        logoRemoved: false
      };
    }
  }

  // Case 3: No change - keep existing logo
  return {
    logoValue: existingLogo,
    logoRemoved: false
  };
};
