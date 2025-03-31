import { describe, it, vi } from 'vitest';
import Treasury from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn()
}));

describe('Treasury Page', () => {
  it('renders Treasury Page without crashing', () => {
    render(<Treasury />);
  });
});
