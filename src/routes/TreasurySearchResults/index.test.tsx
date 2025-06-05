import { describe, it, vi } from 'vitest';
import TreasurySearchResults from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom'
    );
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

describe('TreasurySearchResults Page', () => {
  it('renders TreasurySearchResults view without crashing', () => {
    render(<TreasurySearchResults />);
  });
});
