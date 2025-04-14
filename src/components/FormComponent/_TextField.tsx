import InputAdornment from '@mui/material/InputAdornment';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

export type _TextFieldProps = Omit<TextFieldProps, 'type'> & {
  adornment?: React.ReactNode;
  forwardRef?: React.Ref<HTMLInputElement>;
};

export const _TextField = (props: _TextFieldProps) => (
  <TextField
    data-testid={props.id}
    fullWidth
    sx={{
      '.MuiInputBase-input': {
        textOverflow: 'ellipsis'
      }
    }}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          {props?.adornment ?? <SearchRoundedIcon />}
        </InputAdornment>
      )
    }}
    size="small"
    {...props}
    ref={props.forwardRef}
  />
);
