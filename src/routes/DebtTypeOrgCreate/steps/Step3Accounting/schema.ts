import { z } from 'zod';
import { isValidIBAN } from '../../../../utils/fieldValidation';
import { debtPositionTypeOrgBalanceCostDTOSchema } from '@generated/core/zod-schema';

const debtPositionTypeOrgBalanceCostFormSchema =
  debtPositionTypeOrgBalanceCostDTOSchema
    .extend({
      enabled: z.boolean().optional().default(false)
    })
    .superRefine((value, ctx) => {
      if (!value.enabled) {
        return;
      }

      if (!value.sectionCode?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sectionCode'],
          message: 'commons.validation.sectionCodeRequired'
        });
      }

      if (!value.sectionDescription?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sectionDescription'],
          message: 'commons.validation.sectionDescriptionRequired'
        });
      }
    });

export const step3Schema = z.object({
  postalIban: z
    .literal(undefined)
    .or(z.literal(''))
    .or(z.string().refine(isValidIBAN, 'commons.validation.invalidPostalIban')),
  iban: z
    .literal(undefined)
    .or(z.literal(''))
    .or(z.string().refine(isValidIBAN, 'commons.validation.invalidIban')),

  postalAccountCode: z.string().optional(),
  holderPostalCc: z.string().optional(),
  balance: z.string().optional(),
  orgSector: z.string().optional(),
  debtPositionTypeOrgBalanceCostRequestList: z
    .array(debtPositionTypeOrgBalanceCostFormSchema)
    .optional()
});
