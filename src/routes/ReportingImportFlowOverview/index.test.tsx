import { describe, it, vi } from 'vitest';
import ReportingImportFlowOverview from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn()
}));

describe('Reporting Import Overview Page Page', () => {
  it('renders Reporting Import Overview Page without crashing', () => {
    render(<ReportingImportFlowOverview />);
  });
});
