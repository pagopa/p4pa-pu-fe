import { useMutation } from '@tanstack/react-query';
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
  useMutation({
    mutationKey: ['getOrganizations'],
    mutationFn: async () => {
      const { data: organizations } =
        await utils.apiClient.bff.getOrganizationTypes();
      if (organizations) {
        parseAndLog(taxonomyOrganizationTypeDTOSchema.array(), organizations);
      }
      return organizations;
    }
  });

type GetMacroAreaParams = Parameters<typeof utils.apiClient.bff.getMacroArea>;
export type GetMacroAreaQuery = NonNullable<GetMacroAreaParams[0]>;
export const getMacroArea = () =>
  useMutation({
    mutationKey: ['getMacroArea'],
    mutationFn: async (query: GetMacroAreaQuery) => {
      const { data: macroAreas } =
        await utils.apiClient.bff.getMacroArea(query);
      if (macroAreas) {
        parseAndLog(taxonomyMacroAreaCodeDTOSchema.array(), macroAreas);
      }
      return macroAreas;
    }
  });

type GetServiceTypeParams = Parameters<
  typeof utils.apiClient.bff.getServiceType
>;
export type GetServiceTypeQuery = NonNullable<GetServiceTypeParams[0]>;
export const getServiceType = () => {
  return useMutation({
    mutationKey: ['getServiceType'],
    mutationFn: async (query: GetServiceTypeQuery) => {
      const { data: serviceTypes } =
        await utils.apiClient.bff.getServiceType(query);
      if (serviceTypes) {
        parseAndLog(taxonomyServiceTypeCodeDTOSchema.array(), serviceTypes);
      }
      return serviceTypes;
    }
  });
};

type GetCollectionReasonParams = Parameters<
  typeof utils.apiClient.bff.getCollectionReason
>;
export type GetCollectionReasonQuery = NonNullable<
  GetCollectionReasonParams[0]
>;
export const getCollectionReason = () => {
  return useMutation({
    mutationKey: ['getCollectionReason'],
    mutationFn: async (query: GetCollectionReasonQuery) => {
      const { data: collectionReasons } =
        await utils.apiClient.bff.getCollectionReason(query);
      if (collectionReasons) {
        parseAndLog(
          taxonomyCollectionReasonDTOSchema.array(),
          collectionReasons
        );
      }
      return collectionReasons;
    }
  });
};

type GetTaxonomyCodeParams = Parameters<
  typeof utils.apiClient.bff.getTaxonomyCode
>;
export type GetTaxonomyCodeQuery = NonNullable<GetTaxonomyCodeParams[0]>;
export const getTaxonomyCode = () => {
  return useMutation({
    mutationKey: ['getTaxonomyCode'],
    mutationFn: async (query: GetTaxonomyCodeQuery) => {
      const { data: taxonomyCodes } =
        await utils.apiClient.bff.getTaxonomyCode(query);
      if (taxonomyCodes) {
        parseAndLog(taxonomyCodeDTOSchema.array(), taxonomyCodes);
      }
      return taxonomyCodes;
    }
  });
};
