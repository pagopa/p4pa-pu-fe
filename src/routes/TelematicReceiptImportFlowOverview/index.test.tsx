import { describe, it, vi } from 'vitest';
import TelematicReceiptImportFlowOverview from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

describe('TelematicReceiptImportFlowOverview Page', () => {
  it('renders Telematic Receipt Import Flow Overview results view without crashing', () => {
    render(<TelematicReceiptImportFlowOverview />);
  });
});
