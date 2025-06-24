import { describe, it, vi } from 'vitest';
import TaxonomyPage from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn()
}));

describe('TaxonomyPage Page', () => {
  it('renders TaxonomyPage without crashing', () => {
    render(<TaxonomyPage />);
  });
});
