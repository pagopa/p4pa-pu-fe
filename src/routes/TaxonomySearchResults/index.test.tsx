import { describe, it, vi } from 'vitest';
import { render } from '../../__tests__/renderers';
import TaxonomySearchResults from '.';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn()
}));

describe('TaxonomySearchResults Page', () => {
  it('renders TaxonomyPage without crashing', () => {
    render(<TaxonomySearchResults />);
  });
});
