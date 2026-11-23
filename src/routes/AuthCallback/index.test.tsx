import { afterEach, describe, it, vi, expect } from 'vitest';
import AuthCallback from './index';
import { render, screen, waitFor } from '../../__tests__/renderers';
import * as IdTokenStore from '../../store/IdTokenStore';
import { PageRoutes } from '..';

const mockLoaderData = vi.hoisted(() => ({
  value: {
    token: {
      access_token: 'mocked-access-token',
      refresh_token: 'mocked-refresh-token'
    },
    idToken: 'header.payload.signature'
  } as {
    token: { access_token: string; refresh_token: string };
    idToken: string;
  } | null
}));

vi.mock('../../store/IdTokenStore', () => ({
  setIdToken: vi.fn(),
  idTokenPayloadState: {}
}));

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useLoaderData: vi.fn(() => mockLoaderData.value),
    useNavigate: () => mockNavigate
  };
});

describe('AuthCallback Page', () => {
  let originalLocalStorage: Storage;
  let originalLocation: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalLocalStorage = window.localStorage;
    originalLocation = Object.getOwnPropertyDescriptor(window, 'location');
    mockLoaderData.value = {
      token: {
        access_token: 'mocked-access-token',
        refresh_token: 'mocked-refresh-token'
      },
      idToken: 'header.payload.signature'
    };
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
      writable: true
    });

    Object.defineProperty(window, 'location', {
      value: {
        replace: vi.fn()
      },
      writable: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.localStorage = originalLocalStorage;
    if (originalLocation) {
      Object.defineProperty(window, 'location', originalLocation);
    }
  });

  it('renders Auth callback and navigates with token', async () => {
    render(<AuthCallback />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'accessToken',
        'mocked-access-token'
      );
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'refreshToken',
        'mocked-refresh-token'
      );
      expect(IdTokenStore.setIdToken).toHaveBeenCalledWith(
        'header.payload.signature'
      );
      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.HOME);
    });
  });

  it('redirects to the error page when token retrieval fails', async () => {
    mockLoaderData.value = null;
    render(<AuthCallback />);

    await waitFor(() => {
      expect(window.location.replace).toHaveBeenCalledWith(PageRoutes.ERROR);
    });

    expect(window.localStorage.setItem).not.toHaveBeenCalled();
    expect(IdTokenStore.setIdToken).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
