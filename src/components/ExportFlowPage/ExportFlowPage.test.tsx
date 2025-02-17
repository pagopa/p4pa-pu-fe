import { describe, it, vi, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import ExportFlow from './ExportFlowPage';
import { useParams } from 'react-router-dom';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
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
      render(<ExportFlow/>);

      expect(screen.getByText('exportFlow.title')).toBeDefined();
      expect(screen.getByText('commons.paymentDate')).toBeDefined();
      expect(screen.getByText('commons.from')).toBeDefined();
      expect(screen.getByText('commons.to')).toBeDefined();
      expect(screen.getAllByText('exportFlow.fileVersion')[0]).toBeDefined();
      expect(screen.getByText('exportFlow.dueType')).toBeDefined();
      expect(screen.getByTestId('exit-button')).toBeDefined();
      expect(screen.getByTestId('success-button')).toBeDefined();
    });

    it('enable button when required fields are filled', async () => {
  
      render(<ExportFlow />);

      const inputsDate = screen.getAllByRole('textbox');
      const inputfileVersion = screen.getAllByRole('combobox');
      
      fireEvent.change(inputsDate[0], { target: { value: '10/10/2025' } });
      fireEvent.change(inputsDate[1], { target: { value: '20/10/2025' } });

      fireEvent.mouseDown(inputfileVersion[0]);

      expect(screen.getByRole('listbox')).toBeDefined();
      const listbox = screen.getAllByRole('listbox')[0];
      
      const firstOption = within(listbox).getAllByRole('option')[0];
      fireEvent.click(firstOption);

      const successButton = screen.getByTestId('success-button');

      expect(successButton).toHaveProperty('disabled', false);
    });
  });
  describe('config without dueType select', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ category: 'conservation' });
    });

    it('renders without dueType select', () => {
      render(<ExportFlow/>);

      expect(screen.queryByText('exportFlow.dueType')).toBeNull();
    });
  });
});
