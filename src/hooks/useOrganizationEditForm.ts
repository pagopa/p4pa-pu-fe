/**
 * Custom hook for managing the unified Organization edit form
 * Encapsulates react-hook-form logic, validations, and form state management
 */

import { useMemo } from 'react';
import {
  useForm,
  Control,
  FieldErrors,
  UseFormHandleSubmit
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  UnifiedFormData,
  UnifiedFormValues
} from '../models/OrganizationEditTypes';
import { base64ToFile } from '../utils/filevalidation';
import { isValidEmail } from '../utils/fieldValidation';
import { createIBANValidationRules } from '../utils/validationRules';
import {
  handleLogoConversion,
  unifiedFormDataToFormValues
} from '../utils/organizationFormTransformers';

type UseOrganizationEditFormParams = {
  initialData: UnifiedFormData;
};

type ValidationRules = {
  orgEmail: {
    validate: {
      validEmail: (value: string) => true | string;
    };
  };
  iban: Record<string, unknown>;
  ibanPostal: Record<string, unknown>;
  segregationCode: {
    required?: {
      value: boolean;
      message: string;
    };
  };
  generateNoticeApiKey: {
    required: {
      value: boolean;
      message: string;
    };
  };
  selectedLanguage: {
    required?: {
      value: boolean;
      message: string;
    };
  };
  flagNotifyOutcomePush: {
    validate: (value: boolean | null) => true | string;
  };
  flagPaymentNotification: {
    validate: (value: boolean | null) => true | string;
  };
  ioApiKey: {
    required?: {
      value: boolean;
      message: string;
    };
  };
};

type HandleLogoChangeResult = {
  logoValue: string | null;
  logoRemoved: boolean;
  isValid: boolean;
  errorMessage?: string;
};

type UseOrganizationEditFormReturn = {
  control: Control<UnifiedFormValues>;
  handleSubmit: UseFormHandleSubmit<UnifiedFormValues>;
  getValues: () => UnifiedFormValues;
  errors: FieldErrors<UnifiedFormValues>;
  watch: (name: keyof UnifiedFormValues) => unknown;
  watchAdditionalLanguage: boolean;
  watchFlagNotifyIo: boolean;
  validationRules: ValidationRules;
  getInitialValues: () => UnifiedFormValues;
  handleLogoChange: (logoFile: File | null) => Promise<HandleLogoChangeResult>;
  setError: (
    name: keyof UnifiedFormValues,
    error: { type: string; message: string }
  ) => void;
  trigger: (name: keyof UnifiedFormValues) => Promise<boolean>;
};

export const useOrganizationEditForm = ({
  initialData
}: UseOrganizationEditFormParams): UseOrganizationEditFormReturn => {
  const { t } = useTranslation();
  // Convert logo from base64 to File only once using useMemo
  // This is needed because react-hook-form expects File | null for file inputs
  const logoFile = useMemo(() => {
    if (initialData.orgLogo.value) {
      return base64ToFile(initialData.orgLogo.value);
    }
    return null;
  }, [initialData.orgLogo.value]);

  /**
   * Calculate initial values dynamically to sync with parent data changes
   * Converts UnifiedFormData to UnifiedFormValues for react-hook-form
   */
  const getInitialValues = (): UnifiedFormValues => {
    return unifiedFormDataToFormValues(initialData, { logoFile });
  };

  // Setup react-hook-form
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    getValues,
    setError,
    trigger
  } = useForm<UnifiedFormValues>({
    defaultValues: getInitialValues(),
    values: getInitialValues(), // This ensures form updates when data changes
    mode: 'onSubmit'
  });

  // Watch fields for conditional rendering
  // These will be used to show/hide fields based on user selections
  const watchAdditionalLanguage = watch('additionalLanguage') as boolean;
  const watchFlagNotifyIo = watch('flagNotifyIo') as boolean;

  // Calculate validation rules based on organization status and watched values
  // Use useMemo to avoid recalculating on every render
  const validationRules = useMemo<ValidationRules>(() => {
    const isActive = initialData.organizationStatus === 'ACTIVE';

    return {
      // Step 1 validations
      orgEmail: {
        validate: {
          validEmail: (value: string) => {
            if (!value) return true;
            return (
              isValidEmail(value) ||
              t('organizationEditWizard.step1.orgEmail.invalid')
            );
          }
        }
      },
      // Step 2 Accounting validations
      iban: createIBANValidationRules(t, isActive),
      ibanPostal: createIBANValidationRules(t, false),
      // Step 2 Payments validations
      segregationCode: {
        ...(isActive && {
          required: {
            value: true,
            message: t('organizationEditWizard.step2.segregationCode.required')
          }
        })
      },
      generateNoticeApiKey: {
        required: {
          value: true,
          message: t(
            'organizationEditWizard.step2.generateNoticeApiKey.required'
          )
        }
      },
      selectedLanguage: {
        ...(watchAdditionalLanguage && {
          required: {
            value: true,
            message: t('organizationEditWizard.step2.selectedLanguage.required')
          }
        })
      },
      flagNotifyOutcomePush: {
        validate: (value: boolean | null) =>
          value !== null || t('organizationEditWizard.step2.radioRequired')
      },
      flagPaymentNotification: {
        validate: (value: boolean | null) =>
          value !== null || t('organizationEditWizard.step2.radioRequired')
      },
      // Step 2 PagoPA Integration validations
      ioApiKey: {
        ...(watchFlagNotifyIo && {
          required: {
            value: true,
            message: t(
              'organizationEditWizard.step2.pagoPaIntegration.io.apiKeyRequired'
            )
          }
        })
      }
    };
  }, [
    initialData.organizationStatus,
    watchAdditionalLanguage,
    watchFlagNotifyIo,
    t
  ]);

  /**
   * Handles logo change, conversion, and validation
   * Converts File to base64, handles removal, and validates if required
   *
   * @param logoFile - File object from form (null if removed or not changed)
   * @returns Promise with logo conversion result and validation status
   */
  const handleLogoChange = async (
    logoFile: File | null
  ): Promise<HandleLogoChangeResult> => {
    const existingLogo = initialData.orgLogo.value;
    const isActive = initialData.organizationStatus === 'ACTIVE';

    // Use utility function to handle conversion
    const conversionResult = await handleLogoConversion(logoFile, existingLogo);

    // Validate logo requirements
    // Case 1: Logo was removed and status is ACTIVE
    if (conversionResult.logoRemoved && isActive) {
      setError('orgLogo', {
        type: 'manual',
        message: t('organizationEditWizard.step1.orgLogo.required')
      });
      return {
        ...conversionResult,
        isValid: false,
        errorMessage: t('organizationEditWizard.step1.orgLogo.required')
      };
    }

    // Case 2: No logo exists and status is ACTIVE
    if (!conversionResult.logoValue && isActive && !existingLogo) {
      setError('orgLogo', {
        type: 'manual',
        message: t('organizationEditWizard.step1.orgLogo.required')
      });
      return {
        ...conversionResult,
        isValid: false,
        errorMessage: t('organizationEditWizard.step1.orgLogo.required')
      };
    }

    // Logo is valid
    return {
      ...conversionResult,
      isValid: true
    };
  };

  return {
    control,
    handleSubmit,
    getValues,
    errors,
    watch,
    watchAdditionalLanguage,
    watchFlagNotifyIo,
    validationRules,
    getInitialValues,
    handleLogoChange,
    setError,
    trigger: (name: keyof UnifiedFormValues) => trigger(name)
  };
};
