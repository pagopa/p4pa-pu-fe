import { describe, it, vi } from 'vitest';
import ReportingSearchResults from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn()
}));

describe('Reporting Page', () => {
  it('renders Reporting without crashing', () => {
    render(<ReportingSearchResults />);
  });
});
