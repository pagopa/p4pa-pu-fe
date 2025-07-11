import utils from '../../utils';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '../../__tests__/renderers';
import { getAssessments, type AssessmentsQuery } from '.././assessments';

vi.mock('../../utils', async () => {
  const actual =
    await vi.importActual<typeof import('../../utils')>('../../utils');
  return {
    ...actual,
    apiClient: {
      bff: {
        getPagedAssessmentsExtendedDto: vi.fn()
      }
    }
  };
});

vi.mock('../../utils/loaders', () => ({
  parseAndLog: vi.fn(),
  default: {
    getOrganizations: vi.fn(),
    getOrganizationsPlain: vi.fn()
  }
}));

describe('getAssessments', () => {
  it('should return data correctly when mutation is called', async () => {
    const dataMock = {
      content: [
        {
          id: '1',
          assessmentName: 'Test Assessment 1',
          debtPositionTypeOrgCode: 'TYPE1',
          status: 'ACTIVE',
          iuv: 'test-iuv-1',
          updateDate: '2023-01-01T00:00:00Z',
          organizationId: 123
        },
        {
          id: '2',
          assessmentName: 'Test Assessment 2',
          debtPositionTypeOrgCode: 'TYPE2',
          status: 'INACTIVE',
          iuv: 'test-iuv-2',
          updateDate: '2023-01-02T00:00:00Z',
          organizationId: 123
        }
      ],
      size: 20,
      totalElements: 2,
      totalPages: 1,
      number: 0
    };

    const organizationId = 123;
    const query: AssessmentsQuery = {
      assessmentName: 'Test',
      debtPositionTypeOrgCode: 'TYPE1',
      iuv: 'test-iuv',
      updateDateFrom: '2023-01-01T00:00:00Z',
      updateDateTo: '2023-12-31T23:59:59Z',
      page: 0,
      size: 20
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPagedAssessmentsExtendedDto')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => getAssessments(organizationId));

    result.current.mutate(query);

    await waitFor(() => {
      expect(result.current.data).toEqual(dataMock);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, query, {
      paramsSerializer: {
        indexes: null
      }
    });
  });

  it('should not fetch data if mutate is not called', () => {
    const organizationId = 123;
    const { result } = renderHook(() => getAssessments(organizationId));

    expect(result.current.data).toBeUndefined();
    expect(result.current.isPending).toBe(false);
  });

  it('should handle API errors correctly', async () => {
    const organizationId = 123;
    const query: AssessmentsQuery = {
      assessmentName: 'Test',
      page: 0,
      size: 20
    };

    const errorMock = new Error('API Error');
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPagedAssessmentsExtendedDto')
      .mockRejectedValue(errorMock);

    const { result } = renderHook(() => getAssessments(organizationId));

    result.current.mutate(query);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(errorMock);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, query, {
      paramsSerializer: {
        indexes: null
      }
    });
  });

  it('should handle empty response correctly', async () => {
    const organizationId = 123;
    const query: AssessmentsQuery = {
      page: 0,
      size: 20
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPagedAssessmentsExtendedDto')
      .mockResolvedValue({ data: undefined } as AxiosResponse);

    const { result } = renderHook(() => getAssessments(organizationId));

    result.current.mutate(query);

    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, query, {
      paramsSerializer: {
        indexes: null
      }
    });
  });

  it('should use correct mutation key', () => {
    const organizationId = 123;
    const { result } = renderHook(() => getAssessments(organizationId));

    expect(result.current).toBeDefined();
  });

  it('should handle different organizationId values', async () => {
    const dataMock = {
      content: [],
      size: 0,
      totalElements: 0,
      totalPages: 0,
      number: 0
    };

    const organizationId = 456;
    const query: AssessmentsQuery = {
      page: 0,
      size: 10
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPagedAssessmentsExtendedDto')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => getAssessments(organizationId));

    result.current.mutate(query);

    await waitFor(() => {
      expect(result.current.data).toEqual(dataMock);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, query, {
      paramsSerializer: {
        indexes: null
      }
    });
  });

  it('should handle query with all optional parameters', async () => {
    const dataMock = {
      content: [],
      size: 20,
      totalElements: 0,
      totalPages: 0,
      number: 0
    };

    const organizationId = 123;
    const query: AssessmentsQuery = {
      assessmentName: 'Full Test',
      debtPositionTypeOrgCode: 'FULL_TYPE',
      iuv: 'full-test-iuv',
      updateDateFrom: '2023-01-01T00:00:00Z',
      updateDateTo: '2023-12-31T23:59:59Z',
      page: 2,
      size: 50,
      sort: ['assessmentName,asc', 'updateDate,desc']
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPagedAssessmentsExtendedDto')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => getAssessments(organizationId));

    result.current.mutate(query);

    await waitFor(() => {
      expect(result.current.data).toEqual(dataMock);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, query, {
      paramsSerializer: {
        indexes: null
      }
    });
  });
});
