import { render } from '../../__tests__/renderers';
import { describe, it, vi } from 'vitest';
import ExportFlowPage from './ExportFlowPage';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
  useParams: () => ({ category: 'treasury' })
}));

describe('Import Flow Page', () => {
  it('renders Import Flow without crashing', () => {
    render(<ExportFlowPage />);
  });
});
