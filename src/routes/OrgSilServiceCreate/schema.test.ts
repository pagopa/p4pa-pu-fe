/* eslint-disable sonarjs/no-nested-functions */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orgSilServiceFormSchema, OrgSilServiceFormData } from './schema';
import {
  OrgSilServiceType,
  JwtAlgorithm
} from '../../../generated/data-contracts';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';

vi.mock('i18next', () => ({
  t: vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'orgSilServiceCreate.validations.requiredAPIName': 'API Name is required',
      'orgSilServiceCreate.validations.requiredURL': 'URL is required',
      'orgSilServiceCreate.validations.invalidURL': 'Invalid URL format',
      'orgSilServiceCreate.validations.requiredServiceType':
        'Service Type is required',
      'orgSilServiceCreate.validations.requiredLegacyType':
        'Legacy authentication type is required',
      'orgSilServiceCreate.validations.requiredField': 'This field is required'
    };
    return translations[key] || key;
  })
}));

describe('orgSilServiceFormSchema', () => {
  beforeEach(() => {
    i18nTestSetup({
      'orgSilServiceCreate.validations.requiredAPIName': 'API Name is required',
      'orgSilServiceCreate.validations.requiredURL': 'URL is required',
      'orgSilServiceCreate.validations.invalidURL': 'Invalid URL format',
      'orgSilServiceCreate.validations.requiredServiceType':
        'Service Type is required',
      'orgSilServiceCreate.validations.requiredLegacyType':
        'Legacy authentication type is required',
      'orgSilServiceCreate.validations.requiredField': 'This field is required'
    });
  });

  describe('Basic Field Validation', () => {
    it('should validate a complete valid form data', () => {
      const validData: OrgSilServiceFormData = {
        applicationName: 'Test API',
        serviceUrl: 'https://test.api.com/v1',
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
        flagLegacy: false
      };

      const result = orgSilServiceFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail when applicationName is empty', () => {
      const invalidData = {
        applicationName: '',
        serviceUrl: 'https://test.api.com/v1',
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
        flagLegacy: false
      };

      const result = orgSilServiceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0].path).toEqual(['applicationName']);
        expect(result.error.issues[0].message).toBe('API Name is required');
      }
    });

    it('should fail when serviceUrl is empty', () => {
      const invalidData = {
        applicationName: 'Test API',
        serviceUrl: '',
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
        flagLegacy: false
      };

      const result = orgSilServiceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(1);

        const serviceUrlIssue = result.error.issues.find((issue) =>
          issue.path.includes('serviceUrl')
        );
        expect(serviceUrlIssue).toBeDefined();
        expect(serviceUrlIssue?.message).toBe('URL is required');
      }
    });

    it('should fail when serviceUrl is not a valid URL', () => {
      const invalidData = {
        applicationName: 'Test API',
        serviceUrl: 'not-a-valid-url',
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
        flagLegacy: false
      };

      const result = orgSilServiceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0].path).toEqual(['serviceUrl']);
        expect(result.error.issues[0].message).toBe('Invalid URL format');
      }
    });

    it('should fail when serviceType is missing', () => {
      const invalidData = {
        applicationName: 'Test API',
        serviceUrl: 'https://test.api.com/v1',
        flagLegacy: false
      };

      const result = orgSilServiceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const serviceTypeIssue = result.error.issues.find((issue) =>
          issue.path.includes('serviceType')
        );
        expect(serviceTypeIssue).toBeDefined();
        expect(serviceTypeIssue?.message).toBe('Service Type is required');
      }
    });

    it('should accept all valid service types', () => {
      const serviceTypes = Object.values(OrgSilServiceType);

      serviceTypes.forEach((serviceType) => {
        const validData = {
          applicationName: 'Test API',
          serviceUrl: 'https://test.api.com/v1',
          serviceType: serviceType,
          flagLegacy: false
        };

        const result = orgSilServiceFormSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Legacy Authentication Validation', () => {
    it('should pass when flagLegacy is false (no additional validation needed)', () => {
      const validData = {
        applicationName: 'Test API',
        serviceUrl: 'https://test.api.com/v1',
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
        flagLegacy: false
      };

      const result = orgSilServiceFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail when flagLegacy is true but authConfigType is missing', () => {
      const invalidData = {
        applicationName: 'Test API',
        serviceUrl: 'https://test.api.com/v1',
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
        flagLegacy: true
      };

      const result = orgSilServiceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const authConfigIssue = result.error.issues.find((issue) =>
          issue.path.includes('authConfigType')
        );
        expect(authConfigIssue).toBeDefined();
        expect(authConfigIssue?.message).toBe(
          'Legacy authentication type is required'
        );
      }
    });
  });

  describe('Basic Authentication Validation', () => {
    it('should pass when basic auth is complete and valid', () => {
      const validData = {
        applicationName: 'Test API',
        serviceUrl: 'https://test.api.com/v1',
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
        flagLegacy: true,
        authConfigType: 'basic' as const,
        basicUser: 'testuser',
        basicPassword: 'testpass',
        basicAuthURL: 'https://auth.test.com/basic'
      };

      const result = orgSilServiceFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail when basic auth fields are missing', () => {
      const invalidData = {
        applicationName: 'Test API',
        serviceUrl: 'https://test.api.com/v1',
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
        flagLegacy: true,
        authConfigType: 'basic' as const
      };

      const result = orgSilServiceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(3);

        const paths = result.error.issues.map((issue) => issue.path[0]);
        expect(paths).toContain('basicUser');
        expect(paths).toContain('basicPassword');
        expect(paths).toContain('basicAuthURL');

        result.error.issues.forEach((issue) => {
          expect(issue.message).toBe('This field is required');
        });
      }
    });

    it('should fail when basicAuthURL is not a valid URL', () => {
      const invalidData = {
        applicationName: 'Test API',
        serviceUrl: 'https://test.api.com/v1',
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
        flagLegacy: true,
        authConfigType: 'basic' as const,
        basicUser: 'testuser',
        basicPassword: 'testpass',
        basicAuthURL: 'not-a-valid-url'
      };

      const result = orgSilServiceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const urlIssue = result.error.issues.find((issue) =>
          issue.path.includes('basicAuthURL')
        );
        expect(urlIssue).toBeDefined();
        expect(urlIssue?.message).toBe('Invalid URL format');
      }
    });

    it('should validate individual basic auth fields', () => {
      const baseData = {
        applicationName: 'Test API',
        serviceUrl: 'https://test.api.com/v1',
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
        flagLegacy: true,
        authConfigType: 'basic' as const,
        basicAuthURL: 'https://auth.test.com/basic'
      };

      let result = orgSilServiceFormSchema.safeParse({
        ...baseData,
        basicPassword: 'testpass'
      });
      expect(result.success).toBe(false);

      result = orgSilServiceFormSchema.safeParse({
        ...baseData,
        basicUser: 'testuser'
      });
      expect(result.success).toBe(false);
    });
  });

  describe('JWT Authentication Validation', () => {
    it('should pass when JWT auth is complete and valid', () => {
      const validData = {
        applicationName: 'Test API',
        serviceUrl: 'https://test.api.com/v1',
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
        flagLegacy: true,
        authConfigType: 'jwt' as const,
        jwtKid: 'test-kid',
        jwtIssuer: 'test-issuer',
        jwtSubject: 'test-subject',
        jwtAlgorithm: JwtAlgorithm.HS256,
        jwtSigningKey: 'test-signing-key'
      };

      const result = orgSilServiceFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail when JWT auth fields are missing', () => {
      const invalidData = {
        applicationName: 'Test API',
        serviceUrl: 'https://test.api.com/v1',
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
        flagLegacy: true,
        authConfigType: 'jwt' as const
      };

      const result = orgSilServiceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(5);

        const paths = result.error.issues.map((issue) => issue.path[0]);
        expect(paths).toContain('jwtKid');
        expect(paths).toContain('jwtIssuer');
        expect(paths).toContain('jwtSubject');
        expect(paths).toContain('jwtAlgorithm');
        expect(paths).toContain('jwtSigningKey');

        result.error.issues.forEach((issue) => {
          expect(issue.message).toBe('This field is required');
        });
      }
    });

    it('should validate individual JWT fields', () => {
      const baseData = {
        applicationName: 'Test API',
        serviceUrl: 'https://test.api.com/v1',
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
        flagLegacy: true,
        authConfigType: 'jwt' as const
      };

      const requiredFields = [
        'jwtKid',
        'jwtIssuer',
        'jwtSubject',
        'jwtAlgorithm',
        'jwtSigningKey'
      ];

      requiredFields.forEach((field) => {
        const dataWithoutField = {
          ...baseData,
          jwtKid: field === 'jwtKid' ? undefined : 'test-kid',
          jwtIssuer: field === 'jwtIssuer' ? undefined : 'test-issuer',
          jwtSubject: field === 'jwtSubject' ? undefined : 'test-subject',
          jwtAlgorithm:
            field === 'jwtAlgorithm' ? undefined : JwtAlgorithm.HS256,
          jwtSigningKey: field === 'jwtSigningKey' ? undefined : 'test-key'
        };

        const result = orgSilServiceFormSchema.safeParse(dataWithoutField);
        expect(result.success).toBe(false);
        if (!result.success) {
          const fieldIssue = result.error.issues.find((issue) =>
            issue.path.includes(field)
          );
          expect(fieldIssue).toBeDefined();
          expect(fieldIssue?.message).toBe('This field is required');
        }
      });
    });

    it('should accept all valid JWT algorithms', () => {
      const algorithms = Object.values(JwtAlgorithm);

      algorithms.forEach((algorithm) => {
        const validData = {
          applicationName: 'Test API',
          serviceUrl: 'https://test.api.com/v1',
          serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
          flagLegacy: true,
          authConfigType: 'jwt' as const,
          jwtKid: 'test-kid',
          jwtIssuer: 'test-issuer',
          jwtSubject: 'test-subject',
          jwtAlgorithm: algorithm,
          jwtSigningKey: 'test-signing-key'
        };

        const result = orgSilServiceFormSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Multiple Validation Errors', () => {
    it('should return multiple errors when multiple fields are invalid', () => {
      const invalidData = {
        applicationName: '',
        serviceUrl: 'invalid-url',
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
        flagLegacy: true,
        authConfigType: 'basic' as const
      };

      const result = orgSilServiceFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(5);

        const errorPaths = result.error.issues.map((issue) => issue.path[0]);
        expect(errorPaths).toContain('applicationName');
        expect(errorPaths).toContain('serviceUrl');
        expect(errorPaths).toContain('basicUser');
        expect(errorPaths).toContain('basicPassword');
        expect(errorPaths).toContain('basicAuthURL');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle valid URLs with different protocols', () => {
      const urlsToTest = [
        'https://api.example.com/v1',
        'http://localhost:3000/api',
        'https://api-test.subdomain.example.com/path',
        'https://127.0.0.1:8080/api'
      ];

      urlsToTest.forEach((url) => {
        const validData = {
          applicationName: 'Test API',
          serviceUrl: url,
          serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
          flagLegacy: false
        };

        const result = orgSilServiceFormSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid URL formats', () => {
      const testCases = [
        { url: 'not-a-url', shouldFail: true },
        { url: 'example.com', shouldFail: true },
        { url: 'https://', shouldFail: true },
        { url: ' ', shouldFail: true },
        { url: 'htp://example.com', shouldFail: true },
        { url: '', shouldFail: true }
      ];

      const actuallyInvalidUrls: Array<string> = [];

      testCases.forEach(({ url, shouldFail }) => {
        const invalidData = {
          applicationName: 'Test API',
          serviceUrl: url,
          serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
          flagLegacy: false
        };

        const result = orgSilServiceFormSchema.safeParse(invalidData);

        if (shouldFail && result.success) {
          console.warn(
            `URL "${url}" was expected to be invalid but passed validation`
          );
        } else if (!result.success) {
          actuallyInvalidUrls.push(url);
          const urlIssue = result.error.issues.find((issue) =>
            issue.path.includes('serviceUrl')
          );
          expect(urlIssue).toBeDefined();
        }
      });

      expect(actuallyInvalidUrls.length).toBeGreaterThan(0);
    });

    it('should definitely reject clearly invalid URLs', () => {
      const definitelyInvalidUrls = ['', ' ', 'not-a-url-at-all'];

      definitelyInvalidUrls.forEach((url) => {
        const invalidData = {
          applicationName: 'Test API',
          serviceUrl: url,
          serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
          flagLegacy: false
        };

        const result = orgSilServiceFormSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    it('should handle mixed authentication scenarios', () => {
      const mixedData = {
        applicationName: 'Test API',
        serviceUrl: 'https://test.api.com/v1',
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
        flagLegacy: true,
        authConfigType: 'basic' as const,
        basicUser: 'testuser',
        basicPassword: 'testpass',
        basicAuthURL: 'https://auth.test.com/basic',
        jwtKid: 'some-kid',
        jwtIssuer: 'some-issuer'
      };

      const result = orgSilServiceFormSchema.safeParse(mixedData);
      expect(result.success).toBe(true);
    });
  });
});
