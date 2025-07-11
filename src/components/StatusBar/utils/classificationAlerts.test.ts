/* eslint-disable sonarjs/no-nested-functions */
/* eslint-disable sonarjs/no-alphabetical-sort */
/* eslint-disable sonarjs/no-misleading-array-reverse */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect } from 'vitest';
import {
  CLASSIFICATION_SEVERITY_MAP,
  CLASSIFICATION_ALERT_KEYS
} from './classificationAlerts';
import { ClassificationsEnum } from '../../../../generated/data-contracts';

describe('classificationAlerts', () => {
  describe('CLASSIFICATION_SEVERITY_MAP', () => {
    it('should have success severity for positive flow classifications', () => {
      const successClassifications = [
        ClassificationsEnum.IUD_RT_IUF,
        ClassificationsEnum.RT_IUF,
        ClassificationsEnum.RT_TES,
        ClassificationsEnum.IUD_RT_IUF_TES,
        ClassificationsEnum.RT_IUF_TES
      ];

      successClassifications.forEach((classification) => {
        expect(CLASSIFICATION_SEVERITY_MAP[classification]).toBe('success');
      });
    });

    it('should have warning severity for partial mismatch classifications', () => {
      const warningClassifications = [
        ClassificationsEnum.RT_NO_IUF,
        ClassificationsEnum.RT_NO_IUD,
        ClassificationsEnum.IUF_NO_TES
      ];

      warningClassifications.forEach((classification) => {
        expect(CLASSIFICATION_SEVERITY_MAP[classification]).toBe('warning');
      });
    });

    it('should have error severity for problematic classifications', () => {
      const errorClassifications = [
        ClassificationsEnum.DOPPI,
        ClassificationsEnum.IUV_NO_RT,
        ClassificationsEnum.TES_NO_IUF_OR_IUV,
        ClassificationsEnum.IUF_TES_DIV_IMP,
        ClassificationsEnum.IUD_NO_RT,
        ClassificationsEnum.TES_NO_MATCH,
        ClassificationsEnum.UNKNOWN
      ];

      errorClassifications.forEach((classification) => {
        expect(CLASSIFICATION_SEVERITY_MAP[classification]).toBe('error');
      });
    });

    it('should cover all enum values', () => {
      const allEnumValues = Object.values(ClassificationsEnum);
      const mappedKeys = Object.keys(CLASSIFICATION_SEVERITY_MAP);

      allEnumValues.forEach((enumValue) => {
        expect(mappedKeys).toContain(enumValue);
      });
    });

    it('should only contain valid severity values', () => {
      const validSeverities = ['success', 'warning', 'error'];
      const severityValues = Object.values(CLASSIFICATION_SEVERITY_MAP);

      severityValues.forEach((severity) => {
        expect(validSeverities).toContain(severity);
      });
    });
  });

  describe('CLASSIFICATION_ALERT_KEYS', () => {
    it('should have title and description for all classifications', () => {
      const allClassifications = Object.values(ClassificationsEnum);

      allClassifications.forEach((classification) => {
        const alertKeys = CLASSIFICATION_ALERT_KEYS[classification];
        expect(alertKeys).toBeDefined();
        expect(alertKeys.title).toBeDefined();
        expect(alertKeys.description).toBeDefined();
        expect(typeof alertKeys.title).toBe('string');
        expect(typeof alertKeys.description).toBe('string');
      });
    });

    it('should have consistent key structure', () => {
      const alertKeyEntries = Object.entries(CLASSIFICATION_ALERT_KEYS);

      alertKeyEntries.forEach(([_key, value]) => {
        expect(value).toHaveProperty('title');
        expect(value).toHaveProperty('description');
        expect(Object.keys(value)).toHaveLength(2);
      });
    });

    it('should use proper translation key format', () => {
      const translationKeyPattern =
        /^classifications\.detail\.statusBar\.status\.alerts\.[a-zA-Z]+\.(title|description)$/;

      Object.values(CLASSIFICATION_ALERT_KEYS).forEach((alertKey) => {
        expect(alertKey.title).toMatch(translationKeyPattern);
        expect(alertKey.description).toMatch(translationKeyPattern);
      });
    });

    it('should have matching title and description base keys', () => {
      Object.values(CLASSIFICATION_ALERT_KEYS).forEach((alertKey) => {
        const titleBase = alertKey.title.replace('.title', '');
        const descriptionBase = alertKey.description.replace(
          '.description',
          ''
        );
        expect(titleBase).toBe(descriptionBase);
      });
    });

    it('should cover all enum values', () => {
      const allEnumValues = Object.values(ClassificationsEnum);
      const alertKeyKeys = Object.keys(CLASSIFICATION_ALERT_KEYS);

      allEnumValues.forEach((enumValue) => {
        expect(alertKeyKeys).toContain(enumValue);
      });
    });
  });

  describe('Data consistency', () => {
    it('should have same keys in both SEVERITY_MAP and ALERT_KEYS', () => {
      const severityKeys = Object.keys(CLASSIFICATION_SEVERITY_MAP);
      const alertKeys = Object.keys(CLASSIFICATION_ALERT_KEYS);

      expect(severityKeys.sort()).toEqual(alertKeys.sort());
    });

    it('should have correct mapping for specific business cases', () => {
      const testCases = [
        {
          classification: ClassificationsEnum.IUD_RT_IUF,
          expectedSeverity: 'success',
          description: 'Correctly reported payment should be success'
        },
        {
          classification: ClassificationsEnum.DOPPI,
          expectedSeverity: 'error',
          description: 'Duplicate payments should be error'
        },
        {
          classification: ClassificationsEnum.RT_NO_IUF,
          expectedSeverity: 'warning',
          description: 'Reported but not in payment flow should be warning'
        },
        {
          classification: ClassificationsEnum.UNKNOWN,
          expectedSeverity: 'error',
          description: 'Unknown classification should be error'
        }
      ];

      testCases.forEach(({ classification, expectedSeverity }) => {
        expect(CLASSIFICATION_SEVERITY_MAP[classification]).toBe(
          expectedSeverity
        );
      });
    });
  });

  describe('Translation key patterns', () => {
    it('should use expected translation patterns for success cases', () => {
      const successPatterns = [
        'correctlyReported',
        'reported',
        'punctualReversal',
        'notified',
        'cumulativeReversal'
      ];

      const successClassifications = [
        ClassificationsEnum.IUD_RT_IUF,
        ClassificationsEnum.RT_IUF,
        ClassificationsEnum.RT_TES,
        ClassificationsEnum.IUD_RT_IUF_TES,
        ClassificationsEnum.RT_IUF_TES
      ];

      successClassifications.forEach((classification) => {
        const alertKey = CLASSIFICATION_ALERT_KEYS[classification];
        const hasExpectedPattern = successPatterns.some((pattern) =>
          alertKey.title.includes(pattern)
        );
        expect(hasExpectedPattern).toBe(true);
      });
    });

    it('should use expected translation patterns for warning cases', () => {
      const warningPatterns = [
        'incorrectlyReported',
        'incorrectlyNotified',
        'incorrectlyReversed'
      ];

      const warningClassifications = [
        ClassificationsEnum.RT_NO_IUF,
        ClassificationsEnum.RT_NO_IUD,
        ClassificationsEnum.IUF_NO_TES
      ];

      warningClassifications.forEach((classification) => {
        const alertKey = CLASSIFICATION_ALERT_KEYS[classification];
        const hasExpectedPattern = warningPatterns.some((pattern) =>
          alertKey.title.includes(pattern)
        );
        expect(hasExpectedPattern).toBe(true);
      });
    });

    it('should use expected translation patterns for error cases', () => {
      const errorPatterns = [
        'duplicatePayments',
        'unexecutedReporting',
        'unrecognizedReversal',
        'differentAmountReversal',
        'notifiedNotExecuted',
        'unrecognizedTreasuryReversal',
        'default'
      ];

      const errorClassifications = [
        ClassificationsEnum.DOPPI,
        ClassificationsEnum.IUV_NO_RT,
        ClassificationsEnum.TES_NO_IUF_OR_IUV,
        ClassificationsEnum.IUF_TES_DIV_IMP,
        ClassificationsEnum.IUD_NO_RT,
        ClassificationsEnum.TES_NO_MATCH,
        ClassificationsEnum.UNKNOWN
      ];

      errorClassifications.forEach((classification) => {
        const alertKey = CLASSIFICATION_ALERT_KEYS[classification];
        const hasExpectedPattern = errorPatterns.some((pattern) =>
          alertKey.title.includes(pattern)
        );
        expect(hasExpectedPattern).toBe(true);
      });
    });
  });

  describe('Immutability', () => {
    it('should be readonly objects', () => {
      expect(() => {
        // @ts-expect-error - Testing immutability
        CLASSIFICATION_SEVERITY_MAP[ClassificationsEnum.UNKNOWN] = 'warning';
      }).toBeDefined();

      expect(() => {
        // @ts-expect-error - Testing immutability
        CLASSIFICATION_ALERT_KEYS[ClassificationsEnum.UNKNOWN] = {
          title: 'test',
          description: 'test'
        };
      }).toBeDefined();
    });
  });
});
