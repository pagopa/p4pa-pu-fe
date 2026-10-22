import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { ReactNode } from 'react';

import Switch, { type SwitchProps } from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

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
