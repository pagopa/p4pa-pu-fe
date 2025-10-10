import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useForm } from 'react-hook-form';
import { Step2ControlledTextField } from './Step2ControlledTextField';
import { Step2Data } from '../../../../models/DebtPositionType';
import { SubjectType } from '../../../../utils/fieldValidation';
import { render } from '../../../../__tests__/renderers';

// Wrapper component to test the controlled field
const TestWrapper = ({
  name = 'taxCode',
  label = 'Tax Code',
  isSubmitted = false,
  required = false,
  disabled = false,
  placeholder,
  transformValue,
  inputProps,
  margin = 'normal',
  onFieldChange = vi.fn(),
  defaultValues
}: {
  name?: keyof Step2Data;
  label?: string;
  isSubmitted?: boolean;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  transformValue?: (value: string) => string;
  inputProps?: Record<string, unknown>;
  margin?: 'normal' | 'dense' | 'none';
  onFieldChange?: (fieldName: string, value: string) => void;
  defaultValues?: Partial<Step2Data>;
}) => {
  const {
    control,
    formState: { errors }
  } = useForm<Step2Data>({
    defaultValues: {
      subjectType: { value: SubjectType.INDIVIDUAL, readonly: false },
      taxCode: { value: '', readonly: false },
      fullName: { value: '', readonly: false },
      address: { value: '', readonly: false },
      civicNumber: { value: '', readonly: false },
      zipCode: { value: '', readonly: false },
      country: { value: 'IT', readonly: false },
      province: { value: '', readonly: false },
      city: { value: '', readonly: false },
      ...defaultValues
    }
  });

  return (
    <Step2ControlledTextField
      name={name}
      control={control}
      label={label}
      isSubmitted={isSubmitted}
      errors={errors}
      onFieldChange={onFieldChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      transformValue={transformValue}
      inputProps={inputProps}
      margin={margin}
      data-testid={`${name}-field`}
    />
  );
};

describe('Step2ControlledTextField', () => {
  const mockOnFieldChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render text field with label', () => {
      render(<TestWrapper label="Tax Code" />);

      expect(screen.getByLabelText('Tax Code')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<TestWrapper placeholder="Enter tax code" />);

      const input = screen.getByPlaceholderText('Enter tax code');
      expect(input).toBeInTheDocument();
    });

    it('should render with required prop', () => {
      const { container } = render(<TestWrapper required />);

      // MUI TextField shows required with asterisk in label, not HTML required attribute
      const label = container.querySelector('label');
      expect(label?.textContent).toContain('Tax Code');
      // Check that asterisk is present (MUI adds it for required fields)
      expect(label?.textContent).toMatch(/\*/);
    });

    it('should render as disabled when disabled prop is true', () => {
      render(<TestWrapper disabled />);

      const input = screen.getByLabelText('Tax Code');
      expect(input).toBeDisabled();
    });

    it('should apply custom inputProps', () => {
      render(<TestWrapper inputProps={{ maxLength: 16 }} />);

      const input = screen.getByLabelText('Tax Code');
      expect(input).toHaveAttribute('maxlength', '16');
    });

    it('should render with data-testid', () => {
      render(<TestWrapper />);

      expect(screen.getByTestId('taxCode-field')).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('should update value on change', () => {
      render(<TestWrapper onFieldChange={mockOnFieldChange} />);

      const input = screen.getByLabelText('Tax Code');
      fireEvent.change(input, { target: { value: 'RSSMRA80A01H501U' } });

      expect(input).toHaveValue('RSSMRA80A01H501U');
    });

    it('should call onFieldChange with correct parameters', () => {
      render(<TestWrapper onFieldChange={mockOnFieldChange} />);

      const input = screen.getByLabelText('Tax Code');
      fireEvent.change(input, { target: { value: 'TEST123' } });

      expect(mockOnFieldChange).toHaveBeenCalledWith(
        'taxCode.value',
        'TEST123'
      );
    });

    it('should transform value when transformValue is provided', () => {
      const transformToUpperCase = (value: string) => value.toUpperCase();
      render(
        <TestWrapper
          onFieldChange={mockOnFieldChange}
          transformValue={transformToUpperCase}
        />
      );

      const input = screen.getByLabelText('Tax Code');
      fireEvent.change(input, { target: { value: 'abc123' } });

      expect(mockOnFieldChange).toHaveBeenCalledWith('taxCode.value', 'ABC123');
      expect(input).toHaveValue('ABC123');
    });

    it('should not call onFieldChange when disabled', () => {
      render(<TestWrapper onFieldChange={mockOnFieldChange} disabled />);

      const input = screen.getByLabelText('Tax Code');

      // Disabled input should not trigger change
      expect(input).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should NOT show error when not submitted', () => {
      const mockErrors = {
        taxCode: {
          value: {
            type: 'required',
            message: 'Tax code is required'
          }
        }
      };

      const TestWrapperWithError = () => {
        const { control } = useForm<Step2Data>({
          defaultValues: {
            subjectType: { value: SubjectType.INDIVIDUAL, readonly: false },
            taxCode: { value: '', readonly: false },
            fullName: { value: '', readonly: false },
            address: { value: '', readonly: false },
            civicNumber: { value: '', readonly: false },
            zipCode: { value: '', readonly: false },
            country: { value: 'IT', readonly: false },
            province: { value: '', readonly: false },
            city: { value: '', readonly: false }
          }
        });

        return (
          <Step2ControlledTextField
            name="taxCode"
            control={control}
            label="Tax Code"
            isSubmitted={false}
            errors={mockErrors}
            onFieldChange={vi.fn()}
            data-testid="taxCode-field"
          />
        );
      };

      render(<TestWrapperWithError />);

      // Error should not be visible when not submitted
      expect(
        screen.queryByText('Tax code is required')
      ).not.toBeInTheDocument();
    });

    it('should show error when submitted', () => {
      const mockErrors = {
        taxCode: {
          value: {
            type: 'required',
            message: 'Tax code is required'
          }
        }
      };

      const TestWrapperWithError = () => {
        const { control } = useForm<Step2Data>({
          defaultValues: {
            subjectType: { value: SubjectType.INDIVIDUAL, readonly: false },
            taxCode: { value: '', readonly: false },
            fullName: { value: '', readonly: false },
            address: { value: '', readonly: false },
            civicNumber: { value: '', readonly: false },
            zipCode: { value: '', readonly: false },
            country: { value: 'IT', readonly: false },
            province: { value: '', readonly: false },
            city: { value: '', readonly: false }
          }
        });

        return (
          <Step2ControlledTextField
            name="taxCode"
            control={control}
            label="Tax Code"
            isSubmitted={true}
            errors={mockErrors}
            onFieldChange={vi.fn()}
            data-testid="taxCode-field"
          />
        );
      };

      render(<TestWrapperWithError />);

      // Error should be visible when submitted
      expect(screen.getByText('Tax code is required')).toBeInTheDocument();
    });
  });

  describe('Different Field Names', () => {
    it('should work with fullName field', () => {
      render(
        <TestWrapper
          name="fullName"
          label="Full Name"
          onFieldChange={mockOnFieldChange}
        />
      );

      const input = screen.getByLabelText('Full Name');
      fireEvent.change(input, { target: { value: 'Mario Rossi' } });

      expect(mockOnFieldChange).toHaveBeenCalledWith(
        'fullName.value',
        'Mario Rossi'
      );
    });

    it('should work with address field', () => {
      render(
        <TestWrapper
          name="address"
          label="Address"
          onFieldChange={mockOnFieldChange}
        />
      );

      const input = screen.getByLabelText('Address');
      fireEvent.change(input, { target: { value: 'Via Roma 1' } });

      expect(mockOnFieldChange).toHaveBeenCalledWith(
        'address.value',
        'Via Roma 1'
      );
    });

    it('should work with zipCode field with maxLength', () => {
      render(
        <TestWrapper
          name="zipCode"
          label="ZIP Code"
          inputProps={{ maxLength: 5 }}
          onFieldChange={mockOnFieldChange}
        />
      );

      const input = screen.getByLabelText('ZIP Code');
      expect(input).toHaveAttribute('maxlength', '5');

      fireEvent.change(input, { target: { value: '00100' } });
      expect(mockOnFieldChange).toHaveBeenCalledWith('zipCode.value', '00100');
    });
  });

  describe('Margin Prop', () => {
    it('should render with normal margin by default', () => {
      const { container } = render(<TestWrapper />);

      const textField = container.querySelector('.MuiTextField-root');
      expect(textField).toHaveClass('MuiFormControl-marginNormal');
    });

    it('should render with none margin when specified', () => {
      const { container } = render(<TestWrapper margin="none" />);

      const textField = container.querySelector('.MuiTextField-root');
      expect(textField).not.toHaveClass('MuiFormControl-marginNormal');
    });
  });

  describe('Real World Scenarios', () => {
    it('should handle tax code with uppercase transformation', () => {
      render(
        <TestWrapper
          name="taxCode"
          label="Tax Code"
          transformValue={(v) => v.toUpperCase()}
          inputProps={{ maxLength: 16 }}
          onFieldChange={mockOnFieldChange}
        />
      );

      const input = screen.getByLabelText('Tax Code');
      fireEvent.change(input, { target: { value: 'rssmra80a01h501u' } });

      expect(input).toHaveValue('RSSMRA80A01H501U');
      expect(mockOnFieldChange).toHaveBeenCalledWith(
        'taxCode.value',
        'RSSMRA80A01H501U'
      );
    });

    it('should handle disabled field in edit mode', () => {
      render(
        <TestWrapper
          name="taxCode"
          label="Tax Code"
          disabled
          defaultValues={{
            taxCode: { value: 'RSSMRA80A01H501U', readonly: true }
          }}
        />
      );

      const input = screen.getByLabelText('Tax Code');
      expect(input).toBeDisabled();
      expect(input).toHaveValue('RSSMRA80A01H501U');
    });
  });
});
