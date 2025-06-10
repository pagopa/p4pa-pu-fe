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

type DebtPositionCompletionState = {
  readonly description?: string;
  readonly status?: DebtPositionStatus;
  readonly debtPositionId?: number;
  readonly isEditing?: boolean;
  readonly wasPublished?: boolean;
};

enum CompletionScenario {
  CREATION_DRAFT = 'CREATION_DRAFT',
  CREATION_PUBLISHED = 'CREATION_PUBLISHED',
  EDIT_SAVED = 'EDIT_SAVED',
  EDIT_PUBLISHED = 'EDIT_PUBLISHED'
}

type ScenarioConfig = {
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly showDownload: boolean;
  readonly showView: boolean;
};

const SCENARIO_CONFIG: Record<CompletionScenario, ScenarioConfig> = {
  [CompletionScenario.CREATION_DRAFT]: {
    titleKey: 'debtPositionCreateWizardCompleted.draft',
    descriptionKey: 'debtPositionCreateWizardCompleted.descriptionDraft',
    showDownload: false,
    showView: true
  },
  [CompletionScenario.CREATION_PUBLISHED]: {
    titleKey: 'debtPositionCreateWizardCompleted.title',
    descriptionKey: 'debtPositionCreateWizardCompleted.description',
    showDownload: true,
    showView: false
  },
  [CompletionScenario.EDIT_SAVED]: {
    titleKey: 'debtPositionCreateWizardCompleted.edit',
    descriptionKey: 'debtPositionCreateWizardCompleted.description',
    showDownload: false,
    showView: true
  },
  [CompletionScenario.EDIT_PUBLISHED]: {
    titleKey: 'debtPositionCreateWizardCompleted.title',
    descriptionKey: 'debtPositionCreateWizardCompleted.description',
    showDownload: true,
    showView: false
  }
} as const;

const getCompletionScenario = (
  isEditing: boolean,
  isDraft: boolean,
  wasPublished: boolean
): CompletionScenario => {
  if (isEditing) {
    return wasPublished
      ? CompletionScenario.EDIT_PUBLISHED
      : CompletionScenario.EDIT_SAVED;
  }
  return isDraft
    ? CompletionScenario.CREATION_DRAFT
    : CompletionScenario.CREATION_PUBLISHED;
};

// Type guard per validazione runtime
const isValidCompletionState = (
  state: unknown
): state is DebtPositionCompletionState => {
  if (!state || typeof state !== 'object') return false;

  const s = state as Record<string, unknown>;

  return (
    (s.description === undefined || typeof s.description === 'string') &&
    (s.status === undefined ||
      Object.values(DebtPositionStatus).includes(
        s.status as DebtPositionStatus
      )) &&
    (s.debtPositionId === undefined || typeof s.debtPositionId === 'number') &&
    (s.isEditing === undefined || typeof s.isEditing === 'boolean') &&
    (s.wasPublished === undefined || typeof s.wasPublished === 'boolean')
  );
};

function DebtPositionCreateWizardCompleted() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const deployPath = config.deployPath;
  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);
  const validatedState: DebtPositionCompletionState = isValidCompletionState(
    location.state
  )
    ? location.state
    : {
        description: '',
        status: undefined,
        debtPositionId: undefined,
        isEditing: false,
        wasPublished: false
      };

  const {
    description = '',
    status,
    debtPositionId,
    isEditing = false,
    wasPublished = false
  } = validatedState;

  const isDraft = status === DebtPositionStatus.DRAFT;

  const currentScenario = getCompletionScenario(
    isEditing,
    isDraft,
    wasPublished
  );
  const scenarioConfig = SCENARIO_CONFIG[currentScenario];

  const translationKeys = {
    title: scenarioConfig.titleKey,
    description: scenarioConfig.descriptionKey,
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
        {scenarioConfig.showView ? (
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
