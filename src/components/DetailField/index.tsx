import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import type { TypographyOwnProps } from '@mui/material/Typography';
import Typography from '@mui/material/Typography';

export type DetailFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  variant?: TypographyOwnProps['variant'];
};

export const DetailField = ({
  id,
  label,
  value,
  variant = 'monospaced'
}: DetailFieldProps) => (
  <ListItem key={id} disableGutters disablePadding>
    <ListItemText
      disableTypography
      primary={
        <Typography variant="body2" color="textSecondary" fontWeight={400}>
          {label}
        </Typography>
      }
      secondary={
        <Typography
          variant={variant}
          paragraph
          sx={{ wordBreak: 'break-word' }}
        >
          {value}
        </Typography>
      }
    />
  </ListItem>
);
