import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import { LazyBackground } from '../LazyBackground';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import {
  GRADIENT_BACKGROUND,
  GRADIENT_PLACEHOLDER,
  styles
} from './Phone.styles';

type PhoneProps = {
  open: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
};

export const Phone = ({ children, open, onClose }: PhoneProps) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      aria-labelledby="app-preview-dialog-title"
      aria-describedby="app-preview-dialog-description"
      data-testid="phone-dialog"
    >
      <DialogTitle id="phone-dialog-title" sx={styles.dialogTitle}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">{t('appPreview.title')}</Typography>
          <IconButton
            onClick={onClose}
            aria-label={t('commons.close')}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Typography variant="body2">{t('appPreview.messageInfo')}</Typography>
      </DialogTitle>
      <DialogContent
        id="app-preview-dialog-description"
        sx={styles.dialogContent}
      >
        <LazyBackground
          src={GRADIENT_BACKGROUND}
          placeholder={GRADIENT_PLACEHOLDER}
          style={styles.background}
        >
          <Stack sx={styles.border}>
            <Stack sx={styles.phone}>{children}</Stack>
          </Stack>
        </LazyBackground>
      </DialogContent>
    </Dialog>
  );
};
