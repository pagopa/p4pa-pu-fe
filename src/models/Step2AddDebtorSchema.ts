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
export const createStep2AddDebtorSchema = (t: TFunction) => {
  // Base schema
  const schema = z.object({
    'subjectType.value': z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.subjectType.required')),

    'taxCode.value': z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.taxCode.required')),

    'fullName.value': z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.fullName.required')),

    'address.value': z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.address.required')),

    'civicNumber.value': z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.civicNumber.required')),

    'zipCode.value': z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.zipCode.required')),

    'country.value': z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.country.required')),

    'province.value': z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.province.required')),

    'city.value': z
      .string()
      .nonempty(t('debtPositionCreateWizard.step2.city.required'))
  });

  // Validation for individuals
  const individualSchema = schema.refine(
    (data) => {
      if (data['subjectType.value'] !== SubjectType.INDIVIDUAL) return true;
      const taxCode = data['taxCode.value'];
      return isValidCodiceFiscale(taxCode) || isValidPartitaIVA(taxCode);
    },
    {
      message: t('debtPositionCreateWizard.step2.taxCode.invalid'),
      path: ['taxCode.value']
    }
  );

  // Validation for businesses
  const businessSchema = individualSchema.refine(
    (data) => {
      if (data['subjectType.value'] !== SubjectType.BUSINESS) return true;
      const taxCode = data['taxCode.value'];
      return isValidPartitaIVA(taxCode);
    },
    {
      message: t('debtPositionCreateWizard.step2.taxCode.invalidVAT'),
      path: ['taxCode.value']
    }
  );

  // Validation for fullName: two words only for individuals
  const fullNameSchema = businessSchema.refine(
    (data) => {
      const fullName = data['fullName.value'];
      const trimmed = fullName.trim();
      const subjectType = data['subjectType.value'];

      // Check that name contains at least two words ONLY for individuals
      if (subjectType === SubjectType.INDIVIDUAL) {
        return trimmed.split(' ').length >= 2;
      }

      // For businesses, it's already validated to be non-empty in the base schema
      return true;
    },
    {
      // The error message will be customized in the resolver based on subject type
      message: t('debtPositionCreateWizard.step2.fullName.minTwoWords'),
      path: ['fullName.value']
    }
  );

  // Validation for address
  const addressSchema = fullNameSchema.refine(
    () => {
      // The address is already validated to be non-empty in the base schema
      // We can add further validations if needed in the future
      return true;
    },
    {
      message: t('debtPositionCreateWizard.step2.address.required'),
      path: ['address.value']
    }
  );

  // Validation for zipCode
  return addressSchema.refine(
    (data) => {
      const zipCode = data['zipCode.value'];
      const country = data['country.value'];

      if (country === 'IT' || !country) {
        return /^\d{5}$/.test(zipCode);
      }

      return true;
    },
    {
      message: t('debtPositionCreateWizard.step2.zipCode.error'),
      path: ['zipCode.value']
    }
  );
};

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

  const taxCodeSchema = createFieldSchema(
    z.string().nonempty(t('debtPositionCreateWizard.step2.taxCode.required'))
  );

  const fullNameSchema = createFieldSchema(
    z.string().nonempty(t('debtPositionCreateWizard.step2.fullName.required'))
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
    taxCode: taxCodeSchema,
    fullName: fullNameSchema,
    address: addressSchema,
    civicNumber: civicNumberSchema,
    zipCode: zipCodeSchema,
    country: countrySchema,
    province: provinceSchema,
    city: citySchema
  });

  // Validation for individuals
  const individualSchema = schema.refine(
    (data) => {
      if (data.subjectType.value !== SubjectType.INDIVIDUAL) return true;
      const taxCode = data.taxCode.value;
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
      const taxCode = data.taxCode.value;
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

      // Check that name contains at least two words ONLY for individuals
      if (subjectType === SubjectType.INDIVIDUAL) {
        return trimmed.split(' ').length >= 2;
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
        return /^\d{5}$/.test(zipCode);
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
 * Type derived from the flat Zod schema
 */
export type Step2AddDebtorFlatFormValues = z.infer<
  ReturnType<typeof createStep2AddDebtorSchema>
>;

/**
 * Type derived from the nested Zod schema
 */
export type Step2AddDebtorNestedFormValues = z.infer<
  ReturnType<typeof createNestedStep2AddDebtorSchema>
>;
