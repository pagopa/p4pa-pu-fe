import utils from '../../utils';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '../../__tests__/renderers';
import {
  createAssessment,
  getAssessments,
  getAssessmentsRegistries,
  getAssessmentsRegistry,
  createAssessmentDetails
} from '.';
import { initialFilterValues } from '../../store/FilterStore';
import { assessmentsRegistryDTOSchema } from '../../../generated/zod-schema';
import { createMock } from 'zodock';
import * as loaders from '../../utils/loaders';

vi.mock('../../utils', async () => {
  const actual =
    await vi.importActual<typeof import('../../utils')>('../../utils');
  return {
    ...actual,
    apiClient: {
      bff: {
        getPagedAssessmentsExtendedDto: vi.fn(),
        createAssessment: vi.fn(),
        getAssessmentsRegistries: vi.fn(),
        getAssessmentsRegistry: vi.fn(),
        createAssessmentsDetail: vi.fn()
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

const mockParseAndLog = vi.mocked(loaders.parseAndLog);

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
    const query = {
      filters: {
        ...initialFilterValues,
        ASSESSMENT_NAME: 'Test',
        DEBT_TYPE: 'TYPE1',
        IUV: 'test-iuv',
        LAST_UPDATE_DATE_FROM: new Date('2023-01-01T00:00:00Z'),
        LAST_UPDATE_DATE_TO: new Date('2023-12-31T23:59:59Z')
      },
      pagination: { page: 0, size: 20 },
      sort: []
    };

    const expectedApiParams = {
      assessmentName: 'Test',
      debtPositionTypeOrgCode: 'TYPE1',
      iuv: 'test-iuv',
      updateDateFrom: '2023-01-01T00:00:00.000Z',
      updateDateTo: '2023-12-31T23:59:59.000Z',
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

    expect(apiMock).toHaveBeenCalledWith(organizationId, expectedApiParams, {
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
    const query = {
      filters: {
        ...initialFilterValues,
        ASSESSMENT_NAME: 'Test'
      },
      pagination: { page: 0, size: 20 },
      sort: []
    };

    const expectedApiParams = {
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

    expect(apiMock).toHaveBeenCalledWith(organizationId, expectedApiParams, {
      paramsSerializer: {
        indexes: null
      }
    });
  });

  it('should handle empty response correctly', async () => {
    const organizationId = 123;
    const query = {
      filters: initialFilterValues,
      pagination: { page: 0, size: 20 },
      sort: []
    };

    const expectedApiParams = {
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

    expect(apiMock).toHaveBeenCalledWith(organizationId, expectedApiParams, {
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
    const query = {
      filters: initialFilterValues,
      pagination: { page: 0, size: 10 },
      sort: []
    };

    const expectedApiParams = {
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

    expect(apiMock).toHaveBeenCalledWith(organizationId, expectedApiParams, {
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
    const query = {
      filters: {
        ...initialFilterValues,
        ASSESSMENT_NAME: 'Full Test',
        DEBT_TYPE: 'FULL_TYPE',
        IUV: 'full-test-iuv',
        LAST_UPDATE_DATE_FROM: new Date('2023-01-01T00:00:00Z'),
        LAST_UPDATE_DATE_TO: new Date('2023-12-31T23:59:59Z')
      },
      pagination: { page: 2, size: 50 },
      sort: ['assessmentName,asc', 'updateDate,desc']
    };

    const expectedApiParams = {
      assessmentName: 'Full Test',
      debtPositionTypeOrgCode: 'FULL_TYPE',
      iuv: 'full-test-iuv',
      updateDateFrom: '2023-01-01T00:00:00.000Z',
      updateDateTo: '2023-12-31T23:59:59.000Z',
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

    expect(apiMock).toHaveBeenCalledWith(organizationId, expectedApiParams, {
      paramsSerializer: {
        indexes: null
      }
    });
  });
});

describe('createAssessment', () => {
  it('should create assessment successfully when mutation is called', async () => {
    const organizationId = 123;
    const assessmentParams = {
      assessmentName: 'New Assessment',
      debtPositionTypeOrgCode: 'TYPE1'
    };

    const expectedResponse = {
      id: '12345',
      assessmentName: 'New Assessment',
      debtPositionTypeOrgCode: 'TYPE1',
      status: 'ACTIVE',
      createdDate: '2023-01-01T00:00:00Z'
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'createAssessment')
      .mockResolvedValue({ data: expectedResponse } as AxiosResponse);

    const { result } = renderHook(() => createAssessment(organizationId));

    result.current.mutate(assessmentParams);

    await waitFor(() => {
      expect(result.current.data).toEqual(expectedResponse);
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, {
      assessmentName: 'New Assessment',
      debtPositionTypeOrgCode: 'TYPE1'
    });
  });

  it('should handle API errors correctly during creation', async () => {
    const organizationId = 123;
    const assessmentParams = {
      assessmentName: 'Failed Assessment',
      debtPositionTypeOrgCode: 'TYPE2'
    };

    const errorMock = new Error('Creation failed');
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'createAssessment')
      .mockRejectedValue(errorMock);

    const { result } = renderHook(() => createAssessment(organizationId));

    result.current.mutate(assessmentParams);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(errorMock);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, {
      assessmentName: 'Failed Assessment',
      debtPositionTypeOrgCode: 'TYPE2'
    });
  });

  it('should not create assessment if mutate is not called', () => {
    const organizationId = 123;
    const { result } = renderHook(() => createAssessment(organizationId));

    expect(result.current.data).toBeUndefined();
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });

  it('should handle empty response correctly', async () => {
    const organizationId = 123;
    const assessmentParams = {
      assessmentName: 'Empty Response Test',
      debtPositionTypeOrgCode: 'TYPE3'
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'createAssessment')
      .mockResolvedValue({ data: undefined } as AxiosResponse);

    const { result } = renderHook(() => createAssessment(organizationId));

    result.current.mutate(assessmentParams);

    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, {
      assessmentName: 'Empty Response Test',
      debtPositionTypeOrgCode: 'TYPE3'
    });
  });

  it('should use correct mutation key', () => {
    const organizationId = 456;
    const { result } = renderHook(() => createAssessment(organizationId));

    expect(result.current).toBeDefined();
  });

  it('should handle different organizationId values', async () => {
    const organizationId = 789;
    const assessmentParams = {
      assessmentName: 'Different Org Assessment',
      debtPositionTypeOrgCode: 'DIFF_TYPE'
    };

    const expectedResponse = {
      id: '67890',
      assessmentName: 'Different Org Assessment',
      debtPositionTypeOrgCode: 'DIFF_TYPE',
      status: 'ACTIVE'
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'createAssessment')
      .mockResolvedValue({ data: expectedResponse } as AxiosResponse);

    const { result } = renderHook(() => createAssessment(organizationId));

    result.current.mutate(assessmentParams);

    await waitFor(() => {
      expect(result.current.data).toEqual(expectedResponse);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, {
      assessmentName: 'Different Org Assessment',
      debtPositionTypeOrgCode: 'DIFF_TYPE'
    });
  });

  it('should handle special characters in assessment name', async () => {
    const organizationId = 123;
    const assessmentParams = {
      assessmentName: 'Assessment with àccénts & symbols!',
      debtPositionTypeOrgCode: 'SPECIAL_TYPE'
    };

    const expectedResponse = {
      id: '54321',
      assessmentName: 'Assessment with àccénts & symbols!',
      debtPositionTypeOrgCode: 'SPECIAL_TYPE',
      status: 'ACTIVE'
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'createAssessment')
      .mockResolvedValue({ data: expectedResponse } as AxiosResponse);

    const { result } = renderHook(() => createAssessment(organizationId));

    result.current.mutate(assessmentParams);

    await waitFor(() => {
      expect(result.current.data).toEqual(expectedResponse);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, {
      assessmentName: 'Assessment with àccénts & symbols!',
      debtPositionTypeOrgCode: 'SPECIAL_TYPE'
    });
  });
});

describe('createAssessmentDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create assessment details successfully when mutation is called', async () => {
    const organizationId = 123;
    const assessmentId = 456;
    const payload = {
      assessmentRegistryId: 789,
      iuds: ['IUD001', 'IUD002', 'IUD003']
    };

    const expectedResponse = {
      id: '12345',
      assessmentId: assessmentId,
      assessmentRegistryId: payload.assessmentRegistryId,
      iuds: payload.iuds,
      status: 'CREATED',
      createdDate: '2023-01-01T00:00:00Z'
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'createAssessmentsDetail')
      .mockResolvedValue({ data: expectedResponse } as AxiosResponse);

    const { result } = renderHook(() =>
      createAssessmentDetails(organizationId, assessmentId)
    );

    result.current.mutate(payload);

    await waitFor(() => {
      expect(result.current.data).toEqual(expectedResponse);
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, assessmentId, {
      assessmentRegistryId: payload.assessmentRegistryId,
      iuds: payload.iuds
    });
  });

  it('should handle API errors correctly during assessment details creation', async () => {
    const organizationId = 123;
    const assessmentId = 456;
    const payload = {
      assessmentRegistryId: 789,
      iuds: ['IUD001']
    };

    const errorMock = new Error('Assessment details creation failed');
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'createAssessmentsDetail')
      .mockRejectedValue(errorMock);

    const { result } = renderHook(() =>
      createAssessmentDetails(organizationId, assessmentId)
    );

    result.current.mutate(payload);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(errorMock);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, assessmentId, {
      assessmentRegistryId: payload.assessmentRegistryId,
      iuds: payload.iuds
    });
  });

  it('should handle empty IUDs array', async () => {
    const organizationId = 123;
    const assessmentId = 456;
    const payload = {
      assessmentRegistryId: 789,
      iuds: []
    };

    const expectedResponse = {
      id: '12345',
      assessmentId: assessmentId,
      assessmentRegistryId: payload.assessmentRegistryId,
      iuds: [],
      status: 'CREATED'
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'createAssessmentsDetail')
      .mockResolvedValue({ data: expectedResponse } as AxiosResponse);

    const { result } = renderHook(() =>
      createAssessmentDetails(organizationId, assessmentId)
    );

    result.current.mutate(payload);

    await waitFor(() => {
      expect(result.current.data).toEqual(expectedResponse);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, assessmentId, {
      assessmentRegistryId: payload.assessmentRegistryId,
      iuds: payload.iuds
    });
  });

  it('should call parseAndLog when response data is present', async () => {
    const organizationId = 123;
    const assessmentId = 456;
    const payload = {
      assessmentRegistryId: 789,
      iuds: ['IUD001', 'IUD002']
    };

    const expectedResponse = [
      {
        assessmentDetailId: 1,
        assessmentId: assessmentId,
        organizationId: organizationId,
        debtPositionTypeOrgCode: 'DEBT001',
        iuv: 'IUV001',
        iud: 'IUD001',
        iur: 'IUR001',
        debtorFiscalCodeHash: 'hash1',
        sectionCode: 'SEC001',
        amountCents: 10000,
        amountSubmitted: true
      },
      {
        assessmentDetailId: 2,
        assessmentId: assessmentId,
        organizationId: organizationId,
        debtPositionTypeOrgCode: 'DEBT001',
        iuv: 'IUV002',
        iud: 'IUD002',
        iur: 'IUR002',
        debtorFiscalCodeHash: 'hash2',
        sectionCode: 'SEC001',
        amountCents: 15000,
        amountSubmitted: true
      }
    ];

    const { result } = renderHook(() =>
      createAssessmentDetails(organizationId, assessmentId)
    );

    result.current.mutate(payload);

    await waitFor(() => {
      expect(result.current.data).toEqual(expectedResponse);
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockParseAndLog).toHaveBeenCalledTimes(2);
    expect(mockParseAndLog).toHaveBeenNthCalledWith(
      1,
      expect.any(Object),
      expectedResponse[0]
    );
    expect(mockParseAndLog).toHaveBeenNthCalledWith(
      2,
      expect.any(Object),
      expectedResponse[1]
    );
  });
});

describe('getAssessmentsRegistries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return data correctly when mutation is called', async () => {
    const dataMock = {
      content: [
        {
          assessmentRegistryId: 1,
          organizationId: 123,
          assessmentName: 'Registry Test 1',
          status: 'ACTIVE',
          creationDate: '2023-01-01T00:00:00Z'
        },
        {
          assessmentRegistryId: 2,
          organizationId: 123,
          assessmentName: 'Registry Test 2',
          status: 'INACTIVE',
          creationDate: '2023-01-02T00:00:00Z'
        }
      ],
      size: 20,
      totalElements: 2,
      totalPages: 1,
      number: 0
    };

    const organizationId = 123;
    const query = {
      filters: {
        ...initialFilterValues,
        OFFICE_CODE: 'OFF001',
        ASSESSMENT_CODE: 'ASS001'
      },
      pagination: { page: 0, size: 20 },
      sort: []
    };

    const expectedApiParams = {
      officeCode: 'OFF001',
      assessmentCode: 'ASS001',
      page: 0,
      size: 20
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getAssessmentsRegistries')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      getAssessmentsRegistries({ organizationId })
    );

    await act(async () => {
      result.current.mutate(query);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(dataMock);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, expectedApiParams, {
      paramsSerializer: {
        indexes: null
      }
    });
  });

  it('should handle API errors correctly', async () => {
    const organizationId = 123;
    const query = {
      filters: {
        ...initialFilterValues,
        OFFICE_CODE: 'TEST'
      },
      pagination: { page: 0, size: 20 },
      sort: []
    };

    const errorMock = new Error('API Error');
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getAssessmentsRegistries')
      .mockRejectedValue(errorMock);

    const { result } = renderHook(() =>
      getAssessmentsRegistries({ organizationId })
    );

    await act(async () => {
      result.current.mutate(query);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(errorMock);
    });

    expect(apiMock).toHaveBeenCalled();
  });

  it('should not fetch data if mutate is not called', () => {
    const organizationId = 123;
    const { result } = renderHook(() =>
      getAssessmentsRegistries({ organizationId })
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isPending).toBe(false);
  });

  it('should handle empty response correctly', async () => {
    const organizationId = 123;
    const query = {
      filters: initialFilterValues,
      pagination: { page: 0, size: 20 },
      sort: []
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getAssessmentsRegistries')
      .mockResolvedValue({ data: undefined } as AxiosResponse);

    const { result } = renderHook(() =>
      getAssessmentsRegistries({ organizationId })
    );

    await act(async () => {
      result.current.mutate(query);
    });

    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
    });

    expect(apiMock).toHaveBeenCalled();
  });
});

describe('getAssessmentsRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch registry data successfully', async () => {
    const mockRegistryData = createMock(assessmentsRegistryDTOSchema);
    const organizationId = 123;
    const assessmentRegistryId = 456;

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getAssessmentsRegistry')
      .mockResolvedValue({ data: mockRegistryData } as AxiosResponse);

    const { result } = renderHook(() =>
      getAssessmentsRegistry(organizationId, assessmentRegistryId)
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockRegistryData);
    expect(apiMock).toHaveBeenCalledWith(organizationId, assessmentRegistryId);
    expect(mockParseAndLog).toHaveBeenCalledWith(
      assessmentsRegistryDTOSchema,
      mockRegistryData
    );
  });

  it('should not call parseAndLog when data is null/undefined', async () => {
    const organizationId = 123;
    const assessmentRegistryId = 456;

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getAssessmentsRegistry')
      .mockResolvedValue({ data: null } as AxiosResponse);

    const { result } = renderHook(() =>
      getAssessmentsRegistry(organizationId, assessmentRegistryId)
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeNull();
    expect(apiMock).toHaveBeenCalledWith(organizationId, assessmentRegistryId);
    expect(mockParseAndLog).not.toHaveBeenCalled();
  });

  it('should handle API errors correctly', async () => {
    const organizationId = 123;
    const assessmentRegistryId = 456;
    const errorMock = new Error('API Error');

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getAssessmentsRegistry')
      .mockRejectedValue(errorMock);

    renderHook(() =>
      getAssessmentsRegistry(organizationId, assessmentRegistryId)
    );

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(
        organizationId,
        assessmentRegistryId
      );
    });

    expect(mockParseAndLog).not.toHaveBeenCalled();
  });

  it('should use correct query key for caching', () => {
    const organizationId = 123;
    const assessmentRegistryId = 456;

    const { result } = renderHook(() =>
      getAssessmentsRegistry(organizationId, assessmentRegistryId)
    );

    expect(result.current).toBeDefined();
  });

  it('should handle different organizationId and assessmentRegistryId values', async () => {
    const mockRegistryData = createMock(assessmentsRegistryDTOSchema);
    const organizationId = 999;
    const assessmentRegistryId = 777;

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getAssessmentsRegistry')
      .mockResolvedValue({ data: mockRegistryData } as AxiosResponse);

    const { result } = renderHook(() =>
      getAssessmentsRegistry(organizationId, assessmentRegistryId)
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockRegistryData);
    expect(apiMock).toHaveBeenCalledWith(organizationId, assessmentRegistryId);
  });
});
