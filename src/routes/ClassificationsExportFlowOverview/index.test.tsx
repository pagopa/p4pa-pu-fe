import { describe, it, vi } from 'vitest';
import ClassificationsExportFlowOverview from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
  };
});

describe('ClassificationsExportFlowOverview Page', () => {
  it('renders ClassificationsExportFlowOverview without crashing', () => {
    render(<ClassificationsExportFlowOverview />);
  });
});
