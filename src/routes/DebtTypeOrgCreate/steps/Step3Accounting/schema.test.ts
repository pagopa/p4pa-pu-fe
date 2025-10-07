import { step3Schema } from './schema';

describe('step3Schema validation', () => {
  it('accepts empty or undefined postalIban and iban', () => {
    const validData = {
      postalIban: '',
      iban: undefined,
      postalAccountCode: '123',
      holderPostalCc: 'John',
      balance: '1000',
      orgSector: 'Public'
    };

    const result = step3Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('accepts valid IBANs', () => {
    const validData = {
      postalIban: '123456',
      iban: 'IT60X0542811101000000123456'
    };
    const result = step3Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid IBANs', () => {
    const invalidData = {
      postalIban: 'INVALID_IBAN',
      iban: '123'
    };
    const result = step3Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.formErrors.fieldErrors.postalIban).toContain(
        'commons.validation.invalidPostalIban'
      );
      expect(result.error.formErrors.fieldErrors.iban).toContain(
        'commons.validation.invalidIban'
      );
    }
  });
});
