import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';

import type {
  OrganizationApiKeyType,
  PdndClientDTO,
  PdndServiceRequestDTO,
  PdndServiceType
} from '@generated/core/client';
import {
  orgAndSubUnitDTOSchema,
  organizationApiKeySchema,
  pagedOrgSubUnitSchema,
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
    queryKey: ['organizationApiKey', organizationId, keyType],
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
    mutationKey: ['deleteOrganizationApiKey', organizationId, keyType],
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

type SubUnitPdndServiceFilters = {
  subUnitCode?: string;
  subUnitName?: string;
};

type getOrgSubUnitsPdndServicesRequest =
  FilteredRequest<SubUnitPdndServiceFilters>;

export const useGetOrgSubUnitsPdndServices = (organizationId: number) =>
  useMutation({
    mutationKey: ['getOrgSubUnitPdndServices', organizationId],
    mutationFn: async (request: getOrgSubUnitsPdndServicesRequest) => {
      const { data } = await utils.apiClient.bff.getOrgSubUnitsPdndServices(
        organizationId,
        {
          ...request.filters,
          ...request.pagination,
          sort: request.sort
        }
      );
      parseAndLog(pagedPdndServiceViewSchema, data);
      return data;
    }
  });

export const useDeletePdndService = (
  organizationId: number,
  serviceId: string
) =>
  useMutation({
    mutationKey: ['deletePdndService', organizationId, serviceId],
    mutationFn: async () => {
      await utils.apiClient.bff.deletePdndService(organizationId, serviceId);
    }
  });

export const useGetPdndClients = (organizationId: number) =>
  useQuery({
    queryKey: ['pdndClients', organizationId],
    queryFn: async () => {
      const { data } =
        await utils.apiClient.bff.getPdndClientsByOrgSubUnitCode(
          organizationId
        );
      parseAndLog(z.array(pdndClientNoSecretDTOSchema), data);
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
          // TODO: should not be hardcoded
          // api should return all the subUnits
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

export const useCreatePdndService = (organizationId: number) =>
  useMutation({
    mutationKey: ['createPdndService', organizationId],
    mutationFn: async ({
      data,
      subUnitCode
    }: {
      data: PdndServiceRequestDTO;
      subUnitCode?: string;
    }) => {
      const query = subUnitCode ? { subUnitCode } : undefined;
      const { data: service } = await utils.apiClient.bff.createPdndService(
        organizationId,
        data,
        query
      );
      return service;
    }
  });
