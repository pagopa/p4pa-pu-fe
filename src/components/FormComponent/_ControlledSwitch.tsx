import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Switch, FormControlLabel, SwitchProps } from '@mui/material';
import { ReactNode } from 'react';

export type _ControlledSwitchProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: ReactNode;
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
        control={
          <Switch
            {...field}
            {...switchProps}
            checked={!!field.value}
            sx={{ mx: 1 }}
          />
        }
        label={label}
      />
    )}
  />
);
