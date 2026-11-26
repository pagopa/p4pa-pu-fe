import type { ReactNode } from 'react';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { DialogCloseButton } from '@core/components/DialogCloseButton';

type DialogHeaderProps = {
  id: string;
  title: ReactNode;
  onClose?: () => void;
};

/**
 * Renders the dialog heading and the close button as siblings.
 * The close button must stay outside the heading, otherwise the heading
 * accessible name would include the close button aria-label.
 */
export const DialogHeader = ({ id, title, onClose }: DialogHeaderProps) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="flex-start"
    gap={5}
  >
    <Typography id={id} component="h2" variant="h6" sx={{ flexGrow: 1 }}>
      {title}
    </Typography>
    {onClose && <DialogCloseButton onClick={onClose} />}
  </Stack>
);
