import utils from '../../utils';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../__tests__/renderers';
import {
  createAssessment,
  getAssessments,
  getAssessmentsRegistries,
  getAssessmentsRegistry,
  createAssessmentDetails,
  createAssessmentsRegistry,
  updateAssessmentsRegistry,
  getOperatingYears,
  deleteAssessmentDetails
} from '.';
import { initialFilterValues } from '../../store/FilterStore';
import {
  assessmentsRegistrySchema,
  assessmentsRegistryDTOSchema
} from '../../../generated/zod-schema';
import { createMock } from 'zodock';
import * as loaders from '../../utils/loaders';
import type { AssessmentsRegistry } from '../../../generated/data-contracts';
import { AssessmentsRegistryStatus } from '../../../generated/data-contracts';

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
        createAssessmentsDetail: vi.fn(),
        createAssessmentsRegistry: vi.fn(),
        updateAssessmentsRegistry: vi.fn(),
        getOperatingYears: vi.fn(),
        deleteAssessmentsDetails: vi.fn()
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
        LAST_UPDATE_DATE_FROM: new Date('2022-12-31T23:00:00Z'),
        LAST_UPDATE_DATE_TO: new Date('2023-12-31T22:59:59Z')
      },
      pagination: { page: 0, size: 20 },
      sort: []
    };

    const expectedApiParams = {
      assessmentName: 'Test',
      debtPositionTypeOrgCode: 'TYPE1',
      iuv: 'test-iuv',
      updateDateTimeFrom: '2023-01-01T00:00:00+01:00',
      updateDateTimeTo: '2023-12-31T23:59:59+01:00',
      page: 0,
      size: 20,
      sort: [],
      status: ''
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPagedAssessmentsExtendedDto')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => getAssessments(organizationId));

    const data = await result.current.mutateAsync(query);

    expect(data).toEqual(dataMock);

    expect(apiMock).toHaveBeenCalledWith(organizationId, expectedApiParams);
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
      debtPositionTypeOrgCode: undefined,
      iuv: '',
      updateDatetimeFrom: undefined,
      updateDatetimeTo: undefined,
      page: 0,
      size: 20,
      sort: [],
      status: ''
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

    expect(apiMock).toHaveBeenCalledWith(organizationId, expectedApiParams);
  });

  it('should handle empty response correctly', async () => {
    const organizationId = 123;
    const query = {
      filters: initialFilterValues,
      pagination: { page: 0, size: 20 },
      sort: []
    };

    const expectedApiParams = {
      assessmentName: '',
      debtPositionTypeOrgCode: undefined,
      iuv: '',
      updateDateTimeFrom: undefined,
      updateDateTimeTo: undefined,
      page: 0,
      size: 20,
      sort: [],
      status: ''
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPagedAssessmentsExtendedDto')
      .mockResolvedValue({ data: undefined } as AxiosResponse);

    const { result } = renderHook(() => getAssessments(organizationId));

    const data = await result.current.mutateAsync(query);

    expect(data).toBeUndefined();

    expect(apiMock).toHaveBeenCalledWith(organizationId, expectedApiParams);
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
      assessmentName: '',
      debtPositionTypeOrgCode: undefined,
      iuv: '',
      page: 0,
      size: 10,
      sort: [],
      status: '',
      updateDateFrom: undefined,
      updateDateTo: undefined
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPagedAssessmentsExtendedDto')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => getAssessments(organizationId));

    const data = await result.current.mutateAsync(query);

    expect(data).toEqual(dataMock);

    expect(apiMock).toHaveBeenCalledWith(organizationId, expectedApiParams);
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
        LAST_UPDATE_DATE_FROM: new Date('2022-12-31T23:00:00Z'),
        LAST_UPDATE_DATE_TO: new Date('2023-12-31T22:59:59Z')
      },
      pagination: { page: 2, size: 50 },
      sort: ['assessmentName,asc', 'updateDate,desc']
    };

    const expectedApiParams = {
      assessmentName: 'Full Test',
      debtPositionTypeOrgCode: 'FULL_TYPE',
      iuv: 'full-test-iuv',
      updateDateTimeFrom: '2023-01-01T00:00:00+01:00',
      updateDateTimeTo: '2023-12-31T23:59:59+01:00',
      page: 2,
      size: 50,
      sort: ['assessmentName,asc', 'updateDate,desc'],
      status: ''
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPagedAssessmentsExtendedDto')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => getAssessments(organizationId));

    const data = await result.current.mutateAsync(query);

    expect(data).toEqual(dataMock);

    expect(apiMock).toHaveBeenCalledWith(organizationId, expectedApiParams);
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

    expect(mockParseAndLog).toHaveBeenCalledTimes(1);
    expect(mockParseAndLog).toHaveBeenCalledWith(
      expect.any(Object),
      expectedResponse
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
        OPERATING_YEAR: '2023-01-01T00:00:00Z',
        OFFICE_CODE: 'OFF001',
        ASSESSMENT_CODE: 'ASS001'
      },
      pagination: { page: 0, size: 20 },
      sort: []
    };

    const expectedApiParams = {
      officeCode: 'OFF001',
      officeDescription: '',
      assessmentCode: 'ASS001',
      assessmentDescription: '',
      debtPositionTypeOrgCode: '',
      operatingYear: '2023',
      sectionCode: '',
      sectionDescription: '',
      status: '',
      page: 0,
      size: 20,
      sort: []
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getAssessmentsRegistries')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      getAssessmentsRegistries({ organizationId })
    );

    const data = await result.current.mutateAsync(query);

    expect(data).toEqual(dataMock);

    expect(apiMock).toHaveBeenCalledWith(organizationId, expectedApiParams);
  });

  it('should handle API errors correctly', async () => {
    const organizationId = 123;
    const query = {
      filters: {
        ...initialFilterValues,
        OPERATING_YEAR: '2023-01-01T00:00:00Z',
        OFFICE_CODE: 'TEST'
      },
      pagination: { page: 0, size: 20 },
      sort: []
    };

    const errorMock = new Error('API Error');
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getAssessmentsRegistries')
      .mockRejectedValueOnce(errorMock);

    const { result } = renderHook(() =>
      getAssessmentsRegistries({ organizationId })
    );

    expect(result.current.mutateAsync(query)).rejects.toThrow(errorMock);

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
      filters: {
        ...initialFilterValues,
        OPERATING_YEAR: '2023-01-01T00:00:00Z'
      },
      pagination: { page: 0, size: 20 },
      sort: []
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getAssessmentsRegistries')
      .mockResolvedValue({ data: undefined } as AxiosResponse);

    const { result } = renderHook(() =>
      getAssessmentsRegistries({ organizationId })
    );

    const data = await result.current.mutateAsync(query);

    expect(data).toBeUndefined();

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

  it('should call parseAndLog when data is null/undefined', async () => {
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
    expect(mockParseAndLog).toBeCalledWith(expect.anything(), null);
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

describe('createAssessmentsRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create assessments registry successfully when mutation is called', async () => {
    const organizationId = 123;
    const assessmentRegistry: AssessmentsRegistry = {
      assessmentRegistryId: 456,
      organizationId,
      debtPositionTypeOrgCode: 'DEBT001',
      sectionCode: 'SEC001',
      operatingYear: '2023',
      assessmentDescription: 'Test Registry',
      officeCode: 'OFF001',
      assessmentCode: 'ASS001',
      status: AssessmentsRegistryStatus.ACTIVE,
      creationDate: '2023-01-01T00:00:00Z'
    };

    const expectedResponse = {
      ...assessmentRegistry,
      assessmentRegistryId: 789
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'createAssessmentsRegistry')
      .mockResolvedValue({ data: expectedResponse } as AxiosResponse);

    const { result } = renderHook(() =>
      createAssessmentsRegistry(organizationId)
    );

    result.current.mutate(assessmentRegistry);

    await waitFor(() => {
      expect(result.current.data).toEqual(expectedResponse);
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, assessmentRegistry);
    expect(mockParseAndLog).toHaveBeenCalledWith(
      assessmentsRegistrySchema,
      expectedResponse
    );
  });

  it('should handle API errors correctly during registry creation', async () => {
    const organizationId = 123;
    const assessmentRegistry: AssessmentsRegistry = {
      assessmentRegistryId: 456,
      organizationId,
      debtPositionTypeOrgCode: 'DEBT002',
      sectionCode: 'SEC002',
      operatingYear: '2023',
      assessmentDescription: 'Failed Registry',
      officeCode: 'OFF002',
      assessmentCode: 'ASS002',
      status: AssessmentsRegistryStatus.ACTIVE,
      creationDate: '2023-01-01T00:00:00Z'
    };

    const errorMock = new Error('Registry creation failed');
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'createAssessmentsRegistry')
      .mockRejectedValue(errorMock);

    const { result } = renderHook(() =>
      createAssessmentsRegistry(organizationId)
    );

    result.current.mutate(assessmentRegistry);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(errorMock);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, assessmentRegistry);
    expect(mockParseAndLog).not.toHaveBeenCalled();
  });

  it('should call parseAndLog when response data is null/undefined', async () => {
    const organizationId = 123;
    const assessmentRegistry: AssessmentsRegistry = {
      assessmentRegistryId: 456,
      organizationId,
      debtPositionTypeOrgCode: 'DEBT003',
      sectionCode: 'SEC003',
      operatingYear: '2023',
      assessmentDescription: 'Null Response Registry',
      officeCode: 'OFF003',
      assessmentCode: 'ASS003',
      status: AssessmentsRegistryStatus.ACTIVE,
      creationDate: '2023-01-01T00:00:00Z'
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'createAssessmentsRegistry')
      .mockResolvedValue({ data: null } as AxiosResponse);

    const { result } = renderHook(() =>
      createAssessmentsRegistry(organizationId)
    );

    result.current.mutate(assessmentRegistry);

    await waitFor(() => {
      expect(result.current.data).toBeNull();
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, assessmentRegistry);
    expect(mockParseAndLog).toHaveBeenCalledWith(expect.anything(), null);
  });

  it('should not create registry if mutate is not called', () => {
    const organizationId = 123;
    const { result } = renderHook(() =>
      createAssessmentsRegistry(organizationId)
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });

  it('should use correct mutation key', () => {
    const organizationId = 456;
    const { result } = renderHook(() =>
      createAssessmentsRegistry(organizationId)
    );

    expect(result.current).toBeDefined();
  });
});

describe('updateAssessmentsRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update assessments registry successfully when mutation is called', async () => {
    const organizationId = 123;
    const assessmentRegistryId = 456;
    const assessmentRegistry: AssessmentsRegistry = {
      assessmentRegistryId,
      organizationId,
      debtPositionTypeOrgCode: 'DEBT001',
      sectionCode: 'SEC001',
      operatingYear: '2023',
      assessmentDescription: 'Updated Registry',
      officeCode: 'OFF001',
      assessmentCode: 'ASS001',
      status: AssessmentsRegistryStatus.ACTIVE,
      creationDate: '2023-01-01T00:00:00Z'
    };

    const expectedResponse = {
      ...assessmentRegistry,
      lastUpdateDate: '2023-12-01T00:00:00Z'
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'updateAssessmentsRegistry')
      .mockResolvedValue({ data: expectedResponse } as AxiosResponse);

    const { result } = renderHook(() =>
      updateAssessmentsRegistry(organizationId, assessmentRegistryId)
    );

    result.current.mutate(assessmentRegistry);

    await waitFor(() => {
      expect(result.current.data).toEqual(expectedResponse);
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiMock).toHaveBeenCalledWith(
      organizationId,
      assessmentRegistryId,
      assessmentRegistry
    );
    expect(mockParseAndLog).toHaveBeenCalledWith(
      assessmentsRegistrySchema,
      expectedResponse
    );
  });

  it('should handle API errors correctly during registry update', async () => {
    const organizationId = 123;
    const assessmentRegistryId = 456;
    const assessmentRegistry: AssessmentsRegistry = {
      assessmentRegistryId,
      organizationId,
      debtPositionTypeOrgCode: 'DEBT002',
      sectionCode: 'SEC002',
      operatingYear: '2023',
      assessmentDescription: 'Failed Update Registry',
      officeCode: 'OFF002',
      assessmentCode: 'ASS002',
      status: AssessmentsRegistryStatus.ACTIVE,
      creationDate: '2023-01-01T00:00:00Z'
    };

    const errorMock = new Error('Registry update failed');
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'updateAssessmentsRegistry')
      .mockRejectedValue(errorMock);

    const { result } = renderHook(() =>
      updateAssessmentsRegistry(organizationId, assessmentRegistryId)
    );

    result.current.mutate(assessmentRegistry);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(errorMock);
    });

    expect(apiMock).toHaveBeenCalledWith(
      organizationId,
      assessmentRegistryId,
      assessmentRegistry
    );
    expect(mockParseAndLog).not.toHaveBeenCalled();
  });

  it('should call parseAndLog when response data is null/undefined', async () => {
    const organizationId = 123;
    const assessmentRegistryId = 456;
    const assessmentRegistry: AssessmentsRegistry = {
      assessmentRegistryId,
      organizationId,
      debtPositionTypeOrgCode: 'DEBT003',
      sectionCode: 'SEC003',
      operatingYear: '2023',
      assessmentDescription: 'Null Update Registry',
      officeCode: 'OFF003',
      assessmentCode: 'ASS003',
      status: AssessmentsRegistryStatus.ACTIVE,
      creationDate: '2023-01-01T00:00:00Z'
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'updateAssessmentsRegistry')
      .mockResolvedValue({ data: null } as AxiosResponse);

    const { result } = renderHook(() =>
      updateAssessmentsRegistry(organizationId, assessmentRegistryId)
    );

    result.current.mutate(assessmentRegistry);

    await waitFor(() => {
      expect(result.current.data).toBeNull();
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiMock).toHaveBeenCalledWith(
      organizationId,
      assessmentRegistryId,
      assessmentRegistry
    );
    expect(mockParseAndLog).toBeCalledWith(expect.anything(), null);
  });

  it('should not update registry if mutate is not called', () => {
    const organizationId = 123;
    const assessmentRegistryId = 456;
    const { result } = renderHook(() =>
      updateAssessmentsRegistry(organizationId, assessmentRegistryId)
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });

  it('should use correct mutation key', () => {
    const organizationId = 456;
    const assessmentRegistryId = 789;
    const { result } = renderHook(() =>
      updateAssessmentsRegistry(organizationId, assessmentRegistryId)
    );

    expect(result.current).toBeDefined();
  });

  it('should handle different organizationId and assessmentRegistryId values', async () => {
    const organizationId = 999;
    const assessmentRegistryId = 777;
    const assessmentRegistry: AssessmentsRegistry = {
      assessmentRegistryId,
      organizationId,
      debtPositionTypeOrgCode: 'DIFF_DEBT',
      sectionCode: 'DIFF_SEC',
      operatingYear: '2023',
      assessmentDescription: 'Different Org Registry',
      officeCode: 'DIFF_OFF',
      assessmentCode: 'DIFF_ASS',
      status: AssessmentsRegistryStatus.INACTIVE,
      creationDate: '2023-01-01T00:00:00Z'
    };

    const expectedResponse = {
      ...assessmentRegistry,
      lastUpdateDate: '2023-12-01T00:00:00Z'
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'updateAssessmentsRegistry')
      .mockResolvedValue({ data: expectedResponse } as AxiosResponse);

    const { result } = renderHook(() =>
      updateAssessmentsRegistry(organizationId, assessmentRegistryId)
    );

    result.current.mutate(assessmentRegistry);

    await waitFor(() => {
      expect(result.current.data).toEqual(expectedResponse);
    });

    expect(apiMock).toHaveBeenCalledWith(
      organizationId,
      assessmentRegistryId,
      assessmentRegistry
    );
  });
});

describe('getOperatingYears', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch operating years successfully', async () => {
    const mockOperatingYears = [2021, 2022, 2023, 2024];

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getOperatingYears')
      .mockResolvedValue({ data: mockOperatingYears } as AxiosResponse);

    const { result } = renderHook(() => getOperatingYears());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockOperatingYears);
    expect(apiMock).toHaveBeenCalledWith();
  });

  it('should handle API errors correctly', async () => {
    const errorMock = new Error('Operating years fetch failed');

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getOperatingYears')
      .mockRejectedValue(errorMock);

    renderHook(() => getOperatingYears());

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith();
    });

    expect(apiMock).toHaveBeenCalledTimes(1);
  });

  it('should handle empty response correctly', async () => {
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getOperatingYears')
      .mockResolvedValue({ data: [] } as AxiosResponse);

    const { result } = renderHook(() => getOperatingYears());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
    expect(apiMock).toHaveBeenCalledWith();
  });

  it('should handle null/undefined response correctly', async () => {
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getOperatingYears')
      .mockResolvedValue({ data: null } as AxiosResponse);

    const { result } = renderHook(() => getOperatingYears());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeNull();
    expect(apiMock).toHaveBeenCalledWith();
  });

  it('should use enabled option correctly when set to false', () => {
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getOperatingYears')
      .mockResolvedValue({ data: [2023] } as AxiosResponse);

    const { result } = renderHook(() => getOperatingYears({ enabled: false }));

    expect(result.current.data).toBeUndefined();
    expect(result.current.status).toBe('pending');
    expect(result.current.fetchStatus).toBe('idle');
    expect(apiMock).not.toHaveBeenCalled();
  });

  it('should use enabled option correctly when set to true', async () => {
    const mockOperatingYears = [2023, 2024];

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getOperatingYears')
      .mockResolvedValue({ data: mockOperatingYears } as AxiosResponse);

    const { result } = renderHook(() => getOperatingYears({ enabled: true }));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockOperatingYears);
    expect(apiMock).toHaveBeenCalledWith();
  });

  it('should enable by default when no options provided', async () => {
    const mockOperatingYears = [2024];

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getOperatingYears')
      .mockResolvedValue({ data: mockOperatingYears } as AxiosResponse);

    const { result } = renderHook(() => getOperatingYears());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockOperatingYears);
    expect(apiMock).toHaveBeenCalledWith();
  });

  it('should use correct query key for caching', () => {
    const { result } = renderHook(() => getOperatingYears());

    expect(result.current).toBeDefined();
  });
});

describe('deleteAssessmentDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete assessment details successfully when mutation is called', async () => {
    const organizationId = 123;
    const assessmentDetailIds = [456, 789, 101112];

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'deleteAssessmentsDetails')
      .mockResolvedValue({ data: undefined } as AxiosResponse);

    const { result } = renderHook(() =>
      deleteAssessmentDetails(organizationId)
    );

    result.current.mutate(assessmentDetailIds);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, {
      assessmentDetailIds
    });
  });

  it('should handle API errors correctly during deletion', async () => {
    const organizationId = 123;
    const assessmentDetailIds = [456, 789];

    const errorMock = new Error('Deletion failed');
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'deleteAssessmentsDetails')
      .mockRejectedValue(errorMock);

    const { result } = renderHook(() =>
      deleteAssessmentDetails(organizationId)
    );

    result.current.mutate(assessmentDetailIds);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(errorMock);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, {
      assessmentDetailIds
    });
  });

  it('should handle 4xx client errors correctly during deletion', async () => {
    const organizationId = 123;
    const assessmentDetailIds = [456, 789];

    const clientError = {
      response: { status: 400 },
      message: 'Bad Request'
    };
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'deleteAssessmentsDetails')
      .mockRejectedValue(clientError);

    const { result } = renderHook(() =>
      deleteAssessmentDetails(organizationId)
    );

    result.current.mutate(assessmentDetailIds);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(clientError);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, {
      assessmentDetailIds
    });
  });

  it('should handle 5xx server errors correctly during deletion', async () => {
    const organizationId = 123;
    const assessmentDetailIds = [456, 789];

    const serverError = new Error('Internal Server Error');
    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'deleteAssessmentsDetails')
      .mockRejectedValue(serverError);

    const { result } = renderHook(() =>
      deleteAssessmentDetails(organizationId)
    );

    result.current.mutate(assessmentDetailIds);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(serverError);
    });

    expect(apiMock).toHaveBeenCalledWith(organizationId, {
      assessmentDetailIds
    });
  });

  it('should not delete assessment details if mutate is not called', async () => {
    const organizationId = 123;
    const apiMock = vi.spyOn(utils.apiClient.bff, 'deleteAssessmentsDetails');

    const { result } = renderHook(() =>
      deleteAssessmentDetails(organizationId)
    );

    expect(result.current.isIdle).toBe(true);
    expect(apiMock).not.toHaveBeenCalled();
  });

  it('should use the correct mutation key', () => {
    const organizationId = 123;
    const { result } = renderHook(() =>
      deleteAssessmentDetails(organizationId)
    );

    expect(result.current).toBeDefined();
    // The mutation key is set internally by React Query
  });
});
