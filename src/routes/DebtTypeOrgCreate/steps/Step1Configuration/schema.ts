import { z } from 'zod';

export const step1SchemaEdit = z.object({
  debtPositionTypeId: z.coerce
    .string()
    .nonempty('debtTypeOrgCreate.configuration.debtType.required'),
  code: z
    .string()
    .nonempty('debtTypeOrgCreate.configuration.code.required')
    .max(255),
  description: z
    .string()
    .nonempty('debtTypeOrgCreate.configuration.description.required')
    .max(200, 'debtTypeOrgCreate.configuration.description.maxCharacters'),
  isCodeUnique: z.boolean().optional()
});

export const step1SchemaNew = step1SchemaEdit.superRefine((data, ctx) => {
  if (data.code && data.isCodeUnique === false) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'debtTypeOrgCreate.configuration.code.notUnique',
      path: ['code']
    });
  }
});

export const step1Schema = step1SchemaNew;
