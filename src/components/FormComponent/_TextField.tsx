import InputAdornment from '@mui/material/InputAdornment';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

export type _TextFieldProps = Omit<TextFieldProps, 'type'> & {
  icon?: React.ReactNode;
};

export const _TextField = (props: _TextFieldProps) => (
  <TextField
    data-testid={props.id}
    fullWidth
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">{props?.icon?? <SearchRoundedIcon />}</InputAdornment>
      )
    }}
    label={props.label}
    size="small"
    placeholder={props.placeholder || ''}
    {...props}
  />
);
