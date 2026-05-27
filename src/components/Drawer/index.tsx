import React from 'react';
import {
  Drawer as MuiDrawer,
  Box,
  Typography,
  IconButton,
  useTheme,
  Stack
} from '@mui/material';
import { TypographyProps } from '@mui/material/Typography';
import Close from '@mui/icons-material/Close';
import { DetailField } from '../DetailField';
import { useTranslation } from 'react-i18next';

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  titleDecoration?: React.ReactNode;
  titleVariant?: TypographyProps['variant'];
};

export const Drawer: React.FC<DrawerProps> & { Field: typeof DetailField } = ({
  open,
  onClose,
  title,
  children,
  titleDecoration,
  titleVariant = 'h6'
}: DrawerProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

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
          paddingX: theme.spacing(3),
          paddingY: theme.spacing(1)
        }
      }}
    >
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <IconButton
          onClick={onClose}
          data-testid="close-icon"
          aria-label={t('commons.closeDialog')}
        >
          <Close />
        </IconButton>
      </Box>
      <Stack direction="row" alignItems="center" gap={1} mb={3}>
        {titleDecoration ?? null}
        <Typography variant={titleVariant} fontWeight={700}>
          {title}
        </Typography>
      </Stack>
      {children}
    </MuiDrawer>
  );
};

Drawer.Field = DetailField;
