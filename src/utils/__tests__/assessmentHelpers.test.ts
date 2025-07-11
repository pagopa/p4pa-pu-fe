import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChipOwnProps } from '@mui/material/Chip';
import {
  AssessmentStatus,
  assessmentStateColors,
  getAssessmentStatusChipProps
} from '../assessmentHelpers';

const testValidStatus = (
  status: AssessmentStatus,
  mockTranslationFunction: ReturnType<typeof vi.fn>
): void => {
  const result = getAssessmentStatusChipProps(status, mockTranslationFunction);
  expect(result).toHaveProperty('label');
  expect(result).toHaveProperty('color');
  expect(typeof result.label).toBe('string');
  expect(['success', 'default', 'error']).toContain(result.color);
};

const testInvalidStatus = (
  status: string,
  mockTranslationFunction: ReturnType<typeof vi.fn>
): void => {
  const result = getAssessmentStatusChipProps(status, mockTranslationFunction);
  expect(result).toEqual({
    label: 'Unknown',
    color: 'default'
  });
};

const createEmptyTranslationFunction = (): ReturnType<typeof vi.fn> => {
  return vi.fn(() => '');
};

const createErrorTranslationFunction = (): ReturnType<typeof vi.fn> => {
  return vi.fn(() => {
    throw new Error('Translation error');
  });
};

describe('assessmentHelpers', () => {
  describe('assessmentStateColors', () => {
    it('should contain all expected colors for each status', () => {
      expect(assessmentStateColors).toEqual({
        ACTIVE: 'success',
        CLOSED: 'default',
        CANCELLED: 'error'
      });
    });

    it('should have all values compatible with ChipOwnProps["color"]', () => {
      const validColors: Array<ChipOwnProps['color']> = [
        'default',
        'primary',
        'secondary',
        'error',
        'info',
        'success',
        'warning'
      ];

      Object.values(assessmentStateColors).forEach((color) => {
        expect(validColors).toContain(color);
      });
    });

    it('should contain exactly 3 statuses', () => {
      expect(Object.keys(assessmentStateColors)).toHaveLength(3);
    });
  });

  describe('getAssessmentStatusChipProps - valid statuses', () => {
    const mockTranslationFunction = vi.fn((key: string) => `translated_${key}`);

    beforeEach(() => {
      mockTranslationFunction.mockClear();
    });

    it('should return correct props for ACTIVE status', () => {
      const result = getAssessmentStatusChipProps(
        'ACTIVE',
        mockTranslationFunction
      );

      expect(result).toEqual({
        label: 'translated_assessment.statusOptions.ACTIVE',
        color: 'success'
      });
      expect(mockTranslationFunction).toHaveBeenCalledWith(
        'assessment.statusOptions.ACTIVE'
      );
      expect(mockTranslationFunction).toHaveBeenCalledTimes(1);
    });

    it('should return correct props for CLOSED status', () => {
      const result = getAssessmentStatusChipProps(
        'CLOSED',
        mockTranslationFunction
      );

      expect(result).toEqual({
        label: 'translated_assessment.statusOptions.CLOSED',
        color: 'default'
      });
      expect(mockTranslationFunction).toHaveBeenCalledWith(
        'assessment.statusOptions.CLOSED'
      );
      expect(mockTranslationFunction).toHaveBeenCalledTimes(1);
    });

    it('should return correct props for CANCELLED status', () => {
      const result = getAssessmentStatusChipProps(
        'CANCELLED',
        mockTranslationFunction
      );

      expect(result).toEqual({
        label: 'translated_assessment.statusOptions.CANCELLED',
        color: 'error'
      });
      expect(mockTranslationFunction).toHaveBeenCalledWith(
        'assessment.statusOptions.CANCELLED'
      );
      expect(mockTranslationFunction).toHaveBeenCalledTimes(1);
    });

    it('should return correct type for all valid statuses', () => {
      const validStatuses: Array<AssessmentStatus> = [
        'ACTIVE',
        'CLOSED',
        'CANCELLED'
      ];
      validStatuses.forEach((status) =>
        testValidStatus(status, mockTranslationFunction)
      );
    });
  });
});

describe('assessmentHelpers - invalid statuses', () => {
  const mockTranslationFunction = vi.fn((key: string) => `translated_${key}`);

  beforeEach(() => {
    mockTranslationFunction.mockClear();
  });

  it('should return fallback props for empty status', () => {
    testInvalidStatus('', mockTranslationFunction);
    expect(mockTranslationFunction).not.toHaveBeenCalled();
  });

  it('should return fallback props for unrecognized status', () => {
    testInvalidStatus('INVALID_STATUS', mockTranslationFunction);
    expect(mockTranslationFunction).not.toHaveBeenCalled();
  });

  it('should return fallback props for null status', () => {
    testInvalidStatus(null as unknown as string, mockTranslationFunction);
    expect(mockTranslationFunction).not.toHaveBeenCalled();
  });

  it('should return fallback props for undefined status', () => {
    testInvalidStatus(undefined as unknown as string, mockTranslationFunction);
    expect(mockTranslationFunction).not.toHaveBeenCalled();
  });

  it('should return fallback props for status with incorrect case', () => {
    const invalidCaseStatuses = [
      'active',
      'closed',
      'cancelled',
      'Active',
      'Closed'
    ];
    invalidCaseStatuses.forEach((status) =>
      testInvalidStatus(status, mockTranslationFunction)
    );
    expect(mockTranslationFunction).not.toHaveBeenCalled();
  });

  it('should return fallback props for numeric statuses', () => {
    testInvalidStatus('123', mockTranslationFunction);
    expect(mockTranslationFunction).not.toHaveBeenCalled();
  });
});

describe('assessmentHelpers - edge cases', () => {
  it('should handle correctly translation function that returns empty string', () => {
    const emptyTranslationFunction = createEmptyTranslationFunction();
    const result = getAssessmentStatusChipProps(
      'ACTIVE',
      emptyTranslationFunction
    );

    expect(result.label).toBe('');
    expect(result.color).toBe('success');
    expect(emptyTranslationFunction).toHaveBeenCalledWith(
      'assessment.statusOptions.ACTIVE'
    );
  });

  it('should handle correctly translation function that throws error', () => {
    const errorTranslationFunction = createErrorTranslationFunction();

    expect(() =>
      getAssessmentStatusChipProps('ACTIVE', errorTranslationFunction)
    ).toThrow('Translation error');
  });

  it('should maintain immutability of color mapping', () => {
    const originalColors = { ...assessmentStateColors };
    const mockTranslationFunction = vi.fn((key: string) => `translated_${key}`);

    getAssessmentStatusChipProps('ACTIVE', mockTranslationFunction);

    expect(assessmentStateColors).toEqual(originalColors);
  });
});

describe('assessmentHelpers - performance and behavior', () => {
  const mockTranslationFunction = vi.fn((key: string) => `translated_${key}`);

  beforeEach(() => {
    mockTranslationFunction.mockClear();
  });

  it('should call translation function only once per call', () => {
    getAssessmentStatusChipProps('ACTIVE', mockTranslationFunction);
    expect(mockTranslationFunction).toHaveBeenCalledTimes(1);
  });

  it('should be deterministic - same input, same output', () => {
    const result1 = getAssessmentStatusChipProps(
      'ACTIVE',
      mockTranslationFunction
    );
    const result2 = getAssessmentStatusChipProps(
      'ACTIVE',
      mockTranslationFunction
    );
    expect(result1).toEqual(result2);
  });
});

describe('assessmentHelpers - TypeScript types', () => {
  it('AssessmentStatus should accept only valid values', () => {
    const validStatuses: Array<AssessmentStatus> = [
      'ACTIVE',
      'CLOSED',
      'CANCELLED'
    ];
    expect(validStatuses).toHaveLength(3);
  });

  it('getAssessmentStatusChipProps should return correct type', () => {
    const mockT = vi.fn((key: string) => key);
    const result = getAssessmentStatusChipProps('ACTIVE', mockT);

    expect(result).toHaveProperty('label');
    expect(result).toHaveProperty('color');
    expect(typeof result.label).toBe('string');

    const chipColor: ChipOwnProps['color'] = result.color;
    expect(chipColor).toBeDefined();
  });
});
