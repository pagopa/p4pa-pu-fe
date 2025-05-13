import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Stack,
  CheckboxProps
} from '@mui/material';

export type _ControlledCheckboxProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: React.ReactNode;
  description?: React.ReactNode;
} & Omit<CheckboxProps, 'name' | 'control' | 'checked' | 'onChange'>;

export const _ControlledCheckbox = <T extends FieldValues>(
  props: _ControlledCheckboxProps<T>
) => {
  const { name, control, label, description, ...checkboxProps } = props;

  return (
    <FormGroup>
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange, ...restField } }) => (
          <FormControlLabel
            control={
              <Checkbox
                {...restField}
                {...checkboxProps}
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
              />
            }
            label={
              <Stack spacing={0.5}>
                <Typography variant="body1">{label}</Typography>
                {description && (
                  <Typography variant="caption" color="textSecondary">
                    {description}
                  </Typography>
                )}
              </Stack>
            }
          />
        )}
      />
    </FormGroup>
  );
};
