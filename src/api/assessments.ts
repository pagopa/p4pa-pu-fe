import { useMutation } from '@tanstack/react-query';
import { parseAndLog } from '../utils/loaders';
import { pagedAssessmentsExtendedDTOSchema } from '../../generated/zod-schema';
import utils from '../utils';

type AssessmentsParams = Parameters<
  typeof utils.apiClient.bff.getPagedAssessmentsExtendedDto
>;
export type AssessmentsQuery = AssessmentsParams[1];

export type AssessmentsRequest = {
  organizationId: AssessmentsParams[0];
  query: AssessmentsQuery;
};

/**
 * Hook for the search of assessments
 * @param organizationId - ID of the organization
 * @returns useMutation hook for executing the search
 */
export const getAssessments = (
  organizationId: AssessmentsRequest['organizationId']
) =>
  useMutation({
    mutationKey: ['getAssessments', organizationId],
    mutationFn: async (query: AssessmentsQuery) => {
      const { data: response } =
        await utils.apiClient.bff.getPagedAssessmentsExtendedDto(
          organizationId,
          query,
          {
            paramsSerializer: {
              // repeat array params as query string
              indexes: null
            }
          }
        );

      parseAndLog(pagedAssessmentsExtendedDTOSchema, response);

      return response;
    }
  });
