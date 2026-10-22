import MouseIcon from '@mui/icons-material/Mouse';
import CloseIcon from '@mui/icons-material/Close';
import { styles } from './MousePopup.styles';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const MousePopup = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  return open ? (
    <Paper elevation={16} sx={styles.paper} data-testid="mouse-popup">
      <Stack sx={styles.closeStack}>
        <IconButton onClick={() => setOpen(false)} sx={styles.closeButton}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
      </Stack>
      <Stack sx={styles.contentStack}>
        <MouseIcon fontSize="small" />
        <Typography variant="caption" fontSize={10} fontWeight={600}>
          {t('appPreview.mousePopup')}
        </Typography>
      </Stack>
    </Paper>
  ) : null;
};
