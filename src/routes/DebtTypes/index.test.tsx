import { describe, it, vi } from 'vitest';
import { render } from '../../__tests__/renderers';
import DebtTypes from './Index';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn()
}));

describe('DebtTypes Page', () => {
  it('renders DebtTypes Page without crashing', () => {
    render(<DebtTypes />);
  });
});
