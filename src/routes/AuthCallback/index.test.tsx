import { afterEach, describe, it, vi } from 'vitest';
import AuthCallback from './index';
import { render } from '../../__tests__/renderers';

vi.mock('../../store/IdTokenStore', () => ({
  setIdToken: vi.fn(),
  idTokenPayloadState: {}
}));

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useLoaderData: vi.fn(() => ({
    token: { access_token: 'mocked-access-token' },
    idToken: 'header.payload.signature'
  }))
}));

describe('AutchCallback Page', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders Auth callback without crashing', async () => {
    globalThis.location = {
      ...globalThis.location,
      replace: vi.fn()
    };

    render(<AuthCallback />);
  });
});
