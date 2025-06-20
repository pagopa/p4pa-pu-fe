import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import { ReactNode } from 'react';

type GenericDialogProps = {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  children?: ReactNode;
  fullWidth?: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
  'data-testid'?: string;
};

const GenericDialog = ({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  children,
  fullWidth = false,
  onConfirm,
  onClose,
  'data-testid': testId
}: GenericDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={fullWidth}
      data-testid={testId}
    >
      <DialogTitle sx={{ px: 4, pt: 4 }}>{title}</DialogTitle>
      <DialogContent sx={{ px: 4 }}>
        {message && <DialogContentText>{message}</DialogContentText>}
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 4, pb: 3 }}>
        {cancelLabel && (
          <Button
            onClick={onClose}
            variant="outlined"
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
