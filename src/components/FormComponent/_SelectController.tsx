import { Controller, Control, Path, FieldValues } from 'react-hook-form';
import { FormComponent } from '../FormComponent';
import { SelectOptions } from './_Select';

export type _ControlledSelectProps<T extends FieldValues> = {
  name: Path<T>;
  options: Record<keyof T, SelectOptions>;
  control: Control<T>;
  label: string;
  onChange?: (value: string) => void;
};

export const _ControlledSelect = <T extends FieldValues>({
  name,
  options,
  control,
  label,
  onChange
}: _ControlledSelectProps<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <FormComponent.Select
        {...field}
        required
        label={label}
        options={options[name]}
        disabled={!options[name].length}
        error={!!fieldState.error}
        helperText={fieldState.error?.message}
        onChange={(val) => {
          field.onChange(val);
          onChange?.(val.target.value);
        }}
      />
    )}
  />
);
