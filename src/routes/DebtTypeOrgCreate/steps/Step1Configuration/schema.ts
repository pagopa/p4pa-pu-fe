import { z } from 'zod';

export const step1Schema = z
  .object({
    debtPositionTypeId: z.coerce
      .string()
      .nonempty('debtTypeOrgCreate.configuration.debtType.required'),
    code: z.string().nonempty('debtTypeOrgCreate.configuration.code.required'),
    description: z
      .string()
      .nonempty('debtTypeOrgCreate.configuration.description.required')
      .max(100, 'debtTypeOrgCreate.configuration.description.maxCharacters'),
    isCodeUnique: z.boolean().optional()
  })
  .superRefine((data, ctx) => {
    if (data.code && data.isCodeUnique === false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'debtTypeOrgCreate.configuration.code.notUnique',
        path: ['code']
      });
    }
  });
