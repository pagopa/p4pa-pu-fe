import {
  DialogProps,
  Dialog,
  DialogTitle,
  Typography,
  DialogContent,
  DialogActions
} from '@mui/material';
import { ReactNode, useId } from 'react';

type BaseDialogProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: DialogProps['maxWidth'];
};

export const BaseDialog = ({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  maxWidth = 'sm'
}: BaseDialogProps) => {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      sx={{ padding: 3 }}
    >
      <DialogTitle id={titleId} gap={1}>
        {title}
        {description && (
          <Typography id={descriptionId} variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent>{children}</DialogContent>

      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
};
