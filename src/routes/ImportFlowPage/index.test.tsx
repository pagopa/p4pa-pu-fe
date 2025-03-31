import { describe, it, vi } from 'vitest';
import ImportFlowPage from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
  useParams: () => ({ category: 'treasury' })
}));

describe('Import Flow Page', () => {
  it('renders Import Flow without crashing', () => {
    render(<ImportFlowPage />);
  });
});
