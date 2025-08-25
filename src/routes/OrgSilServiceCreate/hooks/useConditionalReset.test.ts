/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/no-nested-functions */
/* eslint-disable sonarjs/function-return-type */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useConditionalReset } from './useConditionalReset';
import { OrgSilServiceFormData } from '../schema';
import {
  BASIC_AUTH_FIELDS,
  JWT_AUTH_FIELDS,
  ALL_AUTH_FIELDS
} from '../utils/orgSilServiceFormUtils';

vi.mock('../utils/orgSilServiceFormUtils', () => ({
  BASIC_AUTH_FIELDS: ['basicUser', 'basicPassword', 'basicAuthURL'],
  JWT_AUTH_FIELDS: [
    'jwtKid',
    'jwtIssuer',
    'jwtSubject',
    'jwtAlgorithm',
    'jwtSigningKey'
  ],
  ALL_AUTH_FIELDS: [
    'authConfigType',
    'basicUser',
    'basicPassword',
    'basicAuthURL',
    'jwtKid',
    'jwtIssuer',
    'jwtSubject',
    'jwtAlgorithm',
    'jwtSigningKey'
  ]
}));

describe('useConditionalReset', () => {
  const mockWatch = vi.fn();
  const mockResetField = vi.fn();

  const defaultProps = {
    watch: mockWatch,
    resetField: mockResetField
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
      switch (field) {
        case 'flagLegacy':
          return false;
        case 'authConfigType':
          return undefined;
        default:
          return undefined;
      }
    });
  });

  describe('Initialization and Basic Behavior', () => {
    it('should return watched values correctly', () => {
      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return 'basic';
          default:
            return undefined;
        }
      });

      const { result } = renderHook(() => useConditionalReset(defaultProps));

      expect(result.current.watchFlagLegacy).toBe(true);
      expect(result.current.watchAuthConfigType).toBe('basic');
    });

    it('should call watch function for correct fields', () => {
      renderHook(() => useConditionalReset(defaultProps));

      expect(mockWatch).toHaveBeenCalledWith('flagLegacy');
      expect(mockWatch).toHaveBeenCalledWith('authConfigType');
    });
  });

  describe('flagLegacy = false Scenarios', () => {
    it('should reset all auth fields when flagLegacy is false', () => {
      renderHook(() => useConditionalReset(defaultProps));

      ALL_AUTH_FIELDS.forEach((field) => {
        expect(mockResetField).toHaveBeenCalledWith(field);
      });

      expect(mockResetField).toHaveBeenCalledTimes(ALL_AUTH_FIELDS.length);
    });

    it('should reset all auth fields when flagLegacy changes from true to false', () => {
      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return 'basic';
          default:
            return undefined;
        }
      });

      const { rerender } = renderHook(() => useConditionalReset(defaultProps));

      mockResetField.mockClear();

      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return false;
          case 'authConfigType':
            return 'basic';
          default:
            return undefined;
        }
      });

      rerender();

      ALL_AUTH_FIELDS.forEach((field) => {
        expect(mockResetField).toHaveBeenCalledWith(field);
      });
    });
  });

  describe('flagLegacy = true Scenarios', () => {
    beforeEach(() => {
      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return undefined;
          default:
            return undefined;
        }
      });
    });

    it('should reset all auth fields when authConfigType is undefined', () => {
      renderHook(() => useConditionalReset(defaultProps));

      const expectedFields = [...BASIC_AUTH_FIELDS, ...JWT_AUTH_FIELDS];
      expectedFields.forEach((field) => {
        expect(mockResetField).toHaveBeenCalledWith(field);
      });
    });

    it('should reset only JWT fields when authConfigType is "basic"', () => {
      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return 'basic';
          default:
            return undefined;
        }
      });

      renderHook(() => useConditionalReset(defaultProps));

      JWT_AUTH_FIELDS.forEach((field) => {
        expect(mockResetField).toHaveBeenCalledWith(field);
      });

      BASIC_AUTH_FIELDS.forEach((field) => {
        expect(mockResetField).not.toHaveBeenCalledWith(field);
      });
    });

    it('should reset only Basic fields when authConfigType is "jwt"', () => {
      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return 'jwt';
          default:
            return undefined;
        }
      });

      renderHook(() => useConditionalReset(defaultProps));

      BASIC_AUTH_FIELDS.forEach((field) => {
        expect(mockResetField).toHaveBeenCalledWith(field);
      });

      JWT_AUTH_FIELDS.forEach((field) => {
        expect(mockResetField).not.toHaveBeenCalledWith(field);
      });
    });
  });

  describe('State Transitions', () => {
    it('should handle authConfigType changes from basic to jwt', () => {
      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return 'basic';
          default:
            return undefined;
        }
      });

      const { rerender } = renderHook(() => useConditionalReset(defaultProps));

      mockResetField.mockClear();

      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return 'jwt';
          default:
            return undefined;
        }
      });

      rerender();

      BASIC_AUTH_FIELDS.forEach((field) => {
        expect(mockResetField).toHaveBeenCalledWith(field);
      });

      JWT_AUTH_FIELDS.forEach((field) => {
        expect(mockResetField).not.toHaveBeenCalledWith(field);
      });
    });

    it('should handle authConfigType changes from jwt to basic', () => {
      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return 'jwt';
          default:
            return undefined;
        }
      });

      const { rerender } = renderHook(() => useConditionalReset(defaultProps));

      mockResetField.mockClear();

      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return 'basic';
          default:
            return undefined;
        }
      });

      rerender();

      JWT_AUTH_FIELDS.forEach((field) => {
        expect(mockResetField).toHaveBeenCalledWith(field);
      });

      BASIC_AUTH_FIELDS.forEach((field) => {
        expect(mockResetField).not.toHaveBeenCalledWith(field);
      });
    });

    it('should handle authConfigType changes from defined to undefined', () => {
      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return 'basic';
          default:
            return undefined;
        }
      });

      const { rerender } = renderHook(() => useConditionalReset(defaultProps));

      mockResetField.mockClear();

      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return undefined;
          default:
            return undefined;
        }
      });

      rerender();

      const expectedFields = [...BASIC_AUTH_FIELDS, ...JWT_AUTH_FIELDS];
      expectedFields.forEach((field) => {
        expect(mockResetField).toHaveBeenCalledWith(field);
      });
    });
  });

  describe('Complex State Changes', () => {
    it('should handle multiple rapid state changes correctly', () => {
      const { rerender } = renderHook(() => useConditionalReset(defaultProps));

      const stateSequence = [
        { flagLegacy: true, authConfigType: 'basic' as const },
        { flagLegacy: true, authConfigType: 'jwt' as const },
        { flagLegacy: false, authConfigType: undefined }
      ];

      stateSequence.forEach((state) => {
        mockResetField.mockClear();

        mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
          switch (field) {
            case 'flagLegacy':
              return state.flagLegacy;
            case 'authConfigType':
              return state.authConfigType;
            default:
              return undefined;
          }
        });

        rerender();

        expect(mockResetField).toHaveBeenCalled();
      });
    });

    it('should not reset fields unnecessarily when state does not change', () => {
      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return 'basic';
          default:
            return undefined;
        }
      });

      const { rerender } = renderHook(() => useConditionalReset(defaultProps));

      const initialCallCount = mockResetField.mock.calls.length;

      rerender();

      expect(mockResetField.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('Edge Cases', () => {
    it('should handle when watch functions return unexpected values', () => {
      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return null;
          case 'authConfigType':
            return 'invalid-type';
          default:
            return undefined;
        }
      });

      expect(() => {
        renderHook(() => useConditionalReset(defaultProps));
      }).not.toThrow();

      ALL_AUTH_FIELDS.forEach((field) => {
        expect(mockResetField).toHaveBeenCalledWith(field);
      });
    });

    it('should handle missing dependencies gracefully', () => {
      const propsWithoutWatch = {
        watch: undefined as any,
        resetField: mockResetField
      };

      expect(() => {
        renderHook(() => useConditionalReset(propsWithoutWatch));
      }).not.toThrow();
    });

    it('should handle missing resetField gracefully', () => {
      const propsWithoutReset = {
        watch: mockWatch,
        resetField: undefined as any
      };

      expect(() => {
        renderHook(() => useConditionalReset(propsWithoutReset));
      }).not.toThrow();
    });
  });

  describe('Field Group Validation', () => {
    it('should reset correct field groups based on constants', () => {
      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return false;
          case 'authConfigType':
            return undefined;
          default:
            return undefined;
        }
      });

      renderHook(() => useConditionalReset(defaultProps));

      const expectedFields = [
        'authConfigType',
        'basicUser',
        'basicPassword',
        'basicAuthURL',
        'jwtKid',
        'jwtIssuer',
        'jwtSubject',
        'jwtAlgorithm',
        'jwtSigningKey'
      ];

      expectedFields.forEach((field) => {
        expect(mockResetField).toHaveBeenCalledWith(field);
      });
    });

    it('should use correct field separation for auth types', () => {
      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return 'basic';
          default:
            return undefined;
        }
      });

      renderHook(() => useConditionalReset(defaultProps));

      const expectedJwtFields = [
        'jwtKid',
        'jwtIssuer',
        'jwtSubject',
        'jwtAlgorithm',
        'jwtSigningKey'
      ];
      expectedJwtFields.forEach((field) => {
        expect(mockResetField).toHaveBeenCalledWith(field);
      });

      const basicFields = ['basicUser', 'basicPassword', 'basicAuthURL'];
      basicFields.forEach((field) => {
        expect(mockResetField).not.toHaveBeenCalledWith(field);
      });
    });
  });

  describe('useEffect Dependencies', () => {
    it('should re-run effect when flagLegacy changes', () => {
      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return false;
          case 'authConfigType':
            return undefined;
          default:
            return undefined;
        }
      });

      const { rerender } = renderHook(() => useConditionalReset(defaultProps));

      mockResetField.mockClear();

      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return undefined;
          default:
            return undefined;
        }
      });

      rerender();

      expect(mockResetField.mock.calls.length).toBeGreaterThan(0);
    });

    it('should re-run effect when authConfigType changes', () => {
      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return 'basic';
          default:
            return undefined;
        }
      });

      const { rerender } = renderHook(() => useConditionalReset(defaultProps));

      mockResetField.mockClear();

      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return 'jwt';
          default:
            return undefined;
        }
      });

      rerender();

      BASIC_AUTH_FIELDS.forEach((field) => {
        expect(mockResetField).toHaveBeenCalledWith(field);
      });
    });

    it('should not trigger unnecessary effects when unrelated values change', () => {
      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return 'basic';
          default:
            return undefined;
        }
      });

      const { rerender } = renderHook(() => useConditionalReset(defaultProps));

      mockResetField.mockClear();

      rerender();

      expect(mockResetField).not.toHaveBeenCalled();
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should handle typical user flow: enable legacy -> choose basic -> change to jwt', () => {
      const { rerender } = renderHook(() => useConditionalReset(defaultProps));

      mockResetField.mockClear();

      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return undefined;
          default:
            return undefined;
        }
      });

      rerender();

      expect(mockResetField.mock.calls.length).toBeGreaterThan(0);
      mockResetField.mockClear();

      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return 'basic';
          default:
            return undefined;
        }
      });

      rerender();

      JWT_AUTH_FIELDS.forEach((field) => {
        expect(mockResetField).toHaveBeenCalledWith(field);
      });
      mockResetField.mockClear();

      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return 'jwt';
          default:
            return undefined;
        }
      });

      rerender();

      BASIC_AUTH_FIELDS.forEach((field) => {
        expect(mockResetField).toHaveBeenCalledWith(field);
      });
    });

    it('should handle user disabling legacy auth after configuration', () => {
      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return true;
          case 'authConfigType':
            return 'basic';
          default:
            return undefined;
        }
      });

      const { rerender } = renderHook(() => useConditionalReset(defaultProps));

      mockResetField.mockClear();

      mockWatch.mockImplementation((field: keyof OrgSilServiceFormData) => {
        switch (field) {
          case 'flagLegacy':
            return false;
          case 'authConfigType':
            return 'basic';
          default:
            return undefined;
        }
      });

      rerender();

      ALL_AUTH_FIELDS.forEach((field) => {
        expect(mockResetField).toHaveBeenCalledWith(field);
      });
    });
  });
});
