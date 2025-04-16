import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import config from '../../utils/config';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { theme } from '@pagopa/mui-italia';

function DebtPositionCreateWizardCompleted() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const deployPath = config.deployPath;

  // Recupera il titolo dinamico (tipo soggetto) passato come stato
  const paymentObject = location.state?.paymentObject || '';

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
          {t('debtPositionCreateWizardCompleted.title', {
            paymentObject
          })}
        </Typography>

        <Typography
          fontSize={16}
          sx={{
            textAlign: 'center',
            fontWeight: 400
          }}
        >
          {t('debtPositionCreateWizardCompleted.description')}
        </Typography>

        <Button
          role="button"
          variant="contained"
          onClick={() => navigate(`${deployPath}/debt-positions/`)}
        >
          {t('debtPositionCreateWizardCompleted.backToStart')}
        </Button>
      </Box>
    </Box>
  );
}

export default DebtPositionCreateWizardCompleted;
