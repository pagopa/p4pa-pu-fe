import type React from 'react';
import { useId } from 'react';
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

import { DialogHeader } from '@core/components/DialogHeader';

type PhoneProps = {
  open: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
};

export const Phone = ({ children, open, onClose }: PhoneProps) => {
  const { t } = useTranslation();
  const titleId = useId();
  const contentId = useId();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      aria-labelledby={titleId}
      aria-describedby={contentId}
      data-testid="phone-dialog"
    >
      <DialogTitle component="div" sx={styles.dialogTitle}>
        <DialogHeader
          id={titleId}
          title={t('appPreview.title')}
          onClose={onClose}
        />
        <Typography variant="body2">{t('appPreview.messageInfo')}</Typography>
      </DialogTitle>
      <DialogContent id={contentId} sx={styles.dialogContent}>
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
