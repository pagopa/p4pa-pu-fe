import { describe, it, vi } from 'vitest';
import TelematicReceiptSearchResults from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn()
}));

describe('TelematicReceiptSearchResults Page', () => {
  it('renders Telematic Receipt Search results view without crashing', () => {
    render(<TelematicReceiptSearchResults />);
  });
});
