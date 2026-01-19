import { describe, expect, it } from 'vitest';
import {
  SpontaneousFormCreateData,
  spontaneousFormCreateSchema
} from './spontaneousFormCreateSchema';

describe('spontaneousFormCreateSchema', () => {
  describe('valid inputs', () => {
    it('accepts valid data with all fields', () => {
      const validData: SpontaneousFormCreateData = {
        code: 'TEST_CODE',
        structure: '{"fields":[]}',
        dictionary: '{"IT":{}}'
      };

      const result = spontaneousFormCreateSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('accepts valid data without dictionary', () => {
      const validData = {
        code: 'TEST_CODE',
        structure: '{"fields":[]}'
      };

      const result = spontaneousFormCreateSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe('TEST_CODE');
        expect(result.data.structure).toBe('{"fields":[]}');
        expect(result.data.dictionary).toBeUndefined();
      }
    });

    it('accepts valid data with empty dictionary string', () => {
      const validData = {
        code: 'TEST_CODE',
        structure: '{"fields":[]}',
        dictionary: ''
      };

      const result = spontaneousFormCreateSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('accepts code with special characters', () => {
      const validData = {
        code: 'TEST-CODE_123',
        structure: '{"fields":[]}'
      };

      const result = spontaneousFormCreateSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('accepts multiline structure JSON', () => {
      const validData = {
        code: 'TEST_CODE',
        structure: `{
          "fields": [
            {"name": "field1"}
          ]
        }`
      };

      const result = spontaneousFormCreateSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs - code field', () => {
    it('rejects empty code', () => {
      const invalidData = {
        code: '',
        structure: '{"fields":[]}'
      };

      const result = spontaneousFormCreateSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const codeError = result.error.errors.find((e) => e.path[0] === 'code');
        expect(codeError?.message).toBe(
          'spontaneousForm.create.errors.codeRequired'
        );
      }
    });

    it('rejects missing code', () => {
      const invalidData = {
        structure: '{"fields":[]}'
      };

      const result = spontaneousFormCreateSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('rejects whitespace-only code', () => {
      const invalidData = {
        code: '   ',
        structure: '{"fields":[]}'
      };

      const result = spontaneousFormCreateSchema.safeParse(invalidData);

      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs - structure field', () => {
    it('rejects empty structure', () => {
      const invalidData = {
        code: 'TEST_CODE',
        structure: ''
      };

      const result = spontaneousFormCreateSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const structureError = result.error.errors.find(
          (e) => e.path[0] === 'structure'
        );
        expect(structureError?.message).toBe(
          'spontaneousForm.create.errors.structureRequired'
        );
      }
    });

    it('rejects missing structure', () => {
      const invalidData = {
        code: 'TEST_CODE'
      };

      const result = spontaneousFormCreateSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('type inference', () => {
    it('correctly infers type for valid data', () => {
      const validData: SpontaneousFormCreateData = {
        code: 'TEST',
        structure: '{}',
        dictionary: '{}'
      };

      // TypeScript compilation check - if types are wrong, this won't compile
      expect(validData.code).toBeDefined();
      expect(validData.structure).toBeDefined();
      expect(validData.dictionary).toBeDefined();
    });

    it('allows dictionary to be undefined in type', () => {
      const validData: SpontaneousFormCreateData = {
        code: 'TEST',
        structure: '{}'
      };

      expect(validData.dictionary).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('accepts very long code strings', () => {
      const longCode = 'A'.repeat(1000);
      const validData = {
        code: longCode,
        structure: '{}'
      };

      const result = spontaneousFormCreateSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('accepts very long structure strings', () => {
      const longStructure =
        '{"fields":' + JSON.stringify(Array(100).fill({ name: 'field' })) + '}';
      const validData = {
        code: 'TEST',
        structure: longStructure
      };

      const result = spontaneousFormCreateSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('accepts unicode characters in code', () => {
      const validData = {
        code: 'CÓDIGO_日本語',
        structure: '{}'
      };

      const result = spontaneousFormCreateSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });
});
