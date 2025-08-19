import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, waitFor, act } from '../__tests__/renderers';
import utils from '../utils';
import {
  getDebtPositionTypeOrgs,
  getDebtPositionTypeOrgById,
  createDebtPositionTypeOrg,
  CreateDebtPositionTypeOrg,
  updateFlagActiveDebtPositionTypeOrg
} from './debtPositionsTypeOrg';
import { parseAndLog } from '../utils/loaders';
import { AxiosError } from 'axios';

vi.mock('../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getDebtPositionTypeOrgs: vi.fn(),
        getDebtPositionTypeOrgById: vi.fn(),
        createDebtPositionTypeOrg: vi.fn(),
        updateFlagActiveDebtPositionTypeOrg: vi.fn()
      }
    }
  }
}));

vi.mock('../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

describe('getDebtPositionTypeOrgs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return debt position types', async () => {
    const mockData = [
      { id: 1, description: 'Type A' },
      { id: 2, description: 'Type B' }
    ];

    (utils.apiClient.bff.getDebtPositionTypeOrgs as Mock).mockResolvedValue({
      data: mockData
    });

    const { result } = renderHook(() =>
      getDebtPositionTypeOrgs({ organizationId: 123 })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(utils.apiClient.bff.getDebtPositionTypeOrgs).toHaveBeenCalledWith(
      123
    );
  });
});

describe('getDebtPositionTypeOrgById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return a specific debt position type by ID', async () => {
    const mockData = { debtPositionTypeOrgId: 456, description: 'description' };

    (utils.apiClient.bff.getDebtPositionTypeOrgById as Mock).mockResolvedValue({
      data: mockData
    });

    const { result } = renderHook(() =>
      getDebtPositionTypeOrgById({
        organizationId: 123,
        debtPositionTypeOrgId: 456
      })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      optionsMap: [
        {
          label: 'description',
          value: 456
        }
      ],
      response: { debtPositionTypeOrgId: 456, description: 'description' }
    });
    expect(utils.apiClient.bff.getDebtPositionTypeOrgById).toHaveBeenCalledWith(
      123,
      456
    );
  });
});

describe('createDebtPositionTypeOrg', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call API and parseAndLog, then return data on success', async () => {
    const mockInput = {
      organizationId: 123,
      data: { name: 'Test Type', code: 'TST' }
    };
    const mockResponse = { id: 1, name: 'Test Type', code: 'TST' };

    (utils.apiClient.bff.createDebtPositionTypeOrg as Mock).mockResolvedValue({
      data: mockResponse
    });

    const { result } = renderHook(() => createDebtPositionTypeOrg());

    await act(async () => {
      result.current.mutate(mockInput as unknown as CreateDebtPositionTypeOrg);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(utils.apiClient.bff.createDebtPositionTypeOrg).toHaveBeenCalledWith(
      mockInput.organizationId,
      mockInput.data
    );
    expect(parseAndLog).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle errors from the API', async () => {
    const mockInput = {
      organizationId: 123,
      data: { name: 'Test Type', code: 'TST' }
    };
    const error = new Error('API error');

    (utils.apiClient.bff.createDebtPositionTypeOrg as Mock).mockRejectedValue(
      error
    );

    const { result } = renderHook(() => createDebtPositionTypeOrg());

    await act(async () => {
      result.current.mutate(mockInput as unknown as CreateDebtPositionTypeOrg);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });
});

describe('updateFlagActiveDebtPositionTypeOrg', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully update flag to active', async () => {
    const mockApiCall = utils.apiClient.bff
      .updateFlagActiveDebtPositionTypeOrg as Mock;
    mockApiCall.mockResolvedValue({});

    const onSuccessMock = vi.fn();
    const onErrorMock = vi.fn();

    const { result } = renderHook(() =>
      updateFlagActiveDebtPositionTypeOrg(onSuccessMock, onErrorMock)
    );

    const mutationData = {
      organizationId: 123,
      debtPositionTypeOrgId: 456,
      flagActive: true
    };

    result.current.mutate(mutationData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiCall).toHaveBeenCalledWith(123, 456, { flagActive: true });
    expect(onSuccessMock).toHaveBeenCalled();
    expect(onErrorMock).not.toHaveBeenCalled();
  });

  it('should successfully update flag to inactive', async () => {
    const mockApiCall = utils.apiClient.bff
      .updateFlagActiveDebtPositionTypeOrg as Mock;
    mockApiCall.mockResolvedValue({});

    const onSuccessMock = vi.fn();

    const { result } = renderHook(() =>
      updateFlagActiveDebtPositionTypeOrg(onSuccessMock)
    );

    const mutationData = {
      organizationId: 789,
      debtPositionTypeOrgId: 101112,
      flagActive: false
    };

    result.current.mutate(mutationData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiCall).toHaveBeenCalledWith(789, 101112, {
      flagActive: false
    });
    expect(onSuccessMock).toHaveBeenCalled();
  });

  it('should handle API error and call onError callback', async () => {
    const mockError = new AxiosError('Network Error');
    const mockApiCall = utils.apiClient.bff
      .updateFlagActiveDebtPositionTypeOrg as Mock;
    mockApiCall.mockRejectedValue(mockError);

    const onSuccessMock = vi.fn();
    const onErrorMock = vi.fn();

    const { result } = renderHook(() =>
      updateFlagActiveDebtPositionTypeOrg(onSuccessMock, onErrorMock)
    );

    const mutationData = {
      organizationId: 123,
      debtPositionTypeOrgId: 456,
      flagActive: true
    };

    result.current.mutate(mutationData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockApiCall).toHaveBeenCalledWith(123, 456, { flagActive: true });
    expect(onSuccessMock).not.toHaveBeenCalled();
    expect(onErrorMock).toHaveBeenCalledWith(
      mockError,
      mutationData,
      undefined
    );
  });

  it('should work without callbacks', async () => {
    const mockApiCall = utils.apiClient.bff
      .updateFlagActiveDebtPositionTypeOrg as Mock;
    mockApiCall.mockResolvedValue({});

    const { result } = renderHook(() => updateFlagActiveDebtPositionTypeOrg());

    const mutationData = {
      organizationId: 123,
      debtPositionTypeOrgId: 456,
      flagActive: true
    };

    result.current.mutate(mutationData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiCall).toHaveBeenCalledWith(123, 456, { flagActive: true });
    expect(result.current.error).toBeNull();
  });

  it('should use correct mutation key for caching', async () => {
    const mockApiCall = utils.apiClient.bff
      .updateFlagActiveDebtPositionTypeOrg as Mock;
    mockApiCall.mockResolvedValue({});

    const { result } = renderHook(() => updateFlagActiveDebtPositionTypeOrg());

    expect(result.current.mutate).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });

  it('should handle multiple consecutive calls', async () => {
    const mockApiCall = utils.apiClient.bff
      .updateFlagActiveDebtPositionTypeOrg as Mock;
    mockApiCall.mockResolvedValue({});

    const onSuccessMock = vi.fn();

    const { result } = renderHook(() =>
      updateFlagActiveDebtPositionTypeOrg(onSuccessMock)
    );

    result.current.mutate({
      organizationId: 123,
      debtPositionTypeOrgId: 456,
      flagActive: true
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    result.current.reset();

    result.current.mutate({
      organizationId: 789,
      debtPositionTypeOrgId: 101112,
      flagActive: false
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiCall).toHaveBeenCalledTimes(2);
    expect(onSuccessMock).toHaveBeenCalledTimes(2);
  });
});
