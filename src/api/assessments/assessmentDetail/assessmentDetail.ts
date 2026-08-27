import { useMutation } from '@tanstack/react-query';
import utils from '../../../utils';
import { parseAndLog } from '../../../utils/loaders';
import { assessmentsRowsDetailSchema } from '../../../../generated/core/zod-schema';
import { FilteredRequest } from '../../../models/Filters';
import {
  AssessmentDetailFilters,
  buildAssessmentDetailQueryParams
} from '../mappings';

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
  filters?: Record<string, unknown>
) => {
  return useMutation({
    mutationKey: ['getAssessmentDetail', organizationId, assessmentId, filters],
    mutationFn: async (args: FilteredRequest<AssessmentDetailFilters>) => {
      const query = buildAssessmentDetailQueryParams(args);
      const { data: assessmentDetail } =
        await utils.apiClient.bff.getPagedAssessmentsDetails(
          organizationId,
          assessmentId,
          query
        );
      parseAndLog(assessmentsRowsDetailSchema, assessmentDetail);
      return assessmentDetail;
    }
  });
};
