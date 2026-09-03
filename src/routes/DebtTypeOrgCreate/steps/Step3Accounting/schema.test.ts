import { step3Schema } from './schema';
import { DebtPositionTypeOrgBalanceCostType } from '../../../../../generated/data-contracts';

const createBalanceCost = (
  overrides: Partial<{
    type: DebtPositionTypeOrgBalanceCostType;
    operatingYear: string;
    enabled: boolean;
    officeCode?: string;
    officeDescription?: string;
    sectionCode: string;
    sectionDescription?: string;
    assessmentCode?: string;
    assessmentDescription?: string;
  }> = {}
) => ({
  type: DebtPositionTypeOrgBalanceCostType.NOTIFICATION_COST,
  operatingYear: '2026',
  enabled: false,
  sectionCode: '',
  ...overrides
});

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
      postalIban: 'IT60X0542811101000000123456',
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

  describe('balance costs', () => {
    it('accepts a disabled balance cost without section information', () => {
      const data = {
        debtPositionTypeOrgBalanceCostRequestList: [
          createBalanceCost({
            enabled: false,
            sectionCode: ''
          })
        ]
      };

      const result = step3Schema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('accepts an enabled balance cost with section information', () => {
      const data = {
        debtPositionTypeOrgBalanceCostRequestList: [
          createBalanceCost({
            enabled: true,
            sectionCode: '123',
            sectionDescription: 'Capitolo ordinario'
          })
        ]
      };

      const result = step3Schema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('requires sectionCode when balance cost is enabled', () => {
      const data = {
        debtPositionTypeOrgBalanceCostRequestList: [
          createBalanceCost({
            enabled: true,
            sectionCode: '',
            sectionDescription: 'Capitolo ordinario'
          })
        ]
      };

      const result = step3Schema.safeParse(data);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(
          result.error.formErrors.fieldErrors
            .debtPositionTypeOrgBalanceCostRequestList?.[0]
        ).toBeDefined();

        expect(result.error.issues).toContainEqual({
          code: 'custom',
          path: ['debtPositionTypeOrgBalanceCostRequestList', 0, 'sectionCode'],
          message: 'commons.validation.sectionCodeRequired'
        });
      }
    });

    it('requires sectionDescription when balance cost is enabled', () => {
      const data = {
        debtPositionTypeOrgBalanceCostRequestList: [
          createBalanceCost({
            enabled: true,
            sectionCode: '123',
            sectionDescription: ''
          })
        ]
      };

      const result = step3Schema.safeParse(data);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues).toContainEqual({
          code: 'custom',
          path: [
            'debtPositionTypeOrgBalanceCostRequestList',
            0,
            'sectionDescription'
          ],
          message: 'commons.validation.sectionDescriptionRequired'
        });
      }
    });

    it('requires both section fields when balance cost is enabled', () => {
      const data = {
        debtPositionTypeOrgBalanceCostRequestList: [
          createBalanceCost({
            enabled: true,
            sectionCode: '',
            sectionDescription: ''
          })
        ]
      };

      const result = step3Schema.safeParse(data);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            {
              code: 'custom',
              path: [
                'debtPositionTypeOrgBalanceCostRequestList',
                0,
                'sectionCode'
              ],
              message: 'commons.validation.sectionCodeRequired'
            },
            {
              code: 'custom',
              path: [
                'debtPositionTypeOrgBalanceCostRequestList',
                0,
                'sectionDescription'
              ],
              message: 'commons.validation.sectionDescriptionRequired'
            }
          ])
        );
      }
    });

    it('rejects whitespace-only section fields when balance cost is enabled', () => {
      const data = {
        debtPositionTypeOrgBalanceCostRequestList: [
          createBalanceCost({
            enabled: true,
            sectionCode: '   ',
            sectionDescription: '   '
          })
        ]
      };

      const result = step3Schema.safeParse(data);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
      }
    });
  });
});
