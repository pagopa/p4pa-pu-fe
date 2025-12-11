import { step1Schema } from './schema';

describe('step1Schema validation', () => {
  it('passes validation with valid data', () => {
    const validData = {
      debtPositionTypeId: '123', // string coerced from number if needed
      code: 'CODE123',
      description: 'Valid description text'
    };

    const result = step1Schema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('fails if debtPositionTypeId is empty', () => {
    const invalidData = {
      debtPositionTypeId: '',
      code: 'CODE123',
      description: 'Valid description'
    };

    const result = step1Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const debtPositionTypeIdError =
        result.error.formErrors.fieldErrors.debtPositionTypeId;
      expect(debtPositionTypeIdError).toContain(
        'debtTypeOrgCreate.configuration.debtType.required'
      );
    }
  });

  it('fails if code is empty', () => {
    const invalidData = {
      debtPositionTypeId: '1',
      code: '',
      description: 'Valid description'
    };

    const result = step1Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const codeError = result.error.formErrors.fieldErrors.code;
      expect(codeError).toContain(
        'debtTypeOrgCreate.configuration.code.required'
      );
    }
  });

  it('fails if description is empty', () => {
    const invalidData = {
      debtPositionTypeId: '1',
      code: 'CODE123',
      description: ''
    };

    const result = step1Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const descriptionError = result.error.formErrors.fieldErrors.description;
      expect(descriptionError).toContain(
        'debtTypeOrgCreate.configuration.description.required'
      );
    }
  });

  it('fails if description is longer than 200 characters', () => {
    const longDescription = 'a'.repeat(201);
    const invalidData = {
      debtPositionTypeId: '1',
      code: 'CODE123',
      description: longDescription
    };

    const result = step1Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const descriptionError = result.error.formErrors.fieldErrors.description;
      expect(descriptionError).toContain(
        'debtTypeOrgCreate.configuration.description.maxCharacters'
      );
    }
  });

  it('fails if the code is not unique', () => {
    const invalidData = {
      debtPositionTypeId: '1',
      code: 'CODE123',
      isCodeUnique: false,
      description: 'a description'
    };

    const result = step1Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const descriptionError = result.error.formErrors.fieldErrors.code;
      expect(descriptionError).toContain(
        'debtTypeOrgCreate.configuration.code.notUnique'
      );
    }
  });
});
