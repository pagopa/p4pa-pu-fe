import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageRoutes } from '..';

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
        <Link to={PageRoutes.HOME}>{t('utilityPages.error.retry')}</Link>
      </Box>
    </>
  );
};

export default ErrorPage;
