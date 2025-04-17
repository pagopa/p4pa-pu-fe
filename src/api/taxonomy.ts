import { keepPreviousData, useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import {
  taxonomyMacroAreaCodeDTOSchema,
  taxonomyServiceTypeCodeDTOSchema,
  taxonomyCollectionReasonDTOSchema,
  taxonomyCodeDTOSchema,
  taxonomyOrganizationTypeDTOSchema
} from '../../generated/zod-schema';

export const getOrganizationsTypes = () =>
  useQuery({
    queryKey: ['getOrganizations'],
    placeholderData: keepPreviousData,
    queryFn: utils.apiClient.bff.getOrganizationTypes,
    select: ({ data }) => {
      parseAndLog(taxonomyOrganizationTypeDTOSchema.array(), data);
      return data.map((org) => ({
        value: org.organizationType,
        label: org.organizationTypeDescription
      }));
    }
  });

export const getMacroAreas = (organizationType: string) =>
  useQuery({
    queryKey: ['getMacroArea', organizationType],
    placeholderData: keepPreviousData,
    queryFn: async () =>
      await utils.apiClient.bff.getMacroArea({
        organizationType
      }),
    select: ({ data }) => {
      parseAndLog(taxonomyMacroAreaCodeDTOSchema.array(), data);
      return data.map((macroArea) => ({
        value: macroArea.macroAreaCode,
        label: macroArea.macroAreaName
      }));
    }
  });

type ServiceTypeQuery = Parameters<
  typeof utils.apiClient.bff.getServiceType
>[0];
export const getServiceTypes = (query: ServiceTypeQuery) =>
  useQuery({
    queryKey: ['getServiceType', ...Object.values(query)],
    placeholderData: keepPreviousData,
    queryFn: async () => await utils.apiClient.bff.getServiceType(query),
    select: ({ data }) => {
      parseAndLog(taxonomyServiceTypeCodeDTOSchema.array(), data);
      return data.map((serviceType) => ({
        value: serviceType.serviceTypeCode,
        label: serviceType.serviceTypeDescription
      }));
    }
  });

type CollectionReasonQuery = Parameters<
  typeof utils.apiClient.bff.getCollectionReason
>[0];
export const getCollectionReasons = (query: CollectionReasonQuery) =>
  useQuery({
    queryKey: ['getCollectionReason', ...Object.values(query)],
    placeholderData: keepPreviousData,
    queryFn: async () => await utils.apiClient.bff.getCollectionReason(query),
    select: ({ data }) => {
      parseAndLog(taxonomyCollectionReasonDTOSchema.array(), data);
      return data.map(({ collectionReason }) => ({
        value: collectionReason,
        label: collectionReason
      }));
    }
  });

export type TaxonomyCodeQuery = Parameters<
  typeof utils.apiClient.bff.getTaxonomyCode
>[0];

export const getTaxonomyCode = (query: TaxonomyCodeQuery) =>
  useQuery({
    queryKey: ['getTaxonomyCode', ...Object.values(query)],
    placeholderData: keepPreviousData,
    queryFn: async () => await utils.apiClient.bff.getTaxonomyCode(query),
    select: ({ data }) => {
      parseAndLog(taxonomyCodeDTOSchema.array(), data);
      return data.map(({ taxonomyCode }) => ({
        value: taxonomyCode,
        label: taxonomyCode
      }));
    }
  });
