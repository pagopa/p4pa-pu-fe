import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Save from '@mui/icons-material/Save';

type Props = {
  onBack?: () => void;
  onNext?: () => void;
  onSaveDraft?: () => void;
  disableNext?: boolean;
  disableBack?: boolean;
  disableSaveDraft?: boolean;
  nextLabel?: string;
  backLabel?: string;
  showSaveDraft?: boolean;
  saveDraftLabel?: string;
  showSaveDraftIcon?: boolean;
};

const WizardStepButtons = ({
  onBack,
  onNext,
  onSaveDraft,
  disableNext,
  disableBack = false,
  disableSaveDraft = false,
  nextLabel = 'commons.continue',
  backLabel = 'commons.back',
  showSaveDraft = false,
  saveDraftLabel = 'commons.saveDraft',
  showSaveDraftIcon = true
}: Props) => {
  const { t } = useTranslation();

  return (
    <Box
      mt={4}
      display="flex"
      justifyContent="space-between"
      data-testid="wizard-step-buttons"
    >
      <Box>
        <Button
          id="wizard-back-button"
          data-testid="wizard-back-button"
          variant="outlined"
          onClick={onBack}
          disabled={disableBack}
          startIcon={<ArrowBack />}
        >
          {t(backLabel)}
        </Button>
      </Box>
      <Box display="flex" gap={4}>
        {showSaveDraft && (
          <Button
            id="wizard-save-draft-button"
            data-testid="wizard-save-draft-button"
            variant={showSaveDraftIcon ? 'text' : 'outlined'}
            onClick={onSaveDraft}
            disabled={disableSaveDraft}
            startIcon={showSaveDraftIcon ? <Save /> : undefined}
          >
            {t(saveDraftLabel)}
          </Button>
        )}
        <Button
          id="wizard-next-button"
          data-testid="wizard-next-button"
          variant="contained"
          onClick={onNext}
          disabled={disableNext}
        >
          {t(nextLabel)}
        </Button>
      </Box>
    </Box>
  );
};

export default WizardStepButtons;
