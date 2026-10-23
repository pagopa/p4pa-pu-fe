import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';

import type { OrganizationApiKeyType } from '@generated/core/client';
import {
  organizationApiKeySchema,
  pagedPdndServiceViewSchema,
  pdndClientNoSecretDTOSchema,
  pdndServiceViewSchema
} from '@generated/core/zod-schema';

import utils from '@core/utils';
import { parseAndLog } from '@core/utils/loaders';
import type { FilteredRequest } from '@core/models/Filters';

export const getOrganizationApiKeys = (organizationId: number) =>
  useQuery({
    queryKey: ['organizationApiKeys', organizationId],
    queryFn: async () => {
      const { data } =
        await utils.apiClient.bff.getOrganizationApiKeys(organizationId);
      parseAndLog(z.array(organizationApiKeySchema), data);
      return data;
    }
  });

export const getOrganizationApiKey = (
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

export const deleteOrganizationApiKey = (
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

export const getPdndServices = (organizationId: number) =>
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

export const getOrgSubUnitsPdndServices = (organizationId: number) =>
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

export const deletePdndService = (organizationId: number, serviceId: string) =>
  useMutation({
    mutationKey: ['deletePdndService', organizationId, serviceId],
    mutationFn: async () => {
      await utils.apiClient.bff.deletePdndService(organizationId, serviceId);
    }
  });

export const getPdndClients = (organizationId: number) =>
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

export const deletePdndClient = (organizationId: number, clientId: string) =>
  useMutation({
    mutationKey: ['deletePdndClient', organizationId, clientId],
    mutationFn: async () => {
      await utils.apiClient.bff.deletePdndClient(organizationId, clientId);
    }
  });
