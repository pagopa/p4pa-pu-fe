import { describe, it, vi } from 'vitest';
import DebtPositionsInstallmentDetail from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn()
}));

describe('Debt Positions Installment Detail Page', () => {
  it('renders Debt Positions Installmeent Detail page without crashing', () => {
    render(<DebtPositionsInstallmentDetail />);
  });
});
