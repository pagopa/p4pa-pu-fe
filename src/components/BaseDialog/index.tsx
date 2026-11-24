import type { ReactNode } from 'react';
import { useId } from 'react';

import type { DialogProps } from '@mui/material/Dialog';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

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
        <Stack direction="row" justifyContent="flex-end" alignItems="center">
          {title}
          <IconButton onClick={onClose} aria-label="Chiudi" sx={{ p: 0 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
          {description && (
            <Typography
              id={descriptionId}
              variant="body2"
              color="text.secondary"
            >
              {description}
            </Typography>
          )}
        </Stack>
      </DialogTitle>

      <DialogContent>{children}</DialogContent>

      {actions && (
        <DialogActions sx={{ padding: 3, paddingTop: 0 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};
