import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
type Props = {
  onBack?: () => void;
  onNext: () => void;
  disableNext?: boolean;
  disableBack?: boolean;
  nextLabel?: string;
};

const WizardStepButtons = ({
  onBack,
  onNext,
  disableNext,
  disableBack = false,
  nextLabel = 'Continua'
}: Props) => {
  const { t } = useTranslation();
  return (
    <Box mt={4} display="flex" justifyContent="space-between">
      <Button variant="outlined" onClick={onBack} disabled={disableBack}>
        {t('commons.back')}
      </Button>
      <Button variant="contained" onClick={onNext} disabled={disableNext}>
        {nextLabel}
      </Button>
    </Box>
  );
};

export default WizardStepButtons;
