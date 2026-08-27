import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../../utils';
import {
  buildAssessmentsRegistriesQueryParams,
  buildAssessmentsQueryParams
} from './mappings';
import { parseAndLog } from '../../utils/loaders';
import {
  assessmentsRegistryDTOSchema,
  assessmentsRegistrySchema,
  assessmentsSchema,
  assessmentsDetailSchema
} from '../../../generated/core/zod-schema';
import { pagedAssessmentsExtendedDTOSchema } from '../../../generated/core/zod-schema';
import {
  AssessmentsRegistry,
  AssessmentStatus
} from '../../../generated/core/data-contracts';
import { FilteredRequest, FilterValues } from '../../models/Filters';

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
    mutationFn: async (args: FilteredRequest<FilterValues>) => {
      const query = buildAssessmentsQueryParams(args);
      const { data: response } =
        await utils.apiClient.bff.getPagedAssessmentsExtendedDto(
          organizationId,
          query
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
    mutationFn: async (args: FilteredRequest<FilterValues>) => {
      const query = buildAssessmentsRegistriesQueryParams(args);
      const { data: response } =
        await utils.apiClient.bff.getAssessmentsRegistries(
          organizationId,
          query
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
      parseAndLog(assessmentsRegistryDTOSchema, data);
      return data;
    }
  });

export const createAssessment = (organizationId: number) =>
  useMutation({
    mutationKey: ['createAssessment', organizationId],
    mutationFn: async (params: {
      assessmentName: string;
      debtPositionTypeOrgCode: string;
    }) => {
      const { data } = await utils.apiClient.bff.createAssessment(
        organizationId,
        {
          assessmentName: params.assessmentName,
          debtPositionTypeOrgCode: params.debtPositionTypeOrgCode
        }
      );
      parseAndLog(assessmentsSchema, data);
      return data;
    }
  });

export const createAssessmentsRegistry = (organizationId: number) =>
  useMutation({
    mutationKey: ['createAssessmentRegistry', organizationId],
    mutationFn: async (assessmentRegistry: AssessmentsRegistry) => {
      const { data } = await utils.apiClient.bff.createAssessmentsRegistry(
        organizationId,
        assessmentRegistry
      );
      parseAndLog(assessmentsRegistrySchema, data);
      return data;
    }
  });

export const updateAssessmentsRegistry = (
  organizationId: number,
  assessmentRegistryId: number
) =>
  useMutation({
    mutationKey: [
      'updateAssessmentRegistry',
      organizationId,
      assessmentRegistryId
    ],
    mutationFn: async (assessmentRegistry: AssessmentsRegistry) => {
      const { data } = await utils.apiClient.bff.updateAssessmentsRegistry(
        organizationId,
        assessmentRegistryId,
        assessmentRegistry
      );
      parseAndLog(assessmentsRegistrySchema, data);
      return data;
    }
  });

export const createAssessmentDetails = (
  organizationId: number,
  assessmentId: number
) =>
  useMutation({
    mutationKey: ['createAssessmentDetails', organizationId, assessmentId],
    mutationFn: async (payload: {
      assessmentRegistryId: number;
      iuds: Array<string>;
    }) => {
      const { data } = await utils.apiClient.bff.createAssessmentsDetail(
        organizationId,
        assessmentId,
        {
          assessmentRegistryId: payload.assessmentRegistryId,
          iuds: payload.iuds
        }
      );
      parseAndLog(assessmentsDetailSchema, data);
      return data;
    }
  });

export const deleteAssessmentDetails = (organizationId: number) =>
  useMutation({
    mutationKey: ['deleteAssessmentDetails', organizationId],
    mutationFn: async (assessmentDetailIds: Array<number>) => {
      const response = await utils.apiClient.bff.deleteAssessmentsDetails(
        organizationId,
        {
          assessmentDetailIds
        }
      );
      return response;
    }
  });

export const updateAssessmentsStatus = (organizationId: number) =>
  useMutation({
    mutationKey: ['updateAssessmentsStatus', organizationId],
    mutationFn: async ({
      assessmentId,
      status
    }: {
      assessmentId: number;
      status: AssessmentStatus;
    }) => {
      await utils.apiClient.bff.updateAssessmentsStatus(
        organizationId,
        assessmentId,
        {
          status
        }
      );
    }
  });

export const getOperatingYears = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['getOperatingYears'],
    queryFn: async () => {
      const { data: response } = await utils.apiClient.bff.getOperatingYears();
      return response;
    },
    enabled: options?.enabled ?? true
  });
