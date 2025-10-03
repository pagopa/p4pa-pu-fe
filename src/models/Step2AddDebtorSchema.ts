import { z } from 'zod';
import { TFunction } from 'i18next';
import { SubjectType } from '../utils/fieldValidation';
import {
  isValidCodiceFiscale,
  isValidPartitaIVA
} from '../utils/fieldValidation';

/**
 * Definition of the schema for fields with value and readonly properties
 */
function createFieldSchema<T>(
  valueSchema: z.ZodType<T>,
  readonlySchema: z.ZodType<boolean> = z.boolean()
): z.ZodObject<{
  value: z.ZodType<T>;
  readonly: z.ZodType<boolean>;
}> {
  return z.object({
    value: valueSchema,
    readonly: readonlySchema
  });
}

/**
 * Zod validation schema for Step2AddDebtor (flat structure)
 * We maintain this schema for compatibility with existing code
 * @param t - Translation function for error messages
 * @returns Zod schema for form validation
 */
// (Flat schema removed as unused)

/**
 * Zod validation schema for Step2AddDebtor with nested structure
 * This schema exactly mirrors the structure of Step2Data
 * @param t - Translation function for error messages
 * @returns Zod schema for form validation
 */
export const createNestedStep2AddDebtorSchema = (t: TFunction) => {
  // Base schemas for each field
  const subjectTypeSchema = createFieldSchema(
    z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.subjectType.required'))
  );

  const anonymousSubjectSchema = createFieldSchema(z.boolean());

  // Tax code is optional at base level - will be validated conditionally based on anonymousSubject
  const taxCodeSchema = createFieldSchema(z.string().optional());

  const fullNameSchema = createFieldSchema(
    z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.fullName.required'))
      .refine((value) => value.trim().length > 0, {
        message: t('debtPositionCreateWizard.step2.fullName.required')
      })
  );

  const addressSchema = createFieldSchema(
    z.string().nonempty(t('debtPositionCreateWizard.step2.address.required'))
  );

  const civicNumberSchema = createFieldSchema(
    z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.civicNumber.required'))
  );

  const zipCodeSchema = createFieldSchema(
    z.string().nonempty(t('debtPositionCreateWizard.step2.zipCode.required'))
  );

  const countrySchema = createFieldSchema(
    z.string().nonempty(t('debtPositionCreateWizard.step2.country.required'))
  );

  const provinceSchema = createFieldSchema(
    z.string().nonempty(t('debtPositionCreateWizard.step2.province.required'))
  );

  const citySchema = createFieldSchema(
    z.string().nonempty(t('debtPositionCreateWizard.step2.city.required'))
  );

  // Base schema for the entire object
  const schema = z.object({
    subjectType: subjectTypeSchema,
    anonymousSubject: anonymousSubjectSchema.optional(),
    taxCode: taxCodeSchema,
    fullName: fullNameSchema,
    address: addressSchema,
    civicNumber: civicNumberSchema,
    zipCode: zipCodeSchema,
    country: countrySchema,
    province: provinceSchema,
    city: citySchema
  });

  // Validation: taxCode is required when user is NOT anonymous
  const taxCodeRequiredSchema = schema.refine(
    (data) => {
      // If anonymousSubject is true, taxCode is not required
      const isAnonymous = data.anonymousSubject?.value === true;
      if (isAnonymous) return true;

      // Otherwise, taxCode must be present and not empty
      const taxCode = data.taxCode.value;
      return taxCode !== undefined && taxCode !== null && taxCode.trim().length > 0;
    },
    {
      message: t('debtPositionCreateWizard.step2.taxCode.required'),
      path: ['taxCode', 'value']
    }
  );

  // Validation for individuals
  const individualSchema = taxCodeRequiredSchema.refine(
    (data) => {
      if (data.subjectType.value !== SubjectType.INDIVIDUAL) return true;

      // Skip validation if user is anonymous
      const isAnonymous = data.anonymousSubject?.value === true;
      if (isAnonymous) return true;

      const taxCode = data.taxCode.value;
      // Skip validation if taxCode is undefined or empty (already handled by taxCodeRequiredSchema)
      if (!taxCode || taxCode.trim().length === 0) return true;

      return isValidCodiceFiscale(taxCode) || isValidPartitaIVA(taxCode);
    },
    {
      message: t('debtPositionCreateWizard.step2.taxCode.invalid'),
      path: ['taxCode', 'value']
    }
  );

  // Validation for businesses
  const businessSchema = individualSchema.refine(
    (data) => {
      if (data.subjectType.value !== SubjectType.BUSINESS) return true;

      // Skip validation if user is anonymous
      const isAnonymous = data.anonymousSubject?.value === true;
      if (isAnonymous) return true;

      const taxCode = data.taxCode.value;
      // Skip validation if taxCode is undefined or empty (already handled by taxCodeRequiredSchema)
      if (!taxCode || taxCode.trim().length === 0) return true;

      return isValidPartitaIVA(taxCode);
    },
    {
      message: t('debtPositionCreateWizard.step2.taxCode.invalidVAT'),
      path: ['taxCode', 'value']
    }
  );

  // Validation for fullName: two words only for individuals
  const fullNameValidationSchema = businessSchema.refine(
    (data) => {
      const fullName = data.fullName.value;
      const trimmed = fullName.trim();
      const subjectType = data.subjectType.value;

      // Apply two-words rule ONLY for individuals and only when not empty after trim
      if (subjectType === SubjectType.INDIVIDUAL) {
        if (trimmed.length === 0) {
          // Let base required validation handle emptiness to avoid overriding its message
          return true;
        }
        const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
        return wordCount >= 2;
      }

      // For businesses, it's already validated to be non-empty in the base schema
      return true;
    },
    {
      // The error message will be customized in the resolver based on subject type
      message: t('debtPositionCreateWizard.step2.fullName.minTwoWords'),
      path: ['fullName', 'value']
    }
  );

  // Validation for zipCode (only for Italy must be 5 digits)
  return fullNameValidationSchema.refine(
    (data) => {
      const zipCode = data.zipCode.value;
      const country = data.country.value;

      if (country === 'IT' || !country) {
        const trimmed = (zipCode || '').trim();
        if (trimmed.length === 0) {
          // Let the base required validation handle emptiness
          return true;
        }
        return /^\d{5}$/.test(trimmed);
      }

      return true;
    },
    {
      message: t('debtPositionCreateWizard.step2.zipCode.error'),
      path: ['zipCode', 'value']
    }
  );
};

/**
 * Type derived from the nested Zod schema
 */
export type Step2AddDebtorNestedFormValues = z.infer<
  ReturnType<typeof createNestedStep2AddDebtorSchema>
>;
