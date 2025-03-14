import { afterEach, describe, it, vi } from 'vitest';
import AuthCallback from './index';
import { render } from '@testing-library/react';

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useLoaderData: vi.fn(() => ({ access_token: 'mocked-access-token' }))
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
