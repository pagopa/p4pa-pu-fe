import React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import { LazyBackground } from '../LazyBackground';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { GRADIENT_PLACEHOLDER, styles } from './AppPreview.styles';

type AppPreviewProps = {
  open: boolean;
  onClose?: () => void;
  onEdit?: () => void;
  title?: string;
  children?: React.ReactNode;
};

export const AppPreview = ({
  title,
  children,
  open,
  onClose,
  onEdit
}: AppPreviewProps) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      aria-labelledby="app-preview-dialog-title"
      aria-describedby="app-preview-dialog-description"
      data-testid="confirm-dialog"
    >
      <DialogTitle id="app-preview-dialog-title" sx={styles.dialogTitle}>
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="h6">{title}</Typography>
            <IconButton sx={styles.infoButton} aria-label={t('commons.info')}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Stack>
          <IconButton
            color="primary"
            onClick={onClose}
            aria-label={t('commons.close')}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Button
          sx={styles.editButton}
          onClick={onEdit}
          aria-label={t('commons.edit')}
        >
          <Typography variant="button" color="inherit">
            {t('commons.edit')}
          </Typography>
          <EditIcon fontSize="small" />
        </Button>
      </DialogTitle>
      <DialogContent
        id="app-preview-dialog-description"
        sx={styles.dialogContent}
      >
        <LazyBackground
          src="/assets/Sfondo.jpg"
          placeholder={GRADIENT_PLACEHOLDER}
          style={styles.background}
        >
          <Stack sx={styles.border}>
            <Stack sx={styles.phone}>{children}</Stack>
          </Stack>
        </LazyBackground>
        <Typography variant="body2">{t('appPreview.messageInfo')}</Typography>
      </DialogContent>
    </Dialog>
  );
};
