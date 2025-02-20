import { ButtonProps, Button } from '@mui/material';

export type _ButtonProps = Omit<ButtonProps, 'type'> & {
  label?: string;
};

export const _Button = (props: _ButtonProps) => (
  <Button
    fullWidth
    size="medium"
    variant="contained"
    sx={{ height: 40 }}
    onClick={props.onClick}
    {...props}>
    {props.children || props.label}
  </Button>
);
