import { describe, it, vi } from 'vitest';
import ClassificationsOverview from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
  };
});

describe('ClassificationsOverview Page', () => {
  it('renders ClassificationsOverview without crashing', () => {
    render(<ClassificationsOverview />);
  });
});
