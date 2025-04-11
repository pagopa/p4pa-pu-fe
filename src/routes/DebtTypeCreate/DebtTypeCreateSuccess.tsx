import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { theme } from '@pagopa/mui-italia';
import { PageRoutes } from '../../App';

export const DebtTypeCreateSuccess = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // TODO: error if no formData is provided
  const formData = location.state?.formData || '';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        padding: 3,
        margin: '0 auto'
      }}
    >
      <Box
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          width: '100%'
        }}
      >
        <CheckCircleOutlineIcon
          sx={{
            fontSize: 64,
            color: theme.palette.success.main,
            borderRadius: '50%'
          }}
        />

        <Typography
          variant="h4"
          component="h1"
          fontSize={24}
          sx={{
            fontWeight: 700,
            textAlign: 'center',
            maxWidth: (theme) => theme.spacing(50)
          }}
        >
          {t('debtTypeCreateSuccess.title', {
            paymentObject: formData.step1.debtPositionType
          })}
        </Typography>

        <Typography
          fontSize={16}
          sx={{
            textAlign: 'center',
            fontWeight: 400
          }}
        >
          {t('debtTypeCreateSuccess.description')}
        </Typography>

        <Button
          role="button"
          variant="contained"
          onClick={() => navigate(PageRoutes.DEBT_TYPES_CATALOG)}
        >
          {t('debtTypeCreateSuccess.backToStart')}
        </Button>
      </Box>
    </Box>
  );
};
