import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import config from '../../utils/config';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { theme } from '@pagopa/mui-italia';
import { DebtPositionStatus } from '../../../generated/data-contracts';

function DebtPositionCreateWizardCompleted() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const deployPath = config.deployPath;

  const { description = '', status, debtPositionId } = location.state || {};
  const isDraft = status === DebtPositionStatus.DRAFT;

  const translationKeys = {
    title: isDraft
      ? 'debtPositionCreateWizardCompleted.draft'
      : 'debtPositionCreateWizardCompleted.title',
    description: isDraft
      ? 'debtPositionCreateWizardCompleted.descriptionDraft'
      : 'debtPositionCreateWizardCompleted.description',
    viewDebtPosition: 'debtPositionCreateWizardCompleted.viewDebtPosition',
    backToStart: 'debtPositionCreateWizardCompleted.backToStart'
  };

  const translationParams = {
    paymentObject: description
  };

  function handleViewDebtPosition() {
    if (isDraft) {
      navigate(`${deployPath}/debt-positions/${debtPositionId}`);
    } else {
      navigate(`${deployPath}/debt-positions/`);
    }
  }

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
          {t(translationKeys.title, translationParams)}
        </Typography>

        <Typography
          fontSize={16}
          sx={{
            textAlign: 'center',
            fontWeight: 400
          }}
        >
          {t(
            translationKeys.description,
            isDraft ? translationParams : undefined
          )}
        </Typography>

        <Button
          role="button"
          variant="contained"
          onClick={handleViewDebtPosition}
        >
          {t(translationKeys.viewDebtPosition)}
        </Button>
      </Box>{' '}
      <Button
        role="button"
        variant="naked"
        onClick={() => navigate(`${deployPath}/debt-positions/`)}
      >
        {t(translationKeys.backToStart)}
      </Button>
    </Box>
  );
}

export default DebtPositionCreateWizardCompleted;
