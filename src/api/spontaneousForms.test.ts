import { describe, it, expect, vi, Mock, beforeEach } from 'vitest';
import * as reactQuery from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import utils from '../utils';
import * as loaders from '../utils/loaders';
import { getSpontaneousForms } from './spontaneousForms';

vi.mock('../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getSpontaneousForms: vi.fn()
      }
    }
  }
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn()
}));

vi.mock('../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

describe('getSpontaneousForms API', () => {
  const organizationId = 123;
  const dataMock = [
    {
      spontaneousFormId: 10,
      code: 'FORM10'
    },
    {
      spontaneousFormId: 20,
      code: 'FORM20'
    }
  ];

  const mockUseQueryResult = {
    data: dataMock,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: true
  };

  beforeEach(() => {
    vi.clearAllMocks();

    const mockApi = utils.apiClient.bff.getSpontaneousForms as Mock;
    mockApi.mockResolvedValue({
      data: dataMock
    } as AxiosResponse);

    (reactQuery.useQuery as Mock).mockReturnValue(mockUseQueryResult);
  });

  it('should call useQuery with correct queryKey', () => {
    getSpontaneousForms(organizationId);

    expect(reactQuery.useQuery).toHaveBeenCalled();

    const useQueryArgs = (reactQuery.useQuery as Mock).mock.calls[0][0];

    expect(useQueryArgs.queryKey).toEqual([
      'getSpontaneousForms',
      organizationId
    ]);
  });

  it('should call API with correct organizationId', async () => {
    getSpontaneousForms(organizationId);

    const useQueryArgs = (reactQuery.useQuery as Mock).mock.calls[0][0];
    const queryFn = useQueryArgs.queryFn;

    await queryFn();

    expect(utils.apiClient.bff.getSpontaneousForms).toHaveBeenCalledWith(
      organizationId
    );
  });

  it('should return data from API response', async () => {
    getSpontaneousForms(organizationId);

    const useQueryArgs = (reactQuery.useQuery as Mock).mock.calls[0][0];
    const queryFn = useQueryArgs.queryFn;

    const response = await queryFn();

    expect(response).toEqual(dataMock);
  });

  it('should call parseAndLog with correct schema and data', async () => {
    getSpontaneousForms(organizationId);

    const useQueryArgs = (reactQuery.useQuery as Mock).mock.calls[0][0];
    const queryFn = useQueryArgs.queryFn;

    await queryFn();

    expect(loaders.parseAndLog).toHaveBeenCalledTimes(1);
    const parseAndLogCall = (loaders.parseAndLog as Mock).mock.calls[0];
    expect(parseAndLogCall[0]).toBeDefined();
    expect(typeof parseAndLogCall[0].parse).toBe('function');
    expect(parseAndLogCall[1]).toEqual(dataMock);
  });

  it('should be enabled when organizationId is provided and enabled is true', () => {
    getSpontaneousForms(organizationId, true);

    const useQueryArgs = (reactQuery.useQuery as Mock).mock.calls[0][0];

    expect(useQueryArgs.enabled).toBe(true);
  });

  it('should be disabled when enabled is false', () => {
    getSpontaneousForms(organizationId, false);

    const useQueryArgs = (reactQuery.useQuery as Mock).mock.calls[0][0];

    expect(useQueryArgs.enabled).toBe(false);
  });

  it('should be disabled when organizationId is 0', () => {
    getSpontaneousForms(0, true);

    const useQueryArgs = (reactQuery.useQuery as Mock).mock.calls[0][0];

    expect(useQueryArgs.enabled).toBe(false);
  });

  it('should be disabled when organizationId is undefined', () => {
    getSpontaneousForms(undefined as unknown as number, true);

    const useQueryArgs = (reactQuery.useQuery as Mock).mock.calls[0][0];

    expect(useQueryArgs.enabled).toBe(false);
  });

  it('should handle API error correctly', async () => {
    const error = new Error('API Error');
    (utils.apiClient.bff.getSpontaneousForms as Mock).mockRejectedValue(error);

    getSpontaneousForms(organizationId);

    const useQueryArgs = (reactQuery.useQuery as Mock).mock.calls[0][0];
    const queryFn = useQueryArgs.queryFn;

    await expect(queryFn()).rejects.toThrow('API Error');
  });

  it('should return useQuery result', () => {
    const result = getSpontaneousForms(organizationId);

    expect(result).toEqual(mockUseQueryResult);
  });

  it('should use default enabled value as true', () => {
    getSpontaneousForms(organizationId);

    const useQueryArgs = (reactQuery.useQuery as Mock).mock.calls[0][0];

    expect(useQueryArgs.enabled).toBe(true);
  });
});
