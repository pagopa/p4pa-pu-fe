import utils from '@core/utils';
import type { AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { createMock } from 'zodock';
import { OrganizationApiKeyType } from '@generated/core/client';
import {
  organizationApiKeySchema,
  pdndClientNoSecretDTOSchema,
  pdndServiceViewSchema
} from '@generated/core/zod-schema';
import {
  deleteOrganizationApiKey,
  deletePdndClient,
  getOrganizationApiKey,
  getOrganizationApiKeys,
  getPdndClients,
  getPdndServices
} from '.';
import { renderHook, waitFor } from '@core/__tests__/renderers';

const organizationId = 33;
const keyType = OrganizationApiKeyType.IO;

describe('getOrganizationApiKeys', () => {
  it('returns data correctly', async () => {
    const dataMock = [createMock(organizationApiKeySchema)];
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getOrganizationApiKeys')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => getOrganizationApiKeys(organizationId));

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(organizationId);
      expect(result.current.data).toEqual(dataMock);
    });
  });
});

describe('getOrganizationApiKey', () => {
  it('returns data correctly', async () => {
    const dataMock = createMock(organizationApiKeySchema);
    const query = { subUnitCode: 'SU1' };
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getOrganizationApiKey')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      getOrganizationApiKey(organizationId, keyType, query)
    );

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(organizationId, keyType, query);
      expect(result.current.data).toEqual(dataMock);
    });
  });
});

describe('deleteOrganizationApiKey', () => {
  it('calls the api with the key type and query', async () => {
    const query = { subUnitCode: 'SU1' };
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'deleteOrganizationApiKey')
      .mockResolvedValue({} as AxiosResponse);

    const { result } = renderHook(() =>
      deleteOrganizationApiKey(organizationId, keyType, query)
    );

    await result.current.mutateAsync();

    expect(apiMock).toHaveBeenCalledWith(organizationId, keyType, query);
  });
});

describe('getPdndServices', () => {
  it('returns data correctly', async () => {
    const dataMock = [createMock(pdndServiceViewSchema)];
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPdndServices')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => getPdndServices(organizationId));

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(organizationId);
      expect(result.current.data).toEqual(dataMock);
    });
  });
});

describe('getPdndClients', () => {
  it('returns data correctly', async () => {
    const dataMock = [createMock(pdndClientNoSecretDTOSchema)];
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPdndClientsByOrgSubUnitCode')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => getPdndClients(organizationId));

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(organizationId);
      expect(result.current.data).toEqual(dataMock);
    });
  });
});

describe('deletePdndClient', () => {
  it('calls the api with the client id', async () => {
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'deletePdndClient')
      .mockResolvedValue({} as AxiosResponse);

    const { result } = renderHook(() =>
      deletePdndClient(organizationId, 'client-c')
    );

    await result.current.mutateAsync();

    expect(apiMock).toHaveBeenCalledWith(organizationId, 'client-c');
  });
});
