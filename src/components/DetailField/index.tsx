import {
  ListItem,
  ListItemText,
  Typography,
  TypographyOwnProps
} from '@mui/material';

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
