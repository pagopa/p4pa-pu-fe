import Button, { type ButtonProps } from '@mui/material/Button';

export type _ButtonProps = ButtonProps & {
  label?: string;
};

export const _Button = (props: _ButtonProps) => (
  <Button fullWidth size="medium" variant="contained" {...props}>
    {props.children || props.label}
  </Button>
);
