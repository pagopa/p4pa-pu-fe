/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { AxiosResponse } from 'axios';

import utils from '../../utils';
import { SupersetUrlResponseDTO } from '../../../generated/apiClient';
import { renderHook } from '../../__tests__/renderers';
import { useGenerateSupersetUrl } from '.';

vi.mock('../../utils', () => ({
  default: {
    apiClient: {
      bff: {
        generateSupersetUrl: vi.fn()
      }
    }
  }
}));

describe('useGenerateSupersetUrl', () => {
  const createMockAxiosResponse = <T>(data: T): AxiosResponse<T> => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully generate Superset URL', async () => {
    const mockResponse = createMockAxiosResponse<SupersetUrlResponseDTO>({
      authorizedUrl: 'https://superset.example.com/dashboard?token=abc123'
    });

    vi.mocked(utils.apiClient.bff.generateSupersetUrl).mockResolvedValue(
      mockResponse
    );

    const { result } = renderHook(() => useGenerateSupersetUrl());

    result.current.mutate({ organizationId: 123 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(utils.apiClient.bff.generateSupersetUrl).toHaveBeenCalledWith(
      { organizationId: 123 },
      undefined
    );
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle API errors', async () => {
    const mockError = new Error('API Error');
    vi.mocked(utils.apiClient.bff.generateSupersetUrl).mockRejectedValue(
      mockError
    );

    const { result } = renderHook(() => useGenerateSupersetUrl());

    result.current.mutate({ organizationId: 123 });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(mockError);
  });

  it('should pass custom params to API', async () => {
    const mockResponse = createMockAxiosResponse<SupersetUrlResponseDTO>({
      authorizedUrl: 'https://superset.example.com/dashboard?token=abc123'
    });

    vi.mocked(utils.apiClient.bff.generateSupersetUrl).mockResolvedValue(
      mockResponse
    );

    const customParams = {
      headers: {
        'X-Custom-Header': 'value'
      }
    };

    const { result } = renderHook(() => useGenerateSupersetUrl());

    result.current.mutate({
      organizationId: 123,
      params: customParams
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(utils.apiClient.bff.generateSupersetUrl).toHaveBeenCalledWith(
      { organizationId: 123 },
      customParams
    );
  });

  it('should set isPending state during mutation', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(utils.apiClient.bff.generateSupersetUrl).mockReturnValue(
      promise as any
    );

    const { result } = renderHook(() => useGenerateSupersetUrl());

    result.current.mutate({ organizationId: 123 });

    await waitFor(() => expect(result.current.isPending).toBe(true));

    resolvePromise!(
      createMockAxiosResponse<SupersetUrlResponseDTO>({
        authorizedUrl: 'https://superset.example.com/dashboard?token=abc123'
      })
    );

    await waitFor(() => expect(result.current.isPending).toBe(false));
  });

  it('should call onSuccess callback when mutation succeeds', async () => {
    const mockResponse = createMockAxiosResponse<SupersetUrlResponseDTO>({
      authorizedUrl: 'https://superset.example.com/dashboard?token=abc123'
    });

    vi.mocked(utils.apiClient.bff.generateSupersetUrl).mockResolvedValue(
      mockResponse
    );

    const onSuccessMock = vi.fn();

    const { result } = renderHook(() => useGenerateSupersetUrl());

    result.current.mutate(
      { organizationId: 123 },
      { onSuccess: onSuccessMock }
    );

    await waitFor(() =>
      expect(onSuccessMock).toHaveBeenCalledWith(
        mockResponse,
        { organizationId: 123 },
        undefined
      )
    );
  });

  it('should call onError callback when mutation fails', async () => {
    const mockError = new Error('API Error');
    vi.mocked(utils.apiClient.bff.generateSupersetUrl).mockRejectedValue(
      mockError
    );

    const onErrorMock = vi.fn();

    const { result } = renderHook(() => useGenerateSupersetUrl());

    result.current.mutate({ organizationId: 123 }, { onError: onErrorMock });

    await waitFor(() =>
      expect(onErrorMock).toHaveBeenCalledWith(
        mockError,
        { organizationId: 123 },
        undefined
      )
    );
  });

  it('should handle missing authorizedUrl in response', async () => {
    const mockResponse = createMockAxiosResponse<SupersetUrlResponseDTO>({});

    vi.mocked(utils.apiClient.bff.generateSupersetUrl).mockResolvedValue(
      mockResponse
    );

    const { result } = renderHook(() => useGenerateSupersetUrl());

    result.current.mutate({ organizationId: 123 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data?.authorizedUrl).toBeUndefined();
  });
});
