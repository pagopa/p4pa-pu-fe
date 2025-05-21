import { z } from 'zod';
import { OperatorsSelection } from '../../../../../generated/data-contracts';

export const step5Schema = z.object({
  operatorsSelection: z.nativeEnum(OperatorsSelection, {
    required_error: 'debtTypeOrgCreate.operators.operatorSelection.required'
  }),
  enabledOperators: z.array(z.string()).optional()
});
