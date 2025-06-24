import { describe, it, Mock, vi, beforeEach } from 'vitest';
import DebtPositionsInstallmentDetail from '.';
import { render } from '../../__tests__/renderers';
import { useLocation, useNavigate } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
  useLocation: vi.fn()
}));

beforeEach(() => {
  (useNavigate as Mock).mockReturnValue(mockNavigate);
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
