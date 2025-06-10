import { ButtonProps, Button } from '@mui/material';

export type _ButtonProps = ButtonProps & {
  label?: string;
};

export const _Button = (props: _ButtonProps) => (
  <Button fullWidth size="small" variant="contained" {...props}>
    {props.children || props.label}
  </Button>
);
