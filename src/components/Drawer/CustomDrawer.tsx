import React from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  IconButton,
  useTheme,
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface CustomDrawerProps {
  open: boolean;
  onClose: () => void;
  fields: {
    id: string;
    label: string;
    value: string;
    placeholder?: string;
    variant?: 'body1' | 'body2' | 'h6' | 'subtitle1' | 'monospaced';
  }[];
  title: string;
  buttonText?: string;
  onButtonClick?: () => void;
  startIcon?: React.ReactNode;
}

const CustomDrawer: React.FC<CustomDrawerProps> = ({
  open,
  onClose,
  fields,
  title,
  buttonText,
  onButtonClick,
  startIcon,
}) => {
  const theme = useTheme();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 420,
          padding: theme.spacing(3),
        },
      }}
    >
      <Box display="flex" justifyContent='end' mb={2}>
        <IconButton onClick={onClose}>
          <Close/>
        </IconButton>
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" gutterBottom fontWeight={700}>
          {title}
        </Typography>
      </Box>
      <List >
        {fields.map((field) => (
          <ListItem key={field.id} disableGutters disablePadding>
            <ListItemText
              primary={
                <Typography variant="body2" color="textSecondary" fontWeight={400} >
                  {field.label}
                </Typography>
              }
              secondary={
                <Typography variant={field.variant || 'body1'} fontWeight={field.variant ?? 600} 
                  paragraph={true} sx={{wordBreak: 'break-word'}}>
                  {field.value}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
      {buttonText && onButtonClick && (
        <Box mt={2}>
          <Button
            fullWidth
            size='large'
            variant="contained"
            onClick={onButtonClick}
            startIcon={startIcon}
          >
            {buttonText}
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

export default CustomDrawer;
