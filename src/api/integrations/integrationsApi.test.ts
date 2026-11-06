import utils from '@core/utils';
import type { AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { createMock } from 'zodock';
import {
  OrganizationApiKeyType,
  PdndServiceType
} from '@generated/core/client';
import type {
  PdndClientDTO,
  PdndServiceRequestDTO
} from '@generated/core/client';
import {
  orgAndSubUnitDTOSchema,
  organizationApiKeySchema,
  pagedOrgSubUnitSchema,
  pagedPdndServiceViewSchema,
  pdndClientNoSecretDTOSchema,
  pdndServiceViewSchema
} from '@generated/core/zod-schema';
import {
  useCreatePdndService,
  useDeleteOrganizationApiKey,
  useDeletePdndClient,
  useDeletePdndService,
  useGetAllOrgSubUnits,
  useGetOrgSubUnitWithNoServiceType,
  useGetOrgSubUnitsPdndServices,
  useGetOrganizationApiKey,
  useGetOrganizationApiKeys,
  useGetPdndClients,
  useGetPdndClientsByOrgSubUnitCode,
  useGetPdndServices,
  useSavePdndClient
} from '.';
import { renderHook, waitFor } from '@core/__tests__/renderers';

const organizationId = 33;
const keyType = OrganizationApiKeyType.IO;

describe('getOrganizationApiKeys', () => {
  it('does not fetch when disabled', () => {
    const apiMock = vi.spyOn(utils.apiClient.bff, 'getOrganizationApiKeys');
    const { result } = renderHook(() =>
      useGetOrganizationApiKeys(organizationId, false)
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(apiMock).not.toHaveBeenCalled();
  });

  it('returns data correctly', async () => {
    const dataMock = [createMock(organizationApiKeySchema)];
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getOrganizationApiKeys')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      useGetOrganizationApiKeys(organizationId)
    );

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
      useGetOrganizationApiKey(organizationId, keyType, query)
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
      useDeleteOrganizationApiKey(organizationId, keyType, query)
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

    const { result } = renderHook(() => useGetPdndServices(organizationId));

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(organizationId);
      expect(result.current.data).toEqual(dataMock);
    });
  });
});

describe('getOrgSubUnitsPdndServices', () => {
  it('passes filters, pagination, and sorting and returns the paged services', async () => {
    const request = {
      filters: { subUnitCode: 'SU1', subUnitName: 'Sub unit one' },
      pagination: { page: 2, size: 10 },
      sort: ['serviceName,asc']
    };
    const dataMock = createMock(pagedPdndServiceViewSchema);
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getOrgSubUnitsPdndServices')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      useGetOrgSubUnitsPdndServices(organizationId)
    );

    const services = await result.current.mutateAsync(request);

    expect(apiMock).toHaveBeenCalledWith(organizationId, {
      ...request.filters,
      ...request.pagination,
      sort: request.sort
    });
    expect(services).toEqual(dataMock);
  });
});

describe('deletePdndService', () => {
  it('calls the api with the service id', async () => {
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'deletePdndService')
      .mockResolvedValue({} as AxiosResponse);

    const { result } = renderHook(() =>
      useDeletePdndService(organizationId, 'service-1')
    );

    await result.current.mutateAsync();

    expect(apiMock).toHaveBeenCalledWith(organizationId, 'service-1');
  });
});

describe('getPdndClients', () => {
  it('returns data correctly', async () => {
    const dataMock = [createMock(pdndClientNoSecretDTOSchema)];
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPdndClientsByOrgSubUnitCode')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => useGetPdndClients(organizationId));

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(organizationId);
      expect(result.current.data).toEqual(dataMock);
    });
  });
});

describe('savePdndClient', () => {
  it('saves the client and returns the API response', async () => {
    const request: PdndClientDTO = {
      organizationId,
      clientName: 'Client one',
      clientId: 'client-1',
      kid: 'key-1',
      publicKey: 'public-key',
      privateKey: 'private-key'
    };
    const response = createMock(pdndClientNoSecretDTOSchema);
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'savePdndClient')
      .mockResolvedValue({ data: response } as AxiosResponse);

    const { result } = renderHook(() => useSavePdndClient(organizationId));
    const savedClient = await result.current.mutateAsync(request);

    expect(apiMock).toHaveBeenCalledWith(organizationId, request);
    expect(savedClient).toEqual(response);
  });
});

describe('getAllOrgSubUnits', () => {
  it('does not fetch when disabled', () => {
    const apiMock = vi.spyOn(utils.apiClient.bff, 'getPagedOrgSubUnits');
    const { result } = renderHook(() =>
      useGetAllOrgSubUnits(organizationId, false)
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(apiMock).not.toHaveBeenCalled();
  });

  it('requests the first 100 sub-units and returns the page', async () => {
    const dataMock = createMock(pagedOrgSubUnitSchema);
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPagedOrgSubUnits')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => useGetAllOrgSubUnits(organizationId));

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(organizationId, { size: 100 });
      expect(result.current.data).toEqual(dataMock);
    });
  });
});

describe('getOrgSubUnitWithNoServiceType', () => {
  it('does not fetch when disabled', () => {
    const apiMock = vi.spyOn(
      utils.apiClient.bff,
      'getOrgSubUnitWithNoServiceType'
    );
    const { result } = renderHook(() =>
      useGetOrgSubUnitWithNoServiceType(
        organizationId,
        PdndServiceType.SEND,
        false
      )
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(apiMock).not.toHaveBeenCalled();
  });

  it('returns sub-units without the requested service type', async () => {
    const dataMock = [createMock(orgAndSubUnitDTOSchema)];
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getOrgSubUnitWithNoServiceType')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      useGetOrgSubUnitWithNoServiceType(organizationId, PdndServiceType.SEND)
    );

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(
        organizationId,
        PdndServiceType.SEND
      );
      expect(result.current.data).toEqual(dataMock);
    });
  });
});

describe('getPdndClientsByOrgSubUnitCode', () => {
  it.each([
    { subUnitCode: undefined, expectedQuery: undefined },
    {
      subUnitCode: 'SU1',
      expectedQuery: { orgSubUnitCode: 'SU1' }
    }
  ])(
    'passes the expected sub-unit query for $subUnitCode',
    async ({ subUnitCode, expectedQuery }) => {
      const dataMock = [createMock(pdndClientNoSecretDTOSchema)];
      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getPdndClientsByOrgSubUnitCode')
        .mockResolvedValue({ data: dataMock } as AxiosResponse);

      const { result } = renderHook(() =>
        useGetPdndClientsByOrgSubUnitCode(organizationId, subUnitCode)
      );

      await waitFor(() => {
        expect(apiMock).toHaveBeenCalledWith(organizationId, expectedQuery);
        expect(result.current.data).toEqual(dataMock);
      });
    }
  );
});

describe('createPdndService', () => {
  const request: PdndServiceRequestDTO = {
    purposeId: 'purpose-1',
    serviceName: 'Service one',
    serviceType: PdndServiceType.SEND,
    clientId: 'client-1'
  };

  it('creates an organization service and returns the API response', async () => {
    const response = createMock(pdndServiceViewSchema);
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'createPdndService')
      .mockResolvedValue({ data: response } as AxiosResponse);

    const { result } = renderHook(() => useCreatePdndService(organizationId));
    const createdService = await result.current.mutateAsync({
      data: request
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, request, undefined);
    expect(createdService).toEqual(response);
  });

  it('creates a sub-unit service with the sub-unit query and returns the API response', async () => {
    const response = createMock(pdndServiceViewSchema);
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'createPdndService')
      .mockResolvedValue({ data: response } as AxiosResponse);

    const { result } = renderHook(() => useCreatePdndService(organizationId));
    const createdService = await result.current.mutateAsync({
      data: request,
      subUnitCode: 'SU1'
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, request, {
      subUnitCode: 'SU1'
    });
    expect(createdService).toEqual(response);
  });
});

describe('deletePdndClient', () => {
  it('calls the api with the client id', async () => {
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'deletePdndClient')
      .mockResolvedValue({} as AxiosResponse);

    const { result } = renderHook(() =>
      useDeletePdndClient(organizationId, 'client-c')
    );

    await result.current.mutateAsync();

    expect(apiMock).toHaveBeenCalledWith(organizationId, 'client-c');
  });
});
