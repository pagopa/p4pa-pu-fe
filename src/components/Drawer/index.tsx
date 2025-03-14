import React from 'react';
import {
  Drawer as MuiDrawer,
  Box,
  Typography,
  IconButton,
  useTheme
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { DetailField } from '../DetailField';

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
};

export const Drawer: React.FC<DrawerProps> & { Field: typeof DetailField } = ({
  open,
  onClose,
  title,
  children
}: DrawerProps) => {
  const theme = useTheme();

  return (
    <MuiDrawer
      anchor="right"
      open={open}
      onClose={onClose}
      keepMounted
      disableScrollLock
      data-testid="drawer"
      PaperProps={{
        sx: {
          width: 500,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          padding: theme.spacing(3)
        }
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <IconButton onClick={onClose} data-testid="close-icon">
          <Close />
        </IconButton>
      </Box>
      {children}
    </MuiDrawer>
  );
};

Drawer.Field = DetailField;
