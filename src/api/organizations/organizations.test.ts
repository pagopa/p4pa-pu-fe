import utils from '../../utils';
import { act, renderHook } from '../../__tests__/renderers';
import { getOrganizationsByBrokerIdAndFilters } from './';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getOrganizationsByBrokerIdAndFilters: vi.fn()
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
          id: 1,
          name: 'Test Organization 1',
          ipaCode: 'IPA001',
          status: 'ACTIVE'
        },
        {
          id: 2,
          name: 'Test Organization 2',
          ipaCode: 'IPA002',
          status: 'ACTIVE'
        }
      ],
      size: 10,
      totalElements: 2,
      totalPages: 1,
      number: 0
    };

    const filters = {
      orgName: 'Test Organization',
      ipaCode: 'IPA001'
    };
    const pagination = { page: 0, size: 10 };
    const sort = ['name,asc'];

    mockGetOrganizationsByBrokerIdAndFilters.mockResolvedValue({
      data: mockData
    } as AxiosResponse);

    const { result } = renderHook(() => getOrganizationsByBrokerIdAndFilters());

    await act(async () => {
      const response = await result.current.mutateAsync({
        filters,
        pagination,
        sort
      });
      expect(response).toEqual(mockData);
    });

    expect(mockGetOrganizationsByBrokerIdAndFilters).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      orgName: 'Test Organization',
      ipaCode: 'IPA001',
      sort: ['name,asc']
    });
  });

  it('fetches organizations with empty filters', async () => {
    const mockData = {
      content: [
        {
          id: 1,
          name: 'All Organizations Test',
          ipaCode: 'IPA999',
          status: 'ACTIVE'
        }
      ],
      size: 20,
      totalElements: 1,
      totalPages: 1,
      number: 0
    };

    const filters = {};
    const pagination = { page: 0, size: 20 };
    const sort = ['id,desc'];

    mockGetOrganizationsByBrokerIdAndFilters.mockResolvedValue({
      data: mockData
    } as AxiosResponse);

    const { result } = renderHook(() => getOrganizationsByBrokerIdAndFilters());

    await act(async () => {
      const response = await result.current.mutateAsync({
        filters,
        pagination,
        sort
      });
      expect(response).toEqual(mockData);
    });

    expect(mockGetOrganizationsByBrokerIdAndFilters).toHaveBeenCalledWith({
      page: 0,
      size: 20,
      orgName: undefined,
      ipaCode: undefined,
      sort: ['id,desc']
    });
  });

  it('handles API error gracefully', async () => {
    const mockError = new Error('API request failed');
    const filters = { orgName: 'Test' };
    const pagination = { page: 0, size: 10 };
    const sort = ['name,asc'];

    mockGetOrganizationsByBrokerIdAndFilters.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => getOrganizationsByBrokerIdAndFilters());

    await act(async () => {
      await result.current
        .mutateAsync({
          filters,
          pagination,
          sort
        })
        .catch((error) => {
          expect(error).toBe(mockError);
        });
    });

    expect(mockGetOrganizationsByBrokerIdAndFilters).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      orgName: 'Test',
      ipaCode: undefined,
      sort: ['name,asc']
    });
  });

  it('fetches organizations with only orgName filter', async () => {
    const mockData = {
      content: [
        {
          id: 5,
          name: 'Specific Org',
          ipaCode: 'SPEC001',
          status: 'ACTIVE'
        }
      ],
      size: 10,
      totalElements: 1,
      totalPages: 1,
      number: 0
    };

    const filters = { orgName: 'Specific Org' };
    const pagination = { page: 1, size: 5 };
    const sort = ['name,desc', 'id,asc'];

    mockGetOrganizationsByBrokerIdAndFilters.mockResolvedValue({
      data: mockData
    } as AxiosResponse);

    const { result } = renderHook(() => getOrganizationsByBrokerIdAndFilters());

    await act(async () => {
      const response = await result.current.mutateAsync({
        filters,
        pagination,
        sort
      });
      expect(response).toEqual(mockData);
    });

    expect(mockGetOrganizationsByBrokerIdAndFilters).toHaveBeenCalledWith({
      page: 1,
      size: 5,
      orgName: 'Specific Org',
      ipaCode: undefined,
      sort: ['name,desc', 'id,asc']
    });
  });

  it('fetches organizations with only ipaCode filter', async () => {
    const mockData = {
      content: [
        {
          id: 3,
          name: 'IPA Specific Organization',
          ipaCode: 'UNIQUE123',
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

    await act(async () => {
      const response = await result.current.mutateAsync({
        filters: { ipaCode: 'UNIQUE123' },
        pagination: { page: 0, size: 10 },
        sort: []
      });
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
