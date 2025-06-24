import { describe, it, vi } from 'vitest';
import TelematicReceiptImportFlowOverview from '.';
import { render } from '../../__tests__/renderers';

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
  };
});

describe('TelematicReceiptImportFlowOverview Page', () => {
  it('renders Telematic Receipt Import Flow Overview results view without crashing', () => {
    render(<TelematicReceiptImportFlowOverview />);
  });
});
