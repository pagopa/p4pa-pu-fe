import { describe, it, expect } from 'vitest';
import { buildBeneficiaryFieldPath } from '../BeneficiaryFieldHelpers';
import { FieldValues, Path } from 'react-hook-form';

describe('BeneficiaryFieldHelpers', () => {
  describe('buildBeneficiaryFieldPath', () => {
    type TestFormValues = {
      beneficiaries: {
        name: string;
        amount: number;
        fiscalCode: string;
      }[];
    } & FieldValues;

    it('dovrebbe costruire correttamente il path per un campo', () => {
      // Arrange
      const fieldNamePrefix = 'beneficiaries';
      const index = 0;
      const fieldName = 'name';

      // Act
      const result = buildBeneficiaryFieldPath<
        TestFormValues,
        typeof fieldName
      >(fieldNamePrefix, index, fieldName);

      // Assert
      expect(result).toBe('beneficiaries.0.name');
    });

    it('dovrebbe costruire correttamente il path con indici diversi', () => {
      // Arrange
      const fieldNamePrefix = 'beneficiaries';
      const fieldName = 'amount';

      // Act
      const result1 = buildBeneficiaryFieldPath<
        TestFormValues,
        typeof fieldName
      >(fieldNamePrefix, 0, fieldName);
      const result2 = buildBeneficiaryFieldPath<
        TestFormValues,
        typeof fieldName
      >(fieldNamePrefix, 1, fieldName);
      const result3 = buildBeneficiaryFieldPath<
        TestFormValues,
        typeof fieldName
      >(fieldNamePrefix, 2, fieldName);

      // Assert
      expect(result1).toBe('beneficiaries.0.amount');
      expect(result2).toBe('beneficiaries.1.amount');
      expect(result3).toBe('beneficiaries.2.amount');
    });

    it('dovrebbe costruire correttamente il path con prefissi diversi', () => {
      const index = 0;
      const fieldName = 'fiscalCode';

      const result1 = buildBeneficiaryFieldPath<
        TestFormValues,
        typeof fieldName
      >('beneficiaries', index, fieldName);
      const result2 = buildBeneficiaryFieldPath<
        TestFormValues,
        typeof fieldName
      >('receivers', index, fieldName);

      expect(result1).toBe('beneficiaries.0.fiscalCode');
      expect(result2).toBe('receivers.0.fiscalCode');
    });

    it('dovrebbe mantenere il tipo Path<T> nel valore restituito', () => {
      const fieldNamePrefix = 'beneficiaries';
      const index = 0;
      const fieldName = 'name';

      const result: Path<TestFormValues> = buildBeneficiaryFieldPath<
        TestFormValues,
        typeof fieldName
      >(fieldNamePrefix, index, fieldName);

      expect(result).toBe('beneficiaries.0.name');
    });
  });
});
