import { describe, it, vi } from 'vitest';
import ReportingFlowImportThankYouPage from '../../components/ReportingFlowImport/ReportingFlowImportThankYouPage';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

describe('Reporting Thank You Page', () => {
  it('renders Reporting Thank You Page without crashing', () => {
    render(<ReportingFlowImportThankYouPage />);
  });
});
