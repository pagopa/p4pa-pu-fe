import { z } from 'zod';

/**
 * Schema for validation of taxonomy fields in forms (e.g., debt type creation)
 * Field names match DebtPositionTypeRequestBody:
 * - orgType
 * - macroArea
 * - serviceType
 * - collectingReason
 * - taxonomyCode
 */
export const taxonomyFieldsSchema = z.object({
  orgType: z.string({
    required_error: 'taxonomy.orgType.required'
  }),
  macroArea: z.string({
    required_error: 'taxonomy.macroArea.required'
  }),
  serviceType: z.string({
    required_error: 'taxonomy.serviceType.required'
  }),
  collectingReason: z.string({
    required_error: 'taxonomy.collectingReason.required'
  }),
  taxonomyCode: z.string({
    required_error: 'taxonomy.taxonomyCode.required'
  })
});
