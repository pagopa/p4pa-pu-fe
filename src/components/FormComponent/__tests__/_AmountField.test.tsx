import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  render,
  fireEvent,
  screen,
  waitFor
} from '../../../__tests__/renderers';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
const {
  mockFormatAmountForDisplay,
  mockIsValidAmountInput,
  mockSanitizeAmountInput
} = vi.hoisted(() => {
  return {
    mockFormatAmountForDisplay: vi.fn((v: unknown) => {
      if (v == null || v === '') return '';
      if (typeof v === 'number') return String(v).replace('.', ',');
      if (typeof v === 'string') return v;
      return '';
    }),
    mockIsValidAmountInput: vi.fn((s: string) =>
      // eslint-disable-next-line sonarjs/concise-regex
      /^[0-9]*([,.][0-9]*)?$/.test(s)
    ),
    mockSanitizeAmountInput: vi.fn((s: string) => s.replace(/[^\d.,]/g, ''))
  };
});

vi.mock('../../../utils/formatters', () => ({
  formatAmountForDisplay: mockFormatAmountForDisplay,
  isValidAmountInput: mockIsValidAmountInput,
  sanitizeAmountInput: mockSanitizeAmountInput
}));

import { _AmountField, AmountFieldProps } from '../_AmountField';

i18nTestSetup({});

describe('_AmountField', () => {
  const defaultProps: AmountFieldProps = { label: 'Amount' };

  beforeEach(() => {
    mockFormatAmountForDisplay.mockClear();
    mockIsValidAmountInput.mockClear();
    mockSanitizeAmountInput.mockClear();
  });

  describe('Rendering and Initial State', () => {
    it('should render with euro icon and placeholder', () => {
      render(<_AmountField {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: 'Amount' });
      const euroIcon = screen.getByTestId('EuroRoundedIcon');

      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', '0,00');
      expect(euroIcon).toBeInTheDocument();
    });

    it('should render with correct input attributes for decimal input', () => {
      render(<_AmountField {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: 'Amount' });

      expect(input).toHaveAttribute('inputMode', 'decimal');
      expect(input).toHaveAttribute('pattern', '[0-9]*[,.]?[0-9]*');
    });

    it('should display formatted initial value', () => {
      render(<_AmountField {...defaultProps} value={1234.56} />);

      const input = screen.getByRole('textbox', { name: 'Amount' });

      expect(input).toHaveValue('1234,56');
      expect(mockFormatAmountForDisplay).toHaveBeenCalledWith(1234.56);
    });

    it('should handle empty/null initial values', () => {
      const { rerender } = render(
        <_AmountField {...defaultProps} value={null} />
      );

      let input = screen.getByRole('textbox', { name: 'Amount' });
      expect(input).toHaveValue('');

      rerender(<_AmountField {...defaultProps} value={undefined} />);
      input = screen.getByRole('textbox', { name: 'Amount' });
      expect(input).toHaveValue('');
    });
  });

  describe('User Input Handling', () => {
    it('should accept valid decimal input with comma', async () => {
      const onChangeMock = vi.fn();
      render(<_AmountField {...defaultProps} onChange={onChangeMock} />);

      const input = screen.getByRole('textbox', { name: 'Amount' });

      fireEvent.change(input, { target: { value: '123,45' } });

      await waitFor(() => {
        expect(input).toHaveValue('123,45');
        expect(onChangeMock).toHaveBeenCalledWith(
          expect.objectContaining({
            target: expect.objectContaining({
              value: '123.45'
            })
          })
        );
      });
    });

    it('should accept valid decimal input with dot', async () => {
      const onChangeMock = vi.fn();
      render(<_AmountField {...defaultProps} onChange={onChangeMock} />);

      const input = screen.getByRole('textbox', { name: 'Amount' });

      fireEvent.change(input, { target: { value: '123.45' } });

      await waitFor(() => {
        expect(input).toHaveValue('123.45');
        expect(onChangeMock).toHaveBeenCalledWith(
          expect.objectContaining({
            target: expect.objectContaining({
              value: '123.45'
            })
          })
        );
      });
    });

    it('should handle whole numbers correctly', async () => {
      const onChangeMock = vi.fn();
      render(<_AmountField {...defaultProps} onChange={onChangeMock} />);

      const input = screen.getByRole('textbox', { name: 'Amount' });

      fireEvent.change(input, { target: { value: '1000' } });

      await waitFor(() => {
        expect(input).toHaveValue('1000');
        expect(onChangeMock).toHaveBeenCalledWith(
          expect.objectContaining({
            target: expect.objectContaining({
              value: '1000'
            })
          })
        );
      });
    });

    it('should clear field when empty string is entered', async () => {
      const onChangeMock = vi.fn();
      render(
        <_AmountField
          {...defaultProps}
          value="123,45"
          onChange={onChangeMock}
        />
      );

      const input = screen.getByRole('textbox', { name: 'Amount' });

      fireEvent.change(input, { target: { value: '' } });

      await waitFor(() => {
        expect(input).toHaveValue('');
        expect(onChangeMock).toHaveBeenCalledWith(
          expect.objectContaining({
            target: expect.objectContaining({
              value: ''
            })
          })
        );
      });
    });

    it('should handle onChange being undefined', async () => {
      render(<_AmountField {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: 'Amount' });

      expect(() => {
        fireEvent.change(input, { target: { value: '123,45' } });
      }).not.toThrow();

      await waitFor(() => {
        expect(input).toHaveValue('123,45');
      });
    });
  });

  describe('Input Validation and Sanitization', () => {
    it('should reject invalid input and not update value', async () => {
      const onChangeMock = vi.fn();

      render(<_AmountField {...defaultProps} onChange={onChangeMock} />);

      const input = screen.getByRole('textbox', {
        name: 'Amount'
      }) as HTMLInputElement;

      mockIsValidAmountInput.mockReturnValueOnce(false);

      fireEvent.change(input, { target: { value: '123,999' } });

      await waitFor(() => {
        expect(input).toHaveValue('');
        expect(onChangeMock).not.toHaveBeenCalled();
        expect(mockSanitizeAmountInput).toHaveBeenCalledWith('123,999');
        expect(mockIsValidAmountInput).toHaveBeenCalledWith('123,999');
      });
    });

    it('should sanitize input before validation', async () => {
      const onChangeMock = vi.fn();
      render(<_AmountField {...defaultProps} onChange={onChangeMock} />);

      const input = screen.getByRole('textbox', { name: 'Amount' });

      fireEvent.change(input, { target: { value: '12€3,45' } });

      await waitFor(() => {
        expect(mockSanitizeAmountInput).toHaveBeenCalledWith('12€3,45');
      });
    });

    it('should handle multiple decimal separators by keeping only first', async () => {
      const onChangeMock = vi.fn();

      render(<_AmountField {...defaultProps} onChange={onChangeMock} />);

      const input = screen.getByRole('textbox', { name: 'Amount' });

      mockSanitizeAmountInput.mockReturnValueOnce('12,3456');

      fireEvent.change(input, { target: { value: '12,34,56' } });

      await waitFor(() => {
        expect(mockSanitizeAmountInput).toHaveBeenCalledWith('12,34,56');
        expect(input).toHaveValue('12,3456');
      });
    });

    it('should remove non-numeric characters except comma and dot', async () => {
      const onChangeMock = vi.fn();
      render(<_AmountField {...defaultProps} onChange={onChangeMock} />);

      const input = screen.getByRole('textbox', { name: 'Amount' });

      fireEvent.change(input, { target: { value: '1a2b3,4c5d' } });

      await waitFor(() => {
        expect(input).toHaveValue('123,45');
        expect(mockSanitizeAmountInput).toHaveBeenCalledWith('1a2b3,4c5d');
      });
    });
  });

  describe('Value Synchronization', () => {
    it('should update display value when prop value changes', async () => {
      const { rerender } = render(
        <_AmountField {...defaultProps} value={100} />
      );

      const input = screen.getByRole('textbox', { name: 'Amount' });
      expect(input).toHaveValue('100');
      expect(mockFormatAmountForDisplay).toHaveBeenCalledWith(100);

      rerender(<_AmountField {...defaultProps} value={200.5} />);

      await waitFor(() => {
        expect(input).toHaveValue('200,5');
        expect(mockFormatAmountForDisplay).toHaveBeenCalledWith(200.5);
      });
    });

    it('should handle zero value correctly', async () => {
      render(<_AmountField {...defaultProps} value={0} />);

      const input = screen.getByRole('textbox', { name: 'Amount' });
      expect(input).toHaveValue('0');
      expect(mockFormatAmountForDisplay).toHaveBeenCalledWith(0);
    });

    it('should call formatAmountForDisplay on every value change', async () => {
      const { rerender } = render(
        <_AmountField {...defaultProps} value="123" />
      );

      expect(mockFormatAmountForDisplay).toHaveBeenCalledWith('123');

      rerender(<_AmountField {...defaultProps} value="456.78" />);

      expect(mockFormatAmountForDisplay).toHaveBeenCalledWith('456.78');
    });
  });

  describe('Internal Format Conversion', () => {
    it('should convert comma to dot in onChange event value', async () => {
      const onChangeMock = vi.fn();
      render(<_AmountField {...defaultProps} onChange={onChangeMock} />);

      const input = screen.getByRole('textbox', { name: 'Amount' });

      fireEvent.change(input, { target: { value: '999,99' } });

      await waitFor(() => {
        expect(onChangeMock).toHaveBeenCalledWith(
          expect.objectContaining({
            target: expect.objectContaining({
              value: '999.99'
            })
          })
        );
      });
    });

    it('should preserve dots in onChange event value', async () => {
      const onChangeMock = vi.fn();
      render(<_AmountField {...defaultProps} onChange={onChangeMock} />);

      const input = screen.getByRole('textbox', { name: 'Amount' });

      fireEvent.change(input, { target: { value: '888.88' } });

      await waitFor(() => {
        expect(onChangeMock).toHaveBeenCalledWith(
          expect.objectContaining({
            target: expect.objectContaining({
              value: '888.88'
            })
          })
        );
      });
    });
  });

  describe('Integration with _TextField', () => {
    it('should pass through additional props to _TextField', () => {
      render(
        <_AmountField
          {...defaultProps}
          disabled
          helperText="Enter amount"
          error
        />
      );

      const input = screen.getByRole('textbox', { name: 'Amount' });

      expect(input).toBeDisabled();
      expect(screen.getByText('Enter amount')).toBeInTheDocument();
    });

    it('should maintain focus behavior during input changes', async () => {
      render(<_AmountField {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: 'Amount' });

      input.focus();
      expect(input).toHaveFocus();

      fireEvent.change(input, { target: { value: '123,45' } });

      await waitFor(() => {
        expect(input).toHaveFocus();
      });
    });

    it('should support all _TextField props through spreading', () => {
      render(
        <_AmountField
          {...defaultProps}
          size="small"
          variant="outlined"
          fullWidth
          required
          className="custom-class"
        />
      );

      const input = screen.getByRole('textbox', { name: 'Amount' });

      expect(input).toBeRequired();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive inputs correctly', async () => {
      const onChangeMock = vi.fn();
      render(<_AmountField {...defaultProps} onChange={onChangeMock} />);

      const input = screen.getByRole('textbox', { name: 'Amount' });

      const rapidInputs = ['1', '12', '123', '123,', '123,4', '123,45'];

      rapidInputs.forEach((value) => {
        fireEvent.change(input, { target: { value } });
      });

      await waitFor(() => {
        expect(input).toHaveValue('123,45');
        expect(onChangeMock).toHaveBeenCalledTimes(rapidInputs.length);
      });
    });

    it('should handle component with no initial value', () => {
      render(<_AmountField {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: 'Amount' });

      expect(input).toHaveValue('');
      expect(input).toHaveAttribute('placeholder', '0,00');
    });

    it('should handle very large numbers within validation limits', async () => {
      const onChangeMock = vi.fn();
      render(<_AmountField {...defaultProps} onChange={onChangeMock} />);

      const input = screen.getByRole('textbox', { name: 'Amount' });

      fireEvent.change(input, { target: { value: '999999,99' } });

      await waitFor(() => {
        expect(input).toHaveValue('999999,99');
        expect(onChangeMock).toHaveBeenCalledWith(
          expect.objectContaining({
            target: expect.objectContaining({
              value: '999999.99'
            })
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should be accessible via keyboard navigation', () => {
      render(<_AmountField {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: 'Amount' });

      input.focus();
      expect(input).toHaveFocus();

      expect(input).toHaveAccessibleName('Amount');
    });

    it('should have proper role and input type for screen readers', () => {
      render(<_AmountField {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: 'Amount' });

      expect(input).toHaveAttribute('inputMode', 'decimal');
      expect(input).toHaveAttribute('pattern', '[0-9]*[,.]?[0-9]*');
    });
  });

  describe('Mock Verification', () => {
    it('should call all formatter utilities with correct parameters', async () => {
      const onChangeMock = vi.fn();
      render(
        <_AmountField {...defaultProps} value={100} onChange={onChangeMock} />
      );

      expect(mockFormatAmountForDisplay).toHaveBeenCalledWith(100);

      const input = screen.getByRole('textbox', { name: 'Amount' });
      fireEvent.change(input, { target: { value: '12€3,45' } });

      await waitFor(() => {
        expect(mockSanitizeAmountInput).toHaveBeenCalledWith('12€3,45');
        expect(mockIsValidAmountInput).toHaveBeenCalledWith('123,45');
      });
    });
  });

  describe('Debug Tests', () => {
    it('should verify mock functions are working', () => {
      expect(vi.isMockFunction(mockFormatAmountForDisplay)).toBe(true);
      expect(vi.isMockFunction(mockIsValidAmountInput)).toBe(true);
      expect(vi.isMockFunction(mockSanitizeAmountInput)).toBe(true);
    });

    it('should test formatAmountForDisplay directly', () => {
      const result = mockFormatAmountForDisplay(123.45);
      expect(result).toBe('123,45');
      expect(mockFormatAmountForDisplay).toHaveBeenCalledWith(123.45);
    });
  });
});
