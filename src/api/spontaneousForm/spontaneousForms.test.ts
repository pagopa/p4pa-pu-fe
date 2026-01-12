import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../__tests__/renderers';
import { buildQueryParams } from './mappings';
import spontaneousFormsApi from './index';
import type { SpontaneousFormsFilteredRequest } from './mappings';
import utils from '../../utils';
import { AxiosResponse } from 'axios';

vi.mock('../../utils', () => {
  const originalModule = vi.importActual('../../utils');
  return {
    ...originalModule,
    default: {
      apiClient: {
        bff: {
          getPagedSpontaneousForms: vi.fn(),
          getSpontaneousFormDetail: vi.fn(),
          createSpontaneousForm: vi.fn(),
          updateSpontaneousForm: vi.fn(),
          deleteSpontaneousForm: vi.fn()
        }
      }
    }
  };
});

vi.mock('../../utils/loaders', () => ({
  default: {
    getOrganizations: vi.fn(),
    getOrganizationsPlain: vi.fn()
  },
  parseAndLog: vi.fn()
}));

const mockApiResponse = {
  content: [
    {
      spontaneousFormId: 1,
      code: 'FORM001',
      organizationId: 123,
      structure: {
        fields: []
      }
    }
  ],
  totalElements: 1,
  totalPages: 1,
  size: 10,
  number: 0
};

const mockFormDetailsResponse = {
  spontaneousFormId: 1,
  code: 'FORM001',
  organizationId: 123,
  structure: {
    fields: [
      {
        name: 'testField',
        required: true,
        htmlRender: 'TEXT',
        insertableOrder: 1,
        indexable: false,
        renderableOrder: 1,
        searchableOrder: 1,
        listableOrder: 1,
        insertable: true,
        renderable: true,
        searchable: true,
        listable: true,
        association: false,
        detailLink: false,
        minOccurences: 0,
        maxOccurences: 1
      }
    ],
    amountFieldName: 'amount'
  },
  dictionary: {
    EN: {
      testField: {
        label: 'Test Field',
        error: 'Field is required',
        help: 'Enter a value'
      }
    }
  },
  creationDate: '2024-01-15T10:30:00Z',
  updateDate: '2024-01-16T14:20:00Z'
};

const mockCreateUpdatePayload = {
  organizationId: 123,
  code: 'FORM001',
  structure: {
    fields: []
  }
};

describe('spontaneousForms API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSpontaneousForms', () => {
    it('should return data correctly', async () => {
      const organizationId = 123;
      const requestData: SpontaneousFormsFilteredRequest = {
        filters: {
          code: 'FORM'
        },
        pagination: { page: 0, size: 20 },
        sort: ['code']
      };

      const expectedQuery = {
        page: 0,
        size: 20,
        code: 'FORM',
        sort: ['code']
      };

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getPagedSpontaneousForms')
        .mockResolvedValue({ data: mockApiResponse } as AxiosResponse);

      const { result } = renderHook(() =>
        spontaneousFormsApi.getSpontaneousForms({ organizationId })
      );

      await result.current.mutateAsync(requestData);

      await waitFor(() => {
        expect(result.current.data).toEqual(mockApiResponse);
      });

      expect(apiMock).toHaveBeenCalledWith(organizationId, expectedQuery);
    });

    it('should handle API errors correctly', async () => {
      const organizationId = 123;
      const mockError = new Error('API Error');

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getPagedSpontaneousForms')
        .mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        spontaneousFormsApi.getSpontaneousForms({ organizationId })
      );

      const requestData: SpontaneousFormsFilteredRequest = {
        filters: {},
        pagination: { page: 0, size: 10 },
        sort: []
      };

      await expect(result.current.mutateAsync(requestData)).rejects.toThrow(
        'API Error'
      );
      expect(apiMock).toHaveBeenCalled();
    });
  });

  describe('getSpontaneousFormById', () => {
    it('should fetch form details correctly', async () => {
      const organizationId = 123;
      const spontaneousFormId = 456;

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getSpontaneousFormDetail')
        .mockResolvedValue({
          data: mockFormDetailsResponse
        } as AxiosResponse);

      const { result } = renderHook(() =>
        spontaneousFormsApi.getSpontaneousFormById({
          organizationId,
          spontaneousFormId
        })
      );

      await waitFor(() => {
        expect(result.current.data).toEqual({
          response: mockFormDetailsResponse
        });
      });

      expect(apiMock).toHaveBeenCalledWith(organizationId, spontaneousFormId);
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle API errors correctly', async () => {
      const organizationId = 123;
      const spontaneousFormId = 456;
      const mockError = new Error('Form not found');

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getSpontaneousFormDetail')
        .mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        spontaneousFormsApi.getSpontaneousFormById({
          organizationId,
          spontaneousFormId
        })
      );

      expect(apiMock).toHaveBeenCalledWith(organizationId, spontaneousFormId);

      expect(result.current.isLoading).toBe(true);

      await expect(apiMock.mock.results[0].value).rejects.toThrow(
        'Form not found'
      );
    });

    it('should create query with correct parameters', () => {
      const organizationId = 123;
      const spontaneousFormId = 456;

      const apiMock = vi.spyOn(utils.apiClient.bff, 'getSpontaneousFormDetail');

      renderHook(() =>
        spontaneousFormsApi.getSpontaneousFormById({
          organizationId,
          spontaneousFormId
        })
      );

      expect(apiMock).toHaveBeenCalledWith(organizationId, spontaneousFormId);
    });

    it('should fetch data automatically on mount', () => {
      const organizationId = 123;
      const spontaneousFormId = 456;

      const apiMock = vi.spyOn(utils.apiClient.bff, 'getSpontaneousFormDetail');

      renderHook(() =>
        spontaneousFormsApi.getSpontaneousFormById({
          organizationId,
          spontaneousFormId
        })
      );

      expect(apiMock).toHaveBeenCalledWith(organizationId, spontaneousFormId);
    });

    it('should handle different organization and form IDs', async () => {
      const testCases = [
        { organizationId: 100, spontaneousFormId: 200 },
        { organizationId: 999, spontaneousFormId: 1 },
        { organizationId: 1, spontaneousFormId: 999 }
      ];

      for (const { organizationId, spontaneousFormId } of testCases) {
        const apiMock = vi
          .spyOn(utils.apiClient.bff, 'getSpontaneousFormDetail')
          .mockResolvedValue({
            data: mockFormDetailsResponse
          } as AxiosResponse);

        const { result } = renderHook(() =>
          spontaneousFormsApi.getSpontaneousFormById({
            organizationId,
            spontaneousFormId
          })
        );

        await waitFor(() => {
          expect(result.current.data).toEqual({
            response: mockFormDetailsResponse
          });
        });

        expect(apiMock).toHaveBeenCalledWith(organizationId, spontaneousFormId);
        expect(result.current.isSuccess).toBe(true);

        vi.clearAllMocks();
      }
    });
  });

  describe('createSpontaneousForm', () => {
    it('should create form successfully', async () => {
      const organizationId = 123;

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'createSpontaneousForm')
        .mockResolvedValue({
          data: { ...mockCreateUpdatePayload, spontaneousFormId: 1 }
        } as AxiosResponse);

      const { result } = renderHook(() =>
        spontaneousFormsApi.createSpontaneousForm({ organizationId })
      );

      await result.current.mutateAsync(mockCreateUpdatePayload);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiMock).toHaveBeenCalledWith(
        organizationId,
        mockCreateUpdatePayload
      );
    });

    it('should handle API errors during creation', async () => {
      const organizationId = 123;
      const mockError = new Error('Creation failed');

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'createSpontaneousForm')
        .mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        spontaneousFormsApi.createSpontaneousForm({ organizationId })
      );

      await expect(
        result.current.mutateAsync(mockCreateUpdatePayload)
      ).rejects.toThrow('Creation failed');

      expect(apiMock).toHaveBeenCalledWith(
        organizationId,
        mockCreateUpdatePayload
      );
    });
  });

  describe('updateSpontaneousForm', () => {
    it('should update form successfully', async () => {
      const organizationId = 123;
      const updatePayload = {
        ...mockCreateUpdatePayload,
        spontaneousFormId: 1
      };

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'updateSpontaneousForm')
        .mockResolvedValue({ data: updatePayload } as AxiosResponse);

      const { result } = renderHook(() =>
        spontaneousFormsApi.updateSpontaneousForm({ organizationId })
      );

      await result.current.mutateAsync(updatePayload);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiMock).toHaveBeenCalledWith(organizationId, updatePayload);
    });

    it('should handle API errors during update', async () => {
      const organizationId = 123;
      const mockError = new Error('Update failed');

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'updateSpontaneousForm')
        .mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        spontaneousFormsApi.updateSpontaneousForm({ organizationId })
      );

      await expect(
        result.current.mutateAsync(mockCreateUpdatePayload)
      ).rejects.toThrow('Update failed');

      expect(apiMock).toHaveBeenCalledWith(
        organizationId,
        mockCreateUpdatePayload
      );
    });
  });

  describe('deleteSpontaneousForm', () => {
    it('should delete form successfully', async () => {
      const organizationId = 123;
      const spontaneousFormId = 456;

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'deleteSpontaneousForm')
        .mockResolvedValue({} as AxiosResponse);

      const { result } = renderHook(() =>
        spontaneousFormsApi.deleteSpontaneousForm({ organizationId })
      );

      await result.current.mutateAsync(spontaneousFormId);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(apiMock).toHaveBeenCalledWith(organizationId, spontaneousFormId);
      expect(result.current.isError).toBe(false);
    });

    it('should handle API errors during deletion', async () => {
      const organizationId = 123;
      const spontaneousFormId = 456;
      const mockError = new Error('Form not found for deletion');

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'deleteSpontaneousForm')
        .mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        spontaneousFormsApi.deleteSpontaneousForm({ organizationId })
      );

      await expect(
        result.current.mutateAsync(spontaneousFormId)
      ).rejects.toThrow('Form not found for deletion');

      expect(apiMock).toHaveBeenCalledWith(organizationId, spontaneousFormId);
    });

    it('should handle different organization and form IDs for deletion', async () => {
      const testCases = [
        { organizationId: 100, spontaneousFormId: 200 },
        { organizationId: 999, spontaneousFormId: 1 },
        { organizationId: 1, spontaneousFormId: 999 }
      ];

      for (const { organizationId, spontaneousFormId } of testCases) {
        const apiMock = vi
          .spyOn(utils.apiClient.bff, 'deleteSpontaneousForm')
          .mockResolvedValue({} as AxiosResponse);

        const { result } = renderHook(() =>
          spontaneousFormsApi.deleteSpontaneousForm({ organizationId })
        );

        await result.current.mutateAsync(spontaneousFormId);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(apiMock).toHaveBeenCalledWith(organizationId, spontaneousFormId);

        vi.clearAllMocks();
      }
    });

    it('should handle network errors during deletion', async () => {
      const organizationId = 123;
      const spontaneousFormId = 456;
      const networkError = new Error('Network timeout');

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'deleteSpontaneousForm')
        .mockRejectedValue(networkError);

      const { result } = renderHook(() =>
        spontaneousFormsApi.deleteSpontaneousForm({ organizationId })
      );

      await expect(
        result.current.mutateAsync(spontaneousFormId)
      ).rejects.toThrow('Network timeout');

      expect(apiMock).toHaveBeenCalledWith(organizationId, spontaneousFormId);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should handle server error responses during deletion', async () => {
      const organizationId = 123;
      const spontaneousFormId = 456;
      const serverError = new Error('Internal server error');

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'deleteSpontaneousForm')
        .mockRejectedValue(serverError);

      const { result } = renderHook(() =>
        spontaneousFormsApi.deleteSpontaneousForm({ organizationId })
      );

      await expect(
        result.current.mutateAsync(spontaneousFormId)
      ).rejects.toThrow('Internal server error');

      expect(apiMock).toHaveBeenCalledWith(organizationId, spontaneousFormId);
    });
  });
});

describe('buildQueryParams', () => {
  it('should build query params with all filters present', () => {
    const request: SpontaneousFormsFilteredRequest = {
      filters: {
        code: 'FORM001'
      },
      pagination: { page: 2, size: 25 },
      sort: ['code', 'creationDate']
    };

    const result = buildQueryParams(request);

    expect(result).toEqual({
      page: 2,
      size: 25,
      code: 'FORM001',
      sort: ['code', 'creationDate']
    });
  });

  it('should build query params with only pagination when no filters', () => {
    const request: SpontaneousFormsFilteredRequest = {
      filters: {},
      pagination: { page: 0, size: 10 },
      sort: []
    };

    const result = buildQueryParams(request);

    expect(result).toEqual({
      page: 0,
      size: 10
    });
  });

  it('should include only provided filters and exclude undefined ones', () => {
    const request: SpontaneousFormsFilteredRequest = {
      filters: {
        code: 'TEST'
      },
      pagination: { page: 1, size: 15 },
      sort: ['code']
    };

    const result = buildQueryParams(request);

    expect(result).toEqual({
      page: 1,
      size: 15,
      code: 'TEST',
      sort: ['code']
    });
  });

  it('should not include code when undefined', () => {
    const request: SpontaneousFormsFilteredRequest = {
      filters: {
        code: undefined
      },
      pagination: { page: 0, size: 10 },
      sort: []
    };

    const result = buildQueryParams(request);

    expect(result).toEqual({
      page: 0,
      size: 10
    });

    expect(result).not.toHaveProperty('code');
  });

  it('should handle empty sort array correctly', () => {
    const request: SpontaneousFormsFilteredRequest = {
      filters: {
        code: 'FORM'
      },
      pagination: { page: 0, size: 10 },
      sort: []
    };

    const result = buildQueryParams(request);

    expect(result).toEqual({
      page: 0,
      size: 10,
      code: 'FORM'
    });

    expect(result).not.toHaveProperty('sort');
  });

  it('should handle empty string code correctly (should not include it)', () => {
    const request: SpontaneousFormsFilteredRequest = {
      filters: {
        code: ''
      },
      pagination: { page: 0, size: 10 },
      sort: []
    };

    const result = buildQueryParams(request);

    expect(result).toEqual({
      page: 0,
      size: 10
    });

    expect(result).not.toHaveProperty('code');
  });
});
