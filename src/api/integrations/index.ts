import { z } from 'zod';
import { skipToken, useMutation, useQuery } from '@tanstack/react-query';

import type {
  OrganizationApiKeyType,
  PdndClientDTO,
  PdndServiceRequestDTO,
  PdndServiceType,
  PdndServiceUpdateDTO,
  RequestParams
} from '@generated/core/client';
import {
  orgAndSubUnitDTOSchema,
  organizationApiKeySchema,
  pagedOrgSubUnitSchema,
  pagedPdndClientViewSchema,
  pagedPdndServiceViewSchema,
  pdndClientNoSecretDTOSchema,
  pdndServiceViewSchema
} from '@generated/core/zod-schema';

import utils from '@core/utils';
import { parseAndLog } from '@core/utils/loaders';
import type { FilteredRequest } from '@core/models/Filters';

export const useGetOrganizationApiKeys = (
  organizationId: number,
  enabled = true
) =>
  useQuery({
    queryKey: ['organizationApiKeys', organizationId],
    enabled,
    queryFn: async () => {
      const { data } =
        await utils.apiClient.bff.getOrganizationApiKeys(organizationId);
      parseAndLog(z.array(organizationApiKeySchema), data);
      return data;
    }
  });

export const useGetOrganizationApiKey = (
  organizationId: number,
  keyType: OrganizationApiKeyType,
  query?: { subUnitCode?: string }
) =>
  useQuery({
    queryKey: [
      'organizationApiKey',
      organizationId,
      keyType,
      query?.subUnitCode
    ],
    queryFn: async () => {
      const { data } = await utils.apiClient.bff.getOrganizationApiKey(
        organizationId,
        keyType,
        query
      );
      parseAndLog(organizationApiKeySchema, data);
      return data;
    }
  });

export const useDeleteOrganizationApiKey = (
  organizationId: number,
  keyType: OrganizationApiKeyType,
  query?: { subUnitCode?: string }
) =>
  useMutation({
    mutationKey: [
      'deleteOrganizationApiKey',
      organizationId,
      keyType,
      query?.subUnitCode
    ],
    mutationFn: async () => {
      await utils.apiClient.bff.deleteOrganizationApiKey(
        organizationId,
        keyType,
        query
      );
    }
  });

export const useGetPdndServices = (organizationId: number) =>
  useQuery({
    queryKey: ['pdndServices', organizationId],
    queryFn: async () => {
      const { data } =
        await utils.apiClient.bff.getPdndServices(organizationId);
      parseAndLog(z.array(pdndServiceViewSchema), data);
      return data;
    }
  });

export const useGetPdndService = (
  organizationId: number,
  purposeId?: string,
  subUnitCode?: string
) =>
  useQuery({
    queryKey: ['pdndService', organizationId, purposeId, subUnitCode],
    queryFn: purposeId
      ? async () => {
          const { data } = await utils.apiClient.bff.getPdndService(
            organizationId,
            purposeId,
            subUnitCode ? { subUnitCode } : undefined
          );
          parseAndLog(pdndServiceViewSchema, data);
          return data;
        }
      : skipToken
  });

type UpdatePdndServiceRequestParams = RequestParams & {
  query?: { subUnitCode?: string };
};

export const useUpdatePdndService = (
  organizationId: number,
  purposeId: string,
  subUnitCode?: string
) =>
  useMutation({
    mutationKey: ['updatePdndService', organizationId, purposeId, subUnitCode],
    mutationFn: async (data: PdndServiceUpdateDTO) => {
      // The generated contract does not expose the optional `subUnitCode`
      // query for this endpoint, but it must be sent for sub-unit services.
      const params: UpdatePdndServiceRequestParams | undefined = subUnitCode
        ? { query: { subUnitCode } }
        : undefined;

      const { data: service } = await utils.apiClient.bff.updatePdndService(
        organizationId,
        purposeId,
        data,
        params
      );
      return service;
    }
  });

type SubUnitPdndServiceFilters = {
  subUnitCode?: string;
  subUnitName?: string;
};

type GetOrgSubUnitsPdndServicesRequest =
  FilteredRequest<SubUnitPdndServiceFilters>;

export const useGetOrgSubUnitsPdndServices = (organizationId: number) =>
  useMutation({
    mutationKey: ['getOrgSubUnitsPdndServices', organizationId],
    mutationFn: async ({
      filters,
      pagination,
      sort
    }: GetOrgSubUnitsPdndServicesRequest) => {
      const { data } = await utils.apiClient.bff.getOrgSubUnitsPdndServices(
        organizationId,
        { ...filters, ...pagination, sort }
      );
      parseAndLog(pagedPdndServiceViewSchema, data);
      return data;
    }
  });

export const useDeletePdndService = (
  organizationId: number,
  purposeId: string,
  subUnitCode?: string
) =>
  useMutation({
    mutationKey: ['deletePdndService', organizationId, purposeId, subUnitCode],
    mutationFn: async () => {
      await utils.apiClient.bff.deletePdndService(
        organizationId,
        purposeId,
        subUnitCode ? { subUnitCode } : undefined
      );
    }
  });

export const useGetPdndClientsByOrgSubUnitCode = (
  organizationId: number,
  subUnitCode?: string
) =>
  useQuery({
    queryKey: ['getPdndClientsByOrgSubUnitCode', organizationId, subUnitCode],
    queryFn: async () => {
      const query = subUnitCode ? { orgSubUnitCode: subUnitCode } : undefined;
      const { data } = await utils.apiClient.bff.getPdndClientsByOrgSubUnitCode(
        organizationId,
        query
      );
      parseAndLog(z.array(pdndClientNoSecretDTOSchema), data);
      return data;
    }
  });

// Clients not scoped to a sub-unit belong to the organization itself.
export const useGetPdndClients = (organizationId: number) =>
  useGetPdndClientsByOrgSubUnitCode(organizationId);

export const useGetOrgSubUnitsPdndClients = (organizationId: number) =>
  useMutation({
    mutationKey: ['useGetOrgSubUnitsPdndClients', organizationId],
    mutationFn: async (request: GetOrgSubUnitsPdndServicesRequest) => {
      const { data } = await utils.apiClient.bff.getOrgSubUnitsPdndClients(
        organizationId,
        {
          ...request.filters,
          ...request.pagination,
          sort: request.sort
        }
      );
      parseAndLog(pagedPdndClientViewSchema, data);
      return data;
    }
  });

export const useDeletePdndClient = (organizationId: number, clientId: string) =>
  useMutation({
    mutationKey: ['deletePdndClient', organizationId, clientId],
    mutationFn: async () => {
      await utils.apiClient.bff.deletePdndClient(organizationId, clientId);
    }
  });

export const useSavePdndClient = (organizationId: number) =>
  useMutation({
    mutationKey: ['savePdndClient', organizationId],
    mutationFn: async (data: PdndClientDTO) => {
      const { data: client } = await utils.apiClient.bff.savePdndClient(
        organizationId,
        data
      );
      return client;
    }
  });

export const useGetAllOrgSubUnits = (organizationId: number, enabled = true) =>
  useQuery({
    queryKey: ['getAllOrgSubUnits', organizationId],
    enabled,
    queryFn: async () => {
      const { data } = await utils.apiClient.bff.getPagedOrgSubUnits(
        organizationId,
        {
          // The API has no "get all" variant, so request a large page.
          size: 100
        }
      );
      parseAndLog(pagedOrgSubUnitSchema, data);
      return data;
    }
  });

export const useGetOrgSubUnitWithNoServiceType = (
  organizationId: number,
  serviceType: PdndServiceType,
  enabled = true
) =>
  useQuery({
    queryKey: ['getOrgSubUnitWithNoServiceType', organizationId, serviceType],
    enabled,
    queryFn: async () => {
      const { data } = await utils.apiClient.bff.getOrgSubUnitWithNoServiceType(
        organizationId,
        serviceType
      );
      parseAndLog(z.array(orgAndSubUnitDTOSchema), data, false);
      return data;
    }
  });

type CreatePdndServiceParams = {
  data: PdndServiceRequestDTO;
  subUnitCode?: string;
};

export const useCreatePdndService = (organizationId: number) =>
  useMutation({
    mutationKey: ['createPdndService', organizationId],
    mutationFn: async ({ data, subUnitCode }: CreatePdndServiceParams) => {
      const query = subUnitCode ? { subUnitCode } : undefined;
      const { data: service } = await utils.apiClient.bff.createPdndService(
        organizationId,
        data,
        query
      );
      return service;
    }
  });
