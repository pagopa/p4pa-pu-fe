import { z } from 'zod';
import { TFunction } from 'i18next';

/**
 * Creates a Zod schema to validate the amount field for installments
 */
export const createInstallmentAmountFieldSchema = (t: TFunction) => {
  return z
    .string()
    .min(1, t('debtPositionCreateWizard.step3.installments.amount.required'))
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
          message: t('debtPositionCreateWizard.step3.amount.positive')
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
 * Creates a Zod schema to validate the remittance (payment reason) field for installments
 */
export const createInstallmentRemittanceFieldSchema = (t: TFunction) => {
  return z
    .string()
    .min(
      1,
      t('debtPositionCreateWizard.step3.installments.remittance.required')
    )
    .transform((val) => val.trim());
};

/**
 * Creates a Zod schema to validate the dueDate field for installments
 * @param t Translation function
 * @param isMandatory Indicates if the date is required (defaults to true for backward compatibility)
 */
export const createInstallmentDueDateFieldSchema = (
  t: TFunction,
  isMandatory: boolean = true
) => {
  // Base schema accepting string, Date or null
  const baseSchema = z.union([z.string(), z.date(), z.null()]);

  return baseSchema.superRefine((val, ctx) => {
    // If date is mandatory but not provided
    if (isMandatory && !val) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t(
          'debtPositionCreateWizard.step3.installments.dueDate.required'
        )
      });
      return;
    }

    if (val) {
      let date: Date;

      if (val instanceof Date) {
        date = val;
      } else {
        date = new Date(val as string);
      }

      if (isNaN(date.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('debtPositionCreateWizard.step3.dueDate.invalid')
        });
        return;
      }

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (date < now) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('debtPositionCreateWizard.step3.dueDate.futureDate')
        });
      }
    }
  });
};
