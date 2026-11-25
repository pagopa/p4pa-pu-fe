import { useTranslation } from 'react-i18next';

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

type DialogCloseButtonProps = {
  onClick: () => void;
};

export const DialogCloseButton = ({ onClick }: DialogCloseButtonProps) => {
  const { t } = useTranslation();

  return (
    <IconButton
      onClick={onClick}
      aria-label={t('commons.closeDialog')}
      sx={{ p: 0, mt: 0.5 }}
    >
      <CloseIcon fontSize="small" color="action" />
    </IconButton>
  );
};
