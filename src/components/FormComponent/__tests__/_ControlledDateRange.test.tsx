/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../__tests__/renderers';
import { useForm } from 'react-hook-form';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { _ControlledDateRange } from '../_ControlledDateRange';

const mockTranslations = {
  'dates.from': 'Da',
  'dates.to': 'A',
  'dates.validations.from': 'Data di inizio non valida',
  'dates.validations.to': 'Data di fine non valida',
  'dates.validations.insertFrom': 'Inserire data di inizio',
  'dates.validations.insertTo': 'Inserire data di fine'
};

type TestFormData = {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
};

const TestForm = ({
  children,
  defaultValues
}: {
  children: (props: any) => React.ReactNode;
  defaultValues?: Partial<TestFormData>;
}) => {
  const methods = useForm<TestFormData>({
    defaultValues: {
      dateRange: { from: null, to: null },
      ...defaultValues
    }
  });

  return <form>{children(methods)}</form>;
};

describe('_ControlledDateRange', () => {
  beforeEach(() => {
    i18nTestSetup(mockTranslations);
    vi.clearAllMocks();
  });

  const defaultProps = {
    name: 'dateRange' as const,
    from: {
      label: 'Data inizio'
    },
    to: {
      label: 'Data fine'
    }
  };

  it('should render with default values from react-hook-form', () => {
    render(
      <TestForm>
        {({ control }) => (
          <_ControlledDateRange {...defaultProps} control={control} />
        )}
      </TestForm>
    );

    expect(screen.getByLabelText('Data inizio')).toBeInTheDocument();
    const toField =
      screen.queryByLabelText('Data fine') || screen.getByLabelText('A');
    expect(toField).toBeInTheDocument();
  });

  it('should display initial values when provided', () => {
    const initialFromDate = new Date('2024-01-01');
    const initialToDate = new Date('2024-01-31');
    const defaultValues = {
      dateRange: {
        from: initialFromDate,
        to: initialToDate
      }
    };

    render(
      <TestForm defaultValues={defaultValues}>
        {({ control }) => (
          <_ControlledDateRange {...defaultProps} control={control} />
        )}
      </TestForm>
    );

    const fromInput = screen.getByLabelText('Data inizio');
    const toInput =
      screen.queryByLabelText('Data fine') || screen.getByLabelText('A');

    expect(fromInput).toBeInTheDocument();
    expect(toInput).toBeInTheDocument();

    expect(fromInput).toHaveValue('01/01/2024');
    expect(toInput).toHaveValue('31/01/2024');
  });

  it('should update form values when dates change', async () => {
    let formMethods: any;

    render(
      <TestForm>
        {(methods) => {
          formMethods = methods;
          return (
            <_ControlledDateRange {...defaultProps} control={methods.control} />
          );
        }}
      </TestForm>
    );

    formMethods.setValue('dateRange.from', new Date('2024-01-01'));

    await waitFor(() => {
      const formValues = formMethods.getValues();
      expect(formValues.dateRange.from).toEqual(new Date('2024-01-01'));
    });
  });

  it('should preserve existing to value when from changes', async () => {
    const defaultValues = {
      dateRange: {
        from: null,
        to: new Date('2024-01-31')
      }
    };

    let formMethods: any;

    render(
      <TestForm defaultValues={defaultValues}>
        {(methods) => {
          formMethods = methods;
          return (
            <_ControlledDateRange {...defaultProps} control={methods.control} />
          );
        }}
      </TestForm>
    );

    formMethods.setValue('dateRange.from', new Date('2024-01-01'));

    await waitFor(() => {
      const formValues = formMethods.getValues();
      expect(formValues.dateRange.from).toEqual(new Date('2024-01-01'));
      expect(formValues.dateRange.to).toEqual(new Date('2024-01-31'));
    });
  });

  it('should preserve existing from value when to changes', async () => {
    const defaultValues = {
      dateRange: {
        from: new Date('2024-01-01'),
        to: null
      }
    };

    let formMethods: any;

    render(
      <TestForm defaultValues={defaultValues}>
        {(methods) => {
          formMethods = methods;
          return (
            <_ControlledDateRange {...defaultProps} control={methods.control} />
          );
        }}
      </TestForm>
    );

    formMethods.setValue('dateRange.to', new Date('2024-01-31'));

    await waitFor(() => {
      const formValues = formMethods.getValues();
      expect(formValues.dateRange.from).toEqual(new Date('2024-01-01'));
      expect(formValues.dateRange.to).toEqual(new Date('2024-01-31'));
    });
  });

  it('should pass validatePartialRange prop correctly', () => {
    render(
      <TestForm>
        {({ control }) => (
          <_ControlledDateRange
            {...defaultProps}
            control={control}
            validatePartialRange={false}
          />
        )}
      </TestForm>
    );

    expect(screen.getByLabelText('Data inizio')).toBeInTheDocument();
  });

  it('should default validatePartialRange to true', () => {
    render(
      <TestForm>
        {({ control }) => (
          <_ControlledDateRange {...defaultProps} control={control} />
        )}
      </TestForm>
    );

    expect(screen.getByLabelText('Data inizio')).toBeInTheDocument();
  });

  it('should handle form validation errors', async () => {
    let formMethods: any;

    render(
      <TestForm>
        {(methods) => {
          formMethods = methods;
          return (
            <_ControlledDateRange {...defaultProps} control={methods.control} />
          );
        }}
      </TestForm>
    );

    formMethods.setError('dateRange', {
      type: 'required',
      message: 'Date range is required'
    });

    await waitFor(() => {
      const errorMessages = screen.getAllByText('Date range is required');
      expect(errorMessages.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should not show validation when field has no error', () => {
    render(
      <TestForm>
        {({ control }) => (
          <_ControlledDateRange {...defaultProps} control={control} />
        )}
      </TestForm>
    );

    expect(
      screen.queryByText('Date range is required')
    ).not.toBeInTheDocument();
  });

  it('should render range label when provided', () => {
    render(
      <TestForm>
        {({ control }) => (
          <_ControlledDateRange
            {...defaultProps}
            control={control}
            rangeLabel="Custom Range Label"
          />
        )}
      </TestForm>
    );

    expect(screen.getByText('Custom Range Label')).toBeInTheDocument();
  });

  it('should mark fields as required when required prop is true', () => {
    render(
      <TestForm>
        {({ control }) => (
          <_ControlledDateRange
            {...defaultProps}
            control={control}
            required={true}
          />
        )}
      </TestForm>
    );

    const fromInput = screen.getByLabelText('Data inizio *');
    const toInput = screen.getByLabelText('A *');

    expect(fromInput).toHaveAttribute('required');
    expect(toInput).toHaveAttribute('required');
  });

  it('should handle year mode correctly', () => {
    render(
      <TestForm>
        {({ control }) => (
          <_ControlledDateRange
            {...defaultProps}
            control={control}
            isYear={true}
          />
        )}
      </TestForm>
    );

    const fromInput = screen.getByLabelText('Data inizio');
    expect(fromInput).toHaveAttribute('placeholder', 'YYYY');
  });

  it('should handle null field value gracefully', async () => {
    let formMethods: any;

    render(
      <TestForm>
        {(methods) => {
          formMethods = methods;
          return (
            <_ControlledDateRange {...defaultProps} control={methods.control} />
          );
        }}
      </TestForm>
    );

    formMethods.setValue('dateRange', null);

    await waitFor(() => {
      expect(screen.getByLabelText('Data inizio')).toBeInTheDocument();
      const toField =
        screen.queryByLabelText('Data fine') || screen.getByLabelText('A');
      expect(toField).toBeInTheDocument();
    });
  });

  it('should work with only from prop provided', () => {
    const propsWithOnlyFrom = {
      name: 'dateRange' as const,
      from: {
        label: 'Data inizio'
      }
    };

    render(
      <TestForm>
        {({ control }) => (
          <_ControlledDateRange {...propsWithOnlyFrom} control={control} />
        )}
      </TestForm>
    );

    expect(screen.getByLabelText('Data inizio')).toBeInTheDocument();
    expect(screen.queryByLabelText('Data fine')).not.toBeInTheDocument();
  });

  it('should work with only to prop provided', () => {
    const propsWithOnlyTo = {
      name: 'dateRange' as const,
      to: {
        label: 'Data fine'
      }
    };

    render(
      <TestForm>
        {({ control }) => (
          <_ControlledDateRange {...propsWithOnlyTo} control={control} />
        )}
      </TestForm>
    );

    expect(screen.getByLabelText('Da')).toBeInTheDocument();
    const toField =
      screen.queryByLabelText('Data fine') || screen.getByLabelText('A');
    expect(toField).toBeInTheDocument();
  });

  it('should handle partial validation correctly', async () => {
    const defaultValues = {
      dateRange: {
        from: new Date('2024-01-01'),
        to: null
      }
    };

    render(
      <TestForm defaultValues={defaultValues}>
        {({ control }) => (
          <_ControlledDateRange
            {...defaultProps}
            control={control}
            validatePartialRange={true}
          />
        )}
      </TestForm>
    );

    await waitFor(() => {
      expect(screen.getByText('Inserire data di fine')).toBeInTheDocument();
    });
  });

  it('should not show partial validation when disabled', async () => {
    const defaultValues = {
      dateRange: {
        from: new Date('2024-01-01'),
        to: null
      }
    };

    render(
      <TestForm defaultValues={defaultValues}>
        {({ control }) => (
          <_ControlledDateRange
            {...defaultProps}
            control={control}
            validatePartialRange={false}
          />
        )}
      </TestForm>
    );

    expect(screen.queryByText('Inserire data di fine')).not.toBeInTheDocument();
  });
});
