import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export interface SearchButtonProps {
  text?: string;
  onClick?: () => void;
}

export const SearchButton = (props: SearchButtonProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { text = 'search', onClick = () => navigate(0) } = props;

  return (
    <Button
      role="button"
      aria-label={t(`app.routes.${text}`)}
      size="medium"
      variant="contained"
      onClick={onClick}
      sx={{ width: '5rem', height: '3rem' }}>
      {t(`app.routes.${text}`)}
    </Button>
  );
};
