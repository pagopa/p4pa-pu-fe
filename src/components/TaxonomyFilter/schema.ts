import { z } from 'zod';

export const taxonomySchema = z.object({
  orgType: z.string({
    required_error: 'taxonomy.orgType.required'
  }),
  macroAreaCode: z.string({
    required_error: 'taxonomy.macroArea.required'
  }),
  serviceTypeCode: z.string({
    required_error: 'taxonomy.serviceType.required'
  }),
  collectingReason: z.string({
    required_error: 'taxonomy.collectingReason.required'
  }),
  taxonomyCode: z.string({
    required_error: 'taxonomy.taxonomyCode.required'
  })
});
