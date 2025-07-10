import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import utils from '../../utils';

export const ErrorPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        flexDirection={'column'}
      >
        <Typography
          component="h1"
          variant="h3"
          color="textPrimary"
          gutterBottom
        >
          {t('utilityPages.error.title')}
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {t('utilityPages.error.subtitle')}
        </Typography>
        <Link to={utils.config.loginUrl}>{t('utilityPages.error.retry')}</Link>
      </Box>
    </>
  );
};

export default ErrorPage;
