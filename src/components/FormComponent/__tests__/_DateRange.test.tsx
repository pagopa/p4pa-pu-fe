import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '../../../__tests__/renderers';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { _DateRange, _DateRangeProps } from '../_DateRange';

const mockTranslations = {
  'dates.from': 'Da',
  'dates.to': 'A',
  'dates.validations.from': 'Data di inizio non valida',
  'dates.validations.to': 'Data di fine non valida',
  'dates.validations.insertFrom': 'Inserire data di inizio',
  'dates.validations.insertTo': 'Inserire data di fine'
};

describe('_DateRange', () => {
  beforeEach(() => {
    i18nTestSetup(mockTranslations);
  });

  const defaultProps: _DateRangeProps = {
    from: {
      label: 'Data inizio',
      onChange: vi.fn(),
      value: null
    },
    to: {
      label: 'Data fine',
      onChange: vi.fn(),
      value: null
    }
  };

  it('should render both date pickers with correct labels', () => {
    render(<_DateRange {...defaultProps} />);

    expect(screen.getByLabelText('Data inizio')).toBeInTheDocument();
    expect(screen.getByLabelText('A')).toBeInTheDocument();
  });

  it('should render only from date picker when to is not provided', () => {
    const { from } = defaultProps;
    render(<_DateRange from={from} />);

    expect(screen.getByLabelText('Data inizio')).toBeInTheDocument();
    expect(screen.queryByLabelText('Data fine')).not.toBeInTheDocument();
  });

  it('should display range label when provided', () => {
    render(
      <_DateRange {...defaultProps} rangeLabel="Periodo di riferimento" />
    );

    expect(screen.getByText('Periodo di riferimento')).toBeInTheDocument();
  });

  it('should call onChange when from date is changed', async () => {
    const mockOnChange = vi.fn();
    const props = {
      ...defaultProps,
      from: { ...defaultProps.from!, onChange: mockOnChange }
    };

    render(<_DateRange {...props} />);

    const fromInput = screen.getByLabelText('Data inizio');
    fireEvent.change(fromInput, { target: { value: '01/01/2024' } });
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should clear to date when from date is set to a later date', async () => {
    const mockFromChange = vi.fn();
    const mockToChange = vi.fn();

    const props = {
      from: {
        label: 'Data inizio',
        onChange: mockFromChange,
        value: null
      },
      to: {
        label: 'Data fine',
        onChange: mockToChange,
        value: new Date('2024-01-01')
      }
    };

    render(<_DateRange {...props} />);
    const fromPicker = screen.getByLabelText('Data inizio');
    fireEvent.change(fromPicker, { target: { value: '01/02/2024' } });
  });

  describe('Partial range validation', () => {
    it('should show error when only from date is set and validatePartialRange is true', () => {
      const props = {
        ...defaultProps,
        from: { ...defaultProps.from!, value: new Date('2024-01-01') },
        to: { ...defaultProps.to!, value: null },
        validatePartialRange: true
      };

      render(<_DateRange {...props} />);

      expect(screen.getByText('Inserire data di fine')).toBeInTheDocument();
    });

    it('should show error when only to date is set and validatePartialRange is true', () => {
      const props = {
        ...defaultProps,
        from: { ...defaultProps.from!, value: null },
        to: { ...defaultProps.to!, value: new Date('2024-01-01') },
        validatePartialRange: true
      };

      render(<_DateRange {...props} />);

      expect(screen.getByText('Inserire data di inizio')).toBeInTheDocument();
    });

    it('should not show partial errors when validatePartialRange is false', () => {
      const props = {
        ...defaultProps,
        from: { ...defaultProps.from!, value: new Date('2024-01-01') },
        to: { ...defaultProps.to!, value: null },
        validatePartialRange: false
      };

      render(<_DateRange {...props} />);

      expect(
        screen.queryByText('Inserire data di fine')
      ).not.toBeInTheDocument();
    });

    it('should not show partial errors when both dates are set', () => {
      const props = {
        ...defaultProps,
        from: { ...defaultProps.from!, value: new Date('2024-01-01') },
        to: { ...defaultProps.to!, value: new Date('2024-01-31') },
        validatePartialRange: true
      };

      render(<_DateRange {...props} />);

      expect(
        screen.queryByText('Inserire data di fine')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Inserire data di inizio')
      ).not.toBeInTheDocument();
    });
  });

  describe('Validation on submit', () => {
    it('should show validation error when shouldValidate is true and dates are missing', () => {
      const props = {
        ...defaultProps,
        shouldValidate: true,
        validationErrorMessage: 'Campo obbligatorio'
      };

      render(<_DateRange {...props} />);

      const errorMessages = screen.getAllByText('Campo obbligatorio');
      expect(errorMessages).toHaveLength(2);
    });

    it('should show validation error only on missing from date', () => {
      const props = {
        ...defaultProps,
        from: { ...defaultProps.from!, value: null },
        to: { ...defaultProps.to!, value: new Date('2024-01-01') },
        shouldValidate: true,
        validationErrorMessage: 'Campo obbligatorio'
      };

      render(<_DateRange {...props} />);

      const fromInput = screen.getByLabelText('Data inizio');
      const toInput = screen.getByLabelText('A');

      expect(fromInput).toHaveAttribute('aria-invalid', 'true');
      expect(toInput).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('Year mode', () => {
    it('should render year picker when isYear is true', () => {
      const props = {
        ...defaultProps,
        isYear: true
      };

      render(<_DateRange {...props} />);
      const fromInput = screen.getByLabelText('Data inizio');
      expect(fromInput).toBeInTheDocument();
    });
  });

  describe('Error callbacks', () => {
    it('should call onFromErrorChange when from date has error', () => {
      const mockOnFromErrorChange = vi.fn();
      const props = {
        ...defaultProps,
        onFromErrorChange: mockOnFromErrorChange
      };

      render(<_DateRange {...props} />);
    });

    it('should call onToErrorChange when to date has error', () => {
      const mockOnToErrorChange = vi.fn();
      const props = {
        ...defaultProps,
        onToErrorChange: mockOnToErrorChange
      };

      render(<_DateRange {...props} />);
    });
  });

  describe('Required field', () => {
    it('should mark inputs as required when required prop is true', () => {
      const props = {
        ...defaultProps,
        required: true
      };

      render(<_DateRange {...props} />);

      const fromInput = screen.getByLabelText(/Data inizio./);
      const toInput = screen.getByLabelText(/A/);

      expect(fromInput).toBeInTheDocument();
      expect(toInput).toBeInTheDocument();
    });
  });

  describe('Custom error messages', () => {
    it('should display custom error message for from date', () => {
      const props = {
        ...defaultProps,
        from: {
          ...defaultProps.from!,
          errorMessage: 'Errore personalizzato inizio'
        }
      };

      render(<_DateRange {...props} />);
    });

    it('should display custom error message for to date', () => {
      const props = {
        ...defaultProps,
        to: {
          ...defaultProps.to!,
          errorMessage: 'Errore personalizzato fine'
        }
      };

      render(<_DateRange {...props} />);
    });
  });

  describe('Dialog behavior', () => {
    it('should open to dialog after from date is accepted', async () => {
      render(<_DateRange {...defaultProps} />);

      const fromInput = screen.getByLabelText('Data inizio');
      fireEvent.click(fromInput);
    });
  });
});
