import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import type CheckboxProps from '@mui/material/CheckboxProps';

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
                <Typography
                  variant="body1"
                  color={checkboxProps.disabled ? 'gray' : 'textPrimary'}
                >
                  {label}
                </Typography>
                {description && (
                  <Typography
                    variant="caption"
                    color={checkboxProps.disabled ? 'gray' : 'textSecondary'}
                  >
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
