import { describe, it, vi } from 'vitest';
import { Classifications } from '../../components/Classifications';
import { render } from '../../__tests__/renderers';

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn()
}));

describe('Classifications Page', () => {
  it('renders Classifications Page without crashing', () => {
    render(<Classifications />);
  });
});
