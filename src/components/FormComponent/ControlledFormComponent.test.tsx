import { vi } from 'vitest';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormComponent } from '.';
import { fireEvent, render, screen, waitFor } from '../../__tests__/renderers';
import { pickSelect } from '../../__tests__/utils';

// Mock FileUploader for isolation and control
vi.mock('../FileUploader/FileUploader', () => ({
  default: ({
    file,
    setFile,
    description,
    fileExtensionsAllowed
  }: {
    file: File | null;
    setFile: ({ name, type }: { name: string; type: string }) => void;
    description: string;
    fileExtensionsAllowed: Array<string>;
  }) => (
    <div data-testid="file-uploader-mock">
      <span>{description}</span>
      <span>{file?.name || ''}</span>
      <button
        type="button"
        onClick={() => setFile({ name: 'test.pdf', type: 'application/pdf' })}
      >
        Upload
      </button>
      <span data-testid="extensions">{fileExtensionsAllowed.join(',')}</span>
    </div>
  )
}));

// Test component wrappers to use the hook form context
const TestTextField = ({
  defaultValue = '',
  required = false
}: {
  defaultValue?: string;
  required?: boolean;
}) => {
  const schema = z.object({
    testField: required
      ? z.string().min(1, 'Field is required')
      : z.string().optional()
  });

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      testField: defaultValue
    },
    mode: 'onTouched'
  });

  const onSubmit = vi.fn();

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="test-form">
      <FormComponent.ControlledTextField
        name="testField"
        control={control}
        label="Test Field"
        required={required}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

const TestSelect = ({
  defaultValue = 0,
  required = false
}: {
  defaultValue?: number;
  required?: boolean;
}) => {
  const schema = z.object({
    testSelect: required
      ? z.number().min(1, 'Field is required')
      : z.number().optional()
  });

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      testSelect: defaultValue
    },
    mode: 'onTouched'
  });

  const onSubmit = vi.fn();

  const options = [
    { value: 1, label: 'Option 1' },
    { value: 2, label: 'Option 2' },
    { value: 3, label: 'Option 3' }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="test-form">
      <FormComponent.ControlledSelect
        name="testSelect"
        control={control}
        label="Test Select"
        options={options}
        required={required}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

const TestRadioGroup = ({
  defaultValue = 'option1',
  required = false
}: {
  defaultValue?: string;
  required?: boolean;
}) => {
  const schema = z.object({
    testRadio: required
      ? z.string().min(1, 'Field is required')
      : z.string().optional()
  });

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      testRadio: defaultValue
    },
    mode: 'onTouched'
  });

  const onSubmit = vi.fn();

  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="test-form">
      <FormComponent.ControlledRadioGroup
        name="testRadio"
        control={control}
        label="Test Radio Group"
        options={options}
        required={required}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

describe('Controlled Form Components', () => {
  describe('ControlledFileUploader', () => {
    type FormData = { file: File | null };

    const TestFileUploader = ({
      defaultValue = null
    }: {
      defaultValue?: File | null;
      required?: boolean;
    }) => {
      const { control, handleSubmit } = useForm<FormData>({
        defaultValues: { file: defaultValue },
        mode: 'onTouched'
      });
      const onSubmit = vi.fn();

      // If using zod, you can add validation here as in your other wrappers
      return (
        <form onSubmit={handleSubmit(onSubmit)} data-testid="test-form">
          <FormComponent.ControlledFileUploader
            name="file"
            description="File description"
            fileExtensionsAllowed={['pdf', 'jpg']}
            control={control}
          />
          <button type="submit">Submit</button>
        </form>
      );
    };

    it('renders description and allowed extensions', () => {
      render(<TestFileUploader />);
      expect(screen.getByText('File description')).toBeInTheDocument();
      expect(screen.getByTestId('extensions').textContent).toBe('pdf,jpg');
    });

    it('shows no file name initially', () => {
      render(<TestFileUploader />);
      // No file name displayed initially
      const fileName = screen
        .getByTestId('file-uploader-mock')
        .querySelector('span:nth-child(2)');
      expect(fileName?.textContent).toBe('');
    });

    it('updates value on upload', () => {
      render(<TestFileUploader />);
      const uploadBtn = screen.getByRole('button', { name: /upload/i });
      fireEvent.click(uploadBtn);
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });
  describe('ControlledTextField', () => {
    it('renders with default value', () => {
      render(<TestTextField defaultValue="Default Text" />);

      const input = screen.getByRole('textbox', { name: 'Test Field' });
      expect(input).toHaveValue('Default Text');
    });

    it('updates value on change', () => {
      render(<TestTextField />);

      const input = screen.getByRole('textbox', { name: 'Test Field' });
      fireEvent.change(input, { target: { value: 'New Text' } });

      expect(input).toHaveValue('New Text');
    });

    it('shows validation error when required field is empty', async () => {
      render(<TestTextField required={true} />);

      const input = screen.getByRole('textbox', { name: 'Test Field' });

      // Focus and blur to trigger validation
      fireEvent.focus(input);
      fireEvent.blur(input);

      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);

      // Check for error message
      await waitFor(() => {
        expect(screen.getByText('Field is required')).toBeInTheDocument();
      });
    });
  });

  describe('ControlledSelect', () => {
    it('renders with options', () => {
      render(<TestSelect />);

      const selectElement = screen.getByRole('combobox', {
        name: 'Test Select'
      });
      expect(selectElement).toBeInTheDocument();
    });

    it('allows selecting an option', async () => {
      render(<TestSelect />);

      // Select an option
      pickSelect('Test Select', 'Option 2');

      // The Select component should now display the selected option
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('shows validation error when required select is not chosen', async () => {
      render(<TestSelect required={true} />);

      // Submit the form without selecting
      const submitButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);

      // Check for error message
      await waitFor(() => {
        expect(screen.getByText('Field is required')).toBeInTheDocument();
      });
    });
  });

  describe('ControlledRadioGroup', () => {
    it('renders with default option selected', () => {
      render(<TestRadioGroup defaultValue="option2" />);

      const radioOption2 = screen.getByRole('radio', { name: 'Option 2' });
      expect(radioOption2).toBeChecked();
    });

    it('updates value when different option is selected', () => {
      render(<TestRadioGroup defaultValue="option1" />);

      const radioOption1 = screen.getByRole('radio', { name: 'Option 1' });
      const radioOption3 = screen.getByRole('radio', { name: 'Option 3' });

      expect(radioOption1).toBeChecked();

      // Click the third option
      fireEvent.click(radioOption3);

      // Check that selection changed
      expect(radioOption1).not.toBeChecked();
      expect(radioOption3).toBeChecked();
    });

    it('submits the form with the selected value', async () => {
      const onSubmitMock = vi.fn();

      const TestSubmittableRadioGroup = () => {
        const { control, handleSubmit } = useForm({
          defaultValues: {
            testRadio: 'option1'
          }
        });

        return (
          <form onSubmit={handleSubmit(onSubmitMock)} data-testid="test-form">
            <FormComponent.ControlledRadioGroup
              name="testRadio"
              control={control}
              label="Test Radio Group"
              options={[
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' }
              ]}
            />
            <button type="submit">Submit</button>
          </form>
        );
      };

      render(<TestSubmittableRadioGroup />);

      // Select second option
      const radioOption2 = screen.getByRole('radio', { name: 'Option 2' });
      fireEvent.click(radioOption2);

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);

      // Check that onSubmit was called with correct value
      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledWith(
          { testRadio: 'option2' },
          expect.anything()
        );
      });
    });
  });
});
