import { Stepper, Step, StepLabel } from '@mui/material';

const WizardStepper = ({ activeStep }: { activeStep: number }) => {
  const labels = [
    'Configurazione generale',
    'Aggiungi debitore',
    'Configurazione avviso'
  ];

  return (
    <Stepper alternativeLabel activeStep={activeStep} sx={{ my: 3 }}>
      {labels.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default WizardStepper;
