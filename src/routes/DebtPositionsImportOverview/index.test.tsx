import { describe, it, vi } from 'vitest';
import DebtPositionsImportOverview from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn()
}));

describe('Debt Positions Import Overview Page', () => {
  it('renders Debt Positions Import Overview Page without crashing', () => {
    render(<DebtPositionsImportOverview />);
  });
});
