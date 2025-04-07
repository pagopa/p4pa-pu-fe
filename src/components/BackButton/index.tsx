import { ArrowBack } from '@mui/icons-material';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export type BackButtonProps = {
  text?: string;
  onClick?: () => void;
};

export const BackButton = (props: BackButtonProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { text = t('commons.back'), onClick = () => navigate(-1) } = props;

  return (
    <Button
      role="button"
      aria-label={text}
      size="medium"
      startIcon={<ArrowBack />}
      variant="text"
      onClick={onClick}
      sx={{ marginBottom: 3 }}
    >
      {text}
    </Button>
  );
};
