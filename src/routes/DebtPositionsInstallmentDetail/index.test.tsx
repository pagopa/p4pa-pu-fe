import { describe, it, Mock, vi } from 'vitest';
import DebtPositionsInstallmentDetail from '.';
import { render } from '../../__tests__/renderers';
import { useLocation } from 'react-router';

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
  useLocation: vi.fn()
}));

beforeEach(() => {
  (useLocation as Mock).mockReturnValue({
    state: {
      remittanceInformation: 'test remittanceInformation'
    }
  });
});
describe('Debt Positions Installment Detail Page', () => {
  it('renders Debt Positions Installmeent Detail page without crashing', () => {
    render(<DebtPositionsInstallmentDetail />);
  });
});
