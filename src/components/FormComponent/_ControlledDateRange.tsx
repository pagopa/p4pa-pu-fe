import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { _DateRange } from './_DateRange';
import { DateRangeProps } from '.';

export type _ControlledDateRangeProps<T extends FieldValues> =
  DateRangeProps & {
    name: Path<T>;
    control: Control<T>;
    label?: string;
  };

export function _ControlledDateRange<T extends FieldValues>({
  name,
  control,
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
            from={
              props?.from
                ? {
                    value: value.from,
                    onChange: (date) => {
                      field.onChange({ ...value, from: date });
                    },
                    errorMessage: fieldState.error?.message,
                    ...props?.from
                  }
                : undefined
            }
            to={
              props?.to
                ? {
                    value: value.to,
                    onChange: (date) => field.onChange({ ...value, to: date }),
                    errorMessage: fieldState.error?.message,
                    label: props?.to?.label,
                    ...props?.to
                  }
                : undefined
            }
          />
        );
      }}
    />
  );
}
