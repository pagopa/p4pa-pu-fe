import Button from '@mui/material/Button';

export interface SearchButtonProps {
  text?: string;
  variant?: 'contained' | 'outlined';
  onClick?: () => void;
}

export const SearchButton = (props: SearchButtonProps) => {
  const { text = props.text, onClick = props.onClick, variant= props.variant} = props;

  return (
    <Button
      role="button"
      aria-label={text}
      size="medium"
      variant={variant}
      onClick={onClick}
      sx={{ paddingX: 2.75, paddingY: 1.75 }}
    >
      {text}
    </Button>
  );
};
