import { Button } from '@mui/material';
import PreviewIcon from '@mui/icons-material/Preview';
import { t } from 'i18next';

type PreviewButtonProps = {
  disabled?: boolean;
  onClick: () => void;
};
export const PreviewButton = ({ disabled, onClick }: PreviewButtonProps) => (
  <Button
    variant="text"
    onClick={onClick}
    sx={{ px: 0, alignSelf: 'flex-start' }}
    disabled={disabled}
  >
    <PreviewIcon sx={{ mr: 1 }} />
    {t('debtTypeCreate.settings.preview')}
  </Button>
);
