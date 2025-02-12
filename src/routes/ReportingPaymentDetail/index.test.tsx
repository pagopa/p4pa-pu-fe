import { describe, it, vi } from 'vitest';
import ReportingPaymentDetail from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

describe('Reporting Payment Detail Page', () => {
  it('renders Reporting Payment Detail without crashing', () => {
    render(<ReportingPaymentDetail />);
  });
});
