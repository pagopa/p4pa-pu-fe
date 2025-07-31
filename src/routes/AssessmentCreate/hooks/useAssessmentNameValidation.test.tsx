/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { getAssessments } from '../../../api/assessments';
import { useAssessmentNameValidation } from './useAssessmentNameValidation';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { renderHook } from '../../../__tests__/renderers';

vi.mock('../../../api/assessments', () => ({
  getAssessments: vi.fn()
}));

const mockGetAssessments = getAssessments as Mock;

describe('useAssessmentNameValidation', () => {
  const mockMutateAsync = vi.fn();
  const organizationId = 123;

  const translations = {
    'errors.generic': 'Errore generico'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup(translations);

    mockGetAssessments.mockReturnValue({
      mutateAsync: mockMutateAsync
    });
  });

  describe('Hook Initialization', () => {
    it('should initialize with correct organization ID', () => {
      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      expect(result.current).toBeDefined();
      expect(mockGetAssessments).toHaveBeenCalledWith(organizationId);
    });

    it('should handle different organization IDs', () => {
      const differentOrgId = 456;

      renderHook(() => useAssessmentNameValidation(differentOrgId));

      expect(mockGetAssessments).toHaveBeenCalledWith(differentOrgId);
    });

    it('should handle undefined organization ID', () => {
      renderHook(() => useAssessmentNameValidation(undefined as any));

      expect(mockGetAssessments).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Validation Logic', () => {
    it('should return true when assessment name already exists', async () => {
      mockMutateAsync.mockResolvedValue({
        content: [
          {
            id: 1,
            assessmentName: 'Existing Assessment',
            debtPositionTypeOrgCode: 'TYPE_1'
          }
        ]
      });

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      const validationParams = {
        assessmentName: 'Existing Assessment',
        debtPositionTypeOrgCode: 'TYPE_1'
      };

      const validationResult =
        await result.current.mutateAsync(validationParams);

      expect(validationResult).toBe(true);
      expect(mockMutateAsync).toHaveBeenCalledWith({
        filters: {
          ASSESSMENT_NAME: 'Existing Assessment',
          DEBT_TYPE: 'TYPE_1'
        },
        pagination: { page: 0, size: 1 },
        sort: []
      });
    });

    it('should return false when assessment name does not exist', async () => {
      mockMutateAsync.mockResolvedValue({
        content: []
      });

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      const validationParams = {
        assessmentName: 'New Assessment',
        debtPositionTypeOrgCode: 'TYPE_1'
      };

      const validationResult =
        await result.current.mutateAsync(validationParams);

      expect(validationResult).toBe(false);
      expect(mockMutateAsync).toHaveBeenCalledWith({
        filters: {
          ASSESSMENT_NAME: 'New Assessment',
          DEBT_TYPE: 'TYPE_1'
        },
        pagination: { page: 0, size: 1 },
        sort: []
      });
    });

    it('should return false when content is null', async () => {
      mockMutateAsync.mockResolvedValue({
        content: null
      });

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      const validationParams = {
        assessmentName: 'Test Assessment',
        debtPositionTypeOrgCode: 'TYPE_1'
      };

      const validationResult =
        await result.current.mutateAsync(validationParams);

      expect(validationResult).toBe(false);
    });

    it('should return false when content is undefined', async () => {
      mockMutateAsync.mockResolvedValue({
        content: undefined
      });

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      const validationParams = {
        assessmentName: 'Test Assessment',
        debtPositionTypeOrgCode: 'TYPE_1'
      };

      const validationResult =
        await result.current.mutateAsync(validationParams);

      expect(validationResult).toBe(false);
    });

    it('should return true when multiple assessments exist', async () => {
      mockMutateAsync.mockResolvedValue({
        content: [
          {
            id: 1,
            assessmentName: 'Assessment 1',
            debtPositionTypeOrgCode: 'TYPE_1'
          },
          {
            id: 2,
            assessmentName: 'Assessment 2',
            debtPositionTypeOrgCode: 'TYPE_1'
          }
        ]
      });

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      const validationParams = {
        assessmentName: 'Assessment 1',
        debtPositionTypeOrgCode: 'TYPE_1'
      };

      const validationResult =
        await result.current.mutateAsync(validationParams);

      expect(validationResult).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return false when API call fails', async () => {
      const apiError = new Error('Network error');
      mockMutateAsync.mockRejectedValue(apiError);

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      const validationParams = {
        assessmentName: 'Test Assessment',
        debtPositionTypeOrgCode: 'TYPE_1'
      };

      const validationResult =
        await result.current.mutateAsync(validationParams);

      expect(validationResult).toBe(false);
    });

    it('should log error when API call fails', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const apiError = new Error('Database connection failed');
      mockMutateAsync.mockRejectedValue(apiError);

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      const validationParams = {
        assessmentName: 'Test Assessment',
        debtPositionTypeOrgCode: 'TYPE_1'
      };

      await result.current.mutateAsync(validationParams);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error validating assessment:',
        apiError
      );

      consoleSpy.mockRestore();
    });

    it('should handle timeout errors gracefully', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const timeoutError = new Error('Request timeout');
      mockMutateAsync.mockRejectedValue(timeoutError);

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      const validationParams = {
        assessmentName: 'Test Assessment',
        debtPositionTypeOrgCode: 'TYPE_1'
      };

      const validationResult =
        await result.current.mutateAsync(validationParams);

      expect(validationResult).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error validating assessment:',
        timeoutError
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Parameter Transformation', () => {
    it('should correctly transform parameters to filter format', async () => {
      mockMutateAsync.mockResolvedValue({ content: [] });

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      const validationParams = {
        assessmentName: 'Special Assessment Name',
        debtPositionTypeOrgCode: 'SPECIAL_TYPE'
      };

      await result.current.mutateAsync(validationParams);

      expect(mockMutateAsync).toHaveBeenCalledWith({
        filters: {
          ASSESSMENT_NAME: 'Special Assessment Name',
          DEBT_TYPE: 'SPECIAL_TYPE'
        },
        pagination: { page: 0, size: 1 },
        sort: []
      });
    });

    it('should handle empty strings in parameters', async () => {
      mockMutateAsync.mockResolvedValue({ content: [] });

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      const validationParams = {
        assessmentName: '',
        debtPositionTypeOrgCode: ''
      };

      await result.current.mutateAsync(validationParams);

      expect(mockMutateAsync).toHaveBeenCalledWith({
        filters: {
          ASSESSMENT_NAME: '',
          DEBT_TYPE: ''
        },
        pagination: { page: 0, size: 1 },
        sort: []
      });
    });

    it('should handle special characters in parameters', async () => {
      mockMutateAsync.mockResolvedValue({ content: [] });

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      const validationParams = {
        assessmentName: 'Assessment with spaces & symbols!',
        debtPositionTypeOrgCode: 'TYPE_WITH-DASH'
      };

      await result.current.mutateAsync(validationParams);

      expect(mockMutateAsync).toHaveBeenCalledWith({
        filters: {
          ASSESSMENT_NAME: 'Assessment with spaces & symbols!',
          DEBT_TYPE: 'TYPE_WITH-DASH'
        },
        pagination: { page: 0, size: 1 },
        sort: []
      });
    });

    it('should handle unicode characters in assessment name', async () => {
      mockMutateAsync.mockResolvedValue({ content: [] });

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      const validationParams = {
        assessmentName: 'Assessment con àccenti è çaratteri spéciàli',
        debtPositionTypeOrgCode: 'TYPE_1'
      };

      await result.current.mutateAsync(validationParams);

      expect(mockMutateAsync).toHaveBeenCalledWith({
        filters: {
          ASSESSMENT_NAME: 'Assessment con àccenti è çaratteri spéciàli',
          DEBT_TYPE: 'TYPE_1'
        },
        pagination: { page: 0, size: 1 },
        sort: []
      });
    });
  });

  describe('React Query Integration', () => {
    it('should be callable multiple times with different parameters', async () => {
      mockMutateAsync.mockResolvedValue({ content: [] });

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      await result.current.mutateAsync({
        assessmentName: 'First Assessment',
        debtPositionTypeOrgCode: 'TYPE_1'
      });

      await result.current.mutateAsync({
        assessmentName: 'Second Assessment',
        debtPositionTypeOrgCode: 'TYPE_2'
      });

      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
      expect(mockMutateAsync).toHaveBeenNthCalledWith(1, {
        filters: {
          ASSESSMENT_NAME: 'First Assessment',
          DEBT_TYPE: 'TYPE_1'
        },
        pagination: { page: 0, size: 1 },
        sort: []
      });
      expect(mockMutateAsync).toHaveBeenNthCalledWith(2, {
        filters: {
          ASSESSMENT_NAME: 'Second Assessment',
          DEBT_TYPE: 'TYPE_2'
        },
        pagination: { page: 0, size: 1 },
        sort: []
      });
    });

    it('should maintain separate state for different organization IDs', async () => {
      mockMutateAsync.mockResolvedValue({ content: [] });

      const { result: result1 } = renderHook(() =>
        useAssessmentNameValidation(123)
      );
      const { result: result2 } = renderHook(() =>
        useAssessmentNameValidation(456)
      );

      await result1.current.mutateAsync({
        assessmentName: 'Assessment for Org 1',
        debtPositionTypeOrgCode: 'TYPE_1'
      });

      await result2.current.mutateAsync({
        assessmentName: 'Assessment for Org 2',
        debtPositionTypeOrgCode: 'TYPE_2'
      });

      expect(mockGetAssessments).toHaveBeenCalledWith(123);
      expect(mockGetAssessments).toHaveBeenCalledWith(456);
      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle concurrent validation requests', async () => {
      mockMutateAsync.mockResolvedValue({ content: [] });

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      const promise1 = result.current.mutateAsync({
        assessmentName: 'Assessment 1',
        debtPositionTypeOrgCode: 'TYPE_1'
      });

      const promise2 = result.current.mutateAsync({
        assessmentName: 'Assessment 2',
        debtPositionTypeOrgCode: 'TYPE_2'
      });

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance Considerations', () => {
    it('should use pagination to limit results to 1', async () => {
      mockMutateAsync.mockResolvedValue({ content: [] });

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      await result.current.mutateAsync({
        assessmentName: 'Test',
        debtPositionTypeOrgCode: 'TYPE_1'
      });

      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: { page: 0, size: 1 }
        })
      );
    });

    it('should not include sorting to improve performance', async () => {
      mockMutateAsync.mockResolvedValue({ content: [] });

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      await result.current.mutateAsync({
        assessmentName: 'Test',
        debtPositionTypeOrgCode: 'TYPE_1'
      });

      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: []
        })
      );
    });

    it('should start from page 0 for efficiency', async () => {
      mockMutateAsync.mockResolvedValue({ content: [] });

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      await result.current.mutateAsync({
        assessmentName: 'Test',
        debtPositionTypeOrgCode: 'TYPE_1'
      });

      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            page: 0
          })
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed API responses', async () => {
      mockMutateAsync.mockResolvedValue({
        data: 'unexpected format'
      });

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      const validationParams = {
        assessmentName: 'Test Assessment',
        debtPositionTypeOrgCode: 'TYPE_1'
      };

      const validationResult =
        await result.current.mutateAsync(validationParams);

      expect(validationResult).toBe(false);
    });

    it('should handle API response with empty object', async () => {
      mockMutateAsync.mockResolvedValue({});

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      const validationParams = {
        assessmentName: 'Test Assessment',
        debtPositionTypeOrgCode: 'TYPE_1'
      };

      const validationResult =
        await result.current.mutateAsync(validationParams);

      expect(validationResult).toBe(false);
    });

    it('should handle null API response', async () => {
      mockMutateAsync.mockResolvedValue(null);

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      const validationParams = {
        assessmentName: 'Test Assessment',
        debtPositionTypeOrgCode: 'TYPE_1'
      };

      const validationResult =
        await result.current.mutateAsync(validationParams);

      expect(validationResult).toBe(false);
    });

    it('should handle very long assessment names', async () => {
      mockMutateAsync.mockResolvedValue({ content: [] });

      const { result } = renderHook(() =>
        useAssessmentNameValidation(organizationId)
      );

      const longName = 'A'.repeat(1000);
      const validationParams = {
        assessmentName: longName,
        debtPositionTypeOrgCode: 'TYPE_1'
      };

      await result.current.mutateAsync(validationParams);

      expect(mockMutateAsync).toHaveBeenCalledWith({
        filters: {
          ASSESSMENT_NAME: longName,
          DEBT_TYPE: 'TYPE_1'
        },
        pagination: { page: 0, size: 1 },
        sort: []
      });
    });
  });

  describe('Type Safety', () => {
    it('should handle string organization ID', async () => {
      mockMutateAsync.mockResolvedValue({ content: [] });

      const stringOrgId = '789';
      renderHook(() => useAssessmentNameValidation(stringOrgId as any));

      expect(mockGetAssessments).toHaveBeenCalledWith(stringOrgId);
    });

    it('should handle zero organization ID', async () => {
      mockMutateAsync.mockResolvedValue({ content: [] });

      renderHook(() => useAssessmentNameValidation(0));

      expect(mockGetAssessments).toHaveBeenCalledWith(0);
    });

    it('should handle negative organization ID', async () => {
      mockMutateAsync.mockResolvedValue({ content: [] });

      renderHook(() => useAssessmentNameValidation(-1));

      expect(mockGetAssessments).toHaveBeenCalledWith(-1);
    });
  });
});
