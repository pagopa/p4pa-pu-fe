import { z } from 'zod';

export const taxonomySchema = z.object({
  orgType: z.string({
    required_error: 'debtTypeCreate.configuration.organizationType.required'
  }),
  macroAreaCode: z.string({
    required_error: 'debtTypeCreate.configuration.macroArea.required'
  }),
  serviceTypeCode: z.string({
    required_error: 'debtTypeCreate.configuration.serviceType.required'
  }),
  collectingReason: z.string({
    required_error: 'debtTypeCreate.configuration.collectionReason.required'
  }),
  taxonomyCode: z.string({
    required_error: 'debtTypeCreate.configuration.taxonomyCode.required'
  })
});
