import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Switch, FormControlLabel, SwitchProps } from '@mui/material';

export type _ControlledSwitchProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
} & Omit<SwitchProps, 'name' | 'control'>;

export const _ControlledSwitch = <T extends FieldValues>({
  name,
  control,
  label,
  ...switchProps
}: _ControlledSwitchProps<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <FormControlLabel
        control={<Switch {...field} {...switchProps} checked={!!field.value} />}
        label={label}
      />
    )}
  />
);
