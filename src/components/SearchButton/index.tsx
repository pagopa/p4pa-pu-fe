import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../routes/routes';

export interface SearchButtonProps {
  text?: string;
  onClick?: () => void;
}

export const SearchButton = (props: SearchButtonProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { text = 'search', onClick = () => navigate(PageRoutes.TELEMATIC_RECEIPT_SEARCH_RESULTS) } = props;

  return (
    <Button
      role="button"
      aria-label={t(`app.routes.${text}`)}
      size="medium"
      variant="contained"
      onClick={onClick}
      sx={{ paddingX: 2.75, paddingY: 1.75 }}
    >
      {t(`app.routes.${text}`)}
    </Button>
  );
};
