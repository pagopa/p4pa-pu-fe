import utils from '../../utils';
import { act, renderHook, waitFor } from '../../__tests__/renderers';
import {
  getOrganizationDetail,
  getOrganizationsByBrokerIdAndFilters
} from './';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { OrganizationsFilteredRequest } from './mappings';

vi.mock('../../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getOrganizationsByBrokerIdAndFilters: vi.fn(),
        getOrganizationDetail: vi.fn()
      }
    }
  }
}));

const mockGetOrganizationsByBrokerIdAndFilters = vi.mocked(
  utils.apiClient.bff.getOrganizationsByBrokerIdAndFilters
);

describe('getOrganizationsByBrokerIdAndFilters', () => {
  it('fetches and returns organizations data with filters', async () => {
    const mockData = {
      content: [
        {
          organizationId: 1,
          orgName: 'Test Organization 1',
          ipaCode: 'IPA001',
          orgFiscalCode: '12345678901',
          debtPositionTypeOrgCount: 5,
          operatorsCount: 3,
          status: 'ACTIVE'
        },
        {
          organizationId: 2,
          orgName: 'Test Organization 2',
          ipaCode: 'IPA002',
          orgFiscalCode: '12345678902',
          debtPositionTypeOrgCount: 2,
          operatorsCount: 1,
          status: 'ACTIVE'
        }
      ],
      size: 10,
      totalElements: 2,
      totalPages: 1,
      number: 0
    };

    const request: OrganizationsFilteredRequest = {
      filters: {
        orgName: 'Test Organization',
        ipaCode: 'IPA001'
      },
      pagination: { page: 0, size: 10 },
      sort: ['orgName,asc']
    };

    mockGetOrganizationsByBrokerIdAndFilters.mockResolvedValue({
      data: mockData
    } as AxiosResponse);

    const { result } = renderHook(() => getOrganizationsByBrokerIdAndFilters());

    await act(async () => {
      const response = await result.current.mutateAsync(request);
      expect(response).toEqual(mockData);
    });

    expect(mockGetOrganizationsByBrokerIdAndFilters).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      orgName: 'Test Organization',
      ipaCode: 'IPA001',
      sort: ['orgName,asc']
    });
  });

  it('fetches organizations with empty filters', async () => {
    const mockData = {
      content: [
        {
          organizationId: 1,
          orgName: 'All Organizations Test',
          ipaCode: 'IPA999',
          orgFiscalCode: '99999999999',
          debtPositionTypeOrgCount: 1,
          operatorsCount: 1,
          status: 'ACTIVE'
        }
      ],
      size: 20,
      totalElements: 1,
      totalPages: 1,
      number: 0
    };

    const request: OrganizationsFilteredRequest = {
      filters: {},
      pagination: { page: 0, size: 20 },
      sort: ['organizationId,desc']
    };

    mockGetOrganizationsByBrokerIdAndFilters.mockResolvedValue({
      data: mockData
    } as AxiosResponse);

    const { result } = renderHook(() => getOrganizationsByBrokerIdAndFilters());

    await act(async () => {
      const response = await result.current.mutateAsync(request);
      expect(response).toEqual(mockData);
    });

    expect(mockGetOrganizationsByBrokerIdAndFilters).toHaveBeenCalledWith({
      page: 0,
      size: 20,
      orgName: undefined,
      ipaCode: undefined,
      sort: ['organizationId,desc']
    });
  });

  it('handles API error gracefully', async () => {
    const mockError = new Error('API request failed');
    const request: OrganizationsFilteredRequest = {
      filters: { orgName: 'Test' },
      pagination: { page: 0, size: 10 },
      sort: ['orgName,asc']
    };

    mockGetOrganizationsByBrokerIdAndFilters.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => getOrganizationsByBrokerIdAndFilters());

    await act(async () => {
      await result.current.mutateAsync(request).catch((error) => {
        expect(error).toBe(mockError);
      });
    });

    expect(mockGetOrganizationsByBrokerIdAndFilters).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      orgName: 'Test',
      ipaCode: undefined,
      sort: ['orgName,asc']
    });
  });

  it('fetches organizations with only orgName filter', async () => {
    const mockData = {
      content: [
        {
          organizationId: 5,
          orgName: 'Specific Org',
          ipaCode: 'SPEC001',
          orgFiscalCode: '55555555555',
          debtPositionTypeOrgCount: 10,
          operatorsCount: 2,
          status: 'ACTIVE'
        }
      ],
      size: 10,
      totalElements: 1,
      totalPages: 1,
      number: 0
    };

    const request: OrganizationsFilteredRequest = {
      filters: { orgName: 'Specific Org' },
      pagination: { page: 1, size: 5 },
      sort: ['orgName,desc', 'organizationId,asc']
    };

    mockGetOrganizationsByBrokerIdAndFilters.mockResolvedValue({
      data: mockData
    } as AxiosResponse);

    const { result } = renderHook(() => getOrganizationsByBrokerIdAndFilters());

    await act(async () => {
      const response = await result.current.mutateAsync(request);
      expect(response).toEqual(mockData);
    });

    expect(mockGetOrganizationsByBrokerIdAndFilters).toHaveBeenCalledWith({
      page: 1,
      size: 5,
      orgName: 'Specific Org',
      ipaCode: undefined,
      sort: ['orgName,desc', 'organizationId,asc']
    });
  });

  it('fetches organizations with only ipaCode filter', async () => {
    const mockData = {
      content: [
        {
          organizationId: 3,
          orgName: 'IPA Specific Organization',
          ipaCode: 'UNIQUE123',
          orgFiscalCode: '33333333333',
          debtPositionTypeOrgCount: 7,
          operatorsCount: 4,
          status: 'ACTIVE'
        }
      ],
      size: 10,
      totalElements: 1,
      totalPages: 1,
      number: 0
    };

    mockGetOrganizationsByBrokerIdAndFilters.mockResolvedValue({
      data: mockData
    } as AxiosResponse);

    const { result } = renderHook(() => getOrganizationsByBrokerIdAndFilters());

    const request: OrganizationsFilteredRequest = {
      filters: { ipaCode: 'UNIQUE123' },
      pagination: { page: 0, size: 10 },
      sort: []
    };

    await act(async () => {
      const response = await result.current.mutateAsync(request);
      expect(response).toEqual(mockData);
    });

    expect(mockGetOrganizationsByBrokerIdAndFilters).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      orgName: undefined,
      ipaCode: 'UNIQUE123',
      sort: []
    });
  });
});

describe('getOrganizationDetail', () => {
  it('returns data correctly', async () => {
    const dataMock = {
      organizationId: 33,
      flagTreasury: false,
      ipaCode: 'IPA_TEST',
      orgFiscalCode: '99999999990',
      orgName: 'Ente P4PA intermediato 1',
      orgTypeCode: '03',
      orgEmail: 'enteditest@email.it',
      iban: 'IT111',
      segregationCode: '00',
      orgLogo: '',
      status: 'ACTIVE',
      additionalLanguage: 'EN',
      startDate: '2024-12-19',
      brokerId: 1,
      ioApiKey: '111',
      flagNotifyIo: true,
      flagNotifyOutcomePush: false,
      flagPaymentNotification: false,
      pdndEnabled: false
    };

    const params = { organizationId: 33 };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getOrganizationDetail')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      getOrganizationDetail(params.organizationId)
    );

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(params.organizationId);
      expect(result.current.data).toEqual(dataMock);
    });
  });
});
