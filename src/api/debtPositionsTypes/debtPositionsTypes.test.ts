import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook } from '../../__tests__/renderers';
import { waitFor } from '@testing-library/react';
import utils from '../../utils';
import {
  getDebtPositionTypeWithCount,
  useDebtPositionTypeCodeValidation,
  postDebtPositionType,
  patchDebtPositionType,
  getDebtPositionTypesByOrganizationId
} from '../debtPositionsTypes';
import { parseAndLog } from '../../utils/loaders';
import { DebtPositionTypeWithCountFilteredRequest } from './mappings';

vi.mock('../../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getDebtPositionTypeWithCount: vi.fn(),
        createDebtPositionType: vi.fn(),
        patchDebtPositionType: vi.fn(),
        getDebtPositionTypesByOrganizationId: vi.fn()
      }
    }
  }
}));

vi.mock('../../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

describe('getDebtPositionTypeWithCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return paged debt position types with count', async () => {
    const mockData = {
      content: [
        {
          debtPositionTypeId: 1,
          code: 'TYPE_A',
          description: 'Type A',
          updateDate: '2023-01-01T10:00:00Z',
          activeOrganizations: 5
        },
        {
          debtPositionTypeId: 2,
          code: 'TYPE_B',
          description: 'Type B',
          updateDate: '2023-01-02T10:00:00Z',
          activeOrganizations: 10
        }
      ],
      size: 10,
      totalElements: 2,
      totalPages: 1,
      number: 0
    };

    (
      utils.apiClient.bff.getDebtPositionTypeWithCount as Mock
    ).mockResolvedValue({
      data: mockData
    });

    const organizationId = 123;
    const query: DebtPositionTypeWithCountFilteredRequest = {
      filters: {},
      pagination: { page: 0, size: 10 },
      sort: []
    };

    const { result } = renderHook(() =>
      getDebtPositionTypeWithCount({ organizationId })
    );

    const data = await result.current.mutateAsync(query);

    expect(data).toEqual(mockData);
    expect(
      utils.apiClient.bff.getDebtPositionTypeWithCount
    ).toHaveBeenCalledWith(organizationId, { page: 0, size: 10 });
    expect(parseAndLog).toHaveBeenCalledWith(expect.any(Object), mockData);
  });

  it('should handle query with sort parameters and description filter', async () => {
    const mockData = {
      content: [
        {
          debtPositionTypeId: 2,
          code: 'TYPE_B',
          description: 'Type B',
          updateDate: '2023-01-02T10:00:00Z',
          activeOrganizations: 10
        },
        {
          debtPositionTypeId: 1,
          code: 'TYPE_A',
          description: 'Type A',
          updateDate: '2023-01-01T10:00:00Z',
          activeOrganizations: 5
        }
      ],
      size: 10,
      totalElements: 2,
      totalPages: 1,
      number: 0
    };

    (
      utils.apiClient.bff.getDebtPositionTypeWithCount as Mock
    ).mockResolvedValue({
      data: mockData
    });

    const organizationId = 123;
    const query: DebtPositionTypeWithCountFilteredRequest = {
      filters: { description: 'Type A' },
      pagination: { page: 0, size: 10 },
      sort: ['activeOrganizations,desc']
    };

    const { result } = renderHook(() =>
      getDebtPositionTypeWithCount({ organizationId })
    );

    const data = await result.current.mutateAsync(query);

    expect(data).toEqual(mockData);
    expect(
      utils.apiClient.bff.getDebtPositionTypeWithCount
    ).toHaveBeenCalledWith(organizationId, {
      page: 0,
      size: 10,
      description: 'Type A',
      sort: ['activeOrganizations,desc']
    });
  });

  it('should handle null response correctly', async () => {
    (
      utils.apiClient.bff.getDebtPositionTypeWithCount as Mock
    ).mockResolvedValue({
      data: null
    });

    const organizationId = 123;
    const query: DebtPositionTypeWithCountFilteredRequest = {
      filters: {},
      pagination: { page: 0, size: 10 },
      sort: []
    };

    const { result } = renderHook(() =>
      getDebtPositionTypeWithCount({ organizationId })
    );

    const data = await result.current.mutateAsync(query);

    expect(data).toBeNull();
    expect(parseAndLog).not.toHaveBeenCalled();
  });

  it('should handle empty filters correctly', async () => {
    const mockData = {
      content: [],
      size: 10,
      totalElements: 0,
      totalPages: 0,
      number: 0
    };

    (
      utils.apiClient.bff.getDebtPositionTypeWithCount as Mock
    ).mockResolvedValue({
      data: mockData
    });

    const organizationId = 123;
    const query: DebtPositionTypeWithCountFilteredRequest = {
      filters: {},
      pagination: { page: 1, size: 25 },
      sort: ['description,asc']
    };

    const { result } = renderHook(() =>
      getDebtPositionTypeWithCount({ organizationId })
    );

    const data = await result.current.mutateAsync(query);

    expect(data).toEqual(mockData);
    expect(
      utils.apiClient.bff.getDebtPositionTypeWithCount
    ).toHaveBeenCalledWith(organizationId, {
      page: 1,
      size: 25,
      sort: ['description,asc']
    });
  });
});

describe('useDebtPositionTypeCodeValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when code is unique (does not exist)', async () => {
    const firstPageResponse = {
      content: [
        {
          debtPositionTypeId: 1,
          code: 'TYPE_A',
          description: 'Type A',
          updateDate: '2023-01-01T10:00:00Z',
          activeOrganizations: 5
        }
      ],
      size: 1,
      totalElements: 2,
      totalPages: 2,
      number: 0
    };

    const allDataResponse = {
      content: [
        {
          debtPositionTypeId: 1,
          code: 'TYPE_A',
          description: 'Type A',
          updateDate: '2023-01-01T10:00:00Z',
          activeOrganizations: 5
        },
        {
          debtPositionTypeId: 2,
          code: 'TYPE_B',
          description: 'Type B',
          updateDate: '2023-01-02T10:00:00Z',
          activeOrganizations: 10
        }
      ],
      size: 2,
      totalElements: 2,
      totalPages: 1,
      number: 0
    };

    (utils.apiClient.bff.getDebtPositionTypeWithCount as Mock)
      .mockResolvedValueOnce({ data: firstPageResponse })
      .mockResolvedValueOnce({ data: allDataResponse });

    const organizationId = 123;
    const { result } = renderHook(() =>
      useDebtPositionTypeCodeValidation(organizationId)
    );

    const isUnique = await result.current.mutateAsync('TYPE_C');

    expect(isUnique).toBe(true);
    expect(
      utils.apiClient.bff.getDebtPositionTypeWithCount
    ).toHaveBeenCalledTimes(2);
    expect(
      utils.apiClient.bff.getDebtPositionTypeWithCount
    ).toHaveBeenNthCalledWith(1, organizationId, { page: 0, size: 1 });
    expect(
      utils.apiClient.bff.getDebtPositionTypeWithCount
    ).toHaveBeenNthCalledWith(2, organizationId, { page: 0, size: 2 });
  });

  it('should return false when code already exists', async () => {
    const firstPageResponse = {
      content: [
        {
          debtPositionTypeId: 1,
          code: 'TYPE_A',
          description: 'Type A',
          updateDate: '2023-01-01T10:00:00Z',
          activeOrganizations: 5
        }
      ],
      size: 1,
      totalElements: 2,
      totalPages: 2,
      number: 0
    };

    const allDataResponse = {
      content: [
        {
          debtPositionTypeId: 1,
          code: 'TYPE_A',
          description: 'Type A',
          updateDate: '2023-01-01T10:00:00Z',
          activeOrganizations: 5
        },
        {
          debtPositionTypeId: 2,
          code: 'TYPE_B',
          description: 'Type B',
          updateDate: '2023-01-02T10:00:00Z',
          activeOrganizations: 10
        }
      ],
      size: 2,
      totalElements: 2,
      totalPages: 1,
      number: 0
    };

    (utils.apiClient.bff.getDebtPositionTypeWithCount as Mock)
      .mockResolvedValueOnce({ data: firstPageResponse })
      .mockResolvedValueOnce({ data: allDataResponse });

    const organizationId = 123;
    const { result } = renderHook(() =>
      useDebtPositionTypeCodeValidation(organizationId)
    );

    const isUnique = await result.current.mutateAsync('TYPE_A');

    expect(isUnique).toBe(false);
    expect(
      utils.apiClient.bff.getDebtPositionTypeWithCount
    ).toHaveBeenCalledTimes(2);
  });

  it('should return true when code is empty or whitespace', async () => {
    const organizationId = 123;
    const { result } = renderHook(() =>
      useDebtPositionTypeCodeValidation(organizationId)
    );

    const emptyResult = await result.current.mutateAsync('');
    const whitespaceResult = await result.current.mutateAsync('   ');

    expect(emptyResult).toBe(true);
    expect(whitespaceResult).toBe(true);
    expect(
      utils.apiClient.bff.getDebtPositionTypeWithCount
    ).not.toHaveBeenCalled();
  });

  it('should return true when firstPageResponse is null', async () => {
    (
      utils.apiClient.bff.getDebtPositionTypeWithCount as Mock
    ).mockResolvedValueOnce({ data: null });

    const organizationId = 123;
    const { result } = renderHook(() =>
      useDebtPositionTypeCodeValidation(organizationId)
    );

    const isUnique = await result.current.mutateAsync('TYPE_A');

    expect(isUnique).toBe(true);
    expect(
      utils.apiClient.bff.getDebtPositionTypeWithCount
    ).toHaveBeenCalledTimes(1);
  });

  it('should return true when totalElements is 0', async () => {
    const firstPageResponse = {
      content: [],
      size: 1,
      totalElements: 0,
      totalPages: 0,
      number: 0
    };

    (
      utils.apiClient.bff.getDebtPositionTypeWithCount as Mock
    ).mockResolvedValueOnce({ data: firstPageResponse });

    const organizationId = 123;
    const { result } = renderHook(() =>
      useDebtPositionTypeCodeValidation(organizationId)
    );

    const isUnique = await result.current.mutateAsync('TYPE_A');

    expect(isUnique).toBe(true);
    expect(
      utils.apiClient.bff.getDebtPositionTypeWithCount
    ).toHaveBeenCalledTimes(1);
  });

  it('should return true when allDataResponse is null', async () => {
    const firstPageResponse = {
      content: [
        {
          debtPositionTypeId: 1,
          code: 'TYPE_A',
          description: 'Type A',
          updateDate: '2023-01-01T10:00:00Z',
          activeOrganizations: 5
        }
      ],
      size: 1,
      totalElements: 2,
      totalPages: 2,
      number: 0
    };

    (utils.apiClient.bff.getDebtPositionTypeWithCount as Mock)
      .mockResolvedValueOnce({ data: firstPageResponse })
      .mockResolvedValueOnce({ data: null });

    const organizationId = 123;
    const { result } = renderHook(() =>
      useDebtPositionTypeCodeValidation(organizationId)
    );

    const isUnique = await result.current.mutateAsync('TYPE_A');

    expect(isUnique).toBe(true);
    expect(
      utils.apiClient.bff.getDebtPositionTypeWithCount
    ).toHaveBeenCalledTimes(2);
  });

  it('should return true when allDataResponse.content is null or empty', async () => {
    const firstPageResponse = {
      content: [
        {
          debtPositionTypeId: 1,
          code: 'TYPE_A',
          description: 'Type A',
          updateDate: '2023-01-01T10:00:00Z',
          activeOrganizations: 5
        }
      ],
      size: 1,
      totalElements: 2,
      totalPages: 2,
      number: 0
    };

    const allDataResponseNull = {
      content: null,
      size: 0,
      totalElements: 2,
      totalPages: 1,
      number: 0
    };

    const allDataResponseEmpty = {
      content: [],
      size: 0,
      totalElements: 2,
      totalPages: 1,
      number: 0
    };

    const organizationId = 123;

    // Test with null content
    (utils.apiClient.bff.getDebtPositionTypeWithCount as Mock)
      .mockResolvedValueOnce({ data: firstPageResponse })
      .mockResolvedValueOnce({ data: allDataResponseNull });

    const { result: result1 } = renderHook(() =>
      useDebtPositionTypeCodeValidation(organizationId)
    );

    const isUnique1 = await result1.current.mutateAsync('TYPE_A');
    expect(isUnique1).toBe(true);

    vi.clearAllMocks();

    // Test with empty content
    (utils.apiClient.bff.getDebtPositionTypeWithCount as Mock)
      .mockResolvedValueOnce({ data: firstPageResponse })
      .mockResolvedValueOnce({ data: allDataResponseEmpty });

    const { result: result2 } = renderHook(() =>
      useDebtPositionTypeCodeValidation(organizationId)
    );

    const isUnique2 = await result2.current.mutateAsync('TYPE_A');
    expect(isUnique2).toBe(true);
  });

  it('should trim the code before checking', async () => {
    const firstPageResponse = {
      content: [
        {
          debtPositionTypeId: 1,
          code: 'TYPE_A',
          description: 'Type A',
          updateDate: '2023-01-01T10:00:00Z',
          activeOrganizations: 5
        }
      ],
      size: 1,
      totalElements: 1,
      totalPages: 1,
      number: 0
    };

    const allDataResponse = {
      content: [
        {
          debtPositionTypeId: 1,
          code: 'TYPE_A',
          description: 'Type A',
          updateDate: '2023-01-01T10:00:00Z',
          activeOrganizations: 5
        }
      ],
      size: 1,
      totalElements: 1,
      totalPages: 1,
      number: 0
    };

    (utils.apiClient.bff.getDebtPositionTypeWithCount as Mock)
      .mockResolvedValueOnce({ data: firstPageResponse })
      .mockResolvedValueOnce({ data: allDataResponse });

    const organizationId = 123;
    const { result } = renderHook(() =>
      useDebtPositionTypeCodeValidation(organizationId)
    );

    // Code with whitespace should be trimmed and match
    const isUnique = await result.current.mutateAsync('  TYPE_A  ');

    expect(isUnique).toBe(false);
    expect(
      utils.apiClient.bff.getDebtPositionTypeWithCount
    ).toHaveBeenCalledTimes(2);
  });
});

describe('postDebtPositionType', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a debt position type and return the response data', async () => {
    const mockResponseData = {
      debtPositionTypeId: 123,
      code: 'TYPE_A',
      description: 'Type A',
      orgType: '03',
      macroArea: '01',
      serviceType: '100',
      collectingReason: 'AP',
      taxonomyCode: '9/0301100AP/',
      flagMandatoryDueDate: false,
      flagAnonymousFiscalCode: false,
      flagNotifyIo: true,
      ioTemplateSubject: 'Test Subject',
      ioTemplateMessage: 'Test Message'
    };

    const mockStep2Data = {
      code: 'TYPE_A',
      description: 'Type A',
      orgType: '03',
      macroArea: '01',
      serviceType: '100',
      collectingReason: 'AP',
      taxonomyCode: '9/0301100AP/',
      flagMandatoryDueDate: false,
      flagAnonymousFiscalCode: false,
      flagNotifyIo: true,
      ioTemplateSubject: 'Test Subject',
      ioTemplateMessage: 'Test Message'
    };

    (utils.apiClient.bff.createDebtPositionType as Mock).mockResolvedValue({
      data: mockResponseData
    });

    const { result } = renderHook(() => postDebtPositionType());

    const data = await result.current.mutateAsync(mockStep2Data);

    expect(data).toEqual(mockResponseData);
    expect(utils.apiClient.bff.createDebtPositionType).toHaveBeenCalledWith({
      code: 'TYPE_A',
      description: 'Type A',
      orgType: '03',
      macroArea: '01',
      serviceType: '100',
      collectingReason: 'AP',
      taxonomyCode: '9/0301100AP/',
      flagMandatoryDueDate: false,
      flagAnonymousFiscalCode: false,
      flagNotifyIo: true,
      ioTemplateMessage: 'Test Message',
      ioTemplateSubject: 'Test Subject'
    });
    expect(parseAndLog).toHaveBeenCalledWith(
      expect.any(Object),
      mockResponseData
    );
  });

  it('should handle empty optional fields correctly', async () => {
    const mockResponseData = {
      debtPositionTypeId: 123,
      code: 'TYPE_B',
      description: 'Type B',
      orgType: '',
      macroArea: '',
      serviceType: '',
      collectingReason: '',
      taxonomyCode: '',
      flagMandatoryDueDate: false,
      flagAnonymousFiscalCode: false,
      flagNotifyIo: false,
      ioTemplateSubject: '',
      ioTemplateMessage: ''
    };

    const mockStep2Data = {
      code: undefined,
      description: undefined,
      orgType: undefined,
      macroArea: undefined,
      serviceType: undefined,
      collectingReason: undefined,
      taxonomyCode: undefined,
      flagMandatoryDueDate: false,
      flagAnonymousFiscalCode: false,
      flagNotifyIo: false,
      ioTemplateSubject: undefined,
      ioTemplateMessage: undefined
    };

    (utils.apiClient.bff.createDebtPositionType as Mock).mockResolvedValue({
      data: mockResponseData
    });

    const { result } = renderHook(() => postDebtPositionType());

    const data = await result.current.mutateAsync(mockStep2Data);

    expect(data).toEqual(mockResponseData);
    expect(utils.apiClient.bff.createDebtPositionType).toHaveBeenCalledWith({
      code: '',
      description: '',
      orgType: '',
      macroArea: '',
      serviceType: '',
      collectingReason: '',
      taxonomyCode: '',
      flagMandatoryDueDate: false,
      flagAnonymousFiscalCode: false,
      flagNotifyIo: false,
      ioTemplateMessage: undefined,
      ioTemplateSubject: undefined
    });
  });
});

describe('patchDebtPositionType', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should patch a debt position type and return the response data', async () => {
    const debtPositionTypeId = 123;
    const mockPatchData = {
      description: 'Updated Type A',
      flagMandatoryDueDate: true
    };

    const mockResponseData = {
      debtPositionTypeId: 123,
      code: 'TYPE_A',
      description: 'Updated Type A',
      orgType: '03',
      macroArea: '01',
      serviceType: '100',
      collectingReason: 'AP',
      taxonomyCode: '9/0301100AP/',
      flagMandatoryDueDate: true,
      flagAnonymousFiscalCode: false,
      flagNotifyIo: true,
      ioTemplateSubject: 'Test Subject',
      ioTemplateMessage: 'Test Message'
    };

    (utils.apiClient.bff.patchDebtPositionType as Mock).mockResolvedValue({
      data: mockResponseData
    });

    const { result } = renderHook(() =>
      patchDebtPositionType(debtPositionTypeId)
    );

    const data = await result.current.mutateAsync(mockPatchData);

    expect(data).toEqual(mockResponseData);
    expect(utils.apiClient.bff.patchDebtPositionType).toHaveBeenCalledWith(
      debtPositionTypeId,
      mockPatchData
    );
  });

  it('should handle partial updates correctly', async () => {
    const debtPositionTypeId = 456;
    const mockPatchData = {
      flagNotifyIo: false
    };

    const mockResponseData = {
      debtPositionTypeId: 456,
      code: 'TYPE_B',
      description: 'Type B',
      flagNotifyIo: false
    };

    (utils.apiClient.bff.patchDebtPositionType as Mock).mockResolvedValue({
      data: mockResponseData
    });

    const { result } = renderHook(() =>
      patchDebtPositionType(debtPositionTypeId)
    );

    const data = await result.current.mutateAsync(mockPatchData);

    expect(data).toEqual(mockResponseData);
    expect(utils.apiClient.bff.patchDebtPositionType).toHaveBeenCalledWith(
      debtPositionTypeId,
      mockPatchData
    );
  });
});

describe('getDebtPositionTypesByOrganizationId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch debt position types and return sorted data with maps', async () => {
    const mockData = [
      {
        debtPositionTypeId: 2,
        code: 'TYPE_B',
        description: 'Type B',
        updateDate: '2023-01-02T10:00:00Z',
        activeOrganizations: 10
      },
      {
        debtPositionTypeId: 1,
        code: 'TYPE_A',
        description: 'Type A',
        updateDate: '2023-01-01T10:00:00Z',
        activeOrganizations: 5
      },
      {
        debtPositionTypeId: 3,
        code: 'TYPE_C',
        description: 'Type C',
        updateDate: '2023-01-03T10:00:00Z',
        activeOrganizations: 15
      }
    ];

    (
      utils.apiClient.bff.getDebtPositionTypesByOrganizationId as Mock
    ).mockResolvedValue({
      data: mockData
    });

    const organizationId = 123;
    const { result } = renderHook(() =>
      getDebtPositionTypesByOrganizationId({ organizationId })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const data = result.current.data;

    expect(data).toBeDefined();
    expect(data?.response).toEqual(mockData);
    expect(data?.optionsMap).toEqual([
      { label: 'Type A', value: 1 },
      { label: 'Type B', value: 2 },
      { label: 'Type C', value: 3 }
    ]);
    expect(data?.codeMap).toEqual([
      { label: 'Type A', value: 'TYPE_A' },
      { label: 'Type B', value: 'TYPE_B' },
      { label: 'Type C', value: 'TYPE_C' }
    ]);
    expect(
      utils.apiClient.bff.getDebtPositionTypesByOrganizationId
    ).toHaveBeenCalledWith(organizationId);
    expect(parseAndLog).toHaveBeenCalledWith(expect.any(Object), mockData);
  });

  it('should handle empty array correctly', async () => {
    const mockData: Array<never> = [];

    (
      utils.apiClient.bff.getDebtPositionTypesByOrganizationId as Mock
    ).mockResolvedValue({
      data: mockData
    });

    const organizationId = 456;
    const { result } = renderHook(() =>
      getDebtPositionTypesByOrganizationId({ organizationId })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const data = result.current.data;

    expect(data).toBeDefined();
    expect(data?.response).toEqual([]);
    expect(data?.optionsMap).toEqual([]);
    expect(data?.codeMap).toEqual([]);
    expect(parseAndLog).toHaveBeenCalledWith(expect.any(Object), mockData);
  });

  it('should sort by description correctly', async () => {
    const mockData = [
      {
        debtPositionTypeId: 3,
        code: 'TYPE_Z',
        description: 'Zebra Type',
        updateDate: '2023-01-03T10:00:00Z',
        activeOrganizations: 15
      },
      {
        debtPositionTypeId: 1,
        code: 'TYPE_A',
        description: 'Alpha Type',
        updateDate: '2023-01-01T10:00:00Z',
        activeOrganizations: 5
      },
      {
        debtPositionTypeId: 2,
        code: 'TYPE_M',
        description: 'Middle Type',
        updateDate: '2023-01-02T10:00:00Z',
        activeOrganizations: 10
      }
    ];

    (
      utils.apiClient.bff.getDebtPositionTypesByOrganizationId as Mock
    ).mockResolvedValue({
      data: mockData
    });

    const organizationId = 789;
    const { result } = renderHook(() =>
      getDebtPositionTypesByOrganizationId({ organizationId })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const data = result.current.data;

    expect(data?.optionsMap).toEqual([
      { label: 'Alpha Type', value: 1 },
      { label: 'Middle Type', value: 2 },
      { label: 'Zebra Type', value: 3 }
    ]);
    expect(data?.codeMap).toEqual([
      { label: 'Alpha Type', value: 'TYPE_A' },
      { label: 'Middle Type', value: 'TYPE_M' },
      { label: 'Zebra Type', value: 'TYPE_Z' }
    ]);
  });
});
