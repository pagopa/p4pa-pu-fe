import { z } from 'zod';
import { taxonomyFieldsSchema } from '../../../components/TaxonomyFilter/schema';

const baseSchema = z
  .object({
    code: z
      .string({
        required_error: 'debtTypeCreate.configuration.debtTypeCode.required'
      })
      .max(255),
    description: z
      .string({
        required_error: 'debtTypeCreate.configuration.debtType.required'
      })
      .max(100, 'debtTypeCreate.configuration.debtType.maxCharacters'),
    isCodeUnique: z.boolean().optional()
  })
  .merge(taxonomyFieldsSchema);

export const step1Schema = baseSchema.superRefine((data, ctx) => {
  if (data.code && data.isCodeUnique === false) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'debtTypeCreate.configuration.debtTypeCode.notUnique',
      path: ['code']
    });
  }
});
