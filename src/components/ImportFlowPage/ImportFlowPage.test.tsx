import { describe, it, vi, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import ImportFlow from './ImportFlowPage';
import { useParams } from 'react-router-dom';

vi.mock('react-router-dom',  async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
  useParams: vi.fn(),
}));

describe('ImportFlow', () => {
  const mockUseParams = vi.mocked(useParams);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('no select Config', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ category: 'reporting' });
    });

    it('renders without select', () => {
      render(<ImportFlow/>);

      expect(screen.getByText('commons.routes.REPORTING_IMPORT_FLOW')).toBeDefined();
      expect(screen.getByText('commons.flowImport.description')).toBeDefined();
      expect(screen.getByText('commons.flowImport.boxTitle')).toBeDefined();
      expect(screen.getByText('commons.flowImport.boxDescription')).toBeDefined();
      expect(screen.getByText('commons.flowImport.manualLink')).toBeDefined();
      expect(screen.queryByText('commons.requiredFieldDescription')).toBeNull();
      expect(screen.queryByLabelText('commons.flowType')).toBeNull();
    });

    it('should enable button when a file is uploaded', async () => {

      render(<ImportFlow />);
    
      const file = new File(['content'], 'test.zip', { type: 'application/zip' });
      const dropZone = screen.getByTestId('drop-zone');

      fireEvent.dragOver(dropZone);
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });
      
      await vi.waitFor(() => expect(screen.getAllByText('test.zip')).toBeDefined());
      const successButton = screen.getByTestId('success-button');

      expect(successButton).toHaveProperty('disabled', false);
    });
  });

  describe('select config', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ category: 'treasury' });
    });

    it('renders with select', () => {
      render(<ImportFlow />);

      expect(screen.getByText('commons.routes.TREASURY_IMPORT_FLOW')).toBeDefined();
      expect(screen.getByText('commons.requiredFieldDescription')).toBeDefined();
      expect(screen.getByRole('select-flowType')).toBeDefined();
      expect(screen.getByTestId('success-button')).toHaveProperty('disabled', true);
    });

    it('should show all flow type options when select is clicked', () => {
      render(<ImportFlow />);
    
      const selectCombo = screen.getByRole('combobox', { name: 'commons.flowType' });
      fireEvent.mouseDown(selectCombo);
    
      const listbox = within(screen.getByRole('listbox'));
    
      const options = [
        'Giornale di Cassa XLS',
        'Giornale di Cassa CSV',
        'Giornale di Cassa OPI',
        'Estrato conto poste'
      ];
    
      options.forEach(option => {
        expect(listbox.getByText(option)).toBeDefined();
      });
    }); 
    it('should enable button when a file is uploaded and a flow type is selected', async () => {

      render(<ImportFlow />);
    
      const file = new File(['content'], 'test.zip', { type: 'application/zip' });
      const dropZone = screen.getByTestId('drop-zone');

      fireEvent.dragOver(dropZone);
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });
      
      await vi.waitFor(() => expect(screen.getAllByText('test.zip')).toBeDefined());

      const selectCombo = screen.getByRole('combobox', { name: 'commons.flowType' });
      fireEvent.mouseDown(selectCombo);
      
      const firstOption = within(screen.getByRole('listbox')).getAllByRole('option')[0];
      fireEvent.click(firstOption);

      expect(screen.getByTestId('success-button')).toHaveProperty('disabled', false);
    });
  });
});
