/**
 * Validation rules and utilities for Organization Edit Form
 * Centralized validation functions to avoid duplication
 */

import { isValidIBAN } from './fieldValidation';
import { UnifiedFormData } from '../models/OrganizationEditTypes';

/**
 * Validation rules factory for IBAN fields
 * Creates validation rules for IBAN fields with optional required validation
 *
 * @param t - Translation function
 * @param isRequired - Whether the field is required
 * @returns Validation rules object for react-hook-form
 */
export const createIBANValidationRules = (
  t: (key: string) => string,
  isRequired = false
): Record<string, unknown> => {
  const rules: Record<string, unknown> = {
    validate: {
      validIBAN: (value: string) => {
        if (!value) return true;
        return (
          isValidIBAN(value) || t('organizationEditWizard.step2.iban.invalid')
        );
      }
    }
  };

  if (isRequired) {
    rules.required = {
      value: true,
      message: t('organizationEditWizard.step2.iban.required')
    };
  }

  return rules;
};

/**
 * Result type for logo validation
 */
type LogoValidationResult = {
  isValid: boolean;
  shouldPreventSubmit: boolean;
  errorMessage?: string;
};

/**
 * Validates logo before form submission
 * Checks if logo is required and was removed for ACTIVE organizations
 *
 * @param logoFile - File object from form (null if removed or not changed)
 * @param existingLogo - Existing logo as base64 string (null if no logo exists)
 * @param organizationStatus - Organization status (ACTIVE or DRAFT)
 * @param t - Translation function
 * @returns LogoValidationResult - Object with validation status and error message
 */
export const validateLogoBeforeSubmit = (
  logoFile: File | null,
  existingLogo: string | null,
  organizationStatus: UnifiedFormData['organizationStatus'],
  t: (key: string) => string
): LogoValidationResult => {
  // Logo is required only if organization status is ACTIVE
  if (organizationStatus === 'ACTIVE') {
    // Check if logo was removed: if there was a logo before and now it's null
    const logoWasRemoved = existingLogo !== null && logoFile === null;

    // If logo was removed and status is ACTIVE, prevent submission
    if (logoWasRemoved) {
      return {
        isValid: false,
        shouldPreventSubmit: true,
        errorMessage: t('organizationEditWizard.step1.orgLogo.required')
      };
    }

    // Check if logo exists: either new upload or existing (not removed)
    const hasLogo =
      logoFile !== null || (existingLogo !== null && !logoWasRemoved);

    if (!hasLogo) {
      return {
        isValid: false,
        shouldPreventSubmit: true,
        errorMessage: t('organizationEditWizard.step1.orgLogo.required')
      };
    }
  }

  // Logo is valid (either optional for DRAFT or present for ACTIVE)
  return {
    isValid: true,
    shouldPreventSubmit: false
  };
};
