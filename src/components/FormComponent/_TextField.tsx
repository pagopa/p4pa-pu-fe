import InputAdornment from '@mui/material/InputAdornment';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

export type _TextFieldProps = Omit<TextFieldProps, 'type'> & {
  adornment?: React.ReactNode;
  forwardRef?: React.Ref<HTMLInputElement>;
  noAdornment?: boolean;
};

export const _TextField = ({
  forwardRef,
  noAdornment,
  adornment,
  ...props
}: _TextFieldProps) => (
  <TextField
    data-testid={props.id}
    fullWidth
    sx={{
      '.MuiInputBase-input': {
        textOverflow: 'ellipsis'
      }
    }}
    InputProps={{
      endAdornment: noAdornment ? undefined : (
        <InputAdornment position="end">
          {adornment ?? <SearchRoundedIcon />}
        </InputAdornment>
      )
    }}
    size="small"
    {...props}
    ref={forwardRef}
  />
);
