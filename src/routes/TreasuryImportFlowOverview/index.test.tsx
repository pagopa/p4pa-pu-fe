import { describe, it, vi } from 'vitest';
import TreasuryImportFlowOverview from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
  };
});

describe('Treasury Import Flow Overview Page', () => {
  it('renders Treasury Import Flow Overview Page without crashing', () => {
    render(<TreasuryImportFlowOverview />);
  });
});
