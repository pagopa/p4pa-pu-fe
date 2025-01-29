import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import FileUploader from './FileUploader';
import { ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

describe('FileUploader Component', () => {
  const mockSetUploading = vi.fn();
  const mockSetProgress = vi.fn();
  const mockSetFile = vi.fn();

  const defaultProps = {
    uploading: false,
    setUploading: mockSetUploading,
    progress: 0,
    setProgress: mockSetProgress,
    file: null,
    setFile: mockSetFile,
    description: 'Drag and drop or upload a file',
    requiredFieldText: 'This field is required',
    fileExtensionsAllowed: ['zip'],
  };

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    renderWithTheme(<FileUploader {...defaultProps} />);
    
    expect(screen.getByText('commons.file')).toBeDefined();
    expect(screen.getByText(defaultProps.description)).toBeDefined();
    expect(screen.getByText(defaultProps.requiredFieldText)).toBeDefined();
    expect(screen.getByTestId('drop-zone')).toBeDefined();
    expect(screen.getByText('commons.files.upload')).toBeDefined();
  });

  describe('File Upload Handling', () => {
    it('handles valid file upload through input', async () => {
      renderWithTheme(<FileUploader {...defaultProps} />);
      const file = new File(['test content'], 'test.zip', { type: 'application/zip' });
      const input = screen.getByTestId('input-file');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockSetUploading).toHaveBeenCalledWith(true);
        expect(mockSetProgress).toHaveBeenCalledWith(0);
        expect(mockSetFile).toHaveBeenCalledWith(file);
      });
    });

    it('handles invalid file extension through input', () => {
      renderWithTheme(<FileUploader {...defaultProps} />);
      const invalidFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByTestId('input-file');

      fireEvent.change(input, { target: { files: [invalidFile] } });

      expect(screen.getByText('commons.files.notvalid')).toBeDefined();
      expect(mockSetFile).not.toHaveBeenCalled();
    });

    it('shows upload progress', () => {
      renderWithTheme(<FileUploader {...defaultProps} uploading={true} progress={50} />);
      
      expect(screen.getByText('commons.uploadInProgress')).toBeDefined();
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar.getAttribute('aria-valuenow')).toBe('50');
    });
  });

  describe('Drag and Drop Functionality', () => {
    it('handles valid file drop', async () => {
      renderWithTheme(<FileUploader {...defaultProps} />);
      const file = new File(['content'], 'test.zip', { type: 'application/zip' });
      const dropZone = screen.getByTestId('drop-zone');

      fireEvent.dragOver(dropZone);
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });

      await waitFor(() => {
        expect(mockSetUploading).toHaveBeenCalledWith(true);
        expect(mockSetProgress).toHaveBeenCalledWith(0);
        expect(mockSetFile).toHaveBeenCalledWith(file);
      });
    });

    it('handles invalid file drop', () => {
      renderWithTheme(<FileUploader {...defaultProps} />);
      const invalidFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const dropZone = screen.getByTestId('drop-zone');

      fireEvent.dragOver(dropZone);
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [invalidFile]
        }
      });

      expect(screen.getByText('commons.files.notvalid')).toBeDefined();
      expect(mockSetFile).not.toHaveBeenCalled();
    });
  });

  describe('File Display and Removal', () => {
    it('displays uploaded file information correctly', () => {
      const file = new File(['test content'], 'test.zip', { type: 'application/zip' });
      renderWithTheme(<FileUploader {...defaultProps} file={file} />);

      expect(screen.getByText('test.zip')).toBeDefined();
      expect(screen.queryByText(/Bytes/)).toBeDefined();
    });

    it('handles file removal', () => {
      const file = new File(['test content'], 'test.zip', { type: 'application/zip' });
      renderWithTheme(<FileUploader {...defaultProps} file={file} />);

      const removeButton = screen.getByLabelText('commons.removeFile');
      fireEvent.click(removeButton);

      expect(mockSetFile).toHaveBeenCalledWith(null);
      expect(mockSetProgress).toHaveBeenCalledWith(0);
    });
  });

  describe('File Size Formatting', () => {
    it('formats file size in bytes', () => {
      const file = new File(['x'.repeat(500)], 'test.zip', { type: 'application/zip' });
      renderWithTheme(<FileUploader {...defaultProps} file={file} />);
      
      expect(screen.getByText(/500 Bytes/)).toBeDefined();
    });

    it('formats file size in KB', () => {
      const file = new File(['x'.repeat(1024 * 2)], 'test.zip', { type: 'application/zip' });
      renderWithTheme(<FileUploader {...defaultProps} file={file} />);
      
      expect(screen.getByText(/2.0 KB/)).toBeDefined();
    });

    it('formats file size in MB', () => {
      const file = new File(['x'.repeat(1024 * 1024 * 2)], 'test.zip', { type: 'application/zip' });
      renderWithTheme(<FileUploader {...defaultProps} file={file} />);
      
      expect(screen.getByText(/2.00 MB/)).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('allows dismissing error message', () => {
      renderWithTheme(<FileUploader {...defaultProps} />);
      const invalidFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByTestId('input-file');

      fireEvent.change(input, { target: { files: [invalidFile] } });
      const closeButton = screen.getByTestId('close-alert-button');
      
      fireEvent.click(closeButton);
      
      expect(screen.queryByText('commons.files.notvalid')).toBeNull();
    });
  });
});
