import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

type GenericDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onClose?: () => void;
};

const GenericDialog = ({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose
}: GenericDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ px: 4, pt: 4 }}>{title}</DialogTitle>
      <DialogContent sx={{ px: 4 }}>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 4, pb: 3 }}>
        {cancelLabel && (
          <Button onClick={onClose} variant="outlined">
            {cancelLabel}
          </Button>
        )}
        {confirmLabel && (
          <Button onClick={onConfirm} color="primary" variant="contained">
            {confirmLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default GenericDialog;
