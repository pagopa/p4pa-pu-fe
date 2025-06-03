import { describe, it, vi } from 'vitest';
import DebtPositionsImportOverview from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
  };
});

describe('Debt Positions Import Overview Page', () => {
  it('renders Debt Positions Import Overview Page without crashing', () => {
    render(<DebtPositionsImportOverview />);
  });
});
