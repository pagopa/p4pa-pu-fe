import { z } from 'zod';
import { TFunction } from 'i18next';

/**
 * Schema di validazione Zod per il Step1GeneralConfiguration
 * @param t - Funzione di traduzione per i messaggi di errore
 * @returns Schema Zod per la validazione del form
 */
export const createStep1GeneralConfigurationSchema = (t: TFunction) =>
  z.object({
    debtPositionType: z
      .string()
      .nonempty(t('debtPositionCreateWizard.step1.debtPositionType.required')),

    description: z
      .string()
      .nonempty(t('debtPositionCreateWizard.step1.description.required'))
      .refine(
        (value) => {
          const trimmed = value.trim();
          const wordCount = trimmed.split(/\s+/).length;
          return wordCount >= 3;
        },
        {
          message: t('debtPositionCreateWizard.step1.minWords')
        }
      )
  });

/**
 * Tipo derivato dallo schema Zod
 */
export type Step1GeneralConfigurationFormValues = z.infer<
  ReturnType<typeof createStep1GeneralConfigurationSchema>
>;
