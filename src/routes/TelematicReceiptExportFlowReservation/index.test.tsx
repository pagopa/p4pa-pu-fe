import { describe, it, vi } from 'vitest';
import TelematicReceiptExportFlowReservation from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

describe('TelematicReceiptExportFlowReservation Page', () => {
  it('renders Telematic Receipt Flow Reservation without crashing', () => {
    render(<TelematicReceiptExportFlowReservation />);
  });
});
