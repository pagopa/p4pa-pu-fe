import { z } from 'zod';

export const step1Schema = z.object({
  debtPositionTypeId: z.coerce
    .string()
    .nonempty('debtTypeOrgCreate.configuration.debtType.required'),
  code: z.string().nonempty('debtTypeOrgCreate.configuration.code.required'),
  description: z
    .string()
    .nonempty('debtTypeOrgCreate.configuration.description.required')
    .max(100, 'debtTypeOrgCreate.configuration.description.maxCharacters')
});
