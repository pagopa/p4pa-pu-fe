import { setupInterceptors } from '../interceptors';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { Client } from '../../models/Client';
import {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders
} from 'axios';

vi.mock('..', () => ({
  default: {
    config: {
      tokenHeaderExcludePaths: ['/path1', '/path2']
    },
    storage: {
      clear: vi.fn()
    },
    notify: {
      emit: vi.fn()
    }
  }
}));

vi.mock('../navigation', () => ({
  default: {
    routes: {
      HOME: '/home',
      LOGGED_OUT: '/loggedout',
      ERROR: '/blockingError'
    },
    setAuthErrorState: vi.fn(),
    navigateToLoggedOut: vi.fn(),
    navigateTo: vi.fn()
  }
}));

vi.mock('../../translations/i18n', () => ({
  default: {
    t: (key: string) => {
      const translations: Record<string, string> = {
        'commons.serviceUnavailable': 'Servizio temporaneamente non disponibile'
      };
      return translations[key] || key;
    }
  }
}));

import utils from '..';
import navigation from '../navigation';
import { setAppState } from '../../store/AppStateStore';
import router, { PageRoutes } from '../../routes';

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

  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => null);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should set up REQUEST interceptor', () => {
    setupInterceptors(client);
    expect(client.instance.interceptors.request.use).toHaveBeenCalledTimes(1);
  });

  it('should set up RESPONSE interceptor', () => {
    setupInterceptors(client);
    expect(client.instance.interceptors.response.use).toHaveBeenCalledTimes(1);
  });
});

describe('Request interceptor behavior', () => {
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

  let requestInterceptor: (
    request: InternalAxiosRequestConfig
  ) => InternalAxiosRequestConfig;

  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    setupInterceptors(client);
    requestInterceptor = (client.instance.interceptors.request.use as Mock).mock
      .calls[0][0];
  });

  it('should add Authorization header when token is present and path is not excluded', () => {
    const request: InternalAxiosRequestConfig = {
      url: '/api/users',
      headers: {} as AxiosRequestHeaders
    };
    const accessToken = 'test-token-123';
    window.localStorage.setItem('accessToken', accessToken);

    const result = requestInterceptor(request);

    expect(result.headers['Authorization']).toBe(`Bearer ${accessToken}`);
  });

  it('should not add Authorization header when token is not present', () => {
    const request: InternalAxiosRequestConfig = {
      url: '/api/users',
      headers: {} as AxiosRequestHeaders
    };

    const result = requestInterceptor(request);

    expect(result.headers['Authorization']).toBeUndefined();
  });

  it('should not add Authorization header when path is excluded', () => {
    const request: InternalAxiosRequestConfig = {
      url: '/path1',
      headers: {} as AxiosRequestHeaders
    };
    const accessToken = 'test-token-123';
    window.localStorage.setItem('accessToken', accessToken);

    const result = requestInterceptor(request);

    expect(result.headers['Authorization']).toBeUndefined();
  });

  it('should not add Authorization header when path is excluded (second excluded path)', () => {
    const request: InternalAxiosRequestConfig = {
      url: '/path2',
      headers: {} as AxiosRequestHeaders
    };
    const accessToken = 'test-token-123';
    window.localStorage.setItem('accessToken', accessToken);

    const result = requestInterceptor(request);

    expect(result.headers['Authorization']).toBeUndefined();
  });

  it('should handle request without url', () => {
    const request: InternalAxiosRequestConfig = {
      headers: {} as AxiosRequestHeaders
    };
    const accessToken = 'test-token-123';
    window.localStorage.setItem('accessToken', accessToken);

    const result = requestInterceptor(request);

    expect(result.headers['Authorization']).toBe(`Bearer ${accessToken}`);
  });

  it('should handle request error', () => {
    setupInterceptors(client);
    const errorHandler = (client.instance.interceptors.request.use as Mock).mock
      .calls[0][1];
    const error = new Error('Request error');

    expect(errorHandler(error)).rejects.toBe(error);
  });
});

describe('Response interceptor success handling', () => {
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

  let responseSuccessHandler: (response: AxiosResponse) => AxiosResponse;

  beforeEach(() => {
    vi.clearAllMocks();
    setupInterceptors(client);
    const responseInterceptorCall = (
      client.instance.interceptors.response.use as Mock
    ).mock.calls[0];
    responseSuccessHandler = responseInterceptorCall[0];
  });

  it('should pass through successful responses', () => {
    const response: AxiosResponse = {
      data: 'test',
      status: 200,
      statusText: 'OK',
      headers: {} as AxiosRequestHeaders,
      config: {} as InternalAxiosRequestConfig
    };

    const result = responseSuccessHandler(response);

    expect(result).toBe(response);
  });
});

describe('Response interceptor auth error handling', () => {
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

  let responseErrorHandler: (
    error: AxiosError
  ) => Promise<void> | Promise<never>;

  beforeEach(() => {
    vi.clearAllMocks();
    setupInterceptors(client);
    const responseInterceptorCall = (
      client.instance.interceptors.response.use as Mock
    ).mock.calls[0];
    responseErrorHandler = responseInterceptorCall[1];
  });

  it('should handle 401 error (Unauthorized)', async () => {
    const error: AxiosError = {
      name: 'AxiosError',
      message: 'Request failed with status code 401',
      response: {
        status: 401,
        data: {},
        statusText: 'Unauthorized',
        headers: {} as AxiosRequestHeaders,
        config: {} as InternalAxiosRequestConfig
      },
      config: { url: '/api/test' } as InternalAxiosRequestConfig,
      isAxiosError: true,
      toJSON: () => ({})
    };

    const result = await responseErrorHandler(error);

    expect(navigation.setAuthErrorState).toHaveBeenCalledWith(true);
    expect(utils.storage.clear).toHaveBeenCalled();
    expect(navigation.navigateToLoggedOut).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('should handle 403 error (Forbidden)', async () => {
    setAppState({ ready: true });
    const error: AxiosError = {
      name: 'AxiosError',
      message: 'Request failed with status code 403',
      response: {
        status: 403,
        data: {},
        statusText: 'Forbidden',
        headers: {} as AxiosRequestHeaders,
        config: {} as InternalAxiosRequestConfig
      },
      config: { url: '/api/test' } as InternalAxiosRequestConfig,
      isAxiosError: true,
      toJSON: () => ({})
    };
    const getApplesSpy = vi.spyOn(router, 'navigate');

    const result = await responseErrorHandler(error);

    expect(getApplesSpy).toHaveBeenCalledWith(PageRoutes.HOME);
    expect(result).toBeUndefined();
  });
});

describe('Response interceptor server error handling', () => {
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

  let responseErrorHandler: (
    error: AxiosError
  ) => Promise<void> | Promise<never>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => null);
    setupInterceptors(client);
    const responseInterceptorCall = (
      client.instance.interceptors.response.use as Mock
    ).mock.calls[0];
    responseErrorHandler = responseInterceptorCall[1];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle 500 error (Internal Server Error)', async () => {
    const error: AxiosError = {
      name: 'AxiosError',
      message: 'Internal Server Error',
      response: {
        status: 500,
        data: {},
        statusText: 'Internal Server Error',
        headers: {} as AxiosRequestHeaders,
        config: {} as InternalAxiosRequestConfig
      },
      config: {
        url: '/api/test',
        method: 'GET'
      } as InternalAxiosRequestConfig,
      isAxiosError: true,
      toJSON: () => ({})
    };

    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(utils.notify.emit).toHaveBeenCalledWith(
      'Servizio temporaneamente non disponibile',
      'error'
    );
    expect(console.error).toHaveBeenCalledWith('Server Error:', {
      status: 500,
      url: '/api/test',
      method: 'GET',
      message: 'Internal Server Error'
    });
  });

  it('should handle 501 error (Not Implemented)', async () => {
    const error: AxiosError = {
      name: 'AxiosError',
      message: 'Not Implemented',
      response: {
        status: 501,
        data: {},
        statusText: 'Not Implemented',
        headers: {} as AxiosRequestHeaders,
        config: {} as InternalAxiosRequestConfig
      },
      config: {
        url: '/api/feature',
        method: 'POST'
      } as InternalAxiosRequestConfig,
      isAxiosError: true,
      toJSON: () => ({})
    };

    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(utils.notify.emit).toHaveBeenCalledWith(
      'Servizio temporaneamente non disponibile',
      'error'
    );
    expect(console.error).toHaveBeenCalledWith('Server Error:', {
      status: 501,
      url: '/api/feature',
      method: 'POST',
      message: 'Not Implemented'
    });
  });

  it('should handle 502 error (Bad Gateway)', async () => {
    const error: AxiosError = {
      name: 'AxiosError',
      message: 'Bad Gateway',
      response: {
        status: 502,
        data: {},
        statusText: 'Bad Gateway',
        headers: {} as AxiosRequestHeaders,
        config: {} as InternalAxiosRequestConfig
      },
      config: {
        url: '/api/test',
        method: 'POST'
      } as InternalAxiosRequestConfig,
      isAxiosError: true,
      toJSON: () => ({})
    };

    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(utils.notify.emit).toHaveBeenCalledWith(
      'Servizio temporaneamente non disponibile',
      'error'
    );
    expect(console.error).toHaveBeenCalledWith('Server Error:', {
      status: 502,
      url: '/api/test',
      method: 'POST',
      message: 'Bad Gateway'
    });
  });

  it('should handle 503 error (Service Unavailable)', async () => {
    const error: AxiosError = {
      name: 'AxiosError',
      message: 'Service Unavailable',
      response: {
        status: 503,
        data: {},
        statusText: 'Service Unavailable',
        headers: {} as AxiosRequestHeaders,
        config: {} as InternalAxiosRequestConfig
      },
      config: {
        url: '/api/health',
        method: 'GET'
      } as InternalAxiosRequestConfig,
      isAxiosError: true,
      toJSON: () => ({})
    };

    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(utils.notify.emit).toHaveBeenCalledWith(
      'Servizio temporaneamente non disponibile',
      'error'
    );
    expect(console.error).toHaveBeenCalledWith('Server Error:', {
      status: 503,
      url: '/api/health',
      method: 'GET',
      message: 'Service Unavailable'
    });
  });

  it('should handle 599 error (within 5xx range)', async () => {
    const error: AxiosError = {
      name: 'AxiosError',
      message: 'Custom server error',
      response: {
        status: 599,
        data: {},
        statusText: 'Custom Server Error',
        headers: {} as AxiosRequestHeaders,
        config: {} as InternalAxiosRequestConfig
      },
      config: { url: '/api/test' } as InternalAxiosRequestConfig,
      isAxiosError: true,
      toJSON: () => ({})
    };

    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(utils.notify.emit).toHaveBeenCalledWith(
      'Servizio temporaneamente non disponibile',
      'error'
    );
  });
});

describe('Response interceptor other error handling', () => {
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

  let responseErrorHandler: (
    error: AxiosError
  ) => Promise<void> | Promise<never>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => null);
    setupInterceptors(client);
    const responseInterceptorCall = (
      client.instance.interceptors.response.use as Mock
    ).mock.calls[0];
    responseErrorHandler = responseInterceptorCall[1];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not handle 600 error (outside 5xx range)', async () => {
    const error: AxiosError = {
      name: 'AxiosError',
      message: 'Not a server error',
      response: {
        status: 600,
        data: {},
        statusText: 'Custom Error',
        headers: {} as AxiosRequestHeaders,
        config: {} as InternalAxiosRequestConfig
      },
      config: { url: '/api/test' } as InternalAxiosRequestConfig,
      isAxiosError: true,
      toJSON: () => ({})
    };

    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(utils.notify.emit).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should handle 400 error (Client Error) without special handling', async () => {
    const error: AxiosError = {
      name: 'AxiosError',
      message: 'Bad Request',
      response: {
        status: 400,
        data: {},
        statusText: 'Bad Request',
        headers: {} as AxiosRequestHeaders,
        config: {} as InternalAxiosRequestConfig
      },
      config: { url: '/api/test' } as InternalAxiosRequestConfig,
      isAxiosError: true,
      toJSON: () => ({})
    };

    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(navigation.setAuthErrorState).not.toHaveBeenCalled();
    expect(utils.notify.emit).not.toHaveBeenCalled();
  });

  it('should handle error without response', async () => {
    const error: AxiosError = {
      name: 'AxiosError',
      message: 'Network Error',
      config: { url: '/api/test' } as InternalAxiosRequestConfig,
      isAxiosError: true,
      toJSON: () => ({})
    };

    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(navigation.setAuthErrorState).not.toHaveBeenCalled();
    expect(utils.notify.emit).not.toHaveBeenCalled();
  });

  it('should handle error without config', async () => {
    const error: AxiosError = {
      name: 'AxiosError',
      message: 'Server Error',
      response: {
        status: 500,
        data: {},
        statusText: 'Internal Server Error',
        headers: {} as AxiosRequestHeaders,
        config: {} as InternalAxiosRequestConfig
      },
      isAxiosError: true,
      toJSON: () => ({})
    };

    await expect(responseErrorHandler(error)).rejects.toBe(error);

    expect(utils.notify.emit).toHaveBeenCalledWith(
      'Servizio temporaneamente non disponibile',
      'error'
    );
    expect(console.error).toHaveBeenCalledWith('Server Error:', {
      status: 500,
      url: undefined,
      method: undefined,
      message: 'Server Error'
    });
  });
});
