import { describe, it, expect } from 'vitest';
import {
  transformChapterItem,
  transformChaptersData,
  createAssessmentRegistryIdGetter,
  type AssessmentRegistryItem,
  type ChapterOption
} from '../chaptersHelpers';

describe('chaptersHelpers', () => {
  describe('transformChapterItem', () => {
    it('should transform complete assessment registry item correctly', () => {
      const item: AssessmentRegistryItem = {
        assessmentRegistryId: 1,
        sectionCode: 'SEC001',
        sectionDescription: 'Sezione Test',
        officeDescription: 'Ufficio Test',
        assessmentDescription: 'Accertamento Test'
      };

      const result = transformChapterItem(item);

      expect(result).toEqual({
        label: 'Ufficio Test - Sezione Test - Accertamento Test',
        value: 'SEC001',
        assessmentRegistryId: 1
      });
    });

    it('should handle item with only sectionCode and description', () => {
      const item: AssessmentRegistryItem = {
        assessmentRegistryId: 2,
        sectionCode: 'SEC002',
        sectionDescription: 'Solo Sezione'
      };

      const result = transformChapterItem(item);

      expect(result).toEqual({
        label: 'Solo Sezione',
        value: 'SEC002',
        assessmentRegistryId: 2
      });
    });

    it('should use sectionCode when sectionDescription is missing', () => {
      const item: AssessmentRegistryItem = {
        assessmentRegistryId: 3,
        sectionCode: 'SEC003',
        officeDescription: 'Ufficio Test'
      };

      const result = transformChapterItem(item);

      expect(result).toEqual({
        label: 'Ufficio Test - SEC003',
        value: 'SEC003',
        assessmentRegistryId: 3
      });
    });

    it('should handle item with only officeDescription and assessmentDescription', () => {
      const item: AssessmentRegistryItem = {
        assessmentRegistryId: 4,
        sectionCode: 'SEC004',
        officeDescription: 'Ufficio Test',
        assessmentDescription: 'Accertamento Test'
      };

      const result = transformChapterItem(item);

      expect(result).toEqual({
        label: 'Ufficio Test - SEC004 - Accertamento Test',
        value: 'SEC004',
        assessmentRegistryId: 4
      });
    });

    it('should fallback to sectionCode when no descriptions available', () => {
      const item: AssessmentRegistryItem = {
        assessmentRegistryId: 5,
        sectionCode: 'SEC005'
      };

      const result = transformChapterItem(item);

      expect(result).toEqual({
        label: 'SEC005',
        value: 'SEC005',
        assessmentRegistryId: 5
      });
    });

    it('should fallback to dash when sectionCode is empty', () => {
      const item: AssessmentRegistryItem = {
        assessmentRegistryId: 6,
        sectionCode: ''
      };

      const result = transformChapterItem(item);

      expect(result).toEqual({
        label: '-',
        value: '',
        assessmentRegistryId: 6
      });
    });

    it('should handle undefined sectionCode', () => {
      const item: AssessmentRegistryItem = {
        assessmentRegistryId: 7,
        officeDescription: 'Ufficio Test'
      };

      const result = transformChapterItem(item);

      expect(result).toEqual({
        label: 'Ufficio Test',
        value: '',
        assessmentRegistryId: 7
      });
    });

    it('should handle missing assessmentRegistryId', () => {
      const item: AssessmentRegistryItem = {
        sectionCode: 'SEC008',
        sectionDescription: 'Test Sezione'
      };

      const result = transformChapterItem(item);

      expect(result).toEqual({
        label: 'Test Sezione',
        value: 'SEC008',
        assessmentRegistryId: undefined
      });
    });
  });

  describe('transformChaptersData', () => {
    const mockData: Array<AssessmentRegistryItem> = [
      {
        assessmentRegistryId: 1,
        sectionCode: 'SEC002',
        sectionDescription: 'Sezione B',
        officeDescription: 'Ufficio B'
      },
      {
        assessmentRegistryId: 2,
        sectionCode: 'SEC001',
        sectionDescription: 'Sezione A',
        officeDescription: 'Ufficio A'
      },
      {
        assessmentRegistryId: 3,
        sectionCode: 'SEC003',
        sectionDescription: 'Sezione C'
      }
    ];

    it('should filter, sort and transform data correctly', () => {
      const result = transformChaptersData(mockData);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        {
          label: 'Ufficio A - Sezione A',
          value: 'SEC001',
          assessmentRegistryId: 2
        },
        {
          label: 'Ufficio B - Sezione B',
          value: 'SEC002',
          assessmentRegistryId: 1
        },
        {
          label: 'Sezione C',
          value: 'SEC003',
          assessmentRegistryId: 3
        }
      ]);
    });

    it('should filter out items without sectionCode', () => {
      const dataWithInvalidItems: Array<AssessmentRegistryItem> = [
        ...mockData,
        {
          assessmentRegistryId: 4,
          sectionCode: '',
          sectionDescription: 'Should be filtered out'
        },
        {
          assessmentRegistryId: 5,

          sectionDescription: 'Should be filtered out'
        },
        {
          assessmentRegistryId: 6,
          sectionCode: undefined,
          sectionDescription: 'Should be filtered out'
        }
      ];

      const result = transformChaptersData(dataWithInvalidItems);

      expect(result).toHaveLength(3);
      expect(result.every((item) => item.value !== '')).toBe(true);
    });

    it('should handle empty array', () => {
      const result = transformChaptersData([]);
      expect(result).toEqual([]);
    });

    it('should handle array with all invalid items', () => {
      const invalidData: Array<AssessmentRegistryItem> = [
        { assessmentRegistryId: 1, sectionCode: '' },
        { assessmentRegistryId: 2 },
        { assessmentRegistryId: 3, sectionCode: undefined }
      ];

      const result = transformChaptersData(invalidData);
      expect(result).toEqual([]);
    });

    it('should sort alphabetically by sectionCode', () => {
      const unsortedData: Array<AssessmentRegistryItem> = [
        { assessmentRegistryId: 1, sectionCode: 'ZZZ' },
        { assessmentRegistryId: 2, sectionCode: 'AAA' },
        { assessmentRegistryId: 3, sectionCode: 'MMM' },
        { assessmentRegistryId: 4, sectionCode: 'BBB' }
      ];

      const result = transformChaptersData(unsortedData);

      expect(result.map((item) => item.value)).toEqual([
        'AAA',
        'BBB',
        'MMM',
        'ZZZ'
      ]);
    });

    it('should handle null items in array', () => {
      const dataWithNulls = [
        mockData[0],
        null as unknown as AssessmentRegistryItem,
        mockData[1],
        undefined as unknown as AssessmentRegistryItem,
        mockData[2]
      ];

      const result = transformChaptersData(dataWithNulls);

      expect(result).toHaveLength(3);
      expect(result[0].value).toBe('SEC001');
    });
  });

  describe('createAssessmentRegistryIdGetter', () => {
    const mockChapters: Array<ChapterOption> = [
      {
        label: 'Chapter A',
        value: 'SEC001',
        assessmentRegistryId: 1
      },
      {
        label: 'Chapter B',
        value: 'SEC002',
        assessmentRegistryId: 2
      },
      {
        label: 'Chapter C',
        value: 'SEC003',
        assessmentRegistryId: undefined
      }
    ];

    it('should return correct assessmentRegistryId for existing chapter codes', () => {
      const getter = createAssessmentRegistryIdGetter(mockChapters);

      expect(getter('SEC001')).toBe(1);
      expect(getter('SEC002')).toBe(2);
    });

    it('should return undefined for non-existing chapter code', () => {
      const getter = createAssessmentRegistryIdGetter(mockChapters);

      expect(getter('NONEXISTENT')).toBeUndefined();
      expect(getter('')).toBeUndefined();
    });

    it('should return undefined when chapter has undefined assessmentRegistryId', () => {
      const getter = createAssessmentRegistryIdGetter(mockChapters);

      expect(getter('SEC003')).toBeUndefined();
    });

    it('should handle empty chapters array', () => {
      const getter = createAssessmentRegistryIdGetter([]);

      expect(getter('SEC001')).toBeUndefined();
      expect(getter('')).toBeUndefined();
    });

    it('should be case sensitive', () => {
      const getter = createAssessmentRegistryIdGetter(mockChapters);

      expect(getter('sec001')).toBeUndefined();
      expect(getter('SEC001')).toBe(1);
    });

    it('should handle special characters and spaces', () => {
      const specialChapters: Array<ChapterOption> = [
        {
          label: 'Special Chapter',
          value: 'SEC-001/A',
          assessmentRegistryId: 10
        },
        {
          label: 'Spaced Chapter',
          value: 'SEC 002',
          assessmentRegistryId: 20
        }
      ];

      const getter = createAssessmentRegistryIdGetter(specialChapters);

      expect(getter('SEC-001/A')).toBe(10);
      expect(getter('SEC 002')).toBe(20);
    });

    it('should return the first match for duplicate values', () => {
      const duplicateChapters: Array<ChapterOption> = [
        {
          label: 'First Duplicate',
          value: 'DUPLICATE',
          assessmentRegistryId: 100
        },
        {
          label: 'Second Duplicate',
          value: 'DUPLICATE',
          assessmentRegistryId: 200
        }
      ];

      const getter = createAssessmentRegistryIdGetter(duplicateChapters);

      expect(getter('DUPLICATE')).toBe(100);
    });
  });
});
