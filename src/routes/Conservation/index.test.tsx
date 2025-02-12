import { describe, it, vi } from 'vitest';
import Conservation from './Index';
import { render } from '../../__tests__/renderers';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

describe('Conservation Page', () => {
  it('renders Conservation without crashing', () => {
    render(<Conservation />);
  });
});
