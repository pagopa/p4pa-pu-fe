import { describe, it, vi } from 'vitest';
import TelematicReceipt from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn()
}));

describe('TelematicReceipt Page', () => {
  it('renders Telematic Receipt without crashing', () => {
    render(<TelematicReceipt />);
  });
});
