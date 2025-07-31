import { useMutation } from '@tanstack/react-query';
import { getAssessments } from '../../../api/assessments';
import { FilterValues } from '../../../models/Filters';

type AssessmentValidationParams = {
  assessmentName: string;
  debtPositionTypeOrgCode: string;
};

type ValidationFilters = Pick<FilterValues, 'ASSESSMENT_NAME' | 'DEBT_TYPE'>;

export const useAssessmentNameValidation = (organizationId: number) => {
  const getAssessmentsMutation = getAssessments(organizationId);

  return useMutation({
    mutationKey: ['validateAssessment', organizationId],
    mutationFn: async (
      params: AssessmentValidationParams
    ): Promise<boolean> => {
      const filters: ValidationFilters = {
        ASSESSMENT_NAME: params.assessmentName,
        DEBT_TYPE: params.debtPositionTypeOrgCode
      };

      const searchParams = {
        filters: filters as FilterValues,
        pagination: { page: 0, size: 1 },
        sort: []
      };

      try {
        const response = await getAssessmentsMutation.mutateAsync(searchParams);

        return Boolean(response?.content && response.content.length > 0);
      } catch (error) {
        console.error('Error validating assessment:', error);
        return false;
      }
    }
  });
};
