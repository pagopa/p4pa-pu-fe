import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

export type GenericDialogProps = {
  open: boolean;
  title: string;
  message?: string | React.ReactElement;
  confirmLabel?: string;
  cancelLabel?: string;
  children?: ReactNode;
  fullWidth?: boolean;
  confirmLoading?: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
  'data-testid'?: string;
  ariaDescribedby?: string;
  ariaLabelledby?: string;
};

const GenericDialog = ({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  children,
  fullWidth = false,
  confirmLoading = false,
  ariaDescribedby,
  ariaLabelledby,
  onConfirm,
  onClose,
  'data-testid': testId
}: GenericDialogProps) => {
  const { t } = useTranslation();
  confirmLabel = confirmLabel ?? t('commons.confirm');
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={fullWidth}
      data-testid={testId}
      aria-describedby={ariaDescribedby}
      aria-labelledby={ariaLabelledby || 'generic-dialog-title'}
    >
      <DialogTitle sx={{ px: 4, pt: 4 }} id="generic-dialog-title">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={5}
        >
          {title}
          <IconButton
            onClick={onClose}
            aria-label={t('commons.closeDialog')}
            sx={{ p: 0, mt: 0.5 }}
          >
            <CloseIcon fontSize="small" color="action" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ px: 4 }}>
        {message && <DialogContentText>{message}</DialogContentText>}
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 4, pb: 3 }}>
        {cancelLabel && (
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={confirmLoading}
            data-testid={testId ? `${testId}-cancel-button` : undefined}
          >
            {cancelLabel}
          </Button>
        )}
        {confirmLabel && (
          <Button
            onClick={onConfirm}
            color="primary"
            variant="contained"
            disabled={confirmLoading}
            startIcon={
              confirmLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
            data-testid={testId ? `${testId}-confirm-button` : undefined}
          >
            {confirmLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default GenericDialog;
