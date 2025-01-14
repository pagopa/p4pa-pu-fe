import { setupInterceptors } from '../interceptors';
import { useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { Client } from '../../models/Client';

vi.mock('./utils', () => ({
  config: {
    tokenHeaderExcludePaths: ['/path1', '/path2']
  }
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

describe('setupInterceptors', () => {
  const client = {
    instance: {
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      }
    }
  } as unknown as Client;

  const navigate = vi.fn();

  beforeEach(() => {
    window.localStorage.clear();
    (useNavigate as Mock).mockReturnValue(navigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should set up REQUEST interceptor', () => {
    setupInterceptors(client);
    expect(client.instance.interceptors.request.use).toHaveBeenCalledTimes(1);
  });

  it('should set up RESPONSE interceptor', () => {
    setupInterceptors(client);
    expect(client.instance.interceptors.response.use).toHaveBeenCalledTimes(1);
  });

  it('should add Authorization header to request if token is present', () => {
    const request = { url: '/path3', headers: {} };
    const accessToken = 'token';
    window.localStorage.setItem('accessToken', accessToken);
    setupInterceptors(client);
    const requestInterceptor = (client.instance.interceptors.request.use as Mock).mock.calls[0][0];
    const result = requestInterceptor(request);
    expect(result.headers['Authorization']).toBe(`Bearer ${accessToken}`);
  });

  it('should not add Authorization header to request if token is not present', () => {
    const request = { url: '/path3', headers: {} };
    setupInterceptors(client);
    const requestInterceptor = (client.instance.interceptors.request.use as Mock).mock.calls[0][0];
    const result = requestInterceptor(request);
    expect(result.headers['Authorization']).toBeUndefined();
  });

});
