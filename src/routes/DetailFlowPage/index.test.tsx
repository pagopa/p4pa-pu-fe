import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import DetailFlowPage from '.';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useParams: () => ({ category: 'receipt' }),
}));


describe('Detail Flow Page', () => {

  it('renders Detail Flow without crashing', () => {
    render(<DetailFlowPage />);
  });
});
