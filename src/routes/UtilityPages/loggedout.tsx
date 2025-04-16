import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import config from '../../utils/config';

export const LoggedOut = () => {
  const { t } = useTranslation();
  const loginUrl = config.loginUrl;

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
          {t('utilityPages.loggedout.title')}
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {t('utilityPages.loggedout.subtitle')}
        </Typography>
        <Link to={loginUrl || '/login'} replace>
          Login
        </Link>
      </Box>
    </>
  );
};

export default LoggedOut;
