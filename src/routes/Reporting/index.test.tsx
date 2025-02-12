import { describe, it, vi } from 'vitest';
import Reporting from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

describe('Reporting Page', () => {
  it('renders Reporting without crashing', () => {
    render(<Reporting />);
  });
});
