import { describe, it, vi } from 'vitest';
import TelematicReceiptDetail from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

describe('TelematicReceiptDetail Page', () => {
  it('renders Telematic Receipt Detail without crashing', () => {
    render(<TelematicReceiptDetail />);
  });
});
