import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../../utils';
import {
  AssessmentsRegistriesFilteredRequest,
  AssessmentsFilteredRequest,
  buildQueryParams,
  buildAssessmentsQueryParams
} from './mappings';
import { parseAndLog } from '../../utils/loaders';
import { assessmentsRegistryDTOSchema } from '../../../generated/zod-schema';
import { pagedAssessmentsExtendedDTOSchema } from '../../../generated/zod-schema';

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
    mutationFn: async (args: AssessmentsFilteredRequest) => {
      const query = buildAssessmentsQueryParams(args);
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

export const getAssessmentsRegistries = ({
  organizationId
}: {
  organizationId: number;
}) =>
  useMutation({
    mutationKey: ['getTreasuries', organizationId],
    mutationFn: async (args: AssessmentsRegistriesFilteredRequest) => {
      const query = buildQueryParams(args);
      const { data: response } =
        await utils.apiClient.bff.getAssessmentsRegistries(
          organizationId,
          query,
          // repeat array params as query string
          {
            paramsSerializer: {
              indexes: null
            }
          }
        );

      return response;
    }
  });

export const getAssessmentsRegistry = (
  organizationId: number,
  assessmentRegistryId: number
) =>
  useQuery({
    queryKey: ['assessmentRegistry', assessmentRegistryId],
    queryFn: async () => {
      const { data } = await utils.apiClient.bff.getAssessmentsRegistry(
        organizationId,
        assessmentRegistryId
      );
      if (data) {
        parseAndLog(assessmentsRegistryDTOSchema, data);
      }
      return data;
    }
  });
