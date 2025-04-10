import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import ExportFlow from './ExportFlowPage';
import { useParams } from 'react-router-dom';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
  useParams: vi.fn()
}));

vi.mock('./useDebtPositionsTypeOrg', () => ({
  useDebtPositionsTypeOrg: () => ({
    isSuccess: true,
    optionsMap: [
      { label: 'Type A', value: 1 },
      { label: 'Type B', value: 2 }
    ]
  })
}));

describe('ExportFlow', () => {
  const mockUseParams = vi.mocked(useParams);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('complete config', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ category: 'receipt' });
    });

    it('renders with dueType select', () => {
      render(<ExportFlow />);

      expect(screen.getByText('exportFlow.title')).toBeDefined();
      expect(screen.getByText('commons.paymentDate')).toBeDefined();
      expect(screen.getAllByText('exportFlow.fileVersion')[0]).toBeDefined();
      expect(screen.getByText('exportFlow.dueType')).toBeDefined();
      expect(screen.getByTestId('exit-button')).toBeDefined();
      expect(screen.getByTestId('success-button')).toBeDefined();
    });

    it('keeps success button disabled initially', () => {
      render(<ExportFlow />);

      const button = screen.getByTestId('success-button');
      expect(button).toHaveProperty('disabled', true);
    });
  });

  describe('config without dueType select', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ category: 'conservation' });
    });

    it('renders without dueType select', () => {
      render(<ExportFlow />);
      expect(screen.queryByText('exportFlow.dueType')).toBeNull();
    });
  });
});
