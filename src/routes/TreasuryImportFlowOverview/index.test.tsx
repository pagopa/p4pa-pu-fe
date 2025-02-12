import { describe, it, vi } from 'vitest';
import TreasuryImportFlowOverview from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

describe('Treasury Import Flow Overview Page', () => {

  it('renders Treasury Import Flow Overview Page without crashing', () => {
    render(<TreasuryImportFlowOverview />);
  });
});
