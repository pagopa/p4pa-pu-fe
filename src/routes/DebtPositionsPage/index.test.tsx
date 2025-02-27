import { describe, it, vi } from 'vitest';
import DebtPositionsPage from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn()
}));

describe('Debt Positions page Page', () => {
  it('renders Debt Positions page without crashing', () => {
    render(<DebtPositionsPage />);
  });
});
