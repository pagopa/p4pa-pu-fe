/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, vi, expect, beforeEach } from 'vitest';
import {
  fireEvent,
  render,
  screen,
  within,
  waitFor
} from '../../__tests__/renderers';
import ImportFlow from './ImportFlowPage';
import { useParams, useNavigate } from 'react-router';
import { PageRoutes } from '../../routes';
import * as ingestionFlowFiles from '../../api/ingestionFlowFiles';
import utils from '../../utils';

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
  useParams: vi.fn()
}));

vi.mock('../../api/ingestionFlowFiles');
vi.mock('../../store/GlobalStore', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useStore: () => ({
      state: { organizationId: 123 }
    })
  };
});

vi.mock('../../utils', () => ({
  default: {
    config: {
      deployPath: '/test-path'
    },
    notify: {
      emit: vi.fn()
    }
  }
}));

describe('ImportFlow', () => {
  const mockUseParams = vi.mocked(useParams);
  const mockUseNavigate = vi.mocked(useNavigate);
  const mockNavigate = vi.fn();
  const mockUploadMutate = vi.fn();
  const mockNotifyEmit = vi.mocked(utils.notify.emit);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);

    vi.mocked(ingestionFlowFiles.uploadIngestionFlowFile).mockReturnValue({
      mutate: mockUploadMutate
    } as any);
  });

  describe('no select Config', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ category: 'reporting' });
    });

    it('renders without select', () => {
      render(<ImportFlow />);

      expect(screen.getByText('commons.importNewFlow')).toBeDefined();
      expect(screen.getByText('commons.flowImport.description')).toBeDefined();
      expect(screen.getByText('commons.flowImport.boxTitle')).toBeDefined();
      expect(
        screen.getByText('commons.flowImport.boxDescription')
      ).toBeDefined();
      expect(screen.getByText('commons.flowImport.manualLink')).toBeDefined();
      expect(screen.queryByText('commons.requiredFieldDescription')).toBeNull();
      expect(screen.queryByLabelText('commons.flowType')).toBeNull();
    });

    it('should enable button when a file is uploaded', async () => {
      render(<ImportFlow />);

      const file = new File(['content'], 'test1_2.zip', {
        type: 'application/zip'
      });
      const dropZone = screen.getByTestId('drop-zone');

      fireEvent.dragOver(dropZone);
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });

      await vi.waitFor(() =>
        expect(screen.getAllByText('test1_2.zip')).toBeDefined()
      );
      const successButton = screen.getByTestId('success-button');

      expect(successButton).toHaveProperty('disabled', false);
    });

    it('handles 4xx error by navigating to error page', async () => {
      const mockError = {
        response: {
          status: 400
        }
      };

      mockUploadMutate.mockImplementation((_file, options) => {
        options.onError(mockError);
      });

      render(<ImportFlow />);

      const file = new File(['content'], 'test1_2.zip', {
        type: 'application/zip'
      });
      const dropZone = screen.getByTestId('drop-zone');

      fireEvent.dragOver(dropZone);
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });

      await vi.waitFor(() =>
        expect(screen.getAllByText('test1_2.zip')).toBeDefined()
      );

      const successButton = screen.getByTestId('success-button');
      fireEvent.click(successButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR, {
          state: {
            category: 'reporting-import',
            statusCode: 400
          }
        });
      });
    });

    it('handles non-4xx error by showing notification', async () => {
      const mockError = {
        response: {
          status: 500
        }
      };

      mockUploadMutate.mockImplementation((_file, options) => {
        options.onError(mockError);
      });

      render(<ImportFlow />);

      const file = new File(['content'], 'test1_2.zip', {
        type: 'application/zip'
      });
      const dropZone = screen.getByTestId('drop-zone');

      fireEvent.dragOver(dropZone);
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });

      await vi.waitFor(() =>
        expect(screen.getAllByText('test1_2.zip')).toBeDefined()
      );

      const successButton = screen.getByTestId('success-button');
      fireEvent.click(successButton);

      await waitFor(() => {
        expect(mockNotifyEmit).toHaveBeenCalledWith(
          'commons.importFlowErrorMessage'
        );
      });
    });

    it('handles network error by showing notification', async () => {
      const mockError = new Error('Network Error');

      mockUploadMutate.mockImplementation((_file, options) => {
        options.onError(mockError);
      });

      render(<ImportFlow />);

      const file = new File(['content'], 'test1_2.zip', {
        type: 'application/zip'
      });
      const dropZone = screen.getByTestId('drop-zone');

      fireEvent.dragOver(dropZone);
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });

      await vi.waitFor(() =>
        expect(screen.getAllByText('test1_2.zip')).toBeDefined()
      );

      const successButton = screen.getByTestId('success-button');
      fireEvent.click(successButton);

      await waitFor(() => {
        expect(mockNotifyEmit).toHaveBeenCalledWith(
          'commons.importFlowErrorMessage'
        );
      });
    });

    it('handles successful upload', async () => {
      mockUploadMutate.mockImplementation((_file, options) => {
        options.onSuccess();
      });

      render(<ImportFlow />);

      const file = new File(['content'], 'test1_2.zip', {
        type: 'application/zip'
      });
      const dropZone = screen.getByTestId('drop-zone');

      fireEvent.dragOver(dropZone);
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });

      await vi.waitFor(() =>
        expect(screen.getAllByText('test1_2.zip')).toBeDefined()
      );

      const successButton = screen.getByTestId('success-button');
      fireEvent.click(successButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          PageRoutes.RESPONSES_SUCCESS,
          {
            state: {
              category: 'reporting-import'
            }
          }
        );
      });
    });
  });

  describe('select config', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ category: 'treasury' });
    });

    it('renders with select', () => {
      render(<ImportFlow />);

      expect(screen.getByText('commons.importNewFlow')).toBeDefined();
      expect(
        screen.getByText('commons.requiredFieldDescription')
      ).toBeDefined();
      expect(screen.getByRole('select-flowType')).toBeDefined();
      expect(screen.getByTestId('success-button')).toHaveProperty(
        'disabled',
        true
      );
    });

    it('should show all flow type options when select is clicked', () => {
      render(<ImportFlow />);

      const selectCombo = screen.getByRole('combobox', {
        name: 'commons.flowType'
      });
      fireEvent.mouseDown(selectCombo);

      const listbox = within(screen.getByRole('listbox'));

      const options = [
        'commons.flowTypes.TREASURY_OPI',
        'commons.flowTypes.TREASURY_CSV',
        'commons.flowTypes.TREASURY_XLS',
        'commons.flowTypes.TREASURY_POSTE'
      ];

      options.forEach((option) => {
        expect(listbox.getByText(option)).toBeDefined();
      });
    });

    it('should enable button when a file is uploaded and a flow type is selected', async () => {
      render(<ImportFlow />);

      const file = new File(['content'], 'test1_2.zip', {
        type: 'application/zip'
      });
      const dropZone = screen.getByTestId('drop-zone');

      fireEvent.dragOver(dropZone);
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });

      await vi.waitFor(() =>
        expect(screen.getAllByText('test1_2.zip')).toBeDefined()
      );

      const selectCombo = screen.getByRole('combobox', {
        name: 'commons.flowType'
      });
      fireEvent.mouseDown(selectCombo);

      const firstOption = within(screen.getByRole('listbox')).getAllByRole(
        'option'
      )[0];
      fireEvent.click(firstOption);

      expect(screen.getByTestId('success-button')).toHaveProperty(
        'disabled',
        false
      );
    });

    it('handles 4xx error for treasury category', async () => {
      const mockError = {
        response: {
          status: 403
        }
      };

      mockUploadMutate.mockImplementation((_file, options) => {
        options.onError(mockError);
      });

      render(<ImportFlow />);

      const file = new File(['content'], 'test1_2.zip', {
        type: 'application/zip'
      });
      const dropZone = screen.getByTestId('drop-zone');

      fireEvent.dragOver(dropZone);
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });

      await vi.waitFor(() =>
        expect(screen.getAllByText('test1_2.zip')).toBeDefined()
      );

      const successButton = screen.getByTestId('success-button');
      fireEvent.click(successButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR, {
          state: {
            category: 'treasury-import',
            statusCode: 403
          }
        });
      });
    });

    it('does not upload when no file is selected', () => {
      render(<ImportFlow />);

      const successButton = screen.getByTestId('success-button');
      expect(successButton).toHaveProperty('disabled', true);

      fireEvent.click(successButton);

      expect(mockUploadMutate).not.toHaveBeenCalled();
    });
  });
});
