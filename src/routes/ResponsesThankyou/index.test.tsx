import { describe, expect, it, vi } from 'vitest';
import ImportFlowPage from '.';
import { render, screen } from '@testing-library/react';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
  useParams: () => ({ category: 'telematic-receipt-import' })
}));

describe('Responses Page', () => {
  it('renders Thank you page', () => {
    render(<ImportFlowPage />);
    expect(screen.getByText("commons.successImport")).toBeInTheDocument();
  });
});
