import { z } from 'zod';
import { t } from 'i18next';

export const spontaneousFormCreateSchema = z.object({
  code: z.string().min(1, t('spontaneousForm.create.errors.codeRequired')),
  structure: z
    .string()
    .min(1, t('spontaneousForm.create.errors.structureRequired')),
  dictionary: z.string().optional()
});

export type SpontaneousFormCreateData = z.infer<
  typeof spontaneousFormCreateSchema
>;
