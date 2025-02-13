import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DetailFlowPage from '../DetailFlowPage/DetailFlowPage';
import { useParams } from 'react-router-dom';

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

describe('DetailFlowPage', () => {
  const mockUseParams = vi.mocked(useParams);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders double card with title and download button', () => {
    mockUseParams.mockReturnValue({ category: 'receipt' });

    render(<DetailFlowPage />);

    expect(screen.getByText(/commons.summary/i)).toBeDefined();
    expect(screen.getByText(/commons.payment/i)).toBeDefined();
    expect(screen.getByRole('button', { name: 'commons.files.download' })).toBeDefined();
  });

  it('renders double card without download button', () => {
    mockUseParams.mockReturnValue({ category: 'reporting' });

    render(<DetailFlowPage />);

    expect(screen.queryByRole('button', { name: 'commons.files.download' })).toBeNull();
  });

  it('renders single card without section titles', () => {
    mockUseParams.mockReturnValue({ category: 'treasury' });

    render(<DetailFlowPage />);

    expect(screen.queryByText(/commons.summary/i)).toBeNull();
    expect(screen.queryByText(/commons.payment/i)).toBeNull();
  });
});
