import { describe, it, vi } from 'vitest';
import TelematicReceiptFlowExportOverview from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

describe('TelematicReceiptFlowExportOverview Page', () => {
  it('renders Telematic Receipt Flow Export view without crashing', () => {
    render(<TelematicReceiptFlowExportOverview />);
  });
});
