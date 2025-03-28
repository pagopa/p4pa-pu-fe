import { describe, it, vi } from 'vitest';
import ReportingSearchResults from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom'
    );
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(() => ({ state: { filters: {} } })),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
  };
});

describe('Reporting Page', () => {
  it('renders Reporting without crashing', () => {
    render(<ReportingSearchResults />);
  });
});
