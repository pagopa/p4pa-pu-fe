import { z } from 'zod';
import { TFunction } from 'i18next';
import { isValidPartitaIVA, isValidIBAN } from '../utils/fieldValidation';

/**
 * Creates a Zod schema to validate the entityName field of the beneficiary
 */
export const createEntityNameFieldSchema = (t: TFunction) => {
  return z
    .string()
    .min(1, t('debtPositionCreateWizard.step3.beneficiary.entityName.required'))
    .transform((val) => val.trim());
};

/**
 * Creates a Zod schema to validate the amount field of the beneficiary
 */
export const createAmountFieldSchema = (t: TFunction) => {
  return z
    .string()
    .min(1, t('debtPositionCreateWizard.step3.beneficiary.amount.required'))
    .superRefine((val, ctx) => {
      if (!val || val.trim() === '') {
        return;
      }

      if (isNaN(parseFloat(val.replace(',', '.')))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('debtPositionCreateWizard.step3.amount.invalidFormat')
        });
        return;
      }

      const numValue = parseFloat(val.replace(',', '.'));
      if (numValue <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('debtPositionCreateWizard.step3.amount.negative')
        });
        return;
      }

      const parts = val.replace(',', '.').split('.');
      if (parts.length > 1 && parts[1].length > 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('debtPositionCreateWizard.step3.amount.tooManyDecimals')
        });
      }
    })
    .transform((val) => val.replace(',', '.'));
};

/**
 * Creates a Zod schema to validate the taxCode (VAT number) field of the beneficiary
 */
export const createTaxCodeFieldSchema = (t: TFunction) => {
  return z
    .string()
    .min(1, t('debtPositionCreateWizard.step3.beneficiary.vat.required'))
    .transform((val) => val.toUpperCase().replace(/\s/g, ''))
    .refine(
      (val) => isValidPartitaIVA(val),
      t('debtPositionCreateWizard.step3.beneficiary.vat.invalid')
    );
};

/**
 * Creates a Zod schema to validate the remittance (payment reason) field of the beneficiary
 */
export const createRemittanceFieldSchema = (t: TFunction) => {
  return z
    .string()
    .min(1, t('debtPositionCreateWizard.step3.beneficiary.remittance.required'))
    .transform((val) => val.trim());
};

/**
 * Creates a Zod schema to validate the IBAN field of the beneficiary
 */
export const createIBANFieldSchema = (t: TFunction) => {
  return z
    .string()
    .min(1, t('debtPositionCreateWizard.step3.beneficiary.iban.required'))
    .transform((val) => val.toUpperCase().replace(/\s/g, ''))
    .refine(
      (val) => isValidIBAN(val),
      t('debtPositionCreateWizard.step3.beneficiary.iban.invalid')
    );
};

/**
 * Creates a Zod schema to validate the taxonomy code field of the beneficiary
 */
export const createTaxonomyCodeFieldSchema = (t: TFunction) => {
  return z
    .string()
    .min(
      1,
      t('debtPositionCreateWizard.step3.beneficiary.taxonomyCode.required')
    )
    .transform((val) => val.trim());
};

/**
 * Creates a complete Zod schema to validate a single beneficiary
 */
export const createBeneficiarySchema = (t: TFunction) => {
  return z.object({
    entityName: createEntityNameFieldSchema(t),
    amount: createAmountFieldSchema(t),
    taxCode: createTaxCodeFieldSchema(t),
    remittance: createRemittanceFieldSchema(t),
    iban: createIBANFieldSchema(t),
    taxonomyCode: createTaxonomyCodeFieldSchema(t)
    // ID is optional and is added by upper layers
    // isNew is optional and is managed by upper layers
  });
};

/**
 * Creates a Zod schema to validate an array of beneficiaries
 * @param totalAmount Total amount to validate that the sum of amounts is less than
 */
export const createBeneficiariesSchema = (
  t: TFunction,
  totalAmount?: string
) => {
  const schema = z.array(createBeneficiarySchema(t));

  if (totalAmount) {
    return schema.superRefine((beneficiaries, ctx) => {
      if (!beneficiaries.length) {
        return;
      }

      const total = parseFloat(totalAmount);

      // For a single beneficiary, its amount must be less than the total
      if (beneficiaries.length === 1) {
        const beneficiaryAmount = parseFloat(beneficiaries[0].amount) || 0;
        if (beneficiaryAmount >= total) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(
              'debtPositionCreateWizard.step3.beneficiary.amountMustBeLessThanTotal'
            ),
            path: [0, 'amount']
          });
        }
        return;
      }

      // For multiple beneficiaries, the sum must be less than the total
      const sum = beneficiaries.reduce((acc, curr) => {
        return acc + (parseFloat(curr.amount) || 0);
      }, 0);

      if (sum >= total) {
        // Add error to all beneficiaries instead of just the first
        beneficiaries.forEach((_, index) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t(
              'debtPositionCreateWizard.step3.beneficiary.sumMustBeLessThanTotal'
            ),
            path: [index, 'amount']
          });
        });
      }
    });
  }

  return schema;
};
