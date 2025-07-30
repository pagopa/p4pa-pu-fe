import { ArrowBack } from '@mui/icons-material';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router';

export type BackButtonProps = {
  text?: string;
  onClick?: () => void;
};

export const BackButton = (props: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { text = t('commons.back'), onClick = () => navigate(-1) } = props;

  const hasHistory = location.key !== 'default' && window.history.length > 1;

  if (!hasHistory) {
    return null;
  }

  return (
    <Button
      role="button"
      aria-label={text}
      size="medium"
      startIcon={<ArrowBack />}
      variant="text"
      onClick={onClick}
      sx={{ marginBottom: 3, paddingLeft: 0 }}
    >
      {text}
    </Button>
  );
};
