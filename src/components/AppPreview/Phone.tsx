import type React from 'react';
import { LazyBackground } from '../LazyBackground';
import { useTranslation } from 'react-i18next';
import {
  GRADIENT_BACKGROUND,
  GRADIENT_PLACEHOLDER,
  styles
} from './Phone.styles';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { DialogCloseButton } from '@core/components/DialogCloseButton';

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
          {onClose && <DialogCloseButton onClick={onClose} />}
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
