import { z } from 'zod';
import { isValidIBAN } from '../../../../utils/fieldValidation';

export const step3Schema = z.object({
  postalIban: z
    .literal(undefined)
    .or(z.literal(''))
    .or(z.string().refine(isValidIBAN, 'commons.validation.invalidIban')),
  iban: z
    .literal(undefined)
    .or(z.literal(''))
    .or(z.string().refine(isValidIBAN, 'commons.validation.invalidIban')),

  postalAccountCode: z.string().optional(),
  holderPostalCc: z.string().optional(),
  balance: z.string().optional(),
  orgSector: z.string().optional()
});
