import { describe, it, vi } from 'vitest';
import TelematicReceiptFlowImportThankYouPage from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn()
}));

describe('TelematicReceiptFlowImportThankYouPage Page', () => {
  it('renders Telematic Receipt Import Thenk You Page without crashing', () => {
    render(<TelematicReceiptFlowImportThankYouPage />);
  });
});
