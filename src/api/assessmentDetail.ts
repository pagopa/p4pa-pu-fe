import { useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { assessmentsRowsDetailSchema } from '../../generated/zod-schema';

/**
 * Hook for getting the details of a specific assessment
 * @param organizationId - Organization ID
 * @param assessmentId - Assessment ID
 * @param options - Additional options for the query
 * @returns useQuery hook for executing the API call
 */
export const getAssessmentDetail = (
  organizationId: number,
  assessmentId: number,
  filters?: Record<string, unknown>,
  options: Record<string, unknown> = {}
) => {
  return useQuery({
    queryKey: ['getAssessmentDetail', organizationId, assessmentId, filters],
    queryFn: async () => {
      const { data: assessmentDetail } =
        await utils.apiClient.bff.getPagedAssessmentsDetails(
          organizationId,
          assessmentId,
          filters
        );

      if (assessmentDetail) {
        parseAndLog(assessmentsRowsDetailSchema, assessmentDetail);
      }

      return assessmentDetail;
    },
    enabled: !!organizationId && !!assessmentId,
    ...options
  });
};
