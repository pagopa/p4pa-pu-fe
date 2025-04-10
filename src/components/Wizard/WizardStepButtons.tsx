import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ArrowBack } from '@mui/icons-material';

type Props = {
  onBack?: () => void;
  onNext: () => void;
  disableNext?: boolean;
  disableBack?: boolean;
  nextLabel?: string;
  backLabel?: string;
};

const WizardStepButtons = ({
  onBack,
  onNext,
  disableNext,
  disableBack = false,
  nextLabel = 'commons.continue',
  backLabel = 'commons.back'
}: Props) => {
  const { t } = useTranslation();

  return (
    <Box mt={4} display="flex" justifyContent="space-between">
      <Button
        variant="outlined"
        onClick={onBack}
        disabled={disableBack}
        startIcon={<ArrowBack />}
      >
        {t(backLabel)}
      </Button>
      <Button variant="contained" onClick={onNext} disabled={disableNext}>
        {t(nextLabel)}
      </Button>
    </Box>
  );
};

export default WizardStepButtons;
