import { Box, Button } from '@mui/material';

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
}: Props) => (
  <Box mt={4} display="flex" justifyContent="space-between">
    <Button variant="outlined" onClick={onBack} disabled={disableBack}>
      Indietro
    </Button>
    <Button variant="contained" onClick={onNext} disabled={disableNext}>
      {nextLabel}
    </Button>
  </Box>
);

export default WizardStepButtons;
