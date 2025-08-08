import { z } from 'zod';
import { TFunction } from 'i18next';

/**
 * Zod validation schema for Step1GeneralConfiguration
 * @param t - Translation function for error messages
 * @returns Zod schema for form validation
 */
export const createStep1GeneralConfigurationSchema = (t: TFunction) =>
  z.object({
    debtPositionType: z
      .string()
      .nonempty(t('debtPositionCreateWizard.step1.debtPositionType.required')),

    description: z
      .string()
      .nonempty(t('debtPositionCreateWizard.step1.description.required'))
      .refine((value) => value.trim().length > 0, {
        message: t('debtPositionCreateWizard.step1.description.required')
      })
  });

/**
 * Type derived from the Zod schema
 */
export type Step1GeneralConfigurationFormValues = z.infer<
  ReturnType<typeof createStep1GeneralConfigurationSchema>
>;
