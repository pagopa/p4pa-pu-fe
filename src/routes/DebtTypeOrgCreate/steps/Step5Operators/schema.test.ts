import { OperatorsSelection } from '../../../../../generated/core/data-contracts';
import { step5Schema } from './schema';

describe('step5Schema validation', () => {
  it('passes with a valid enum value', () => {
    const validData = { operatorsSelection: OperatorsSelection.ALL };
    const result = step5Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('fails when operatorsSelection is missing', () => {
    const invalidData = {};
    const result = step5Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.formErrors.fieldErrors.operatorsSelection).toContain(
        'debtTypeOrgCreate.operators.operatorSelection.required'
      );
    }
  });

  it('fails when operatorsSelection is invalid', () => {
    const invalidData = { operatorsSelection: 'invalid_value' };
    const result = step5Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
