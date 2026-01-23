import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor
} from '../../../__tests__/renderers';
import SpontaneousFormForm from './SpontaneousFormForm';

vi.mock('../../../store/GlobalStore', () => ({
  useStore: () => ({
    state: {
      organizationId: 123,
      APP_STATE: { loading: false, customBreadcrumbsItems: [] }
    },
    setState: vi.fn()
  }),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

describe('SpontaneousFormForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    mode: 'create' as const,
    isPending: false,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('renders create form with correct title and description', () => {
      render(<SpontaneousFormForm {...defaultProps} />);

      expect(
        screen.getByText('spontaneousForm.create.title')
      ).toBeInTheDocument();
      expect(
        screen.getByText('spontaneousForm.create.description')
      ).toBeInTheDocument();
    });

    it('renders all form fields', () => {
      render(<SpontaneousFormForm {...defaultProps} />);

      expect(screen.getByTestId('code')).toBeInTheDocument();
      expect(screen.getByTestId('structure')).toBeInTheDocument();
      expect(screen.getByTestId('dictionary')).toBeInTheDocument();
    });

    it('renders code field as enabled in create mode', () => {
      render(<SpontaneousFormForm {...defaultProps} />);

      const codeInput = screen.getByTestId('code').querySelector('input');
      expect(codeInput).not.toBeDisabled();
    });

    it('shows add button in create mode', () => {
      render(<SpontaneousFormForm {...defaultProps} />);

      expect(screen.getByText('commons.add')).toBeInTheDocument();
      expect(screen.queryByText('commons.save')).not.toBeInTheDocument();
    });

    it('renders empty fields by default', () => {
      render(<SpontaneousFormForm {...defaultProps} />);

      const codeInput = screen.getByTestId('code').querySelector('input');
      const structureInput = screen
        .getByTestId('structure')
        .querySelector('textarea');
      const dictionaryInput = screen
        .getByTestId('dictionary')
        .querySelector('textarea');

      expect(codeInput).toHaveValue('');
      expect(structureInput).toHaveValue('');
      expect(dictionaryInput).toHaveValue('');
    });

    it('shows validation errors when submitting empty form', async () => {
      render(<SpontaneousFormForm {...defaultProps} />);

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        const codeField = screen.getByTestId('code');
        expect(codeField.querySelector('.MuiInputBase-root')).toHaveClass(
          'Mui-error'
        );
      });

      await waitFor(() => {
        const structureField = screen.getByTestId('structure');
        expect(structureField.querySelector('.MuiInputBase-root')).toHaveClass(
          'Mui-error'
        );
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('calls onSubmit with form data and setError when form is valid', async () => {
      render(<SpontaneousFormForm {...defaultProps} />);

      const codeInput = screen.getByTestId('code').querySelector('input');
      const structureInput = screen
        .getByTestId('structure')
        .querySelector('textarea');

      if (codeInput && structureInput) {
        fireEvent.change(codeInput, { target: { value: 'TEST_CODE' } });
        fireEvent.change(structureInput, {
          target: { value: '{"fields":[]}' }
        });
      }

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          {
            code: 'TEST_CODE',
            structure: '{"fields":[]}',
            dictionary: ''
          },
          expect.any(Function)
        );
      });
    });

    it('calls onSubmit with dictionary when provided', async () => {
      render(<SpontaneousFormForm {...defaultProps} />);

      const codeInput = screen.getByTestId('code').querySelector('input');
      const structureInput = screen
        .getByTestId('structure')
        .querySelector('textarea');
      const dictionaryInput = screen
        .getByTestId('dictionary')
        .querySelector('textarea');

      if (codeInput && structureInput && dictionaryInput) {
        fireEvent.change(codeInput, { target: { value: 'TEST_CODE' } });
        fireEvent.change(structureInput, {
          target: { value: '{"fields":[]}' }
        });
        fireEvent.change(dictionaryInput, {
          target: { value: '{"IT":{}}' }
        });
      }

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          {
            code: 'TEST_CODE',
            structure: '{"fields":[]}',
            dictionary: '{"IT":{}}'
          },
          expect.any(Function)
        );
      });
    });
  });

  describe('Edit Mode', () => {
    const editProps = {
      ...defaultProps,
      mode: 'edit' as const,
      initialData: {
        code: 'EXISTING_CODE',
        structure: '{"fields":[{"name":"test"}]}',
        dictionary: '{"IT":{"test":{"label":"Test"}}}'
      }
    };

    it('renders edit form with correct title and description', () => {
      render(<SpontaneousFormForm {...editProps} />);

      expect(
        screen.getByText('spontaneousForm.edit.title')
      ).toBeInTheDocument();
      expect(
        screen.getByText('spontaneousForm.edit.description')
      ).toBeInTheDocument();
    });

    it('renders code field as disabled in edit mode', () => {
      render(<SpontaneousFormForm {...editProps} />);

      const codeInput = screen.getByTestId('code').querySelector('input');
      expect(codeInput).toBeDisabled();
    });

    it('shows save button in edit mode', () => {
      render(<SpontaneousFormForm {...editProps} />);

      expect(screen.getByText('commons.save')).toBeInTheDocument();
      expect(screen.queryByText('commons.add')).not.toBeInTheDocument();
    });

    it('pre-populates fields with initial data', () => {
      render(<SpontaneousFormForm {...editProps} />);

      const codeInput = screen.getByTestId('code').querySelector('input');
      const structureInput = screen
        .getByTestId('structure')
        .querySelector('textarea');
      const dictionaryInput = screen
        .getByTestId('dictionary')
        .querySelector('textarea');

      expect(codeInput).toHaveValue('EXISTING_CODE');
      expect(structureInput).toHaveValue('{"fields":[{"name":"test"}]}');
      expect(dictionaryInput).toHaveValue('{"IT":{"test":{"label":"Test"}}}');
    });

    it('allows editing structure field', async () => {
      render(<SpontaneousFormForm {...editProps} />);

      const structureInput = screen
        .getByTestId('structure')
        .querySelector('textarea');

      if (structureInput) {
        fireEvent.change(structureInput, {
          target: { value: '{"fields":[{"name":"updated"}]}' }
        });
      }

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            structure: '{"fields":[{"name":"updated"}]}'
          }),
          expect.any(Function)
        );
      });
    });

    it('allows editing dictionary field', async () => {
      render(<SpontaneousFormForm {...editProps} />);

      const dictionaryInput = screen
        .getByTestId('dictionary')
        .querySelector('textarea');

      if (dictionaryInput) {
        fireEvent.change(dictionaryInput, {
          target: { value: '{"EN":{}}' }
        });
      }

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            dictionary: '{"EN":{}}'
          }),
          expect.any(Function)
        );
      });
    });
  });

  describe('Common Behavior', () => {
    it('calls onCancel when cancel button is clicked', () => {
      render(<SpontaneousFormForm {...defaultProps} />);

      const cancelButton = screen.getByTestId('cancel-button');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('renders back button with correct label', () => {
      render(<SpontaneousFormForm {...defaultProps} />);

      expect(screen.getByText('commons.back')).toBeInTheDocument();
    });

    it('renders required field description', () => {
      render(<SpontaneousFormForm {...defaultProps} />);

      expect(
        screen.getByText('commons.requiredFieldDescription')
      ).toBeInTheDocument();
    });

    it('renders form configuration section', () => {
      render(<SpontaneousFormForm {...defaultProps} />);

      expect(
        screen.getByText('spontaneousForm.create.formConfiguration')
      ).toBeInTheDocument();
    });

    it('renders general configuration section', () => {
      render(<SpontaneousFormForm {...defaultProps} />);

      expect(
        screen.getByText('spontaneousForm.create.generalConfiguration')
      ).toBeInTheDocument();
    });

    it('renders translations section', () => {
      render(<SpontaneousFormForm {...defaultProps} />);

      expect(
        screen.getByText('spontaneousForm.create.translations')
      ).toBeInTheDocument();
    });

    it('disables submit button when isPending is true', () => {
      render(<SpontaneousFormForm {...defaultProps} isPending={true} />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('disables code field when isPending is true', () => {
      render(<SpontaneousFormForm {...defaultProps} isPending={true} />);

      const codeInput = screen.getByTestId('code').querySelector('input');
      expect(codeInput).toBeDisabled();
    });

    it('disables structure field when isPending is true', () => {
      render(<SpontaneousFormForm {...defaultProps} isPending={true} />);

      const structureInput = screen
        .getByTestId('structure')
        .querySelector('textarea');
      expect(structureInput).toBeDisabled();
    });

    it('disables dictionary field when isPending is true', () => {
      render(<SpontaneousFormForm {...defaultProps} isPending={true} />);

      const dictionaryInput = screen
        .getByTestId('dictionary')
        .querySelector('textarea');
      expect(dictionaryInput).toBeDisabled();
    });
  });

  describe('Validation', () => {
    it('shows error for empty code on submit', async () => {
      render(<SpontaneousFormForm {...defaultProps} />);

      const structureInput = screen
        .getByTestId('structure')
        .querySelector('textarea');

      if (structureInput) {
        fireEvent.change(structureInput, {
          target: { value: '{"fields":[]}' }
        });
      }

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        const codeField = screen.getByTestId('code');
        expect(codeField.querySelector('.MuiInputBase-root')).toHaveClass(
          'Mui-error'
        );
      });
    });

    it('shows error for empty structure on submit', async () => {
      render(<SpontaneousFormForm {...defaultProps} />);

      const codeInput = screen.getByTestId('code').querySelector('input');

      if (codeInput) {
        fireEvent.change(codeInput, { target: { value: 'TEST_CODE' } });
      }

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        const structureField = screen.getByTestId('structure');
        expect(structureField.querySelector('.MuiInputBase-root')).toHaveClass(
          'Mui-error'
        );
      });
    });

    it('does not show error for empty dictionary (optional field)', async () => {
      render(<SpontaneousFormForm {...defaultProps} />);

      const codeInput = screen.getByTestId('code').querySelector('input');
      const structureInput = screen
        .getByTestId('structure')
        .querySelector('textarea');

      if (codeInput && structureInput) {
        fireEvent.change(codeInput, { target: { value: 'TEST_CODE' } });
        fireEvent.change(structureInput, {
          target: { value: '{"fields":[]}' }
        });
      }

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const dictionaryField = screen.getByTestId('dictionary');
      expect(
        dictionaryField.querySelector('.MuiInputBase-root')
      ).not.toHaveClass('Mui-error');
    });
  });

  describe('Initial Data Handling', () => {
    it('handles undefined initialData gracefully', () => {
      render(<SpontaneousFormForm {...defaultProps} initialData={undefined} />);

      const codeInput = screen.getByTestId('code').querySelector('input');
      expect(codeInput).toHaveValue('');
    });

    it('handles partial initialData', () => {
      render(
        <SpontaneousFormForm
          {...defaultProps}
          mode="edit"
          initialData={{
            code: 'CODE_ONLY',
            structure: '{}',
            dictionary: undefined
          }}
        />
      );

      const codeInput = screen.getByTestId('code').querySelector('input');
      const dictionaryInput = screen
        .getByTestId('dictionary')
        .querySelector('textarea');

      expect(codeInput).toHaveValue('CODE_ONLY');
      expect(dictionaryInput).toHaveValue('');
    });

    it('handles empty string dictionary in initialData', () => {
      render(
        <SpontaneousFormForm
          {...defaultProps}
          mode="edit"
          initialData={{
            code: 'TEST',
            structure: '{}',
            dictionary: ''
          }}
        />
      );

      const dictionaryInput = screen
        .getByTestId('dictionary')
        .querySelector('textarea');
      expect(dictionaryInput).toHaveValue('');
    });
  });
});
