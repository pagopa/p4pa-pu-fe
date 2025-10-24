import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { _DateRange, _DateRangeProps } from './_DateRange';

export type _ControlledDateRangeProps<T extends FieldValues> =
  _DateRangeProps & {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    shouldValidate?: boolean;
    validationErrorMessage?: string;
    validatePartialRange?: boolean;
  };

export function _ControlledDateRange<T extends FieldValues>({
  name,
  control,
  validatePartialRange = true,
  ...props
}: _ControlledDateRangeProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const value = field.value ?? { from: null, to: null };

        return (
          <_DateRange
            {...props}
            validatePartialRange={validatePartialRange}
            shouldValidate={!!fieldState.error}
            validationErrorMessage={fieldState.error?.message}
            from={
              props?.from
                ? {
                    ...props.from,
                    value: value.from,
                    onChange: (date) => {
                      field.onChange({ ...value, from: date });
                    }
                  }
                : undefined
            }
            to={
              props?.to
                ? {
                    ...props.to,
                    value: value.to,
                    onChange: (date) => field.onChange({ ...value, to: date })
                  }
                : undefined
            }
          />
        );
      }}
    />
  );
}
