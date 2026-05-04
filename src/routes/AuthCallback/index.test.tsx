import { afterEach, describe, it, vi, expect } from 'vitest';
import AuthCallback from './index';
import { render, screen, waitFor } from '../../__tests__/renderers';
import * as IdTokenStore from '../../store/IdTokenStore';
import { PageRoutes } from '..';

vi.mock('../../store/IdTokenStore', () => ({
  setIdToken: vi.fn(),
  idTokenPayloadState: {}
}));

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useLoaderData: vi.fn(() => ({
      token: { access_token: 'mocked-access-token' },
      idToken: 'header.payload.signature'
    })),
    useNavigate: () => mockNavigate
  };
});

describe('AuthCallback Page', () => {
  let originalLocalStorage: Storage;

  beforeEach(() => {
    originalLocalStorage = window.localStorage;
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
  });

  it('renders Auth callback and navigates with token', async () => {
    render(<AuthCallback />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'accessToken',
        'mocked-access-token'
      );
      expect(IdTokenStore.setIdToken).toHaveBeenCalledWith(
        'header.payload.signature'
      );
      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.HOME);
    });
  });
});
