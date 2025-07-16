import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { _DateRange } from './_DateRange';
import { DateRangeProps } from '.';

export type _ControlledDateRangeProps<T extends FieldValues> =
  DateRangeProps & {
    name: Path<T>;
    control: Control<T>;
    label?: string;
  };

export const _ControlledDateRange = <T extends FieldValues>({
  name,
  control,
  label,
  isYear,
  required,
  ...props
}: _ControlledDateRangeProps<T>) => (
  <Controller
    name={name}
    control={control}
    rules={{ required }}
    render={({ field, fieldState }) => (
      <_DateRange
        rangeLabel={label}
        isYear={isYear}
        required={required}
        from={
          field.value?.from && {
            value: field.value?.from,
            onChange: field.onChange,
            errorMessage: fieldState.error?.message
          }
        }
        to={
          field.value?.to && {
            value: field.value?.to,
            onChange: field.onChange,
            errorMessage: fieldState.error?.message
          }
        }
        {...props}
      />
    )}
  />
);
