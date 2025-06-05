import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import config from '../../utils/config';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { theme } from '@pagopa/mui-italia';
import { DebtPositionStatus } from '../../../generated/data-contracts';
import { Download } from '@mui/icons-material';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import debtPositions from '../../api/debtPositions';
import utils from '../../utils';
import { downloadBlob } from '../../utils/download';

function DebtPositionCreateWizardCompleted() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const deployPath = config.deployPath;
  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);
  const {
    description = '',
    status,
    debtPositionId,
    isEditing = false
  } = location.state || {};
  const isDraft = status === DebtPositionStatus.DRAFT;

  const getTitleTranslationKey = (): string => {
    if (isEditing) {
      return isDraft
        ? 'debtPositionCreateWizardCompleted.editDraft'
        : 'debtPositionCreateWizardCompleted.edit';
    }
    return isDraft
      ? 'debtPositionCreateWizardCompleted.draft'
      : 'debtPositionCreateWizardCompleted.title';
  };

  const getDescriptionTranslationKey = (): string => {
    return isDraft
      ? 'debtPositionCreateWizardCompleted.descriptionDraft'
      : 'debtPositionCreateWizardCompleted.description';
  };

  const translationKeys = {
    title: getTitleTranslationKey(),
    description: getDescriptionTranslationKey(),
    viewDebtPosition: 'debtPositionCreateWizardCompleted.viewDebtPosition',
    backToStart: 'debtPositionCreateWizardCompleted.backToStart',
    downloadDebtPosition:
      'debtPositionCreateWizardCompleted.downloadDebtPosition'
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

  const getDebtPositionZipFileMutation =
    debtPositions.getDebtPositionZipFile(organizationId);

  const handleDownloadDebtPosition = async () => {
    if (!debtPositionId) {
      return utils.notify.emit(t('commons.files.missingDebtPositionId'));
    }

    try {
      const result = await getDebtPositionZipFileMutation.mutateAsync(
        Number(debtPositionId)
      );
      const { data, fileName } = result;
      downloadBlob(data, fileName);
    } catch (error) {
      console.error(t('commons.files.downloadFailed'), error);
      utils.notify.emit(t('commons.files.downloadFailed'));
    }
  };

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
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Button
          role="button"
          variant="outlined"
          onClick={() => navigate(`${deployPath}/debt-positions/`)}
        >
          {t(translationKeys.backToStart)}
        </Button>
        {isDraft ? (
          <Button
            role="button"
            variant="contained"
            onClick={handleViewDebtPosition}
          >
            {t(translationKeys.viewDebtPosition)}
          </Button>
        ) : (
          <Button
            role="button"
            variant="contained"
            startIcon={<Download />}
            onClick={handleDownloadDebtPosition}
          >
            {t(translationKeys.downloadDebtPosition)}
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default DebtPositionCreateWizardCompleted;
