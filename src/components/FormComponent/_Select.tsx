import MenuItem from '@mui/material/MenuItem';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { ChangeEvent, useState } from 'react';

export type _SelectProps = Omit<TextFieldProps, 'select' | 'type'> & {
  options?: { label: string; value: string }[];
};

export const _Select = (props: _SelectProps) => {
  const [value, setValue] = useState('');

  const onChange = (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value);

  return (
    <TextField
      fullWidth
      size="small"
      data-testid={props.id}
      label={props.label}
      value={value}
      onChange={onChange}
      {...props}
      select>
      {props.options?.map((option, optionIndex) => (
        <MenuItem key={`${props.label}-${option.value}-${optionIndex}`} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};
